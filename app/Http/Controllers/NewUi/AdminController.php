<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Voice;
use App\Models\VoiceStatus;
use App\Services\NewUi\Accounts;
use App\Services\NewUi\Bookings;
use App\Services\NewUi\Library;
use App\Services\NewUi\Plans;
use App\Services\NewUi\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** Admin dashboard API (port of new-ui/server/routes/admin.ts) on MySQL. */
class AdminController extends Controller
{
    private const SECRET_FIELDS = ['stripe' => ['liveSecretKey', 'testSecretKey'], 'smtp' => ['password'], 'elevenlabs' => ['apiKey']];

    public static function earningRow(object $e): array
    {
        return ['id' => $e->id, 'narratorId' => $e->narrator_id, 'voiceId' => $e->voice_id, 'voiceName' => $e->voice_name, 'generationId' => $e->generation_id,
            'companyId' => 'c' . $e->company_user_id, 'chars' => (int) $e->chars, 'grossUsd' => (float) $e->gross_usd, 'sharePercent' => (float) $e->share_percent,
            'narratorUsd' => (float) $e->narrator_usd, 'platformUsd' => (float) $e->platform_usd, 'createdAt' => Store::iso(Store::created($e, 'created_at'))];
    }

    private function generationRow(object $g, array $names): array
    {
        $row = ClientController::generationRow($g);
        $row['companyName'] = $names[$g->user_id] ?? ('c' . $g->user_id);
        $row['userName'] = $names[$g->actor_user_id] ?? (string) $g->actor_user_id;
        return $row;
    }

    private function userNames(): array
    {
        $out = [];
        foreach (User::select('id', 'full_name', 'email')->get() as $u) $out[$u->id] = Accounts::name($u);
        return $out;
    }

    public function overview()
    {
        $companies = Accounts::clientUsers()->map(function ($u) {
            $c = Accounts::company($u);
            $c['balance'] = Accounts::balance($u->id);
            $c['generationsCount'] = DB::table('qv_generations')->where('user_id', $u->id)->count();
            return $c;
        })->values()->all();
        $bookings = Bookings::all();
        $revenue = 0.0; $payouts = 0.0; $pending = 0;
        $count = ['total' => 0, 'active' => 0, 'completed' => 0, 'canceled' => 0, 'thisMonth' => 0, 'lastMonth' => 0];
        $monthStart = Store::iso(now()->startOfMonth()); $lastStart = Store::iso(now()->subMonthNoOverflow()->startOfMonth());
        $lastOrderAt = null;
        foreach ($bookings as $b) {
            $count['total']++;
            if ($b['status'] === 'canceled') { $count['canceled']++; continue; }   // canceled/rejected orders are not revenue
            // ponytail: sums the order totals as stored (every order is USD today); convert per currency_id if SAR orders appear
            $revenue += $b['priceUsd']; $payouts += $b['talentPayoutUsd'];
            in_array($b['status'], ['delivered', 'approved'], true) ? $count['completed']++ : $count['active']++;
            if (in_array($b['status'], ['pending', 'in_studio'], true)) $pending++;
            if ($b['createdAt'] >= $monthStart) $count['thisMonth']++; elseif ($b['createdAt'] >= $lastStart) $count['lastMonth']++;
            if (!$lastOrderAt || $b['createdAt'] > $lastOrderAt) $lastOrderAt = $b['createdAt'];
        }
        $names = $this->userNames();
        $recent = DB::table('qv_generations')->orderByDesc('created_at')->limit(15)->get()->map(fn ($g) => $this->generationRow($g, $names))->all();
        return response()->json([
            'companies' => $companies,
            'voicesCount' => DB::table('qv_tts_voices')->count() + Voice::where('voice_status_id', VoiceStatus::ACCEPTED)->count(),
            'aiVoicesCount' => DB::table('qv_tts_voices')->count(),
            'humanVoicesCount' => Voice::where('voice_status_id', VoiceStatus::ACCEPTED)->count(),
            'totalGenerations' => DB::table('qv_generations')->count(),
            'totalCharsGenerated' => (int) DB::table('qv_generations')->sum('text_chars'),
            'totalSystemCostUsd' => round((float) DB::table('qv_generations')->sum('cost_usd'), 4),
            'totalBookingsRevenueUsd' => round($revenue, 2), 'totalTalentPayoutsUsd' => round($payouts, 2), 'platformBookingMarginUsd' => round($revenue - $payouts, 2),
            'pendingBookingsCount' => $pending, 'bookingCounts' => $count, 'lastBookingAt' => $lastOrderAt,
            'customersCount' => count($companies),
            'narratorsCount' => User::whereIn('user_type_id', [\App\Models\UserType::VOICE_ACTOR, \App\Models\UserType::CLIENT_ADN_VOICE_ACTOR])->count(),
            // real configuration state instead of a fixed «operational» badge
            'providers' => ['elevenlabs' => (string) (Store::integrations()['elevenlabs']['apiKey'] ?? '') !== '',
                'gemini' => !in_array((string) env('GEMINI_API_KEY', ''), ['', 'MY_GEMINI_API_KEY'], true)],
            'systemSettings' => Store::settings(), 'recentLogs' => Store::auditLogs(30), 'recentGenerations' => $recent,
        ]);
    }

