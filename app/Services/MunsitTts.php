<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MunsitTts
{
    public function isConfigured(): bool
    {
        return $this->apiKey() !== '';
    }

    public function voices(): array
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('Munsit is not configured.', 503);
        }

        return Cache::remember('munsit:tts:voices:v1', now()->addMinutes(15), function () {
            $response = Http::acceptJson()
                ->withHeaders(['x-api-key' => $this->apiKey()])
                ->timeout($this->timeout())
                ->get($this->apiUrl('/voices/public'));

            $this->ensureSuccessful($response, 'Unable to load Munsit voices.');
            $voices = $response->json('data', $response->json());
            if (isset($voices['voices']) && is_array($voices['voices'])) {
                $voices = $voices['voices'];
            }
            if (!is_array($voices)) {
                return [];
            }

            return collect($voices)
                ->filter(fn ($voice) => is_array($voice))
                ->map(function (array $voice) {
                    $dialects = collect($voice['dialect'] ?? [])
                        ->filter(fn ($value) => is_string($value) && trim($value) !== '')
                        ->map(fn ($value) => trim($value))
                        ->values();
                    $languages = collect($voice['languages'] ?? [])
                        ->filter(fn ($value) => is_string($value) && trim($value) !== '')
                        ->values();

                    return [
                        'id' => (string) ($voice['voice_id'] ?? $voice['id'] ?? ''),
                        'name' => (string) ($voice['name'] ?? 'Munsit voice'),
                        'category' => 'Munsit',
                        'description' => (string) ($voice['description'] ?? ''),
                        'labels' => $dialects->all(),
                        'previewUrl' => (string) ($voice['sample_url'] ?? $voice['preview_url'] ?? ''),
                        'avatar' => '',
                        'dialect' => $dialects->first() ?: 'العربية',
                        'dialects' => $dialects->all(),
                        'languages' => $languages->all(),
                        'gender' => ($voice['gender'] ?? '') === 'female' ? 'female' : 'male',
                        'style' => implode('، ', $voice['tags'] ?? []),
                        'ttsReady' => true,
                        'isCloned' => (bool) ($voice['is_cloned'] ?? false),
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
            throw new RuntimeException('Munsit is not configured.', 503);
        }

        if (!in_array($voiceId, array_column($this->voices(), 'id'), true)) {
            throw new RuntimeException('Unknown Munsit voice.', 422);
        }

        if (!empty($settings['diacritize'])) {
            $text = $this->diacritize($text);
        }

        $emotionTags = [
            'excited' => '[excited]',
            'happy' => '[happy]',
            'calm' => '[calm]',
            'serious' => '[serious]',
            'sad' => '[sad]',
            'fearful' => '[fearful]',
            'angry' => '[angry]',
        ];
        $emotion = $settings['emotion'] ?? 'none';
        if (isset($emotionTags[$emotion])) {
            $text = $emotionTags[$emotion] . ' ' . $text;
        }

        $dialect = $settings['dialect'] ?? 'auto';
        if (!in_array($dialect, ['auto', 'emirati', 'fusha'], true)) {
            $dialect = 'auto';
        }

        $response = Http::asJson()
            ->accept('audio/wav')
            ->withHeaders(['x-api-key' => $this->apiKey()])
            ->timeout($this->timeout())
            ->post($this->apiUrl('/text-to-speech/' . rawurlencode((string) config('services.munsit.model', 'faseeh-v1-preview'))), [
                'voice_id' => $voiceId,
                'text' => $text,
                'stability' => (float) ($settings['stability'] ?? 0.5),
                'speed' => (float) ($settings['speed'] ?? 1.0),
                'dialect' => $dialect,
                'streaming' => false,
                'sample_rate' => 24000,
            ]);

        $this->ensureSuccessful($response, 'Unable to generate speech with Munsit.');
        return $response;
    }

    /** Arabic diacritics for the studio's «تشكيل النص» button */
    public function diacritizeText(string $text): string
    {
        if (!$this->isConfigured()) throw new RuntimeException('Munsit is not configured.', 503);
        return $this->diacritize($text);
    }

    private function diacritize(string $text): string
    {
        $response = Http::asJson()
            ->acceptJson()
            ->withHeaders(['x-api-key' => $this->apiKey()])
            ->timeout($this->timeout())
            ->post($this->apiUrl('/tashkil/diacritize'), ['text' => $text]);

        $this->ensureSuccessful($response, 'Unable to add Arabic diacritics.');
        return (string) ($response->json('data.diacritized_text') ?: $text);
    }

    private function apiKey(): string
    {
        // the admin dashboard «الإعدادات ← مزوّدو الصوت» first, then MUNSIT_API_KEY
        $k = \App\Services\NewUi\Store::integrationKey('munsit');
        return $k !== '' ? $k : trim((string) config('services.munsit.api_key'));
    }

    private function apiUrl(string $path): string
    {
        return rtrim((string) config('services.munsit.base_url', 'https://api.munsit.com/api/v1'), '/') . $path;
    }

    private function timeout(): int
    {
        return max(10, (int) config('services.munsit.timeout', 60));
    }

    private function ensureSuccessful(Response $response, string $fallback): void
    {
        if ($response->successful()) {
            return;
        }

        $message = (string) ($response->json('errorMessage')
            ?? $response->json('message')
            ?? $fallback);
        throw new RuntimeException($message, $response->status());
    }
}
