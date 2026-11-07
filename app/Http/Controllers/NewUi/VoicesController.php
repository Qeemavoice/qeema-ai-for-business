<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Services\NewUi\Accounts;
use App\Services\NewUi\Store;
use App\Services\NewUi\Tts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * TTS studio voices (qv_tts_voices), their listen samples, the visitors' free trial and stored audio.
 * Port of new-ui/server/routes/voices.ts, ttsVoices.ts and the trial part of generations.ts.
 */
class VoicesController extends Controller
{
    public const AUDIO_DISK_DIR = 'qv-audio';
    private const PREVIEW_TEXT = 'مرحباً بكم في قيمة فويس، منصة الصوت العربي بجودة استوديو.';
    private const TRIAL_MAX_CHARS = 120;

    /** Row of qv_tts_voices as the front end expects it (never the provider voice id or the narrator share) */
    public static function publicVoice(object $v, bool $withSecrets = false): array
    {
        $out = [
            'id' => $v->id, 'code' => Tts::code($v->id), 'type' => 'ai', 'name' => $v->name, 'nameEn' => $v->name_en, 'gender' => $v->gender, 'language' => 'ar',
            'dialect' => $v->dialect, 'dialectLabel' => (string) $v->dialect_label, 'style' => $v->style, 'styleLabel' => (string) $v->style_label,
            'useCases' => $v->use_cases ? (json_decode($v->use_cases, true) ?: []) : ['ads', 'corporate', 'social_media'],
            'provider' => $v->provider, 'previewUrl' => $v->preview_url ? "/api/v1/voices/{$v->id}/preview" : '',
            'avatar' => (string) $v->avatar, 'isActive' => (bool) $v->is_active, 'isFeatured' => (bool) $v->is_featured,
            'bookingsCount' => (int) $v->bookings_count, 'createdAt' => Store::iso(Store::created($v, 'created_at')),
        ];
        if ($withSecrets) {
            $out['providerVoiceId'] = $v->provider_voice_id;
            $out['narratorId'] = $v->narrator_id;
            $out['narratorSharePercent'] = $v->narrator_share_percent === null ? null : (float) $v->narrator_share_percent;
            $out['previewUrl'] = (string) $v->preview_url;
        }
        return $out;
    }

    public static function voiceRow(string $id): ?object
    {
        return DB::table('qv_tts_voices')->where('id', Tts::idFromCode($id) ?? $id)->first();
    }

    /** Munsit voices for the studio (empty when Munsit is not set up) */
    public function munsitVoices()
    {
        $voices = \App\Services\NewUi\Tts::munsitVoices();
        return response()->json(['configured' => (bool) $voices, 'total' => count($voices), 'voices' => $voices])->header('Cache-Control', 'public, max-age=300');
    }

    public function index(Request $r)
    {
        $q = DB::table('qv_tts_voices')->where('is_active', 1);
        if ($r->filled('dialect') && $r->input('dialect') !== 'all') $q->where('dialect', $r->input('dialect'));
        if ($r->filled('gender') && $r->input('gender') !== 'all') $q->where('gender', $r->input('gender'));
        if ($r->filled('search')) {
            $s = '%' . trim((string) $r->input('search')) . '%';
            $q->where(fn ($w) => $w->where('name', 'like', $s)->orWhere('name_en', 'like', $s)->orWhere('dialect_label', 'like', $s)->orWhere('style_label', 'like', $s));
        }
        $type = (string) $r->input('type', 'all');
        $voices = $type === 'human' ? [] : $q->orderByDesc('is_featured')->orderBy('name')->get()->map(fn ($v) => self::publicVoice($v))->all();
        return response()->json([
            'total' => count($voices), 'voices' => $voices,
            'metadata' => [
                'dialects' => [
                    ['code' => 'all', 'labelAr' => 'كافة اللهجات'], ['code' => 'gulf', 'labelAr' => 'خليجي / سعودي'], ['code' => 'egyptian', 'labelAr' => 'مصري'],
                    ['code' => 'levantine', 'labelAr' => 'شامي'], ['code' => 'maghrebi', 'labelAr' => 'مغاربي'], ['code' => 'fusha', 'labelAr' => 'فصحى معيارية'],
                ],
                'types' => [
                    ['code' => 'all', 'labelAr' => 'الكل (Human + AI)'], ['code' => 'ai', 'labelAr' => 'أصوات الذكاء الاصطناعي (AI)'], ['code' => 'human', 'labelAr' => 'أصوات المعلقين البشريين'],
                ],
            ],
        ]);
    }