    public function bookings()
    {
        $bookings = Bookings::all();
        // «زبون متكرر»: the same client booked more than once (canceled orders not counted). Grouped by e-mail, so the
        // bookings of one person count together whether made with the account or as a guest.
        $key = fn ($b) => $b['customerEmail'] !== '' ? $b['customerEmail'] : $b['companyId'];
        $count = [];
        foreach ($bookings as $b) if ($b['status'] !== 'canceled') $count[$key($b)] = ($count[$key($b)] ?? 0) + 1;
        $revenue = 0.0; $narrators = 0.0; $n = 0;
        foreach ($bookings as &$b) {
            $b['customerBookingsCount'] = $count[$key($b)] ?? 0;
            $b['repeatCustomer'] = $b['customerBookingsCount'] > 1;
            if ($b['status'] === 'canceled') continue;
            $revenue += $b['priceUsd']; $narrators += $b['talentPayoutUsd']; $n++;
        }
        unset($b);
        return response()->json(['bookings' => $bookings, 'summary' => [
            'bookingsCount' => $n,   // canceled / rejected orders excluded from every figure
            'revenueUsd' => round($revenue, 2), 'narratorEarningsUsd' => round($narrators, 2), 'platformEarningsUsd' => round($revenue - $narrators, 2),
            'repeatCustomers' => count(array_filter($count, fn ($c) => $c > 1)), 'customers' => count($count),
        ]]);
    }

    /** GET admin/bookings/{id}: the booking page (order, client, narrator, script, lines, payments, messages, ratings) */
    public function bookingDetail(string $id)
    {
        $d = \App\Services\NewUi\BookingDetail::find($id);
        return $d ? response()->json(['booking' => $d]) : response()->json(['error' => 'طلب الحجز غير موجود'], 404);
    }

    public function bookingStatus(Request $r, string $id)
    {
        $status = (string) $r->input('status', '');
        if (!in_array($status, Bookings::STATUSES, true)) return response()->json(['error' => 'حالة الطلب غير صالحة'], 400);
        $b = Bookings::setStatus($id, $status, $r->input('deliverableUrl') ? (string) $r->input('deliverableUrl') : null);
        if (!$b) return response()->json(['error' => 'طلب الحجز غير موجود'], 404);
        return response()->json(['success' => true, 'booking' => $b, 'message' => "تم تحديث حالة الحجز {$b['id']} إلى: {$status}"]);
    }

    public function payouts()
    {
        $p = Bookings::payouts();
        $pending = 0.0; $paid = 0.0;
        foreach ($p as $x) { $pending += $x['pendingBalanceUsd']; $paid += $x['paidOutUsd']; }
        return response()->json(['payouts' => $p, 'totalPendingUsd' => round($pending, 2), 'totalPaidOutUsd' => round($paid, 2)]);
    }

    public function processPayout(Request $r, string $talentId)
    {
        $p = Bookings::processPayout($talentId, $r->filled('amount') ? (float) $r->input('amount') : null);
        if (!$p) return response()->json(['error' => 'سجل المعلق غير موجود'], 404);
        return response()->json(['success' => true, 'payout' => $p, 'message' => "تم تسجيل تسوية المستحقات للمعلق {$p['talentName']} بنجاح"]);
    }

    private function companyUser(string $companyId): ?User
    {
        $uid = Accounts::userIdOfCompany($companyId);
        return $uid ? User::find($uid) : null;
    }

