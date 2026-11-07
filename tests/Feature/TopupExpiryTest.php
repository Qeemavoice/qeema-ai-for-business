<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Terms of use: a plan's unused credit rolls over one month (at most two months of credit), then it lapses */
class TopupExpiryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.newui_grant_without_payment' => true]);   // these tests buy plans; the gateway block has its own test
    }

    public function test_plan_credit_rolls_over_one_month_then_lapses()
    {
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $u = Accounts::createAccount('عميل', 'client@example.test', 'password-123', 'client');
        $u->forceFill(['early_access' => true])->save();
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($u))->withHeader('Accept', 'application/json');

        $start = Accounts::balance($u->id);   // welcome credit: no expiry
        $added = $api->postJson('/api/v1/credits/topup', ['packId' => 'plan-starter'])->assertOk()->json('addedCredits');
        $this->assertSame($start + $added, Accounts::balance($u->id));

        $this->travel(1)->months();
        $this->assertSame($start + $added, Accounts::balance($u->id));
        $this->travel(32)->days();
        $this->assertSame($start, Accounts::balance($u->id));   // the top-up lapsed, the welcome credit stays
    }

    public function test_clients_cannot_get_credit_without_payment()
    {
        config(['services.newui_grant_without_payment' => false]);
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $u = Accounts::createAccount('عميل', 'client2@example.test', 'password-123', 'client');
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($u))->withHeader('Accept', 'application/json');
        $before = Accounts::balance($u->id);
        $api->postJson('/api/v1/credits/topup', ['packId' => 'plan-starter'])->assertStatus(402);
        $api->postJson('/api/v1/billing/change-plan', ['planId' => 'plan-creator'])->assertStatus(402);
        $this->assertSame($before, Accounts::balance($u->id));
    }
}
