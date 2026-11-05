<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Services\NewUi\Accounts;
use App\Services\NewUi\Bookings;
use App\Services\NewUi\Mailer;
use App\Services\NewUi\Plans;
use App\Services\NewUi\Store;
use App\Services\NewUi\Tts;
use App\Services\RowadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** Signed-in clients: TTS generations, credits, usage, billing, bookings, projects, team (port of generations/credits/usage/billing/clientBookings.ts). */
class ClientController extends Controller
{
    // ---------- generations ----------
    public static function generationRow(object $g): array
    {
        return [
            'id' => $g->id, 'companyId' => 'c' . $g->user_id, 'userId' => (string) $g->actor_user_id, 'voiceId' => $g->voice_id, 'voiceName' => $g->voice_name,
            'voiceType' => $g->voice_type, 'dialect' => $g->dialect, 'text' => $g->text, 'textChars' => (int) $g->text_chars,
            'settings' => $g->settings ? (json_decode($g->settings, true) ?: []) : [], 'provider' => $g->provider, 'model' => $g->model,
            'audioUrl' => "/api/v1/storage/audio/{$g->id}", 'storagePath' => (string) $g->audio_path, 'durationSeconds' => (float) $g->duration_seconds,
            'status' => $g->status, 'creditsConsumed' => (int) $g->credits_consumed, 'costUsd' => (float) $g->cost_usd, 'createdAt' => Store::iso(Store::created($g, 'created_at')),
        ];
    }

