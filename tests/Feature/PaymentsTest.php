<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use App\Services\NewUi\Payments;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Card payments: credit and guides are granted only after Stripe confirms the exact amount, once, to the buyer */
class PaymentsTest extends TestCase
{
    use RefreshDatabase;

    /** Fake Stripe: remembers created sessions; tests set what retrieve returns */
    private $stripe;

    protected function setUp(): void
    {
        parent::setUp();
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $this->stripe = new class {
            public $created = [];
            public $paid = [];
            public function createSession(array $p): array
            {
                $id = 'cs_test_' . str_pad((string) (count($this->created) + 1), 12, '0', STR_PAD_LEFT);
                $this->created[$id] = $p;
                return ['id' => $id, 'url' => 'https://checkout.stripe.com/c/pay/' . $id, 'livemode' => false];
            }
            public function retrieveSession(string $id): array
            {
                $p = $this->created[$id];
                return array_merge(['id' => $id, 'payment_status' => 'unpaid', 'amount_total' => $p['line_items'][0]['price_data']['unit_amount'],
                    'currency' => 'usd', 'client_reference_id' => $p['client_reference_id'], 'payment_intent' => 'pi_1', 'livemode' => false], $this->paid[$id] ?? []);
            }
        };
        Payments::$gateway = $this->stripe;
    }

    protected function tearDown(): void
    {
        Payments::$gateway = null;
        parent::tearDown();
    }

    private function client(string $email = 'buyer@example.test'): array
    {
        $u = Accounts::createAccount('مشتري', $email, 'password-123', 'client');
        return [$u, ['Authorization' => 'Bearer ' . Accounts::issueToken($u), 'Accept' => 'application/json']];
    }