    public function show(string $id)
    {
        $v = self::voiceRow($id);
        if (!$v) return response()->json(['error' => 'الصوت غير موجود'], 404);
        return response()->json(self::publicVoice($v));
    }

    /** Listen sample: the uploaded file if any, otherwise one sentence synthesized once and cached. */
    public function preview(string $id)
    {
        // Munsit voice (by its QV code): its sample, served from here so the client never sees the provider's address
        if ($m = Tts::munsitVoiceRow($id)) {
            return $m->preview_url ? (self::remoteAudio($m->preview_url) ?: response()->json(['error' => 'العينة غير متاحة'], 404))
                : response()->json(['error' => 'العينة غير متاحة'], 404);
        }
        $v = self::voiceRow($id);
        if (!$v || !$v->is_active) return response()->json(['error' => 'الصوت غير موجود'], 404);
        if ($v->preview_url) {
            if (Str::startsWith($v->preview_url, 'data:')) return $this->file($id);
            return self::remoteAudio($v->preview_url) ?: response()->json(['error' => 'العينة غير متاحة'], 404);
        }
        $path = self::AUDIO_DISK_DIR . "/preview-{$id}";
        if (!Storage::exists($path . '.bin')) {
            $synth = Tts::synthesize(self::PREVIEW_TEXT, (array) $v, ['speed' => 1, 'stability' => 0.7, 'style' => 0.5, 'pitch' => 0]);
            Storage::put($path . '.bin', $synth['audio']);
            Storage::put($path . '.mime', $synth['mime']);
        }
        return self::audioFile($path, Storage::get($path . '.mime'), 'public, max-age=3600');
    }

    /** Uploaded sample stored as a data URL in the dashboard, served as audio. */
    public function file(string $id)
    {
        $v = self::voiceRow($id);
        if (!$v || !preg_match('#^data:([^;]+);base64,(.*)$#s', (string) $v->preview_url, $m)) return response('', 404);
        return response(base64_decode($m[2]))->header('Content-Type', $m[1])->header('Cache-Control', 'public, max-age=3600');
    }

    /** Generated audio (generations and trials) */
    public function audio(string $id)
    {
        $id = preg_replace('/[^a-zA-Z0-9\-_]/', '', $id);
        $path = self::AUDIO_DISK_DIR . "/{$id}";
        if (!Storage::exists($path . '.bin')) return response()->json(['error' => 'الملف غير موجود'], 404);
        $mime = Storage::exists($path . '.mime') ? Storage::get($path . '.mime') : 'audio/mpeg';
        return self::audioFile($path, $mime, 'private, max-age=86400');
    }

    /**
     * A sample hosted elsewhere (provider CDN), copied here once and served from our address, so the page never
     * shows where it comes from. Null when it cannot be fetched. Only http(s), at most 15 MB.
     */
    private static function remoteAudio(string $url)
    {
        if (!preg_match('#^https?://#i', $url)) return null;
        $path = self::AUDIO_DISK_DIR . '/remote-' . sha1($url);
        if (!Storage::exists($path . '.bin')) {
            try {
                $res = \Illuminate\Support\Facades\Http::timeout(20)->get($url);
            } catch (\Throwable $e) {
                return null;
            }
            if (!$res->successful() || strlen($res->body()) > 15 * 1024 * 1024) return null;
            $mime = strtok((string) $res->header('Content-Type'), ';') ?: 'audio/mpeg';
            if (!Str::startsWith($mime, 'audio/')) $mime = Str::endsWith(parse_url($url, PHP_URL_PATH) ?: '', '.wav') ? 'audio/wav' : 'audio/mpeg';
            self::storeAudio('remote-' . sha1($url), $res->body(), $mime);
        }
        return self::audioFile($path, Storage::get($path . '.mime'), 'public, max-age=86400');
    }

    /** A stored audio file with byte-range support (206): Safari and iOS refuse to play audio without it */
    private static function audioFile(string $path, string $mime, string $cache)
    {
        return response()->file(Storage::path($path . '.bin'), ['Content-Type' => trim($mime), 'Cache-Control' => $cache]);
    }

    public static function storeAudio(string $id, string $bytes, string $mime): void
    {
        Storage::put(self::AUDIO_DISK_DIR . "/{$id}.bin", $bytes);
        Storage::put(self::AUDIO_DISK_DIR . "/{$id}.mime", $mime);
    }

