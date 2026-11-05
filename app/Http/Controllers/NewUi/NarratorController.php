<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSample;
use App\Models\UserStatus;
use App\Models\UserType;
use App\Services\NewUi\Accounts;
use App\Services\NewUi\Mailer;
use App\Services\NewUi\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Narrator dashboards (port of new-ui/server/routes/narrators.ts).
 * The narrator state (narrators, samples, contracts, AI voices, notifications...) is one JSON document in qv_kv,
 * seeded and kept in sync with the voice actors of the old `users` table and their `user_samples`.
 */
class NarratorController extends Controller
{
    public const KEYS = ['narrators', 'aiVoices', 'contracts', 'usageEvents', 'auditLogs', 'voiceSamples', 'voiceOverBookings', 'notifications'];
    private const OTP_MINUTES = 10;
    private const INVITE_DAYS = 7;

    // ---------- state ----------
    public static function state(): array
    {
        $st = Store::get('narratorState');
        if (!is_array($st)) $st = ['narrators' => [], 'aiVoices' => (object) [], 'contracts' => (object) [], 'usageEvents' => [], 'auditLogs' => [], 'voiceSamples' => [], 'voiceOverBookings' => [], 'notifications' => []];
        foreach (self::KEYS as $k) if (!isset($st[$k])) $st[$k] = in_array($k, ['aiVoices', 'contracts'], true) ? [] : [];
        foreach (['aiVoices', 'contracts'] as $k) $st[$k] = (array) $st[$k];
        if (self::syncFromUsers($st)) Store::set('narratorState', $st);
        return $st;
    }

    public static function save(array $st): void
    {
        Store::set('narratorState', $st);
    }

    /** Voice actors of the old site and their samples appear in the narrator state automatically */
    private static function syncFromUsers(array &$st): bool
    {
        $changed = false;
        $known = [];
        foreach ($st['narrators'] as $n) $known[$n['id']] = true;
        $users = User::whereIn('user_type_id', [UserType::VOICE_ACTOR, UserType::CLIENT_ADN_VOICE_ACTOR])->orderBy('id')->get();
        foreach ($users as $u) {
            $id = 'narrator_u' . $u->id;
            if (isset($known[$id])) continue;
            $profile = null;
            try { $profile = $u->profile; } catch (\Throwable $e) {}
            $st['narrators'][] = [
                'id' => $id, 'displayName' => Accounts::name($u), 'phone' => (string) ($u->mobile ?? ''), 'email' => (string) $u->email,
                'avatarUrl' => $u->image ? $u->image_url : null, 'dialects' => [], 'country' => null, 'humanBadge' => 'none',
                'status' => (int) $u->status_id === UserStatus::ACCEPTED ? 'active' : ((int) $u->status_id === UserStatus::BLOCKED ? 'suspended' : 'unclaimed'),
                'kycStatus' => 'none', 'bio' => '', 'adminNotes' => [],
                'rates' => ['standardCommercialUsd' => 0, 'perWordRateUsd' => 0, 'hourlyLiveDirectingUsd' => 0, 'perMinuteUsd' => (float) ($profile->price_per_minute ?? 0) ?: null],
                'createdAt' => Store::iso(Store::created($u, 'created_at')),
            ];
            $known[$id] = true; $changed = true;
        }
        $knownSamples = [];
        foreach ($st['voiceSamples'] as $s) $knownSamples[$s['id']] = true;
        try {
            foreach (UserSample::query()->with(['dialect', 'category'])->orderBy('id')->get() as $s) {
                $id = 'sample_u' . $s->id;
                if (isset($knownSamples[$id]) || !isset($known['narrator_u' . $s->user_id])) continue;
                $status = (string) $s->status === (string) YES ? 'published' : ((string) $s->status === (string) NO ? 'rejected' : 'pending_review');
                $st['voiceSamples'][] = [
                    'id' => $id, 'narratorId' => 'narrator_u' . $s->user_id, 'title' => (string) ($s->getTranslation('name', 'ar', false) ?: $s->name),
                    'category' => $s->category ? (string) $s->category->name : '', 'dialect' => $s->dialect ? (string) $s->dialect->name : '',
                    'audioUrl' => $s->file ? asset_upload(UserSample::DIR_SAMPLES_UPLOADS . '/' . $s->file) : '', 'durationSec' => 0,
                    'pricePerMinute' => (float) $s->price_per_minute ?: null, 'status' => $status, 'format' => strtolower(pathinfo((string) $s->file, PATHINFO_EXTENSION)) ?: 'mp3',
                    'createdAt' => Store::iso(Store::created($s, 'created_at')), 'oldSampleId' => $s->id,
                ];
                $changed = true;
            }
        } catch (\Throwable $e) { report($e); }
        return $changed;
    }