    public function updatePlan(Request $r, string $id)
    {
        $u = $this->companyUser($id);
        if (!$u) return response()->json(['error' => 'الشركة غير موجودة'], 404);
        $planId = (string) $r->input('planId', '');
        if (!Plans::find($planId)) return response()->json(['error' => 'الباقة غير موجودة'], 400);
        Accounts::saveAccount($u, ['planId' => $planId]);
        $c = Accounts::company($u);
        Store::audit($c['id'], 'admin', "COMPANY_PLAN_CHANGED: {$c['name']} -> {$planId}");
        return response()->json(['success' => true, 'company' => $c, 'message' => "تم ترقية باقة الشركة {$c['name']} بنجاح"]);
    }

    public function grantCredits(Request $r)
    {
        $u = $this->companyUser((string) $r->input('companyId', ''));
        if (!$u) return response()->json(['error' => 'الشركة غير موجودة'], 404);
        $amount = (int) $r->input('amountCredits');
        if ($amount <= 0) return response()->json(['error' => 'يرجى إدخال عدد نقاط صالح'], 400);
        $admin = Accounts::currentUser($r);
        $new = Accounts::addCredits($u->id, $admin ? $admin->id : null, $amount, 'admin_grant', (string) $r->input('reason') ?: "منحة إدارية استثنائية (+" . number_format($amount) . ' نقطة)');
        return response()->json(['success' => true, 'companyId' => 'c' . $u->id, 'amountGranted' => $amount, 'newBalance' => $new, 'message' => 'تم إضافة ' . number_format($amount) . ' نقطة للشركة بنجاح']);
    }

    public function systemSettings(Request $r)
    {
        $s = [];
        if ($r->has('platformCommissionPercent')) $s['platformCommissionPercent'] = (float) $r->input('platformCommissionPercent');
        if ($r->has('maintenanceMode')) $s['maintenanceMode'] = (bool) $r->input('maintenanceMode');
        if ($r->has('creditRatePer10kCharsUsd')) $s['creditRatePer10kCharsUsd'] = (float) $r->input('creditRatePer10kCharsUsd');
        Store::saveSettings($s);
        Store::audit('system', 'admin', 'SYSTEM_SETTINGS_UPDATED', Store::settings());
        return response()->json(['success' => true, 'settings' => Store::settings(), 'message' => 'تم تحديث إعدادات المنصة بنجاح']);
    }

    // ---------- customers ----------
    private function customerSummary(User $u): array
    {
        $c = Accounts::company($u);
        $gens = DB::table('qv_generations')->where('user_id', $u->id);
        $bookings = Bookings::forCustomer($u->id);
        $txs = Accounts::transactions($u->id);
        $dates = [$c['createdAt']];
        foreach ($bookings as $b) $dates[] = $b['updatedAt'];
        foreach ($txs as $t) $dates[] = $t['createdAt'];
        $last = DB::table('qv_generations')->where('user_id', $u->id)->max('created_at');
        if ($last) $dates[] = Store::iso($last);
        sort($dates);
        $spent = 0.0; $active = 0; $purchased = 0;
        foreach ($bookings as $b) { $spent += $b['priceUsd']; if (in_array($b['status'], ['pending', 'in_studio'], true)) $active++; }
        foreach ($txs as $t) if ($t['reason'] === 'purchase') $purchased += $t['delta'];
        return array_merge($c, [
            'ownerName' => $c['name'], 'balance' => Accounts::balance($u->id), 'membersCount' => 1,
            'generationsCount' => (clone $gens)->count(), 'charsUsed' => (int) (clone $gens)->sum('text_chars'),
            'bookingsCount' => count($bookings), 'activeBookingsCount' => $active, 'bookingsSpentUsd' => round($spent, 2),
            'purchasedCredits' => $purchased, 'lastActivityAt' => end($dates) ?: $c['createdAt'],
        ]);
    }

    public function customers()
    {
        return response()->json(['customers' => Accounts::clientUsers()->map(fn ($u) => $this->customerSummary($u))->values()->all()]);
    }

