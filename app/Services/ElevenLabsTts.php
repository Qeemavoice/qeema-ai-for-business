<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ElevenLabsTts
{
    public function isConfigured(): bool
    {
        return $this->apiKey() !== '';
    }

    public function voices(): array
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('ElevenLabs is not configured.');
        }

        return Cache::remember('elevenlabs:tts:voices:v1', now()->addMinutes(10), function () {
            $response = Http::acceptJson()
                ->withHeaders(['xi-api-key' => $this->apiKey()])
                ->timeout($this->timeout())
                ->get($this->apiUrl('/v2/voices'), [
                    'page_size' => 100,
                    'sort' => 'name',
                    'sort_direction' => 'asc',
                ]);

            $this->ensureSuccessful($response, 'Unable to load ElevenLabs voices.');

            return collect($response->json('voices', []))
                ->map(function (array $voice) {
                    $labels = collect($voice['labels'] ?? [])
                        ->filter(fn ($value) => is_scalar($value) && trim((string) $value) !== '')
                        ->map(fn ($value) => (string) $value)
                        ->all();

                    return [
                        'id' => (string) ($voice['voice_id'] ?? ''),
                        'name' => (string) ($voice['name'] ?? 'Voice'),
                        'category' => (string) ($voice['category'] ?? 'available'),
                        'description' => (string) ($voice['description'] ?? ''),
                        'labels' => $labels,
                        'previewUrl' => (string) ($voice['preview_url'] ?? ''),
                    ];
                })
                ->filter(fn (array $voice) => $voice['id'] !== '')
                ->values()
                ->all();
        });
    }

    public function generate(string $voiceId, string $text, array $settings): Response
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('ElevenLabs is not configured.');
        }

        $model = in_array(($settings['model'] ?? null), ['eleven_multilingual_v2', 'eleven_v3'], true)
            ? $settings['model']
            : (string) config('services.elevenlabs.tts_model', 'eleven_multilingual_v2');
        $emotionTags = [
            'excited' => '[excited]',
            'curious' => '[curious]',
            'sad' => '[crying]',
            'mischievous' => '[mischievously]',
            'whisper' => '[whispers]',
            'shout' => '[shouts]',
            'laugh' => '[laughs]',
            'sigh' => '[sighs]',
        ];
        $emotion = $settings['emotion'] ?? 'none';
        if ($model === 'eleven_v3' && isset($emotionTags[$emotion])) {
            $text = $emotionTags[$emotion] . ' ' . $text;
        }

        $voiceSettings = [
            'stability' => (float) ($settings['stability'] ?? 0.4),
        ];
        // Eleven v3 does not support speed, similarity boost, or speaker boost.
        if ($model !== 'eleven_v3') {
            $voiceSettings += [
                'similarity_boost' => (float) ($settings['similarityBoost'] ?? 0.75),
                'style' => (float) ($settings['style'] ?? 0.2),
                'use_speaker_boost' => (bool) ($settings['speakerBoost'] ?? true),
                'speed' => (float) ($settings['speed'] ?? 1.0),
            ];
        }

        $response = Http::asJson()
            ->accept('audio/mpeg')
            ->withHeaders(['xi-api-key' => $this->apiKey()])
            ->timeout($this->timeout())
            ->post($this->apiUrl('/v1/text-to-speech/' . rawurlencode($voiceId)) . '?' . http_build_query([
                'output_format' => config('services.elevenlabs.tts_output_format', 'mp3_44100_128'),
            ]), [
                'text' => $text,
                'model_id' => $model,
                'voice_settings' => $voiceSettings,
            ]);

        $this->ensureSuccessful($response, 'Unable to generate speech.');

        return $response;
    }

    private function apiKey(): string
    {
        // the admin dashboard «الإعدادات ← مزوّدو الصوت» first, then ELEVENLABS_API_KEY
        $k = \App\Services\NewUi\Store::integrationKey('elevenlabs');
        return $k !== '' ? $k : trim((string) config('services.elevenlabs.api_key'));
    }

    private function apiUrl(string $path): string
    {
        return rtrim((string) config('services.elevenlabs.base_url', 'https://api.elevenlabs.io'), '/') . $path;
    }

    private function timeout(): int
    {
        return max(10, (int) config('services.elevenlabs.tts_timeout', 45));
    }

    private function ensureSuccessful(Response $response, string $fallback): void
    {
        if ($response->successful()) {
            return;
        }

        $message = (string) ($response->json('detail.message')
            ?? $response->json('detail')
            ?? $response->json('message')
            ?? $fallback);

        throw new RuntimeException($message, $response->status());
    }
}