    public function test_topup_adds_credit_only_after_stripe_confirms_payment_once()
    {
        [$u, $h] = $this->client();
        $before = Accounts::balance($u->id);
        $url = $this->postJson('/api/v1/credits/topup', ['packId' => 'plan-starter'], $h)->assertOk()->json('checkoutUrl');
        $this->assertStringStartsWith('https://checkout.stripe.com/', $url);
        $this->assertSame($before, Accounts::balance($u->id));   // nothing before paying
        $sid = array_key_first($this->stripe->created);
        $this->assertStringContainsString('session_id={CHECKOUT_SESSION_ID}', $this->stripe->created[$sid]['success_url']);

        $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid], $h)->assertStatus(409);   // not paid yet
        $this->assertSame($before, Accounts::balance($u->id));

        $this->stripe->paid[$sid] = ['payment_status' => 'paid'];
        $after = $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid], $h)->assertOk()->json('newBalanceCredits');
        $this->assertGreaterThan($before, $after);
        $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid], $h)->assertOk();   // replay: no second credit
        $this->assertSame($after, Accounts::balance($u->id));
    }

    public function test_wrong_amount_or_someone_elses_session_gives_nothing()
    {
        [$u, $h] = $this->client();
        [, $other] = $this->client('other@example.test');
        $this->postJson('/api/v1/credits/topup', ['packId' => 'plan-starter'], $h)->assertOk();
        $sid = array_key_first($this->stripe->created);
        $before = Accounts::balance($u->id);

        $this->stripe->paid[$sid] = ['payment_status' => 'paid'];
        $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid], $other)->assertStatus(409);   // not the buyer
        $this->postJson('/api/v1/payments/confirm', ['sessionId' => 'cs_test_unknown_session'], $h)->assertStatus(409);
        $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid])->assertStatus(409);   // no account: only bookings

        $this->stripe->paid[$sid] = ['payment_status' => 'paid', 'amount_total' => 100];   // paid less than the price
        $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid], $h)->assertStatus(409);
        $this->assertSame($before, Accounts::balance($u->id));
        $this->assertSame('failed', DB::table('qv_payments')->where('session_id', $sid)->value('status'));
    }

    public function test_plan_change_goes_through_payment()
    {
        [$u, $h] = $this->client();
        $this->postJson('/api/v1/billing/change-plan', ['planId' => 'plan-creator'], $h)->assertOk()->assertJsonStructure(['checkoutUrl']);
        $this->assertNotSame('plan-creator', Accounts::account($u)['planId']);
        $sid = array_key_first($this->stripe->created);
        $this->stripe->paid[$sid] = ['payment_status' => 'paid'];
        $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid], $h)->assertOk()->assertJsonPath('kind', 'plan');
        $this->assertSame('plan-creator', Accounts::account($u)->planId ?? Accounts::account($u)['planId']);
    }

    public function test_no_gateway_means_no_free_credit()
    {
        Payments::$gateway = null;   // Stripe not configured
        [$u, $h] = $this->client();
        $before = Accounts::balance($u->id);
        $this->postJson('/api/v1/credits/topup', ['packId' => 'plan-starter'], $h)->assertStatus(402);
        $this->assertSame($before, Accounts::balance($u->id));
    }

    public function test_a_refused_payment_page_answers_a_readable_message_and_logs_the_reason()
    {
        // Stripe refusing (bad or restricted key): not a 502, which Cloudflare replaces with its own page and loses the message
        Payments::$gateway = new class { public function createSession(array $p): array { throw new \RuntimeException('Invalid API Key provided'); } };
        [$u, $h] = $this->client();
        $res = $this->postJson('/api/v1/credits/topup', ['packId' => 'plan-starter'], $h)->assertStatus(424);
        $this->assertNotEmpty($res->json('error'));
        $this->assertTrue(DB::table('qv_audit_logs')->where('action', 'like', 'PAYMENT_PAGE_FAILED%Invalid API Key provided%')->exists());
    }

    public function test_webhook_rejects_a_bad_signature()
    {
        $this->postJson('/api/v1/payments/stripe-webhook', ['type' => 'checkout.session.completed'], ['Stripe-Signature' => 't=1,v1=forged'])->assertStatus(400);
    }

    public function test_booking_waits_for_payment_then_goes_to_review()
    {
        DB::statement('PRAGMA foreign_keys = OFF');   // orders reference lookup tables (currencies, payment methods…) this test does not seed
        foreach ([1 => 'draft', 2 => 'review', 3 => 'accepted', 4 => 'rejected'] as $id => $n) DB::table('voice_statuses')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        foreach ([1 => 'child', 2 => 'man', 3 => 'women'] as $id => $n) DB::table('voice_types')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        $narrator = Accounts::createAccount('معلق', 'narrator@example.test', 'password-123', 'client');
        DB::table('voices')->insert(['id' => 501, 'title' => json_encode(['ar' => 'إعلان']), 'price_per_minute' => 40, 'total_price' => 52,
            'voiceover_id' => $narrator->id, 'voice_type_id' => 2, 'voice_status_id' => 3, 'created_at' => now(), 'updated_at' => now()]);
        \App\Services\NewUi\Library::forget();   // the library is cached across tests
        [$u, $h] = $this->client();
        $res = $this->postJson('/api/v1/client/bookings', ['sampleId' => '501', 'scriptText' => 'نص الإعلان', 'customerName' => 'مشتري',
            'customerEmail' => 'buyer@example.test', 'customerWhatsapp' => '+966500000000'], $h)->assertOk();
        $this->assertSame('awaiting_payment', $res->json('booking.status'));
        $this->assertSame(1, $res->json('booking.durationMinutes'));
        // pressing «ادفع الآن» again with the same booking reuses it (and opens a new payment page) instead of adding it twice
        $again = $this->postJson('/api/v1/client/bookings', ['sampleId' => '501', 'scriptText' => 'نص الإعلان', 'customerName' => 'مشتري',
            'customerEmail' => 'buyer@example.test', 'customerWhatsapp' => '+966500000000'], $h)->assertOk();
        $this->assertSame($res->json('booking.id'), $again->json('booking.id'));
        $this->assertSame(1, DB::table('qv_booking_meta')->where('sample_id', '501')->count());
        // minutes follow the words: 150 words = 2 minutes (every 100 words a minute), however long the words are
        $long = $this->postJson('/api/v1/client/bookings', ['sampleId' => '501', 'scriptText' => trim(str_repeat('كلمةطويلةجدا ', 150)), 'customerName' => 'مشتري',
            'customerEmail' => 'buyer@example.test', 'customerWhatsapp' => '+966500000000'], $h)->assertOk();
        $this->assertSame(2, $long->json('booking.durationMinutes'));
        $this->assertStringStartsWith('https://checkout.stripe.com/', $res->json('checkoutUrl'));
        $sid = array_key_first($this->stripe->created);
        $this->assertSame((int) round($res->json('booking.priceUsd') * 100), $this->stripe->created[$sid]['line_items'][0]['price_data']['unit_amount']);

        $this->stripe->paid[$sid] = ['payment_status' => 'paid'];
        $sent = fn () => collect(app('mail.manager')->mailer('array')->getSwiftMailer()->getTransport()->messages());
        $this->assertCount(0, $sent());   // nothing before the payment
        $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid])->assertOk()->assertJsonPath('kind', 'booking');   // a guest return works for bookings
        // the paid booking e-mails the client once, with the booking number and the clip name (never the narrator's name)
        $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid])->assertOk();
        $this->assertCount(1, $sent());
        $mail = $sent()->first();
        $this->assertSame(['buyer@example.test'], array_keys($mail->getTo()));
        $this->assertStringContainsString($res->json('booking.id'), $mail->getSubject());
        $this->assertStringNotContainsString('معلق', $mail->getBody());
        $this->assertSame('pending', collect($this->getJson('/api/v1/client/bookings', $h)->json('bookings'))->first()['status']);
    }

    public function test_guides_need_sign_in_and_paid_ones_a_purchase()
    {
        $free = DB::table('guides')->insertGetId(['name' => json_encode(['ar' => 'دليل مجاني']), 'details' => json_encode(['ar' => 'وصف']), 'image' => 'a.png', 'file' => 'free.pdf', 'type' => 1, 'unit_price' => 0, 'created_at' => now(), 'updated_at' => now()]);
        $paid = DB::table('guides')->insertGetId(['name' => json_encode(['ar' => 'دليل مدفوع']), 'details' => json_encode(['ar' => 'وصف']), 'image' => 'b.png', 'file' => 'paid.pdf', 'type' => 2, 'unit_price' => 5, 'created_at' => now(), 'updated_at' => now()]);
        foreach ($this->getJson('/api/v1/guides')->json('items') as $g) $this->assertSame('', $g['file']);   // no file links in the public list

        $this->getJson("/api/v1/guides/{$free}/file")->assertStatus(401);
        [$u, $h] = $this->client();
        $this->getJson("/api/v1/guides/{$free}/file", $h)->assertOk()->assertJsonPath('owned', true);
        $this->getJson("/api/v1/guides/{$paid}/file", $h)->assertStatus(402);

        $this->postJson("/api/v1/guides/{$paid}/checkout", ['name' => 'م', 'email' => 'buyer@example.test'], $h)->assertStatus(400);
        $this->postJson("/api/v1/guides/{$paid}/checkout", ['name' => 'مشتري الدليل', 'email' => 'buyer@example.test'], $h)->assertOk()->assertJsonStructure(['checkoutUrl']);
        $sid = array_key_first($this->stripe->created);
        $this->assertSame(500, $this->stripe->created[$sid]['line_items'][0]['price_data']['unit_amount']);   // the guide's price, set on the server
        $this->stripe->paid[$sid] = ['payment_status' => 'paid'];
        $this->postJson('/api/v1/payments/confirm', ['sessionId' => $sid], $h)->assertOk()->assertJsonPath('guideId', (string) $paid);
        $this->getJson("/api/v1/guides/{$paid}/file", $h)->assertOk()->assertJsonPath('owned', true);
        $this->postJson("/api/v1/guides/{$paid}/checkout", ['name' => 'مشتري الدليل', 'email' => 'buyer@example.test'], $h)->assertOk()->assertJsonPath('owned', true);
    }
}