    private static function ownerOf(string $key, array $item, array $st): ?string
    {
        if ($key === 'narrators') return $item['id'] ?? null;
        if ($key === 'usageEvents') {
            foreach ($st['aiVoices'] as $v) if (($v['id'] ?? null) === ($item['aiVoiceId'] ?? '')) return $v['narratorId'] ?? null;
            return null;
        }
        return $item['narratorId'] ?? null;
    }

    /** Which narrator this request may act for: 'all' for admins, a narrator id for its owner, or null */
    public static function actorFor(Request $r, ?array $st = null): ?string
    {
        $user = Accounts::currentUser($r);
        if (Accounts::isAdmin($user)) return 'all';
        if ($user && ($nid = Accounts::narratorId($user))) return $nid;
        $claim = (string) ($r->header('x-claim-token') ?: $r->query('claim', ''));
        if ($claim !== '') {
            foreach (($st ?: self::state())['narrators'] as $n) if (($n['claimToken'] ?? '') === $claim) return $n['id'];
        }
        return null;
    }

    private static function sliceFor(array $st, string $id): array
    {
        $out = [];
        foreach (self::KEYS as $k) {
            $v = $st[$k];
            if (in_array($k, ['aiVoices', 'contracts'], true)) {
                $o = [];
                foreach ((array) $v as $key => $i) if (is_array($i) && self::ownerOf($k, $i, $st) === $id) $o[$key] = $i;
                $out[$k] = (object) $o;
            } else {
                $out[$k] = array_values(array_filter((array) $v, fn ($i) => is_array($i) && self::ownerOf($k, $i, $st) === $id));
            }
        }
        return $out;
    }

    /** Fields only the admin team may change */
    private static function protect(string $key, array $mine, ?array $old): array
    {
        if ($key === 'narrators') {
            if (!$old) return array_merge($mine, ['status' => 'active', 'kycStatus' => 'none', 'humanBadge' => ($mine['humanBadge'] ?? '') === 'pending' ? 'pending' : 'none', 'adminNotes' => []]);
            $claimed = in_array($old['status'] ?? '', ['invited', 'unclaimed'], true) && ($mine['status'] ?? '') === 'active';
            $out = array_merge($mine, ['status' => $claimed ? 'active' : ($old['status'] ?? 'active'), 'kycStatus' => $old['kycStatus'] ?? 'none', 'adminNotes' => $old['adminNotes'] ?? [],
                'claimToken' => $old['claimToken'] ?? null, 'claimTokenExpiresAt' => $old['claimTokenExpiresAt'] ?? null]);
            if (mb_strtolower((string) ($mine['email'] ?? '')) !== mb_strtolower((string) ($old['email'] ?? ''))) {
                $verified = Cache::get('qv-email-verified:' . $old['id']);
                if ($verified && $verified === mb_strtolower((string) ($mine['email'] ?? ''))) Cache::forget('qv-email-verified:' . $old['id']);
                else $out['email'] = $old['email'] ?? null;
            }
            if (($old['humanBadge'] ?? '') === 'verified' || ($mine['humanBadge'] ?? '') === 'verified') {
                $out['humanBadge'] = $old['humanBadge'] ?? 'none';
                $out['humanVerification'] = $old['humanVerification'] ?? null;
            }
            return $out;
        }
        if ($key === 'voiceSamples') {
            if (!$old) return array_merge($mine, ['status' => !empty($mine['autoRejected']) ? 'rejected' : 'pending_review', 'reviewedAt' => null]);
            return array_merge($mine, ['status' => $old['status'] ?? 'pending_review', 'rejectionReason' => $old['rejectionReason'] ?? null,
                'rejectionCodes' => $old['rejectionCodes'] ?? null, 'reviewedAt' => $old['reviewedAt'] ?? null, 'oldSampleId' => $old['oldSampleId'] ?? null]);
        }
        return $mine;
    }

