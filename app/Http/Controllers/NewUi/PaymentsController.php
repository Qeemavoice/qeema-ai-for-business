<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use App\Services\NewUi\Accounts;
use App\Services\NewUi\Payments;
use Illuminate\Http\Request;

/** Card payments (Stripe Checkout) and paid guides; see Payments for the flow */
class PaymentsController extends Controller
{
    /** Return page after Stripe: grants the purchase once Stripe confirms it was paid */
    public function confirm(Request $r)
    {
        $u = Accounts::currentUser($r);   // guests may confirm a paid booking only
        $sid = (string) $r->input('sessionId', '');
        if (!preg_match('/^cs_[A-Za-z0-9_]{10,250}$/', $sid)) return response()->json(['error' => 'رمز عملية غير صالح'], 400);
        try {
            $res = $u ? Payments::fulfil($sid, $u) : Payments::fulfil($sid, null, ['booking']);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['error' => 'تعذر التحقق من الدفع الآن. إذا خُصم المبلغ فسيُضاف تلقائياً خلال دقائق.'], 424);
        }
        if (!$res['ok']) return response()->json(['error' => $res['error']], 409);
        $p = $res['payment'];
        $meta = json_decode($p->meta, true) ?: [];
        return response()->json(['success' => true, 'kind' => $p->kind, 'amountUsd' => $p->amount_cents / 100,
            'guideId' => $meta['guideId'] ?? null, 'bookingId' => $meta['bookingId'] ?? null,
            'newBalanceCredits' => $u ? Accounts::balance((int) $p->company_user_id) : null]);
    }

    /** Stripe → us (server to server): signature-checked, so it works even when the buyer closes the tab before returning */
    public function webhook(Request $r)
    {
        $sid = Payments::webhookSession($r->getContent(), (string) $r->header('Stripe-Signature', ''));
        if ($sid === null) return response()->json(['error' => 'bad signature'], 400);
        if ($sid === '') return response()->json(['received' => true]);   // an event we do not use
        try {
            Payments::fulfil($sid);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['error' => 'retry'], 500);   // Stripe retries later
        }
        return response()->json(['received' => true]);
    }

    /** «اشترِ الدليل»: name + e-mail of the buyer, then Stripe's payment page */
    public function guideCheckout(Request $r, string $id)
    {
        $u = Accounts::currentUser($r);
        $g = Guide::find((int) $id);
        if (!$g || (int) $g->type !== Guide::TYPE_PAID || (float) $g->unit_price <= 0) return response()->json(['error' => 'الدليل غير متاح للشراء'], 404);
        if (Payments::ownsGuide($u, (string) $g->id)) return response()->json(['owned' => true]);
        $name = trim((string) $r->input('name', ''));
        $email = mb_strtolower(trim((string) $r->input('email', '')));
        if (mb_strlen($name) < 2 || mb_strlen($name) > 120) return response()->json(['error' => 'اكتب الاسم الكامل'], 400);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return response()->json(['error' => 'البريد الإلكتروني غير صحيح'], 400);
        if (!Payments::enabled()) return response()->json(['error' => 'الدفع الإلكتروني غير متاح حالياً، تواصل معنا لطلب الدليل'], 402);
        $item = PublicController::guideItem($g);
        try {
            $url = Payments::start('guide', $u, $u, (float) $g->unit_price, 'دليل قيمة فويس: ' . $item['title'], ['guideId' => (string) $g->id],
                '/ar/guides/' . rawurlencode($item['slug']), $name, $email);
        } catch (\Throwable $e) {
            report($e);
            ClientController::logBookingError('PAYMENT_PAGE_FAILED', $e);
            return response()->json(['error' => 'تعذر فتح صفحة الدفع الآن، حاول بعد قليل'], 424);
        }
        return response()->json(['checkoutUrl' => $url]);
    }

    /** The guide's file for the signed-in reader: free guides need an account, paid ones a purchase */
    public function guideFile(Request $r, string $id)
    {
        $u = Accounts::currentUser($r);
        $g = Guide::find((int) $id);
        if (!$g || !$g->file) return response()->json(['error' => 'الملف غير موجود'], 404);
        $paid = (int) $g->type === Guide::TYPE_PAID;
        if ($paid && !Accounts::isAdmin($u) && !Payments::ownsGuide($u, (string) $g->id)) {
            return response()->json(['error' => 'اشترِ الدليل لتحميله', 'owned' => false], 402);
        }
        return response()->json(['file' => (string) $g->file_url, 'owned' => true]);
    }
}
