<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Admin «استوديو TTS ← الأصوات»: own voices (no ElevenLabs id), clip name, narrator required and never shown to clients */
class AdminTtsVoicesTest extends TestCase
{
    use RefreshDatabase;

    public function test_own_voice_needs_a_narrator_and_hides_it_from_clients()
    {
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $admin = Accounts::createAccount('مشرف', 'admin@example.test', 'password-123', 'client');
        $admin->forceFill(['user_type_id' => 1])->save();
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($admin))->withHeader('Accept', 'application/json');
        $voice = ['name' => 'إعلان تجاري حماسي', 'gender' => 'male', 'dialect' => 'egyptian', 'styleLabel' => 'حماسي', 'previewUrl' => 'data:audio/mpeg;base64,AAAA'];

        $api->postJson('/api/v1/admin/tts-voices', $voice)->assertStatus(400)->assertJsonPath('error', 'اختر المعلق صاحب الصوت');

        $res = $api->postJson('/api/v1/admin/tts-voices', $voice + ['narratorId' => 'narrator_u77'])->assertOk()
            ->assertJsonPath('voice.provider', 'qeema_acoustic')->assertJsonPath('voice.dialectLabel', 'مصري')->assertJsonPath('voice.narratorId', 'narrator_u77');
        $id = $res->json('voice.id');
        $api->putJson("/api/v1/admin/tts-voices/{$id}", ['narratorId' => ''])->assertStatus(400);

        $public = $this->getJson('/api/v1/voices')->assertOk()->json('voices');
        $mine = collect($public)->firstWhere('id', $id);
        $this->assertSame('إعلان تجاري حماسي', $mine['name']);
        $this->assertArrayNotHasKey('narratorId', $mine);
        $this->assertStringNotContainsString('narrator_u77', json_encode($public));
    }
}
