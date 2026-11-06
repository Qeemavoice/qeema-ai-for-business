<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** Our studio with the Munsit catalogue: voices listed as «munsit:<id>», generation charged on our credits ledger with his settings */
class MunsitStudioTest extends TestCase
{
    use RefreshDatabase;

    public function test_munsit_voice_generates_and_charges_credits()
    {
        config(['services.munsit.api_key' => '']);
        $this->getJson('/api/v1/tts/munsit-voices')->assertOk()->assertJsonPath('configured', false)->assertJsonPath('total', 0);

        config(['services.munsit.api_key' => 'test-key']);
        \Illuminate\Support\Facades\Cache::flush();
        Http::fake([
            '*/voices/public' => Http::response(['data' => [['voice_id' => 'v-1', 'name' => 'Turki - Najdi', 'dialect' => ['najdi'], 'gender' => 'male']]]),
            '*/text-to-speech/*' => Http::response('RIFFwav', 200, ['Content-Type' => 'audio/wav']),
        ]);
        $this->getJson('/api/v1/tts/munsit-voices')->assertOk()->assertJsonPath('voices.0.id', 'munsit:v-1')->assertJsonPath('voices.0.dialect', 'najdi');

        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $u = Accounts::createAccount('عميل', 'client@example.test', 'password-123', 'client');
        $u->forceFill(['early_access' => true])->save();
        Accounts::addCredits($u->id, null, 100, 'admin_grant', 'test');
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($u))->withHeader('Accept', 'application/json');

        $before = Accounts::balance($u->id);
        $res = $api->postJson('/api/v1/generations', ['voiceId' => 'munsit:v-1', 'text' => 'مرحبا بكم',
            'settings' => ['emotion' => 'excited', 'dialect' => 'fusha', 'diacritize' => false, 'speed' => 3]])->assertOk();
        $this->assertSame('munsit', $res->json('generation.provider'));
        $this->assertSame('excited', $res->json('generation.settings.emotion'));
        $this->assertEquals(1.2, $res->json('generation.settings.speed'));      // clamped to Munsit's range
        $this->assertSame($before - mb_strlen('مرحبا بكم'), $res->json('newBalanceCredits'));
        Http::assertSent(fn ($req) => str_contains($req->url(), 'text-to-speech') && $req['dialect'] === 'fusha' && str_starts_with($req['text'], '[excited]'));

        // the generated file answers byte ranges (Safari and iOS need 206 to play it)
        $audio = $res->json('generation.audioUrl');
        $this->get($audio, ['Range' => 'bytes=0-3'])->assertStatus(206)->assertHeader('Content-Range', 'bytes 0-3/7');
    }
}
