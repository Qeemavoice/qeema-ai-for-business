<?php

namespace App\QeemaChat\Tools;

use App\QeemaChat\Matching\TalentRanker;
use App\QeemaChat\Notify\TeamNotifier;
use App\QeemaChat\Support\TextTrimmer;
use App\QeemaChat\Support\ToolDefinitions;
use App\QeemaChat\Voice\ElevenLabsClient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

/**
 * ينفذ أدوات الشات على قاعدة البيانات. كل قيود الرصيد والحماية هنا، لا في تعليمات النموذج.
 */
class LaravelToolExecutor implements ToolExecutor
{
    private array $cfg;

    public function __construct(
        private object $conversation,      // صف من qv_chat_conversations
        private ?object $lead,             // صف من qv_chat_leads أو null
        private string $deviceId,
        private string $ip,
        private ElevenLabsClient $voice,
        private TeamNotifier $notifier,
    ) {
        $this->cfg = config('qeema_chat');
    }

    public function context(): array
    {
        return [
            'today' => now()->toDateString(),
            'user_type' => $this->conversation->user_type ?? null,
            'lead_verified' => $this->leadVerified(),
            'has_script' => trim((string) $this->conversation->script) !== '',
            'handoff_open' => $this->conversation->status === 'handoff',
            'remaining_previews' => $this->leadVerified() ? $this->remainingPreviews() : null,
        ];
    }

    public function execute(string $name, array $input): array
    {
        return match ($name) {
            'set_user_type' => $this->setUserType($input),
            'show_artist_join' => $this->artistJoin(),
            'show_artist_help' => $this->artistHelp(),
            'artist_support_request' => $this->artistSupport($input),
            'search_talents' => $this->searchTalents($input),
            'generate_preview' => $this->generatePreview($input),
            'create_order' => $this->createOrder($input),
            'handoff_to_team' => $this->handoff($input),
            default => ['result' => ['status' => 'error', 'message' => 'أداة غير معروفة'], 'ui' => []],
        };
    }

    // ───────────────────────────── البحث والترشيح ─────────────────────────────

    private function searchTalents(array $in): array
    {
        $brief = [
            'use_case' => in_array($in['use_case'] ?? '', ToolDefinitions::USE_CASES, true) ? $in['use_case'] : 'other',
            'dialect' => $in['dialect'] ?? '',
            'gender' => in_array($in['gender'] ?? '', ['male', 'female'], true) ? $in['gender'] : 'any',
            'tone' => array_values(array_intersect((array) ($in['tone'] ?? []), ToolDefinitions::TONES)),
            'age_range' => $in['age_range'] ?? 'any',
            'duration_minutes' => isset($in['duration_minutes']) ? max(0, (float) $in['duration_minutes']) : null,
            'budget_usd' => isset($in['budget_usd']) ? max(0, (float) $in['budget_usd']) : null,
            'deadline' => $in['deadline'] ?? null,
        ];

        if (!in_array($brief['dialect'], ToolDefinitions::DIALECTS, true)) {
            return ['result' => ['status' => 'error', 'message' => 'اللهجة غير معروفة، اختر من القائمة'], 'ui' => []];
        }

        $talents = DB::table('qv_chat_talents')->where('available', true)->get()
            ->map(fn ($r) => $this->decodeTalent($r))->all();

        $ranked = TalentRanker::rank($talents, $brief, $this->cfg['limits']['search_results']);
        $results = $ranked['results'];

        DB::table('qv_chat_conversations')->where('id', $this->conversation->id)->update([
            'brief' => json_encode($brief, JSON_UNESCAPED_UNICODE),
            'last_results' => json_encode(array_column($results, 'talent_code')),
            'updated_at' => now(),
        ]);
        $this->conversation->brief = json_encode($brief, JSON_UNESCAPED_UNICODE);

        if (!$results) {
            return ['result' => ['status' => 'no_results', 'count' => 0], 'ui' => []];
        }

        $forModel = array_map(fn ($t) => [
            'talent_code' => $t['talent_code'],
            'name' => $t['name'],
            'dialects' => $t['dialects'],
            'tones' => $t['tones'],
            'use_cases' => $t['use_cases'],
            'price_per_minute_usd' => (float) $t['price_per_minute_usd'],
            'turnaround_days' => (int) $t['turnaround_days'],
            'has_clone' => (bool) $t['has_clone'],
            'estimate' => TalentRanker::estimateCost($t, $brief),
        ], $results);

        $cards = array_map(fn ($t) => [
            'code' => $t['talent_code'],
            'name' => $t['name'],
            'photo' => $t['photo_url'],
            'profile_url' => $t['profile_url'],
            'sample_url' => $t['sample_url'],
            'dialects' => $t['dialects'],
            'tones' => $t['tones'],
            'gender' => $t['gender'],
            'price_per_minute_usd' => (float) $t['price_per_minute_usd'],
            'ai_price_per_minute_usd' => $t['has_clone'] && $t['ai_price_per_minute_usd'] !== null ? (float) $t['ai_price_per_minute_usd'] : null,
            'turnaround_days' => (int) $t['turnaround_days'],
            'has_clone' => (bool) $t['has_clone'],
            'verified_human' => (bool) $t['verified_human'],
            'estimate' => TalentRanker::estimateCost($t, $brief),
        ], $results);

        return [
            'result' => ['status' => 'ok', 'count' => count($results), 'relaxed' => $ranked['relaxed'], 'talents' => $forModel],
            'ui' => [['type' => 'talents', 'items' => $cards]],
        ];
    }

