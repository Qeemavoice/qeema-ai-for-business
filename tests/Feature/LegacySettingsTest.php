<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** New admin «السياسات» and «مزوّدو تحويل النص إلى صوت» write the old site's settings rows */
class LegacySettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_policies_and_tts_providers_are_shared_with_the_old_site()
    {
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $admin = Accounts::createAccount('مشرف', 'admin@example.test', 'password-123', 'client');
        $admin->forceFill(['user_type_id' => 1])->save();
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($admin))->withHeader('Accept', 'application/json');

        $api->postJson('/api/v1/admin/settings', ['settings' => ['paymentHoldDaysVoiceActor' => 400]])->assertStatus(400);
        $api->postJson('/api/v1/admin/settings', ['settings' => ['paymentHoldDaysVoiceActor' => 7, 'ttsEnabled' => ['elevenlabs', 'bogus']]])->assertOk()
            ->assertJsonPath('settings.paymentHoldDaysVoiceActor', 7)->assertJsonPath('settings.ttsEnabled', ['elevenlabs']);
        $this->assertSame('7', getSetting('payment_hold_days_voice_actor'));

        config(['services.munsit.api_key' => 'test-key']);
        $this->assertFalse(\App\Services\NewUi\Tts::munsitEnabled());   // switched off in the dashboard
        $api->postJson('/api/v1/admin/settings', ['settings' => ['ttsEnabled' => ['munsit']]])->assertOk();
        $this->assertTrue(\App\Services\NewUi\Tts::munsitEnabled());
    }
}