    public function generate(Request $r)
    {
        $ctx = Accounts::context($r);
        $cu = $ctx['companyUser'];
        $text = trim((string) $r->input('text', ''));
        if ($text === '') return response()->json(['error' => 'يرجى إدخال النص المطلوب تحويله إلى صوت'], 400);
        $chars = mb_strlen($text);
        if ($chars < 2) return response()->json(['error' => 'النص قصير جداً. يرجى إدخال كلمتين على الأقل.'], 400);
        if ($chars > 5000) return response()->json(['error' => 'الحد الأقصى للتوليد في المرة الواحدة هو 5,000 حرف.'], 400);
        $voice = VoicesController::voiceRow((string) $r->input('voiceId', ''));
        if (!$voice) return response()->json(['error' => 'الصوت المحدد غير موجود'], 404);
        if (!$voice->is_active) return response()->json(['error' => 'هذا الصوت غير متاح حالياً'], 400);

        $required = Tts::estimateCredits($text);
        $balance = $ctx['balance'];
        if ($balance < $required) {
            return response()->json(['error' => "رصيدك لا يكفي. يتطلب هذا النص {$required} حرف، ورصيدك الحالي {$balance} حرف.",
                'requiredCredits' => $required, 'currentBalance' => $balance, 'suggestedAction' => 'topup_credits',
                'rowadPriceActive' => RowadService::rowadPriceActive($cu)], 402);
        }
        $s = (array) $r->input('settings', []);
        $settings = ['speed' => (float) ($s['speed'] ?? 1) ?: 1.0, 'stability' => (float) ($s['stability'] ?? 0.7) ?: 0.7, 'style' => (float) ($s['style'] ?? 0.5) ?: 0.5,
            'pitch' => (float) ($s['pitch'] ?? 0), 'format' => ($s['format'] ?? '') === 'wav' ? 'wav' : 'mp3'];
        try {
            $synth = Tts::synthesize($text, (array) $voice, $settings);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['error' => 'حدث خطأ أثناء معالجة الصوت. لم يتم خصم أي رصيد من حسابك.'], 500);
        }
        $id = 'gen-' . Str::uuid();
        VoicesController::storeAudio($id, $synth['audio'], $synth['mime']);
        if (!Accounts::deductCredits($cu->id, $ctx['user']->id, $required, $id, "توليد صوتي: {$voice->name} ({$chars} حرف)")) {
            return response()->json(['error' => 'رصيدك لا يكفي', 'suggestedAction' => 'topup_credits', 'rowadPriceActive' => RowadService::rowadPriceActive($cu)], 402);
        }
        DB::table('qv_generations')->insert([
            'id' => $id, 'user_id' => $cu->id, 'actor_user_id' => $ctx['user']->id, 'voice_id' => $voice->id, 'voice_name' => $voice->name, 'voice_type' => 'ai',
            'dialect' => $voice->dialect, 'text' => $text, 'text_chars' => $chars, 'settings' => json_encode($settings), 'provider' => $synth['provider'],
            'model' => $synth['model'], 'audio_path' => VoicesController::AUDIO_DISK_DIR . "/{$id}.bin", 'mime' => $synth['mime'],
            'duration_seconds' => $synth['duration'], 'status' => 'completed', 'credits_consumed' => $required, 'cost_usd' => $synth['cost'], 'created_at' => now(),
        ]);
        if ($voice->narrator_id) {
            $gross = round($required * Plans::creditPriceUsd(Accounts::account($cu)['planId']), 4);
            $share = (float) ($voice->narrator_share_percent ?? 0);
            $narratorUsd = round($gross * $share / 100, 4);
            DB::table('qv_narrator_earnings')->insert([
                'id' => (string) Str::uuid(), 'narrator_id' => $voice->narrator_id, 'voice_id' => $voice->id, 'voice_name' => $voice->name, 'generation_id' => $id,
                'company_user_id' => $cu->id, 'chars' => $chars, 'gross_usd' => $gross, 'share_percent' => $share, 'narrator_usd' => $narratorUsd,
                'platform_usd' => round($gross - $narratorUsd, 4), 'created_at' => now(),
            ]);
        }
        $g = DB::table('qv_generations')->where('id', $id)->first();
        return response()->json(['success' => true, 'generation' => self::generationRow($g), 'newBalanceCredits' => Accounts::balance($cu->id),
            'message' => "تم توليد الصوت بنجاح واستهلاك {$required} نقطة."]);
    }

    public function generations(Request $r)
    {
        $ctx = Accounts::context($r);
        $rows = DB::table('qv_generations')->where('user_id', $ctx['companyUser']->id)->orderByDesc('created_at')->get()->map(fn ($g) => self::generationRow($g))->all();
        return response()->json(['total' => count($rows), 'generations' => $rows]);
    }

    public function generation(Request $r, string $id)
    {
        $ctx = Accounts::context($r);
        $g = DB::table('qv_generations')->where('id', $id)->where('user_id', $ctx['companyUser']->id)->first();
        if (!$g) return response()->json(['error' => 'التسجيل غير موجود'], 404);
        return response()->json(self::generationRow($g));
    }

    public function deleteGeneration(Request $r, string $id)
    {
        $ctx = Accounts::context($r);
        $g = DB::table('qv_generations')->where('id', $id)->where('user_id', $ctx['companyUser']->id)->first();
        if (!$g) return response()->json(['error' => 'التسجيل غير موجود'], 404);
        DB::table('qv_generations')->where('id', $id)->delete();
        Storage::delete([VoicesController::AUDIO_DISK_DIR . "/{$id}.bin", VoicesController::AUDIO_DISK_DIR . "/{$id}.mime"]);
        return response()->json(['success' => true]);
    }

    // ---------- credits / billing / usage ----------
    public function credits(Request $r)
    {
        $ctx = Accounts::context($r);
        return response()->json(['balanceCredits' => $ctx['balance'], 'unitRule' => '1 Credit = 1 Arabic/English Character',
            'company' => ['id' => $ctx['company']['id'], 'name' => $ctx['company']['name'], 'planId' => $ctx['company']['planId']],
            'transactions' => Accounts::transactions($ctx['companyUser']->id)]);
    }

    public function topup(Request $r)
    {
        $ctx = Accounts::context($r);
        $plan = Plans::find((string) $r->input('packId', ''));
        if (!$plan || !$plan['priceUsd'] || !$plan['monthlyCredits']) return response()->json(['error' => 'الباقة المختارة غير متاحة'], 400);
        $method = (string) $r->input('paymentMethod', 'card');
        Accounts::saveAccount($ctx['companyUser'], ['planId' => $plan['id']]);
        // Rowad top-up gift or White Friday price, never both (RowadService::topupPrice); applies to this top-up only
        $q = RowadService::topupPrice($ctx['companyUser'], (float) $plan['priceUsd'], (int) $plan['monthlyCredits']);
        $gift = $q['bonusChars'] ? ' + هدية روّاد قيمة ' . number_format($q['bonusChars']) . ' حرف' : '';
        // ponytail: no payment gateway yet, credits are added on request; connect Stripe here before launch
        $new = Accounts::addCredits($ctx['companyUser']->id, $ctx['user']->id, $q['chars'], 'purchase',
            "شحن رصيد: باقة {$plan['nameAr']} ({$q['price']} USD عبر {$method}){$gift}", 'pay-' . round(microtime(true) * 1000),
            ['source' => 'topup', 'meta' => ['kind' => 'topup', 'planId' => $plan['id'], 'priceUsd' => $q['price'], 'listPriceUsd' => $q['listPrice'],
                'offer' => $q['offer'], 'bonusChars' => $q['bonusChars']]]);
        return response()->json(['success' => true, 'addedCredits' => $q['chars'], 'bonusCredits' => $q['bonusChars'], 'priceUsd' => $q['price'],
            'offer' => $q['offer'], 'newBalanceCredits' => $new,
            'message' => 'تم إضافة ' . number_format($q['chars']) . ' حرف إلى رصيدك بنجاح.']);
    }

    public function billing(Request $r)
    {
        $ctx = Accounts::context($r);
        $plan = Plans::find($ctx['company']['planId']) ?: Plans::all()[0];
        $invoices = [];
        foreach (Accounts::transactions($ctx['companyUser']->id) as $tx) {
            if ($tx['delta'] <= 0) continue;
            $invoices[] = ['id' => 'INV-' . strtoupper(substr($tx['id'], 0, 8)), 'date' => $tx['createdAt'], 'description' => $tx['description'],
                'creditsAdded' => $tx['delta'], 'amountUsd' => $tx['meta']['priceUsd'] ?? ($tx['reason'] === 'purchase' ? ($plan['priceUsd'] ?? 0) : 0), 'status' => 'paid', 'downloadUrl' => '#'];
        }
        return response()->json(['company' => $ctx['company'], 'currentPlan' => $plan, 'availablePlans' => Plans::all(), 'balanceCredits' => $ctx['balance'], 'invoices' => $invoices]);
    }

    /** GET billing/offers: what this account pays per plan now (Rowad price / top-up gift / White Friday, never combined) */
    public function offers(Request $r)
    {
        $cu = Accounts::context($r)['companyUser'];
        $out = [];
        foreach (Plans::all() as $p) {
            if (empty($p['priceUsd']) || empty($p['monthlyCredits'])) continue;
            $out[$p['id']] = ['subscription' => array_diff_key(RowadService::subscriptionPrice($cu, $p), ['lock' => 1]),
                'topup' => RowadService::topupPrice($cu, (float) $p['priceUsd'], (int) $p['monthlyCredits'])];
        }
        return response()->json(['offers' => $out, 'rowadPriceActive' => RowadService::rowadPriceActive($cu),
            'rowadPriceUntil' => $cu->rowad_price_until ? $cu->rowad_price_until->toIso8601String() : null]);
    }

    public function changePlan(Request $r)
    {
        $ctx = Accounts::context($r);
        $plan = Plans::find((string) $r->input('planId', ''));
        if (!$plan) return response()->json(['error' => 'الخطة غير متوفرة'], 404);
        if (!empty($plan['isCustom'])) return response()->json(['error' => 'باقة الشركات بتسعير مخصص، تواصل مع فريق المبيعات لتفعيلها'], 400);
        $cu = $ctx['companyUser'];
        Accounts::saveAccount($cu, ['planId' => $plan['id']]);
        // Rowad price (locked until rowad_price_until, used again on every renewal) or White Friday, the larger only
        $q = RowadService::subscriptionPrice($cu, $plan);
        if ($q['lock']) {
            DB::table('qv_client_accounts')->where('user_id', $cu->id)->update(['locked_plan_id' => $q['lock']['plan_id'],
                'locked_price' => $q['lock']['price'], 'locked_until' => $q['lock']['until'], 'updated_at' => now()]);
        }
        $new = $plan['monthlyCredits'] > 0
            ? Accounts::addCredits($cu->id, $ctx['user']->id, $plan['monthlyCredits'], 'purchase',
                "تجديد/ترقية الاشتراك إلى {$plan['nameAr']} (+" . number_format($plan['monthlyCredits']) . " حرف، {$q['price']} USD)", null,
                ['source' => 'plan', 'meta' => ['kind' => 'subscription', 'planId' => $plan['id'], 'priceUsd' => $q['price'], 'listPriceUsd' => $q['listPrice'],
                    'offer' => $q['offer'], 'discountPct' => $q['discountPct']]])
            : $ctx['balance'];
        return response()->json(['success' => true, 'company' => Accounts::company($cu), 'currentPlan' => $plan, 'priceUsd' => $q['price'], 'offer' => $q['offer'],
            'newBalanceCredits' => $new, 'message' => "تم الترقية بنجاح إلى {$plan['nameAr']}"]);
    }

    public function usage(Request $r)
    {
        $ctx = Accounts::context($r);
        $gens = DB::table('qv_generations')->where('user_id', $ctx['companyUser']->id)->orderBy('created_at')->get();
        $dialects = ['gulf' => 'خليجي / سعودي', 'egyptian' => 'مصري', 'levantine' => 'شامي', 'maghrebi' => 'مغاربي', 'fusha' => 'فصحى معيارية'];
        $dialectBreakdown = [];
        foreach ($dialects as $code => $label) $dialectBreakdown[$code] = ['code' => $code, 'label' => $label, 'count' => 0, 'characters' => 0];
        $voices = [];
        $totalChars = 0; $totalCredits = 0; $seconds = 0.0;
        foreach ($gens as $g) {
            $totalChars += $g->text_chars; $totalCredits += $g->credits_consumed; $seconds += (float) $g->duration_seconds;
            if (isset($dialectBreakdown[$g->dialect])) { $dialectBreakdown[$g->dialect]['count']++; $dialectBreakdown[$g->dialect]['characters'] += $g->text_chars; }
            $voices[$g->voice_id] = $voices[$g->voice_id] ?? ['name' => $g->voice_name, 'count' => 0, 'characters' => 0];
            $voices[$g->voice_id]['count']++; $voices[$g->voice_id]['characters'] += $g->text_chars;
        }
        usort($voices, fn ($a, $b) => $b['characters'] <=> $a['characters']);
        $recent = array_map(fn ($g) => ['id' => $g->id, 'companyId' => 'c' . $g->user_id, 'userId' => (string) $g->actor_user_id, 'generationId' => $g->id, 'feature' => 'tts',
            'provider' => $g->provider, 'model' => $g->model, 'inputUnits' => (int) $g->text_chars, 'outputUnits' => (float) $g->duration_seconds,
            'creditsConsumed' => (int) $g->credits_consumed, 'costUsd' => (float) $g->cost_usd, 'createdAt' => Store::iso(Store::created($g, 'created_at'))], array_reverse(array_slice($gens->all(), -10)));
        return response()->json([
            'metrics' => ['totalGenerations' => count($gens), 'totalCharacters' => $totalChars, 'totalCredits' => $totalCredits,
                'totalAudioMinutes' => round($seconds / 60, 1), 'topVoiceName' => $voices[0]['name'] ?? 'لا يوجد بعد'],
            'dialectBreakdown' => array_values($dialectBreakdown), 'topVoices' => array_slice($voices, 0, 5), 'recentRecords' => $recent,
        ]);
    }

    // ---------- bookings ----------
    public function bookings(Request $r)
    {
        $ctx = Accounts::context($r);
        return response()->json(['bookings' => Bookings::forCustomer($ctx['companyUser']->id)]);
    }

    public function book(Request $r)
    {
        $res = Bookings::create($r->all(), Accounts::currentUser($r));
        if (isset($res['error'])) return response()->json(['error' => $res['error']], $res['status']);
        return response()->json(['success' => true, 'booking' => $res['booking']]);
    }

    public function review(Request $r, string $id)
    {
        $ctx = Accounts::context($r);
        $oid = Bookings::orderId($id);
        $o = $oid ? Bookings::query()->where('customer_id', $ctx['companyUser']->id)->find($oid) : null;
        if (!$o) return response()->json(['error' => 'طلب الحجز غير موجود'], 404);
        $rating = (int) $r->input('rating');
        if ($rating < 1 || $rating > 5) return response()->json(['error' => 'التقييم من 1 إلى 5'], 400);
        $review = ['rating' => $rating, 'text' => mb_substr(trim((string) $r->input('text', '')), 0, 1000), 'author' => Accounts::name($ctx['user']),
            'createdAt' => now()->toIso8601String(), 'status' => 'pending'];
        Bookings::saveMeta($o->id, ['review' => json_encode($review, JSON_UNESCAPED_UNICODE)]);
        return response()->json(['success' => true, 'review' => $review]);
    }

    public function feedback(Request $r)
    {
        $ctx = Accounts::context($r);
        $message = mb_substr(trim((string) $r->input('message', '')), 0, 3000);
        if ($message === '') return response()->json(['error' => 'اكتب ملاحظتك'], 400);
        $item = Store::create('feedback', ['companyId' => $ctx['company']['id'], 'companyName' => $ctx['company']['name'], 'userName' => Accounts::name($ctx['user']),
            'stars' => max(0, min(5, (int) $r->input('stars', 0))), 'topic' => mb_substr((string) $r->input('topic', 'ملاحظة'), 0, 60), 'message' => $message,
            'status' => 'unread', 'date' => date('Y-m-d')]);
        return response()->json(['success' => true, 'id' => $item['id']]);
    }

    // ---------- projects / team ----------
    public function projects(Request $r)
    {
        $ctx = Accounts::context($r);
        return response()->json(['projects' => $ctx['company']['projects']]);
    }

    public function createProject(Request $r)
    {
        $ctx = Accounts::context($r);
        $title = mb_substr(trim((string) $r->input('title', '')), 0, 120);
        if ($title === '') return response()->json(['error' => 'اكتب اسم المشروع'], 400);
        $p = ['id' => 'proj-' . Str::uuid(), 'title' => $title, 'description' => mb_substr(trim((string) $r->input('description', '')), 0, 500),
            'dialect' => mb_substr(trim((string) $r->input('dialect', '')), 0, 60), 'status' => 'active', 'createdAt' => now()->toIso8601String()];
        $list = array_slice(array_merge([$p], $ctx['company']['projects']), 0, 200);
        Accounts::saveAccount($ctx['companyUser'], ['projects' => $list]);
        return response()->json(['project' => $p]);
    }

    public function deleteProject(Request $r, string $id)
    {
        $ctx = Accounts::context($r);
        Accounts::saveAccount($ctx['companyUser'], ['projects' => array_values(array_filter($ctx['company']['projects'], fn ($p) => ($p['id'] ?? '') !== $id))]);
        return response()->json(['ok' => true]);
    }

    public function team(Request $r)
    {
        $ctx = Accounts::context($r);
        $u = $ctx['companyUser'];
        return response()->json(['members' => [['id' => (string) $u->id, 'name' => Accounts::name($u), 'email' => $u->email, 'role' => 'admin']], 'invites' => $ctx['company']['teamInvites']]);
    }

    public function invite(Request $r)
    {
        $ctx = Accounts::context($r);
        $name = mb_substr(trim((string) $r->input('name', '')), 0, 100);
        $email = mb_strtolower(mb_substr(trim((string) $r->input('email', '')), 0, 160));
        if (!$name || !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) return response()->json(['error' => 'أدخل الاسم وبريداً إلكترونياً صحيحاً'], 400);
        foreach ($ctx['company']['teamInvites'] as $i) if (($i['email'] ?? '') === $email) return response()->json(['error' => 'تمت دعوة هذا البريد من قبل'], 400);
        $origin = rtrim((string) env('SITE_URL', $r->getSchemeAndHttpHost()), '/');
        $emailed = Mailer::trySend($email, "دعوة للانضمام إلى {$ctx['company']['name']} في قيمة فويس",
            "مرحباً {$name}،\nدعاك " . Accounts::name($ctx['user']) . " للانضمام إلى مساحة عمل «{$ctx['company']['name']}» في قيمة فويس.\nأنشئ حسابك من هنا: {$origin}/ar");
        $invite = ['id' => 'inv-' . Str::uuid(), 'name' => $name, 'email' => $email, 'invitedAt' => now()->toIso8601String(), 'emailed' => $emailed];
        Accounts::saveAccount($ctx['companyUser'], ['teamInvites' => array_slice(array_merge([$invite], $ctx['company']['teamInvites']), 0, 100)]);
        return response()->json(['invite' => $invite]);
    }
}
