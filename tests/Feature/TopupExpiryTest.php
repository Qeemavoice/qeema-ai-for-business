<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Terms of use: paid credit is valid 12 months from the top-up, then it lapses */
class TopupExpiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_paid_topup_lapses_after_twelve_months()
    {
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $u = Accounts::createAccount('عميل', 'client@example.test', 'password-123', 'client');
        $u->forceFill(['early_access' => true])->save();
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($u))->withHeader('Accept', 'application/json');

        $start = Accounts::balance($u->id);   // welcome credit: no expiry
        $added = $api->postJson('/api/v1/credits/topup', ['packId' => 'plan-starter'])->assertOk()->json('addedCredits');
        $this->assertSame($start + $added, Accounts::balance($u->id));

        $this->travel(11)->months();
        $this->assertSame($start + $added, Accounts::balance($u->id));
        $this->travel(2)->months();
        $this->assertSame($start, Accounts::balance($u->id));   // the top-up lapsed, the welcome credit stays
    }
}