    public function customer(string $id)
    {
        $u = $this->companyUser($id);
        if (!$u) return response()->json(['error' => 'العميل غير موجود'], 404);
        $names = $this->userNames();
        $notes = Accounts::account($u)['notes'];
        usort($notes, fn ($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
        return response()->json([
            'customer' => $this->customerSummary($u),
            'members' => [Accounts::publicUser($u)],
            'bookings' => array_values(array_filter(Bookings::all(), fn ($b) => $b['companyId'] === 'c' . $u->id)),
            'transactions' => Accounts::transactions($u->id),
            'generations' => DB::table('qv_generations')->where('user_id', $u->id)->orderByDesc('created_at')->limit(30)->get()->map(fn ($g) => $this->generationRow($g, $names))->all(),
            'notes' => $notes,
        ]);
    }

    public function customerStatus(Request $r, string $id)
    {
        $u = $this->companyUser($id);
        if (!$u) return response()->json(['error' => 'العميل غير موجود'], 404);
        $status = (string) $r->input('status');
        if (!in_array($status, ['active', 'suspended'], true)) return response()->json(['error' => 'حالة غير صالحة'], 400);
        Accounts::saveAccount($u, ['status' => $status]);
        Store::audit('c' . $u->id, 'admin', 'CUSTOMER_' . strtoupper($status) . ': ' . Accounts::name($u));
        return response()->json(['success' => true, 'customer' => $this->customerSummary($u)]);
    }

    public function customerNote(Request $r, string $id)
    {
        $u = $this->companyUser($id);
        if (!$u) return response()->json(['error' => 'العميل غير موجود'], 404);
        $text = trim((string) $r->input('text', ''));
        if ($text === '') return response()->json(['error' => 'الملاحظة فارغة'], 400);
        $note = ['id' => 'note-' . round(microtime(true) * 1000), 'text' => $text, 'author' => 'admin', 'createdAt' => now()->toIso8601String()];
        Accounts::saveAccount($u, ['notes' => array_merge([$note], Accounts::account($u)['notes'])]);
        return response()->json(['success' => true, 'note' => $note]);
    }

    public function narratorEarnings()
    {
        return response()->json(['earnings' => DB::table('qv_narrator_earnings')->orderByDesc('created_at')->get()->map(fn ($e) => self::earningRow($e))->all()]);
    }

    public function generations()
    {
        $names = $this->userNames();
        return response()->json(['generations' => DB::table('qv_generations')->orderByDesc('created_at')->get()->map(fn ($g) => $this->generationRow($g, $names))->all()]);
    }

    // ---------- settings pages ----------
    private function publicIntegrations(): array
    {
        $out = Store::integrations();
        foreach ($out as $group => $values) {
            foreach (self::SECRET_FIELDS[$group] ?? [] as $f) {
                $v = (string) ($values[$f] ?? '');
                $out[$group][$f] = '';
                $out[$group][$f . 'Hint'] = $v ? '••••' . substr($v, -4) : '';
            }
        }
        return $out;
    }

    public function settingsGet()
    {
        return response()->json(['settings' => Store::settings(), 'integrations' => $this->publicIntegrations()]);
    }

    public function settingsPost(Request $r)
    {
        $settings = (array) $r->input('settings', []);
        $s = [];
        if (array_key_exists('platformCommissionPercent', $settings)) {
            $v = (float) $settings['platformCommissionPercent'];
            if ($v < 0 || $v > 100) return response()->json(['error' => 'نسبة رسوم المنصة يجب أن تكون بين 0 و 100'], 400);
            $s['platformCommissionPercent'] = $v;
        }
        if (array_key_exists('stripeFeePercent', $settings)) {
            $v = (float) $settings['stripeFeePercent'];
            if ($v < 0 || $v > 100) return response()->json(['error' => 'نسبة رسوم سترايب يجب أن تكون بين 0 و 100'], 400);
            $s['stripeFeePercent'] = $v;
        }
        if (!empty($settings['defaultCurrency'])) $s['defaultCurrency'] = strtoupper(substr((string) $settings['defaultCurrency'], 0, 3));
        if (array_key_exists('maintenanceMode', $settings)) $s['maintenanceMode'] = (bool) $settings['maintenanceMode'];
        if (array_key_exists('creditRatePer10kCharsUsd', $settings)) $s['creditRatePer10kCharsUsd'] = (float) $settings['creditRatePer10kCharsUsd'];
        Store::saveSettings($s);

        $current = Store::integrations();
        $changed = [];
        foreach ((array) $r->input('integrations', []) as $group => $incoming) {
            if (!isset($current[$group]) || !is_array($incoming)) continue;
            foreach ($incoming as $k => $v) {
                if (!array_key_exists($k, $current[$group])) continue;
                if (in_array($k, self::SECRET_FIELDS[$group] ?? [], true) && ($v === '' || $v === null)) continue; // empty secret = keep the stored one
                $old = $current[$group][$k];
                $current[$group][$k] = is_int($old) ? (int) $v : (is_bool($old) ? (bool) $v : trim((string) $v));
            }
            $changed[] = $group;
        }
        Store::saveIntegrations($current);
        Store::audit('system', 'admin', 'SETTINGS_UPDATED' . ($changed ? ' (' . implode(', ', $changed) . ')' : ''), Store::settings());
        return response()->json(['success' => true, 'settings' => Store::settings(), 'integrations' => $this->publicIntegrations()]);
    }

    // ---------- voice reviews ----------
    public function reviews()
    {
        $voices = Library::byId();
        $out = [];
        foreach (Bookings::all() as $b) {
            if (empty($b['review'])) continue;
            $out[] = array_merge(['bookingId' => $b['id'], 'sampleId' => $b['sampleId'], 'sampleName' => $voices[$b['sampleId']]['sampleName'] ?? $b['talentName'],
                'talentName' => $b['talentName'], 'companyName' => $b['companyName']], $b['review']);
        }
        usort($out, fn ($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
        return response()->json(['reviews' => $out]);
    }

    public function reviewStatus(Request $r, string $bookingId)
    {
        $oid = Bookings::orderId($bookingId);
        $meta = $oid ? Bookings::meta($oid) : null;
        if (!$meta || !$meta->review) return response()->json(['error' => 'التقييم غير موجود'], 404);
        $status = (string) $r->input('status');
        if (!in_array($status, ['approved', 'rejected', 'pending'], true)) return response()->json(['error' => 'حالة غير صالحة'], 400);
        $review = json_decode($meta->review, true);
        $review['status'] = $status;
        Bookings::saveMeta($oid, ['review' => json_encode($review, JSON_UNESCAPED_UNICODE)]);
        Store::audit('system', 'admin', 'REVIEW_' . strtoupper($status) . ': ' . $bookingId);
        return response()->json(['success' => true, 'review' => $review]);
    }

    // ---------- «روّاد قيمة» invites ----------
    private function inviteRow(\App\Models\Invite $i): array
    {
        $tz = config('rowad.timezone');
        $iso = fn ($d) => $d ? $d->copy()->timezone($tz)->toIso8601String() : null;
        return ['id' => $i->id, 'code' => $i->code, 'name' => $i->name, 'email' => $i->email, 'phone' => $i->phone, 'clientId' => $i->client_id,
            'status' => $i->status !== \App\Models\Invite::REDEEMED && $i->isExpired() ? \App\Models\Invite::EXPIRED : $i->status,
            'emailMismatch' => (bool) $i->email_mismatch, 'sentAt' => $iso($i->sent_at), 'openedAt' => $iso($i->opened_at),
            'redeemedAt' => $iso($i->redeemed_at), 'redeemedBy' => $i->redeemedBy ? ['id' => $i->redeemedBy->id, 'email' => $i->redeemedBy->email] : null,
            'expiresAt' => $iso($i->expires_at), 'emailLink' => \App\Services\RowadService::link($i->code, 'email'),
            'whatsappLink' => \App\Services\RowadService::link($i->code, 'whatsapp')];
    }

    /** GET admin/rowad/invites?status=&q= : the list + the campaign figures */
    public function rowadInvites(Request $r)
    {
        $q = \App\Models\Invite::with('redeemedBy')->orderByDesc('id');
        $status = (string) $r->query('status', '');
        if ($status === 'expired') $q->where(fn ($w) => $w->where('status', 'expired')->orWhere(fn ($x) => $x->where('status', '!=', 'redeemed')->where('expires_at', '<=', now())));
        elseif ($status !== '') $q->where('status', $status)->where(fn ($w) => $w->where('status', 'redeemed')->orWhere('expires_at', '>', now()));
        if ($s = trim((string) $r->query('q', ''))) {
            $q->where(fn ($w) => $w->where('email', 'like', '%' . $s . '%')->orWhere('code', strtoupper($s))->orWhere('name', 'like', '%' . $s . '%'));
        }
        $invites = $q->get()->map(fn ($i) => $this->inviteRow($i))->all();

        $all = \App\Models\Invite::query();
        $grants = DB::table('qv_credit_transactions')->where('source', 'early_access')->where('type', 'grant')->get(['id', 'delta', 'remaining']);
        $expired = $grants->isEmpty() ? 0 : (int) DB::table('qv_credit_transactions')->where('type', 'expire')->whereIn('reference_id', $grants->pluck('id'))->sum(DB::raw('-delta'));
        $members = User::whereNotNull('rowad_badge_at')->pluck('id');
        $purchases = 0; $value = 0.0;
        foreach (DB::table('qv_credit_transactions')->whereIn('user_id', $members)->where('reason', 'purchase')->whereNotNull('meta')->get(['meta']) as $p) {
            $m = json_decode($p->meta, true) ?: [];
            if (in_array($m['offer'] ?? null, ['rowad', 'rowad_locked'], true)) { $purchases++; $value += (float) ($m['priceUsd'] ?? 0); }
        }
        return response()->json(['invites' => $invites, 'stats' => [
            'total' => (clone $all)->count(),
            'sent' => (clone $all)->where(fn ($w) => $w->whereNotNull('sent_at')->orWhereIn('status', ['sent', 'opened', 'redeemed']))->count(),
            'opened' => (clone $all)->where(fn ($w) => $w->whereNotNull('opened_at')->orWhere('status', 'redeemed'))->count(),
            'redeemed' => (clone $all)->where('status', 'redeemed')->count(),
            'emailMismatch' => (clone $all)->where('email_mismatch', true)->count(),
            'freeCharsGranted' => (int) $grants->sum('delta'),
            'freeCharsUsed' => (int) ($grants->sum('delta') - $grants->sum('remaining') - $expired),
            'rowadPurchases' => $purchases, 'rowadPurchasesUsd' => round($value, 2),
        ]]);
    }

    public function rowadResend(string $id)
    {
        $i = \App\Models\Invite::find($id);
        if (!$i) return response()->json(['error' => 'الدعوة غير موجودة'], 404);
        if (!$i->email) return response()->json(['error' => 'لا يوجد بريد لهذه الدعوة، أرسل رابط واتساب'], 400);
        if (!$i->isValid()) return response()->json(['error' => 'الدعوة مستخدمة أو منتهية'], 400);
        if (!\App\Console\Commands\RowadSendInvites::sendOne($i)) return response()->json(['error' => 'تعذّر إرسال البريد، تحقق من إعدادات البريد'], 502);
        Store::audit('system', 'admin', 'ROWAD_RESEND: ' . $i->id);
        return response()->json(['success' => true, 'invite' => $this->inviteRow($i->fresh('redeemedBy'))]);
    }

    /** body: expiresAt (date / date-time, Africa/Cairo) */
    public function rowadExtend(Request $r, string $id)
    {
        $i = \App\Models\Invite::find($id);
        if (!$i) return response()->json(['error' => 'الدعوة غير موجودة'], 404);
        if ($i->status === \App\Models\Invite::REDEEMED) return response()->json(['error' => 'الدعوة مفعّلة مسبقاً'], 400);
        try {
            $raw = (string) $r->input('expiresAt', '');
            $at = \Carbon\Carbon::parse($raw, config('rowad.timezone'));
            if (strlen($raw) <= 10) $at = $at->endOfDay();
        } catch (\Throwable $e) {
            return response()->json(['error' => 'تاريخ غير صالح'], 400);
        }
        if ($at->isPast()) return response()->json(['error' => 'اختر تاريخاً في المستقبل'], 400);
        $i->update(['expires_at' => $at, 'status' => $i->status === \App\Models\Invite::EXPIRED ? ($i->opened_at ? 'opened' : ($i->sent_at ? 'sent' : 'created')) : $i->status]);
        Store::audit('system', 'admin', 'ROWAD_EXTEND: ' . $i->id, ['expiresAt' => $at->toIso8601String()]);
        return response()->json(['success' => true, 'invite' => $this->inviteRow($i->fresh('redeemedBy'))]);
    }

    public function rowadCancel(string $id)
    {
        $i = \App\Models\Invite::find($id);
        if (!$i) return response()->json(['error' => 'الدعوة غير موجودة'], 404);
        if ($i->status === \App\Models\Invite::REDEEMED) return response()->json(['error' => 'لا يمكن إلغاء دعوة مفعّلة'], 400);
        $i->update(['status' => \App\Models\Invite::EXPIRED, 'expires_at' => now()]);
        Store::audit('system', 'admin', 'ROWAD_CANCEL: ' . $i->id);
        return response()->json(['success' => true, 'invite' => $this->inviteRow($i->fresh('redeemedBy'))]);
    }
}