    // ───────────────────────────── المعاينة ─────────────────────────────

    private function generatePreview(array $in): array
    {
        $talent = $this->findTalent($in['talent_code'] ?? '');
        if (!$talent) {
            return ['result' => ['status' => 'error', 'message' => 'رمز المعلق غير موجود'], 'ui' => []];
        }

        if (!$talent['has_clone'] || !$talent['elevenlabs_voice_id']) {
            return [
                'result' => ['status' => 'no_clone', 'name' => $talent['name']],
                'ui' => [['type' => 'sample', 'code' => $talent['talent_code'], 'name' => $talent['name'], 'sample_url' => $talent['sample_url']]],
            ];
        }

        if (!$this->leadVerified()) {
            return $this->leadRequired('preview');
        }

        $source = trim((string) ($in['text'] ?? '')) ?: trim((string) $this->conversation->script);
        if ($source === '') {
            return ['result' => ['status' => 'no_script', 'message' => 'اطلب من العميل لصق جزء من السيناريو'], 'ui' => []];
        }

        if ($this->isBlocked($source)) {
            return ['result' => ['status' => 'blocked_content', 'message' => 'النص يحتاج مراجعة الفريق قبل المعاينة'], 'ui' => []];
        }

        $trim = TextTrimmer::forPreview($source, $this->cfg['limits']['preview_max_chars']);
        $model = $this->cfg['elevenlabs']['preview_model'];
        $cacheKey = hash('sha256', $talent['id'] . '|' . $model . '|' . $trim['text']);

        // نفس المعلق ونفس النص: نعيد نفس الملف بدون خصم رصيد
        $existing = DB::table('qv_chat_previews')
            ->where('cache_key', $cacheKey)
            ->where('expires_at', '>', now())
            ->first();
        if ($existing) {
            return $this->previewPayload($existing->id, $talent, $trim, true);
        }

        $quota = $this->quotaProblem();
        if ($quota) {
            return [
                'result' => ['status' => 'quota_exhausted', 'reason' => $quota, 'remaining_free_previews' => 0],
                'ui' => [['type' => 'quota', 'reason' => $quota]],
            ];
        }

        $audio = $this->voice->speak($talent['elevenlabs_voice_id'], $trim['text']);

        $id = (string) Str::uuid();
        $path = trim($this->cfg['storage_dir'], '/') . '/' . $id . '.mp3';
        Storage::disk($this->cfg['storage_disk'])->put($path, $audio);

        DB::transaction(function () use ($id, $talent, $trim, $model, $path, $cacheKey) {
            DB::table('qv_chat_previews')->insert([
                'id' => $id,
                'conversation_id' => $this->conversation->id,
                'lead_id' => $this->lead->id,
                'talent_id' => $talent['id'],
                'text' => $trim['text'],
                'chars' => $trim['chars'],
                'model' => $model,
                'file_path' => $path,
                'cache_key' => $cacheKey,
                'device_id' => $this->deviceId,
                'ip' => $this->ip,
                'expires_at' => now()->addHours($this->cfg['limits']['preview_link_hours']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('qv_chat_leads')->where('id', $this->lead->id)->increment('previews_used');
        });
        $this->lead->previews_used++;

        return $this->previewPayload($id, $talent, $trim, false);
    }

    private function previewPayload(string $id, array $talent, array $trim, bool $cached): array
    {
        $url = URL::temporarySignedRoute('qv-chat.preview', now()->addHours($this->cfg['limits']['preview_link_hours']), ['id' => $id]);
        $remaining = $this->remainingPreviews();

        return [
            'result' => [
                'status' => 'ok',
                'name' => $talent['name'],
                'trimmed' => $trim['trimmed'],
                'remaining_free_previews' => $remaining,
                'reused' => $cached,
            ],
            'ui' => [[
                'type' => 'preview',
                'code' => $talent['talent_code'],
                'name' => $talent['name'],
                'url' => $url,
                'remaining' => $remaining,
                'trimmed' => $trim['trimmed'],
                'has_ai_price' => $talent['ai_price_per_minute_usd'] !== null,
            ]],
        ];
    }

    /** يرجع سبب المنع أو null إذا كان مسموحًا */
    private function quotaProblem(): ?string
    {
        if ($this->remainingPreviews() <= 0) {
            return 'lead_limit';
        }

        $limits = $this->cfg['limits'];
        $deviceUsed = DB::table('qv_chat_previews')->where('device_id', $this->deviceId)->count();
        if ($deviceUsed >= $limits['previews_per_device'] + (int) $this->lead->bonus_previews) {
            return 'device_limit';
        }

        $ipToday = DB::table('qv_chat_previews')->where('ip', $this->ip)
            ->where('created_at', '>=', now()->startOfDay())->count();
        if ($ipToday >= $limits['previews_per_ip_per_day']) {
            return 'ip_limit';
        }

        return null;
    }

    private function remainingPreviews(): int
    {
        if (!$this->lead) {
            return 0;
        }
        $allowed = $this->cfg['limits']['free_previews_per_lead'] + (int) $this->lead->bonus_previews;

        return max(0, $allowed - (int) $this->lead->previews_used);
    }

    // ───────────────────────────── الطلب ─────────────────────────────

    private function createOrder(array $in): array
    {
        $talent = $this->findTalent($in['talent_code'] ?? '');
        if (!$talent) {
            return ['result' => ['status' => 'error', 'message' => 'رمز المعلق غير موجود'], 'ui' => []];
        }

        $type = ($in['order_type'] ?? 'human') === 'ai_clone' ? 'ai_clone' : 'human';
        if ($type === 'ai_clone' && (!$talent['has_clone'] || $talent['ai_price_per_minute_usd'] === null)) {
            return ['result' => ['status' => 'error', 'message' => 'هذا المعلق ليس له نسخة AI متاحة للبيع، اعرض التسجيل البشري'], 'ui' => []];
        }

        if (!$this->leadVerified()) {
            return $this->leadRequired('order');
        }

        $requestId = DB::table('qv_chat_requests')->insertGetId([
            'type' => $type === 'ai_clone' ? 'order_ai' : 'order_human',
            'conversation_id' => $this->conversation->id,
            'lead_id' => $this->lead->id,
            'talent_id' => $talent['id'],
            'brief' => $this->conversation->brief,
            'script' => $this->conversation->script,
            'notes' => isset($in['notes']) ? mb_substr((string) $in['notes'], 0, 2000) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('qv_chat_conversations')->where('id', $this->conversation->id)
            ->update(['status' => 'ordered', 'updated_at' => now()]);

        // معاينة إضافية بعد أول طلب
        if ((int) $this->lead->bonus_previews === 0) {
            $bonus = (int) $this->cfg['limits']['bonus_previews_after_order'];
            DB::table('qv_chat_leads')->where('id', $this->lead->id)->update(['bonus_previews' => $bonus]);
            $this->lead->bonus_previews = $bonus;
        }

        $ref = 'QV-R-' . str_pad((string) $requestId, 6, '0', STR_PAD_LEFT);
        $this->notifier->send($type === 'ai_clone' ? 'طلب نسخة AI جديد' : 'طلب تسجيل بشري جديد', [
            'المرجع' => $ref,
            'المعلق' => $talent['name'] . ' (' . $talent['talent_code'] . ')',
            'العميل' => trim(($this->lead->name ?? '') . ' ' . $this->lead->phone),
            'البيانات' => $this->conversation->brief,
            'ملاحظات' => $in['notes'] ?? '',
            'السيناريو' => mb_substr((string) $this->conversation->script, 0, 3000),
        ]);

        $next = str_replace(':name', $talent['name'], $this->cfg['messages'][$type === 'ai_clone' ? 'order_ai' : 'order_human']);

        return [
            'result' => ['status' => 'ok', 'reference' => $ref, 'next_step' => $next],
            'ui' => [['type' => 'order', 'reference' => $ref, 'order_type' => $type, 'name' => $talent['name'], 'next_step' => $next]],
        ];
    }

    // ───────────────────────────── نوع المستخدم ─────────────────────────────

    private function setUserType(array $in): array
    {
        $type = ($in['user_type'] ?? '') === 'artist' ? 'artist' : 'client';
        DB::table('qv_chat_conversations')->where('id', $this->conversation->id)
            ->update(['user_type' => $type, 'updated_at' => now()]);
        $this->conversation->user_type = $type;

        return ['result' => ['status' => 'ok', 'user_type' => $type], 'ui' => []];
    }

    // ───────────────────────────── انضمام معلق ─────────────────────────────

    private function artistJoin(): array
    {
        $links = array_filter([
            'signup_url' => $this->cfg['artist']['signup_url'] ?? null,
            'guide_url' => $this->cfg['artist']['guide_url'] ?? null,
            'samples_rules_url' => $this->cfg['artist']['samples_rules_url'] ?? null,
        ]);

        return [
            'result' => ['status' => 'ok', 'shown' => array_keys($links)],
            'ui' => [['type' => 'artist_join'] + $links],
        ];
    }

    private function artistHelp(): array
    {
        $links = array_filter([
            'blog_url' => $this->cfg['artist']['blog_url'] ?? null,
            'terms_url' => $this->cfg['artist']['terms_url'] ?? null,
        ]);

        return [
            'result' => ['status' => 'ok', 'shown' => array_keys($links)],
            'ui' => [['type' => 'artist_help'] + $links],
        ];
    }

    // ───────────────────────────── طلب دعم المعلق (رد خلال 48 ساعة) ─────────────────────────────

    private function artistSupport(array $in): array
    {
        if (!$this->leadVerified()) {
            return $this->leadRequired('artist_support');
        }

        $category = mb_substr((string) ($in['category'] ?? 'other'), 0, 40);
        $summary = mb_substr(trim((string) ($in['summary'] ?? '')), 0, 1000);

        $requestId = DB::table('qv_chat_requests')->insertGetId([
            'type' => 'artist_support',
            'conversation_id' => $this->conversation->id,
            'lead_id' => $this->lead->id,
            'reason' => $category,
            'summary' => $summary,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ref = 'QV-T-' . str_pad((string) $requestId, 6, '0', STR_PAD_LEFT);
        $this->notifier->send('طلب دعم فني من معلق (الرد خلال 48 ساعة)', [
            'المرجع' => $ref,
            'التصنيف' => $category,
            'المشكلة' => $summary,
            'المعلق' => trim(($this->lead->name ?? '') . ' ' . $this->lead->phone),
        ]);

        $msg = $this->cfg['messages']['artist_support'];

        return [
            'result' => ['status' => 'ok', 'reference' => $ref, 'next_step' => $msg],
            'ui' => [['type' => 'ticket', 'reference' => $ref, 'message' => $msg]],
        ];
    }

    // ───────────────────────────── التحويل لموظف الدعم (واتساب) ─────────────────────────────

    private function handoff(array $in): array
    {
        $number = preg_replace('/\D+/', '', (string) ($this->cfg['support_whatsapp'] ?? ''));
        if ($number === '') {
            return ['result' => ['status' => 'error', 'message' => 'رقم واتساب الدعم غير مضبوط، اعتذر وأكمل المساعدة بنفسك'], 'ui' => []];
        }

        $reason = mb_substr((string) ($in['reason'] ?? 'asked_for_human'), 0, 40);
        $summary = mb_substr(trim((string) ($in['summary'] ?? '')), 0, 600);

        $requestId = DB::table('qv_chat_requests')->insertGetId([
            'type' => 'handoff',
            'conversation_id' => $this->conversation->id,
            'lead_id' => $this->lead->id ?? null,
            'reason' => $reason,
            'summary' => $summary,
            'brief' => $this->conversation->brief,
            'script' => $this->conversation->script,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('qv_chat_conversations')->where('id', $this->conversation->id)
            ->update(['status' => 'handoff', 'updated_at' => now()]);
        $this->conversation->status = 'handoff';

        $ref = 'QV-S-' . str_pad((string) $requestId, 6, '0', STR_PAD_LEFT);
        $who = ($this->conversation->user_type ?? '') === 'artist' ? 'معلق صوتي' : 'عميل';
        $text = "مرحبًا، أنا {$who} وتواصلت من شات قيمة فويس.\nرقم الطلب: {$ref}\n{$summary}";
        $url = 'https://wa.me/' . $number . '?text=' . rawurlencode($text);

        $this->notifier->send('تحويل لموظف الدعم عبر الواتساب', [
            'المرجع' => $ref,
            'النوع' => $who,
            'السبب' => $reason,
            'الملخص' => $summary,
            'المحادثة' => $this->conversation->id,
        ]);

        return [
            'result' => ['status' => 'ok', 'reference' => $ref, 'next_step' => $this->cfg['messages']['handoff']],
            'ui' => [['type' => 'whatsapp', 'reference' => $ref, 'url' => $url]],
        ];
    }

    // ───────────────────────────── مساعدات ─────────────────────────────

    private function leadVerified(): bool
    {
        return $this->lead !== null && $this->lead->verified_at !== null;
    }

    private function leadRequired(string $for): array
    {
        return [
            'result' => ['status' => 'lead_required', 'for' => $for],
            'ui' => [['type' => 'lead_form', 'for' => $for, 'otp' => (bool) $this->cfg['otp']['enabled']]],
        ];
    }

    private function findTalent(string $code): ?array
    {
        $row = DB::table('qv_chat_talents')->where('talent_code', strtoupper(trim($code)))->first();

        return $row ? $this->decodeTalent($row) : null;
    }

    private function decodeTalent(object $r): array
    {
        $t = (array) $r;
        foreach (['dialects', 'tones', 'use_cases'] as $k) {
            $t[$k] = is_array($t[$k]) ? $t[$k] : (json_decode((string) $t[$k], true) ?: []);
        }
        $t['has_clone'] = (bool) $t['has_clone'];
        $t['available'] = (bool) $t['available'];

        return $t;
    }

    private function isBlocked(string $text): bool
    {
        foreach ($this->cfg['blocked_terms'] ?? [] as $term) {
            if ($term !== '' && mb_stripos($text, $term) !== false) {
                return true;
            }
        }

        return false;
    }
}