    /** Apply a narrator's own changes; everything else stays as on the server */
    private static function mergeOwned(array &$st, array $incoming, string $id): void
    {
        foreach (self::KEYS as $k) {
            if (in_array($k, ['usageEvents', 'voiceOverBookings'], true)) continue;
            if (!isset($incoming[$k])) continue;
            $srv = $st[$k]; $inc = $incoming[$k];
            if (!in_array($k, ['aiVoices', 'contracts'], true)) {
                $srv = (array) $srv;
                $mine = array_values(array_filter((array) $inc, fn ($i) => is_array($i) && self::ownerOf($k, $i, $st) === $id));
                if ($k === 'auditLogs') {
                    $ids = array_column($srv, 'id');
                    $new = array_filter($mine, fn ($i) => !in_array($i['id'] ?? null, $ids, true));
                    $st[$k] = array_values(array_merge($new, $srv));
                    continue;
                }
                $kept = array_values(array_filter($srv, fn ($i) => !is_array($i) || self::ownerOf($k, $i, $st) !== $id));
                $byId = [];
                foreach ($srv as $x) if (is_array($x) && isset($x['id'])) $byId[$x['id']] = $x;
                $merged = array_map(fn ($i) => self::protect($k, $i, $byId[$i['id'] ?? ''] ?? null), $mine);
                $st[$k] = array_values(array_merge($merged, $kept));
            } else {
                $out = [];
                foreach ((array) $srv as $key => $i) if (!is_array($i) || self::ownerOf($k, $i, $st) !== $id) $out[$key] = $i;
                foreach ((array) $inc as $key => $i) if (is_array($i) && self::ownerOf($k, $i, $st) === $id) $out[$key] = self::protect($k, $i, ((array) $srv)[$key] ?? null);
                $st[$k] = $out;
            }
        }
    }

    public function getState(Request $r)
    {
        $st = self::state();
        $who = self::actorFor($r, $st);
        if (!$who) return response()->json(['error' => 'يلزم تسجيل الدخول'], 401);
        if ($who === 'all') { $st['aiVoices'] = (object) $st['aiVoices']; $st['contracts'] = (object) $st['contracts']; return response()->json($st); }
        return response()->json(self::sliceFor($st, $who));
    }

    public function putState(Request $r)
    {
        $st = self::state();
        $body = $r->all();
        $user = Accounts::currentUser($r);
        $who = self::actorFor($r, $st);
        // First save of a new talent account: adopt the narrator record that carries the account's email
        if (!$who && $user && in_array((int) $user->user_type_id, [UserType::VOICE_ACTOR, UserType::CLIENT_ADN_VOICE_ACTOR], true)) {
            foreach ((array) ($body['narrators'] ?? []) as $n) {
                if (is_array($n) && !empty($n['email']) && mb_strtolower($n['email']) === mb_strtolower($user->email) && !self::has($st['narrators'], $n['id'] ?? '')) {
                    Accounts::linkNarrator($user, $n['id']); $who = $n['id']; break;
                }
            }
        }
        if (!$who) return response()->json(['error' => 'يلزم تسجيل الدخول'], 401);
        if ($who === 'all') {
            foreach (self::KEYS as $k) if (array_key_exists($k, $body)) $st[$k] = in_array($k, ['aiVoices', 'contracts'], true) ? (array) $body[$k] : array_values((array) $body[$k]);
            self::publishApprovedSamples($st);
        } else {
            self::mergeOwned($st, $body, $who);
        }
        self::save($st);
        return response()->json(['success' => true, 'narratorId' => $who === 'all' ? null : $who]);
    }

    private static function has(array $list, string $id): bool
    {
        foreach ($list as $x) if (($x['id'] ?? null) === $id) return true;
        return false;
    }

