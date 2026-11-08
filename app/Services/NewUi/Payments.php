<?php

namespace App\Services\NewUi;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Card payments through Stripe Checkout (Stripe's own hosted page: card numbers never reach this server).
 *
 * Flow: start() prices the order on the server, stores a pending qv_payments row and returns Stripe's page URL.
 * After paying, Stripe sends the buyer back (?payment=success&session_id=...) and also calls the webhook.
 * Both routes end in fulfil(): it re-reads the session FROM STRIPE, checks paid + amount + currency against the
 * stored row, and grants the purchase once (row lock + status), so a replayed or forged return gives nothing.
 */
class Payments
{
    /** Tests replace the Stripe calls: object with createSession(array): array and retrieveSession(string): array */
    public static $gateway = null;

    /** Active Stripe keys from «الإعدادات ← بوابات الدفع», or null when card payment is off */
    public static function config(): ?array
    {
        try { $s = Store::integrations()['stripe'] ?? []; } catch (\Throwable $e) { return null; }
        if (empty($s['enabled'])) return null;
        $test = !empty($s['testMode']);
        $secret = trim((string) ($test ? $s['testSecretKey'] : $s['liveSecretKey']));
        if ($secret === '') return null;
        // a live key while «وضع الاختبار» is on (or the reverse) is a setup mistake: refuse rather than charge by surprise
        if ($test !== Str::startsWith($secret, ['sk_test_', 'rk_test_'])) return null;
        return ['secret' => $secret, 'live' => !$test, 'webhookSecret' => trim((string) ($test ? $s['testWebhookSecret'] : $s['liveWebhookSecret']))];
    }

    public static function enabled(): bool
    {
        return self::$gateway !== null || self::config() !== null;
    }

    /** Creates the pending payment and Stripe's checkout page; returns the page URL */
    public static function start(string $kind, User $payer, User $account, float $amountUsd, string $title, array $meta, string $returnPath,
                                 ?string $buyerName = null, ?string $buyerEmail = null): string
    {
        $cents = (int) round($amountUsd * 100);
        if ($cents < 50) throw new \InvalidArgumentException('amount too small');   // Stripe's minimum charge
        $id = 'pay_' . Str::random(24);
        $base = self::siteUrl() . '/' . ltrim($returnPath, '/');
        $sep = str_contains($base, '?') ? '&' : '?';
        $session = self::gateway()->createSession([
            'mode' => 'payment',
            'client_reference_id' => $id,
            'customer_email' => $buyerEmail ?: (string) $payer->email,
            'line_items' => [[
                'price_data' => ['currency' => 'usd', 'unit_amount' => $cents, 'product_data' => ['name' => mb_substr($title, 0, 250)]],
                'quantity' => 1,
            ]],
            'metadata' => ['payment_id' => $id, 'kind' => $kind],
            'success_url' => $base . $sep . 'payment=success&session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $base . $sep . 'payment=cancelled',
        ]);
        DB::table('qv_payments')->insert([
            'id' => $id, 'session_id' => $session['id'], 'kind' => $kind, 'user_id' => $payer->id, 'company_user_id' => $account->id,
            'amount_cents' => $cents, 'currency' => 'usd', 'status' => 'pending',
            'buyer_name' => $buyerName ? mb_substr($buyerName, 0, 160) : null, 'buyer_email' => $buyerEmail ? mb_substr($buyerEmail, 0, 160) : null,
            'meta' => json_encode($meta, JSON_UNESCAPED_UNICODE), 'livemode' => !empty($session['livemode']), 'created_at' => now(), 'updated_at' => now(),
        ]);
        return (string) $session['url'];
    }

    /**
     * Grants a paid checkout once. $payer limits it to the buyer's own session (return page); null = webhook (signature-checked).
     * Returns ['ok' => bool, 'payment' => row|null, 'error' => string|null].
     */
    public static function fulfil(string $sessionId, ?User $payer = null, ?array $onlyKinds = null): array
    {
        $row = DB::table('qv_payments')->where('session_id', $sessionId)->first();
        if (!$row) return ['ok' => false, 'payment' => null, 'error' => 'عملية الدفع غير معروفة'];
        // a guest back from paying a booking confirms it without an account (Stripe still has to say it was paid in full)
        if ($onlyKinds !== null && !in_array($row->kind, $onlyKinds, true)) return ['ok' => false, 'payment' => null, 'error' => 'سجّل الدخول لإكمال العملية'];
        if ($payer && (int) $row->user_id !== (int) $payer->id) return ['ok' => false, 'payment' => null, 'error' => 'عملية الدفع غير معروفة'];
        if ($row->status === 'fulfilled') return ['ok' => true, 'payment' => $row, 'error' => null];

        $s = self::gateway()->retrieveSession($sessionId);   // the truth comes from Stripe, never from the browser
        if (($s['payment_status'] ?? '') !== 'paid') return ['ok' => false, 'payment' => $row, 'error' => 'لم يكتمل الدفع بعد'];
        if ((int) ($s['amount_total'] ?? -1) !== (int) $row->amount_cents || strtolower((string) ($s['currency'] ?? '')) !== $row->currency
            || (string) ($s['client_reference_id'] ?? '') !== $row->id) {
            report(new \RuntimeException("Stripe session {$sessionId} does not match payment {$row->id}"));
            DB::table('qv_payments')->where('id', $row->id)->update(['status' => 'failed', 'updated_at' => now()]);
            return ['ok' => false, 'payment' => $row, 'error' => 'تعذر التحقق من عملية الدفع، تواصل معنا'];
        }

        return DB::transaction(function () use ($row, $s) {
            $locked = DB::table('qv_payments')->where('id', $row->id)->lockForUpdate()->first();
            if ($locked->status === 'fulfilled') return ['ok' => true, 'payment' => $locked, 'error' => null];
            $payer = User::find($locked->user_id);
            $account = User::find($locked->company_user_id);
            if (!$payer || !$account) return ['ok' => false, 'payment' => $locked, 'error' => 'الحساب غير موجود'];
            $meta = json_decode($locked->meta, true) ?: [];
            if ($locked->kind === 'topup') \App\Http\Controllers\NewUi\ClientController::applyTopup($account, $payer, $meta, 'بطاقة');
            elseif ($locked->kind === 'plan') \App\Http\Controllers\NewUi\ClientController::applyPlan($account, $payer, $meta);
            elseif ($locked->kind === 'guide') DB::table('guides')->where('id', (int) ($meta['guideId'] ?? 0))->increment('number_of_downloads');
            elseif ($locked->kind === 'booking') Bookings::markPaid((string) ($meta['bookingId'] ?? ''), $locked->id);
            DB::table('qv_payments')->where('id', $locked->id)->update(['status' => 'fulfilled', 'fulfilled_at' => now(), 'updated_at' => now(),
                'payment_intent' => is_string($s['payment_intent'] ?? null) ? $s['payment_intent'] : null, 'livemode' => !empty($s['livemode'])]);
            return ['ok' => true, 'payment' => DB::table('qv_payments')->where('id', $locked->id)->first(), 'error' => null];
        });
    }

    /** true when this account bought the paid guide */
    public static function ownsGuide(User $u, string $guideId): bool
    {
        return DB::table('qv_payments')->where('kind', 'guide')->where('status', 'fulfilled')->where('user_id', $u->id)->get(['meta'])
            ->contains(fn ($p) => (string) (json_decode($p->meta, true)['guideId'] ?? '') === $guideId);
    }

    /** Stripe webhook body + signature → the checkout session id to fulfil, or null when the signature is wrong */
    public static function webhookSession(string $payload, string $signature): ?string
    {
        $cfg = self::config();
        if (!$cfg || $cfg['webhookSecret'] === '') return null;
        try {
            $event = \Stripe\Webhook::constructEvent($payload, $signature, $cfg['webhookSecret']);
        } catch (\Throwable $e) {
            return null;
        }
        if (!in_array($event->type, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)) return '';
        return (string) $event->data->object->id;
    }

    /** Site address for Stripe's return links: the request host only when it is ours (a forged Host header cannot redirect buyers away) */
    private static function siteUrl(): string
    {
        $host = request()->getHost();
        if ($host === 'qeemavoice.com' || Str::endsWith($host, '.qeemavoice.com') || in_array($host, ['localhost', '127.0.0.1'], true)) {
            return request()->getSchemeAndHttpHost();
        }
        return rtrim((string) config('app.url'), '/');
    }

    private static function gateway()
    {
        if (self::$gateway) return self::$gateway;
        $cfg = self::config();
        if (!$cfg) throw new \RuntimeException('Stripe is not configured');
        $client = new \Stripe\StripeClient($cfg['secret']);
        return new class($client) {
            private $c;
            public function __construct($c) { $this->c = $c; }
            public function createSession(array $p): array { return $this->c->checkout->sessions->create($p)->toArray(); }
            public function retrieveSession(string $id): array { return $this->c->checkout->sessions->retrieve($id)->toArray(); }
        };
    }
}
