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

    public function test_webhook_rejects_a_bad_signature()
    {
        $this->postJson('/api/v1/payments/stripe-webhook', ['type' => 'checkout.session.completed'], ['Stripe-Signature' => 't=1,v1=forged'])->assertStatus(400);
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