    /** One free short generation for visitors, on the real engine (one per IP per day). */
    public function trial(Request $r)
    {
        $ip = $r->ip() ?: 'unknown';
        $key = 'qv-trial:' . sha1($ip);
        if (Cache::has($key)) return response()->json(['error' => 'استخدمت التجربة المجانية. أنشئ حساباً مجانياً للمتابعة.', 'action' => 'signup'], 429);
        $text = trim((string) $r->input('text', ''));
        if (mb_strlen($text) < 2) return response()->json(['error' => 'يرجى إدخال النص المطلوب تحويله إلى صوت'], 400);
        if (mb_strlen($text) > self::TRIAL_MAX_CHARS) return response()->json(['error' => 'التجربة المجانية حتى ' . self::TRIAL_MAX_CHARS . ' حرفاً.'], 400);
        $vid = (string) $r->input('voiceId', '');
        $voice = \App\Services\NewUi\Tts::munsitVoiceRow($vid)
            ?: DB::table('qv_tts_voices')->where('is_active', 1)->where('id', Tts::idFromCode($vid) ?? $vid)->first()
            ?: DB::table('qv_tts_voices')->where('is_active', 1)->orderByDesc('is_featured')->first();
        if (!$voice && ($m = \App\Services\NewUi\Tts::munsitVoices())) $voice = \App\Services\NewUi\Tts::munsitVoiceRow($m[0]['id']);
        if (!$voice) return response()->json(['error' => 'لا توجد أصوات متاحة حالياً'], 503);
        try {
            $synth = Tts::synthesize($text, (array) $voice, ['speed' => 1, 'stability' => 0.7, 'style' => 0.5, 'pitch' => 0]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'تعذر توليد الصوت الآن، حاول بعد قليل.'], 500);
        }
        $id = 'trial-' . Str::uuid();
        self::storeAudio($id, $synth['audio'], $synth['mime']);
        Cache::put($key, 1, now()->addDay());
        return response()->json(['audioUrl' => "/api/v1/storage/audio/{$id}", 'voiceName' => $voice->name]);
    }

    // ---------- admin: استوديو TTS ← الأصوات ----------
    private const DIALECTS = ['gulf', 'egyptian', 'levantine', 'maghrebi', 'fusha'];
    /** what the client sees as the dialect (one field «اللهجة» in the admin form) */
    private const DIALECT_AR = ['gulf' => 'خليجي', 'egyptian' => 'مصري', 'levantine' => 'شامي', 'maghrebi' => 'مغاربي', 'fusha' => 'فصحى'];
    private const PROVIDERS = ['elevenlabs', 'munsit', 'qeema_acoustic'];
    private const DEFAULT_SHARE = 40;

    private function parse(Request $r, bool $creating)
    {
        $b = $r->all();
        $f = [];
        $text = fn ($v, $max) => mb_substr(trim((string) ($v ?? '')), 0, $max);
        if ($creating || array_key_exists('name', $b)) { $f['name'] = $text($b['name'] ?? '', 80); if ($f['name'] === '') return ['error' => 'اسم المقطع مطلوب']; }
        if (array_key_exists('gender', $b)) $f['gender'] = $b['gender'] === 'female' ? 'female' : 'male';
        if (array_key_exists('dialect', $b)) {
            if (!in_array($b['dialect'], self::DIALECTS, true)) return ['error' => 'لهجة غير صالحة'];
            $f['dialect'] = $b['dialect'];
            if (!array_key_exists('dialectLabel', $b)) $f['dialect_label'] = self::DIALECT_AR[$b['dialect']];
        }
        if (array_key_exists('dialectLabel', $b)) $f['dialect_label'] = $text($b['dialectLabel'], 60);
        if (array_key_exists('styleLabel', $b)) $f['style_label'] = $text($b['styleLabel'], 60);
        if (array_key_exists('provider', $b)) { if (!in_array($b['provider'], self::PROVIDERS, true)) return ['error' => 'مزوّد غير صالح']; $f['provider'] = $b['provider']; }
        if (array_key_exists('providerVoiceId', $b)) $f['provider_voice_id'] = $text($b['providerVoiceId'], 80) ?: null;
        if (array_key_exists('previewUrl', $b)) {
            $url = (string) ($b['previewUrl'] ?? '');
            if (strlen($url) > 8 * 1024 * 1024) return ['error' => 'حجم العينة الصوتية كبير (الحد 6MB)'];
            $f['preview_url'] = $url;
        }
        if (array_key_exists('avatar', $b)) $f['avatar'] = $text($b['avatar'], 500);
        // every voice belongs to a narrator (internal only: never sent to clients, see publicVoice())
        if ($creating || array_key_exists('narratorId', $b)) {
            $f['narrator_id'] = $text($b['narratorId'] ?? '', 80) ?: null;
            if (!$f['narrator_id']) return ['error' => 'اختر المعلق صاحب الصوت'];
        }
        if (array_key_exists('narratorSharePercent', $b)) {
            $n = (float) $b['narratorSharePercent'];
            if ($n < 0 || $n > 100) return ['error' => 'نسبة المعلق يجب أن تكون بين 0 و100'];
            $f['narrator_share_percent'] = $n;
        }
        if (array_key_exists('isActive', $b)) $f['is_active'] = (bool) $b['isActive'];
        return ['fields' => $f];
    }

    public function adminIndex()
    {
        $rows = DB::table('qv_tts_voices')->orderByDesc('created_at')->get()->map(fn ($v) => self::publicVoice($v, true))->all();
        return response()->json(['voices' => $rows]);
    }

    public function adminCreate(Request $r)
    {
        $p = $this->parse($r, true);
        if (isset($p['error'])) return response()->json(['error' => $p['error']], 400);
        $f = $p['fields'];
        $provider = $f['provider'] ?? 'qeema_acoustic';   // own voices: the uploaded sample, no ElevenLabs id
        if (in_array($provider, ['elevenlabs', 'munsit'], true) && empty($f['provider_voice_id'])) return response()->json(['error' => 'معرّف الصوت لدى المزوّد (voice_id) مطلوب'], 400);
        if (empty($f['preview_url'])) return response()->json(['error' => 'العينة الصوتية مطلوبة'], 400);
        $id = 'voice-ai-' . round(microtime(true) * 1000);
        DB::table('qv_tts_voices')->insert(array_merge([
            'id' => $id, 'gender' => 'male', 'dialect' => 'gulf', 'dialect_label' => self::DIALECT_AR['gulf'], 'style' => 'commercial', 'style_label' => 'رسمي واحترافي', 'provider' => $provider,
            'use_cases' => json_encode(['ads', 'corporate', 'social_media']), 'is_active' => 1, 'created_at' => now(), 'updated_at' => now(),
        ], $f, [
            'narrator_share_percent' => !empty($f['narrator_id']) ? ($f['narrator_share_percent'] ?? self::DEFAULT_SHARE) : null,
        ]));
        return response()->json(['voice' => self::publicVoice(self::voiceRow($id), true)]);
    }

    public function adminUpdate(Request $r, string $id)
    {
        if (!self::voiceRow($id)) return response()->json(['error' => 'الصوت غير موجود'], 404);
        $p = $this->parse($r, false);
        if (isset($p['error'])) return response()->json(['error' => $p['error']], 400);
        $f = $p['fields'];
        $f['updated_at'] = now();
        DB::table('qv_tts_voices')->where('id', $id)->update($f);
        $v = self::voiceRow($id);
        if (!$v->narrator_id && $v->narrator_share_percent !== null) DB::table('qv_tts_voices')->where('id', $id)->update(['narrator_share_percent' => null]);
        return response()->json(['voice' => self::publicVoice(self::voiceRow($id), true)]);
    }

    /** Legacy admin endpoints kept for the old «الأصوات» admin view */
    public function adminToggle(string $id)
    {
        $v = self::voiceRow($id);
        if (!$v) return response()->json(['error' => 'الصوت غير موجود'], 404);
        DB::table('qv_tts_voices')->where('id', $id)->update(['is_active' => !$v->is_active, 'updated_at' => now()]);
        Store::audit('system', 'admin', "VOICE_TOGGLE: {$v->name} -> " . (!$v->is_active ? 'ACTIVE' : 'INACTIVE'));
        return response()->json(['success' => true, 'voiceId' => $id, 'isActive' => !$v->is_active, 'message' => "تم تحديث حالة الصوت: {$v->name}"]);
    }

    public function adminLegacyUpdate(Request $r, string $id)
    {
        $v = self::voiceRow($id);
        if (!$v) return response()->json(['error' => 'الصوت غير موجود'], 404);
        $u = [];
        if ($r->has('bookingsCount')) $u['bookings_count'] = (int) $r->input('bookingsCount');
        if ($r->has('isActive')) $u['is_active'] = (bool) $r->input('isActive');
        if ($r->has('name')) $u['name'] = mb_substr((string) $r->input('name'), 0, 80);
        if ($r->has('isFeatured')) $u['is_featured'] = (bool) $r->input('isFeatured');
        if ($u) { $u['updated_at'] = now(); DB::table('qv_tts_voices')->where('id', $id)->update($u); }
        return response()->json(['success' => true, 'voice' => self::publicVoice(self::voiceRow($id), true), 'message' => 'تم تحديث بيانات الصوت']);
    }

    public function adminLegacyCreate(Request $r)
    {
        $r->merge(['provider' => $r->input('provider', 'qeema_acoustic')]);
        return $this->adminCreate($r);
    }
}
