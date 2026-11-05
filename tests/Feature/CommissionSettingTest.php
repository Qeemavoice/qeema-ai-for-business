<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** «الإعدادات ← العمولات»: one platform rate for the new UI, the old site's booking helpers and the old admin page */
class CommissionSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_admin_rate_is_used_everywhere()
    {
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $admin = Accounts::createAccount('مشرف', 'admin@example.test', 'password-123', 'client');
        $admin->forceFill(['user_type_id' => 1])->save();
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($admin))->withHeader('Accept', 'application/json');

        $api->postJson('/api/v1/admin/settings', ['settings' => ['platformCommissionPercent' => 150]])->assertStatus(400);
        $api->postJson('/api/v1/admin/settings', ['settings' => ['platformCommissionPercent' => 25]])->assertOk();

        $this->getJson('/api/v1/site-status')->assertOk()->assertJsonPath('commissionPercent', 25);
        $this->assertEquals(25, commissions('platform'));          // old booking form
        $this->assertEquals(25, platformCommission(100));           // old voice prices
        $this->assertEquals(125, \App\Services\NewUi\Plans::finalPrice(100));
        $old = json_decode(DB::table('settings')->where('key', 'commissions')->value('value'), true);
        $this->assertEquals(25, $old['platform']);                  // old admin page shows the same rate
        $this->assertEquals(5, $old['stripe']);
    }
}