    /** A sample the admin approved in the new dashboard becomes a row of the old `voices` table (the real library). */
    private static function publishApprovedSamples(array &$st): void
    {
        foreach ($st['voiceSamples'] as &$s) {
            if (($s['status'] ?? '') !== 'published' || !empty($s['voiceRowId'])) continue;
            $uid = (int) str_replace('narrator_u', '', (string) ($s['narratorId'] ?? ''));
            if (!$uid) continue;
            try {
                $audio = (string) ($s['audioUrl'] ?? '');
                $file = null;
                if (Str::startsWith($audio, 'data:')) {
                    if (preg_match('#^data:([^;]+);base64,(.*)$#s', $audio, $m)) {
                        $ext = Str::contains($m[1], 'wav') ? 'wav' : 'mp3';
                        $file = 'qv_' . Str::random(10) . '.' . $ext;
                        $dir = public_path(DIR_UPLOAD . '/' . \App\Models\Voice::DIR_VOICES_UPLOADS);
                        if (!is_dir($dir)) @mkdir($dir, 0775, true);
                        file_put_contents($dir . '/' . $file, base64_decode($m[2]));
                    }
                } elseif (preg_match('#/uploads/(?:samples|voices)/([^/?]+)#', $audio, $m)) {
                    $file = $m[1];
                }
                $v = new \App\Models\Voice();
                $v->forceFill([
                    'title' => ['ar' => $s['title'] ?? 'عينة', 'en' => $s['title'] ?? 'Sample'], 'price_per_minute' => (float) ($s['pricePerMinute'] ?? 0),
                    'total_price' => (float) ($s['pricePerMinute'] ?? 0),   // NOT NULL column; the model's mutator adds the platform commission
                    'voiceover_id' => $uid, 'audio_file' => $file, 'is_sample' => YES, 'voice_status_id' => \App\Models\VoiceStatus::ACCEPTED,
                    'number_of_orders' => 0, 'number_of_listened' => 0, 'number_of_likes' => 0,
                    'meta_title' => ['ar' => $s['title'] ?? '', 'en' => $s['title'] ?? ''], 'meta_description' => ['ar' => '', 'en' => ''],
                ])->save();
                $s['voiceRowId'] = $v->id;                       // recorded first: the library must never list the sample twice
                if (!empty($s['category'])) {
                    try {
                        $cat = \App\Models\Category::all()->first(fn ($c) => PublicController::tr($c, 'name') === $s['category']);
                        if ($cat) DB::table('voice_categories')->insert(['voice_id' => $v->id, 'category_id' => $cat->id]);
                    } catch (\Throwable $e) { report($e); }
                }
            } catch (\Throwable $e) { report($e); }
        }
        unset($s);
    }

