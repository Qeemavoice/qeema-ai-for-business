<?php

namespace Tests\Unit;

use App\Services\NewUi\Tts;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** Our TTS studio uses the Munsit engine for voices whose provider is «munsit», and falls back to the internal engine otherwise */
class NewUiTtsMunsitTest extends TestCase
{
    public function test_munsit_voice_uses_munsit_and_falls_back_without_a_key()
    {
        $voice = ['provider' => 'munsit', 'provider_voice_id' => 'v-1', 'gender' => 'male'];

        config(['services.munsit.api_key' => '']);
        $this->assertNotSame('munsit', Tts::synthesize('مرحبا', $voice)['provider']);

        config(['services.munsit.api_key' => 'test-key']);
        Http::fake([
            '*/voices/public' => Http::response(['data' => [['id' => 'v-1', 'voice_id' => 'v-1', 'name' => 'صوت']]]),
            '*/text-to-speech/*' => Http::response('RIFFwav', 200, ['Content-Type' => 'audio/wav']),
        ]);
        $r = Tts::synthesize('مرحبا', $voice);
        $this->assertSame('munsit', $r['provider']);
        $this->assertSame('RIFFwav', $r['audio']);
    }
}
