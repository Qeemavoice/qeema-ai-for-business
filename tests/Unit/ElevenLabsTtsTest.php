<?php

namespace Tests\Unit;

use App\Services\ElevenLabsTts;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ElevenLabsTtsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.elevenlabs.api_key', 'test-key');
        config()->set('services.elevenlabs.base_url', 'https://api.elevenlabs.io');
        config()->set('services.elevenlabs.tts_model', 'eleven_multilingual_v2');
        config()->set('services.elevenlabs.tts_output_format', 'mp3_44100_128');
        Cache::forget('elevenlabs:tts:voices:v1');
    }

    public function test_it_normalizes_available_voices(): void
    {
        Http::fake([
            'api.elevenlabs.io/v2/voices*' => Http::response([
                'voices' => [[
                    'voice_id' => 'voice-1',
                    'name' => 'Arabic Voice',
                    'category' => 'premade',
                    'labels' => ['language' => 'ar', 'accent' => 'gulf'],
                    'preview_url' => 'https://example.test/preview.mp3',
                ]],
            ]),
        ]);

        $voices = app(ElevenLabsTts::class)->voices();

        $this->assertSame('voice-1', $voices[0]['id']);
        $this->assertSame('Arabic Voice', $voices[0]['name']);
        $this->assertSame(['language' => 'ar', 'accent' => 'gulf'], $voices[0]['labels']);
    }

    public function test_it_sends_text_and_voice_settings_to_elevenlabs(): void
    {
        Http::fake([
            'api.elevenlabs.io/v1/text-to-speech/*' => Http::response('fake-mp3', 200, ['Content-Type' => 'audio/mpeg']),
        ]);

        $response = app(ElevenLabsTts::class)->generate('voice-1', 'أهلاً بكم', [
            'stability' => 0.6,
            'similarityBoost' => 0.8,
            'speed' => 0.95,
        ]);

        $this->assertSame('fake-mp3', $response->body());
        Http::assertSent(function (Request $request) {
            return str_contains($request->url(), '/v1/text-to-speech/voice-1')
                && str_contains($request->url(), 'output_format=mp3_44100_128')
                && $request->hasHeader('xi-api-key', 'test-key')
                && $request['text'] === 'أهلاً بكم'
                && $request['model_id'] === 'eleven_multilingual_v2'
                && $request['voice_settings']['speed'] === 0.95;
        });
    }
}