    // ---------- email verification codes ----------
    private function otpTarget(Request $r, array $st)
    {
        if ($r->input('purpose') === 'claim') {
            $token = (string) $r->header('x-claim-token', '');
            foreach ($st['narrators'] as $n) {
                if (($n['claimToken'] ?? '') === $token && $token !== '') {
                    if (empty($n['email'])) return ['error' => 'لا يوجد بريد مسجّل لهذا المعلق. تواصل مع فريق قيمة فويس.', 'status' => 400];
                    return ['key' => 'claim:' . $token, 'email' => $n['email']];
                }
            }
            return ['error' => 'رابط التفعيل غير صالح', 'status' => 404];
        }
        $user = Accounts::currentUser($r);
        $email = mb_strtolower(trim((string) $r->input('email', '')));
        if (!$user || !Accounts::narratorId($user)) return ['error' => 'يلزم تسجيل الدخول', 'status' => 401];
        if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) return ['error' => 'البريد الإلكتروني غير صحيح', 'status' => 400];
        return ['key' => 'email:' . Accounts::narratorId($user) . ':' . $email, 'email' => $email];
    }

    public function otpSend(Request $r)
    {
        $t = $this->otpTarget($r, self::state());
        if (isset($t['error'])) return response()->json(['error' => $t['error']], $t['status']);
        $code = (string) random_int(100000, 999999);
        Cache::put('qv-otp:' . sha1($t['key']), ['hash' => hash('sha256', $code), 'attempts' => 0], now()->addMinutes(self::OTP_MINUTES));
        try {
            Mailer::send($t['email'], 'رمز التحقق من قيمة فويس', "رمز التحقق الخاص بك: {$code}\nصالح لمدة " . self::OTP_MINUTES . " دقائق. إذا لم تطلب هذا الرمز فتجاهل الرسالة.");
        } catch (\Throwable $e) {
            Cache::forget('qv-otp:' . sha1($t['key']));
            return response()->json(['error' => 'تعذر إرسال رمز التحقق: إرسال البريد غير مفعّل على الخادم'], 503);
        }
        return response()->json(['success' => true, 'sentTo' => preg_replace('/^(.)[^@]*(@.*)$/u', '$1***$2', $t['email'])]);
    }

    public function otpVerify(Request $r)
    {
        $t = $this->otpTarget($r, self::state());
        if (isset($t['error'])) return response()->json(['error' => $t['error']], $t['status']);
        $ck = 'qv-otp:' . sha1($t['key']);
        $rec = Cache::get($ck);
        if (!$rec) return response()->json(['error' => 'انتهت صلاحية الرمز، اطلب رمزاً جديداً'], 400);
        if ($rec['attempts'] >= 5) { Cache::forget($ck); return response()->json(['error' => 'تجاوزت عدد المحاولات، اطلب رمزاً جديداً'], 429); }
        if (!hash_equals($rec['hash'], hash('sha256', (string) $r->input('code', '')))) {
            $rec['attempts']++; Cache::put($ck, $rec, now()->addMinutes(self::OTP_MINUTES));
            return response()->json(['error' => 'الرمز غير صحيح'], 400);
        }
        Cache::forget($ck);
        if (Str::startsWith($t['key'], 'claim:')) Cache::put('qv-claim-verified:' . substr($t['key'], 6), 1, now()->addHour());
        else { [, $nid, $email] = explode(':', $t['key'], 3); Cache::put('qv-email-verified:' . $nid, $email, now()->addHour()); }
        return response()->json(['verified' => true]);
    }

    public static function claimVerified(string $token): bool
    {
        return (bool) Cache::get('qv-claim-verified:' . $token);
    }

    public static function activateClaimed(string $narratorId, string $token): void
    {
        $st = self::state();
        foreach ($st['narrators'] as &$n) {
            if ($n['id'] === $narratorId) { $n['status'] = 'active'; $n['claimToken'] = null; $n['claimTokenExpiresAt'] = null; }
        }
        unset($n);
        self::save($st);
        Cache::forget('qv-claim-verified:' . $token);
    }

    // ---------- invitations ----------
    private static function issueInvite(array &$n, Request $r): array
    {
        $n['claimToken'] = bin2hex(random_bytes(24));
        $n['claimTokenExpiresAt'] = now()->addDays(self::INVITE_DAYS)->toIso8601String();
        if (($n['status'] ?? '') !== 'active') $n['status'] = 'invited';
        $origin = rtrim((string) env('SITE_URL', $r->getSchemeAndHttpHost()), '/');
        $link = "{$origin}/claim/{$n['claimToken']}";
        $emailed = !empty($n['email']) && Mailer::trySend($n['email'], 'دعوة لتفعيل حسابك في قيمة فويس',
            "مرحباً " . ($n['displayName'] ?? '') . "،\nتمت دعوتك لتفعيل حسابك كمعلق صوتي في قيمة فويس.\nرابط التفعيل (صالح " . self::INVITE_DAYS . " أيام):\n{$link}");
        return ['link' => $link, 'emailed' => $emailed];
    }

    public function invite(Request $r, string $id)
    {
        $st = self::state();
        foreach ($st['narrators'] as &$n) {
            if ($n['id'] === $id) {
                if (($n['status'] ?? '') === 'active') return response()->json(['error' => 'الحساب مفعّل بالفعل'], 400);
                $res = self::issueInvite($n, $r);
                $out = $n; unset($n);
                self::save($st);
                return response()->json(array_merge(['narrator' => $out], $res));
            }
        }
        return response()->json(['error' => 'المعلق غير موجود'], 404);
    }

    public function inviteAll(Request $r)
    {
        $st = self::state();
        $count = 0; $emailed = 0;
        foreach ($st['narrators'] as &$n) {
            if (($n['status'] ?? '') === 'unclaimed') { $count++; if (self::issueInvite($n, $r)['emailed']) $emailed++; }
        }
        unset($n);
        self::save($st);
        return response()->json(['count' => $count, 'emailed' => $emailed]);
    }

    public function claimLink(Request $r)
    {
        $q = mb_strtolower(trim((string) $r->input('contact', '')));
        if (mb_strlen($q) >= 5) {
            $st = self::state();
            foreach ($st['narrators'] as &$n) {
                $phone = preg_replace('/\D/', '', (string) ($n['phone'] ?? ''));
                if (($n['status'] ?? '') !== 'active' && (mb_strtolower((string) ($n['email'] ?? '')) === $q || ($phone !== '' && $phone === preg_replace('/\D/', '', $q)))) {
                    self::issueInvite($n, $r); unset($n); self::save($st); break;
                }
            }
        }
        return response()->json(['success' => true, 'message' => 'إذا كانت البيانات مسجلة لدينا، أرسلنا رابط تفعيل جديداً إلى بريدك الإلكتروني المسجل.']);
    }

    public function manualReview(Request $r)
    {
        $name = mb_substr(trim((string) $r->input('fullName', '')), 0, 100);
        $phone = mb_substr(trim((string) $r->input('newPhone', '')), 0, 40);
        if (!$name || strlen(preg_replace('/\D/', '', $phone)) < 8) return response()->json(['error' => 'أدخل الاسم ورقم جوال صحيح'], 400);
        $ref = 'MAN-' . random_int(100000, 999999);
        PublicController::storeMessage($name, '', 'طلب تفعيل يدوي لحساب معلق', "المرجع: {$ref}\nالجوال الجديد: {$phone}\n" . mb_substr((string) $r->input('notes', ''), 0, 1000), $phone);
        return response()->json(['success' => true, 'referenceNumber' => $ref]);
    }

    /** Payout and emergency-stop requests from the narrator dashboard land in the admin «الرسائل البريدية» */
    public function requests(Request $r, string $id)
    {
        $st = self::state();
        $who = self::actorFor($r, $st);
        if ($who !== 'all' && $who !== $id) return response()->json(['error' => 'غير مصرح'], 403);
        $n = null;
        foreach ($st['narrators'] as $x) if ($x['id'] === $id) { $n = $x; break; }
        if (!$n) return response()->json(['error' => 'المعلق غير موجود'], 404);
        $type = $r->input('type');
        if ($type === 'payout') {
            $amount = round((float) $r->input('amountUsd'), 2);
            if ($amount <= 0) return response()->json(['error' => 'أدخل مبلغاً صحيحاً'], 400);
            $subject = 'طلب سحب أرباح معلق';
            $message = "المعلق {$n['displayName']} ({$n['id']}) يطلب سحب \${$amount}\nطريقة الاستلام: " . (mb_substr((string) $r->input('method', ''), 0, 60) ?: 'غير محددة');
        } elseif ($type === 'emergency') {
            $subject = 'طلب إيقاف استثنائي لصوت معلق';
            $message = "المعلق {$n['displayName']} ({$n['id']}) يطلب إيقاف صوته فوراً\nالسبب: " . mb_substr((string) $r->input('reason', ''), 0, 200) . "\n" . mb_substr((string) $r->input('details', ''), 0, 2000);
        } else return response()->json(['error' => 'نوع طلب غير معروف'], 400);
        $mid = PublicController::storeMessage((string) $n['displayName'], (string) ($n['email'] ?? ''), $subject, $message, (string) ($n['phone'] ?? ''));
        return response()->json(['success' => true, 'id' => $mid]);
    }

    public function studioVoices(Request $r, string $id)
    {
        $who = self::actorFor($r);
        if ($who !== 'all' && $who !== $id) return response()->json(['error' => 'غير مصرح'], 403);
        $rows = DB::table('qv_tts_voices')->where('narrator_id', $id)->get()->map(fn ($v) => array_merge(VoicesController::publicVoice($v), ['narratorSharePercent' => (float) $v->narrator_share_percent]))->all();
        return response()->json(['voices' => $rows]);
    }

    public function earnings(Request $r, string $id)
    {
        $who = self::actorFor($r);
        if ($who !== 'all' && $who !== $id) return response()->json(['error' => 'غير مصرح'], 403);
        $rows = DB::table('qv_narrator_earnings')->where('narrator_id', $id)->orderByDesc('created_at')->get()->map(fn ($e) => AdminController::earningRow($e))->all();
        $total = 0.0; foreach ($rows as $e) $total += $e['narratorUsd'];
        return response()->json(['earnings' => $rows, 'totalUsd' => round($total, 2)]);
    }
}
