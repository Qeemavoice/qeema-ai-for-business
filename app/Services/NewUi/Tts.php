<?php

namespace App\Services\NewUi;

use Illuminate\Support\Facades\Http;

/**
 * Text-to-speech for the new UI. Port of new-ui/server/providers/*.ts:
 * ElevenLabs when a key and a voice id exist, otherwise the internal acoustic engine (pure PHP, no services).
 */
class Tts
{
    /** 1 credit = 1 character */
    public static function estimateCredits(string $text): int
    {
        return max(1, mb_strlen(trim($text)));
    }

    /**
     * @param array $voice   row of qv_tts_voices (provider, provider_voice_id, gender)
     * @return array{audio:string, mime:string, duration:float, provider:string, model:string, cost:float}
     */
    public static function synthesize(string $text, array $voice, array $settings = []): array
    {
        $provider = $voice['provider'] ?? 'elevenlabs';
        if ($provider === 'elevenlabs') {
            $key = self::elevenLabsKey();
            $voiceId = $voice['provider_voice_id'] ?? '';
            if ($key && $voiceId) {
                $r = self::elevenLabs($key, $voiceId, $text, $settings);
                if ($r) return $r;
            }
        }
        if ($provider === 'munsit' && !empty($voice['provider_voice_id'])) {
            $r = self::munsit((string) $voice['provider_voice_id'], $text, $settings);
            if ($r) return $r;
        }
        return self::acoustic($text, $voice['gender'] ?? 'male', $settings);
    }

    /** Munsit is usable: key set and not switched off in the old dashboard «مزوّدو تحويل النص إلى صوت» */
    public static function munsitEnabled(): bool
    {
        if (!app(\App\Services\MunsitTts::class)->isConfigured()) return false;
        $saved = json_decode((string) \App\Models\Setting::where('key', 'new-ui-tts-providers')->value('value'), true);
        return !is_array($saved['enabled'] ?? null) || in_array('munsit', $saved['enabled'], true);
    }

    /**
     * Short public code of a studio voice (QV-101, QV-102…), fixed once given, kept in qv_kv «tts-voice-codes».
     * Clients see and use this code; the provider and its voice id stay on the server.
     */
    public static function code(string $id): string
    {
        $codes = (array) Store::get('tts-voice-codes', []);
        if (!isset($codes[$id])) {
            // ponytail: read-then-write, two voices first seen at the same instant could share a number; add a lock if voices get added in bulk
            $codes[$id] = max([100, ...array_map('intval', array_values($codes))]) + 1;
            Store::set('tts-voice-codes', $codes);
        }
        return 'QV-' . $codes[$id];
    }

    /** Internal voice id of a «QV-123» code, or null */
    public static function idFromCode(string $code): ?string
    {
        if (!preg_match('/^QV-(\d+)$/i', trim($code), $m)) return null;
        $id = array_search((int) $m[1], array_map('intval', (array) Store::get('tts-voice-codes', [])), true);
        return $id === false ? null : (string) $id;
    }

    /** Raw Munsit catalogue (provider ids), [] when Munsit is off or down */
    private static function munsitCatalogue(): array
    {
        if (!self::munsitEnabled()) return [];
        try {
            return app(\App\Services\MunsitTts::class)->voices();
        } catch (\Throwable $e) {
            report($e);
            return [];
        }
    }

    /** Munsit voices for the studio: the id is the Qeema code, never Munsit's own voice id */
    public static function munsitVoices(): array
    {
        return array_map(function ($v) {
            $code = self::code('munsit:' . $v['id']);
            return ['id' => $code, 'code' => $code, 'name' => $v['name'], 'gender' => $v['gender'],
                'dialect' => $v['dialect'], 'dialects' => $v['dialects'], 'description' => $v['description'], 'style' => $v['style'],
                'previewUrl' => $v['previewUrl'] ? "/api/v1/voices/{$code}/preview" : ''];   // served by us (VoicesController::preview)
        }, self::munsitCatalogue());
    }

    /** A Munsit studio voice (by its code or «munsit:<id>») as a qv_tts_voices-like row (no narrator); null for any other voice */
    public static function munsitVoiceRow(string $id): ?object
    {
        $key = str_starts_with($id, 'munsit:') ? $id : self::idFromCode($id);
        if (!$key || !str_starts_with($key, 'munsit:')) return null;
        foreach (self::munsitCatalogue() as $v) {
            if ('munsit:' . $v['id'] === $key) {
                return (object) ['id' => $key, 'name' => $v['name'], 'provider' => 'munsit', 'provider_voice_id' => $v['id'],
                    'gender' => $v['gender'], 'dialect' => $v['dialect'], 'is_active' => 1, 'narrator_id' => null, 'preview_url' => $v['previewUrl']];
            }
        }
        return null;
    }

    /** منصّت (Munsit), the other developer's Arabic engine; key in MUNSIT_API_KEY */
    private static function munsit(string $voiceId, string $text, array $settings): ?array
    {
        try {
            $m = app(\App\Services\MunsitTts::class);
            if (!$m->isConfigured()) return null;
            $resp = $m->generate($voiceId, $text, $settings);
            return [
                'audio' => $resp->body(),
                'mime' => 'audio/wav',
                'duration' => round(max(1.5, mb_strlen($text) / 14), 2),
                'provider' => 'munsit',
                'model' => (string) config('services.munsit.model', 'faseeh-v1-preview'),
                'cost' => 0.0,
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function elevenLabsKey(): string
    {
        $k = (string) (Store::integrations()['elevenlabs']['apiKey'] ?? '');
        if (strlen(trim($k)) < 6) $k = (string) config('services.elevenlabs.api_key', '');
        return strlen(trim($k)) >= 6 ? trim($k) : '';
    }

    private static function elevenLabs(string $key, string $voiceId, string $text, array $settings): ?array
    {
        try {
            $resp = Http::withHeaders(['xi-api-key' => $key, 'Accept' => 'audio/mpeg'])
                ->timeout(90)
                ->post("https://api.elevenlabs.io/v1/text-to-speech/{$voiceId}", [
                    'text' => $text,
                    'model_id' => 'eleven_multilingual_v2',
                    'voice_settings' => [
                        'stability' => (float) ($settings['stability'] ?? 0.5),
                        'similarity_boost' => (float) ($settings['style'] ?? 0.75),
                        'speed' => (float) ($settings['speed'] ?? 1.0),
                    ],
                ]);
            if (!$resp->successful()) return null;
            $chars = mb_strlen($text);
            return [
                'audio' => $resp->body(),
                'mime' => 'audio/mpeg',
                'duration' => round(max(1.5, $chars / 14), 2),
                'provider' => 'elevenlabs',
                'model' => 'eleven_multilingual_v2',
                'cost' => round(($chars / 1000) * 0.015, 4),
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** Internal engine: harmonic synthesis, 24 kHz 16-bit mono WAV (same numbers as QeemaAcousticProvider.ts). */
    public static function acoustic(string $text, string $gender, array $settings): array
    {
        $sampleRate = 24000;
        $speed = max(0.5, min(2.0, (float) ($settings['speed'] ?? 1.0) ?: 1.0));
        $clean = trim($text);
        $chars = max(1, mb_strlen($clean));
        $duration = max(1.8, ($chars / 14) / $speed);
        $total = (int) floor($sampleRate * $duration);

        $pitch = (float) ($settings['pitch'] ?? 0);
        $baseF0 = ($gender === 'female' ? 220 : 130) + $pitch * 4;
        $formants = $gender === 'female' ? [$baseF0, 850, 2050, 2800, 3800] : [$baseF0, 700, 1600, 2400, 3200];
        $syllables = max(3, (int) floor($chars / 3.5));
        $syllableLength = $total / $syllables;
        $twoPi = 2 * M_PI;

        $pcm = '';
        $chunk = [];
        for ($i = 0; $i < $total; $i++) {
            $t = $i / $sampleRate;
            $syllPos = fmod($i, $syllableLength) / $syllableLength;
            $syllEnv = pow(sin(M_PI * $syllPos), 1.8);
            $phraseProgress = $i / $total;
            $phraseMod = sin(M_PI * $phraseProgress);
            $f0 = $baseF0 * (1.05 - 0.12 * $phraseProgress) + sin($twoPi * 4.5 * $t) * 2.5;

            $s = 0.45 * sin($twoPi * $f0 * $t)
                + 0.25 * sin($twoPi * $f0 * 2 * $t)
                + 0.15 * sin($twoPi * $f0 * 3 * $t)
                + 0.08 * sin($twoPi * $formants[1] * $t)
                + 0.04 * sin($twoPi * $formants[2] * $t);
            $s = ($s + (mt_rand() / mt_getrandmax() * 2 - 1) * 0.025) * $syllEnv * (0.4 + 0.6 * $phraseMod);
            if ($i < 800) $s *= $i / 800;
            elseif ($i > $total - 1200) $s *= ($total - $i) / 1200;

            $v = (int) floor(max(-1, min(1, $s * 0.85)) * 32767);
            $chunk[] = $v & 0xFFFF;
            if (count($chunk) === 8192) { $pcm .= pack('v*', ...$chunk); $chunk = []; }
        }
        if ($chunk) $pcm .= pack('v*', ...$chunk);

        $size = strlen($pcm);
        $header = pack('A4VA4A4VvvVVvvA4V', 'RIFF', 36 + $size, 'WAVE', 'fmt ', 16, 1, 1, $sampleRate, $sampleRate * 2, 2, 16, 'data', $size);
        return [
            'audio' => $header . $pcm,
            'mime' => 'audio/wav',
            'duration' => round($duration, 2),
            'provider' => 'qeema_acoustic_engine_v1',
            'model' => 'arabic-acoustic-neural-f0',
            'cost' => round(($chars / 1000) * 0.005, 4),
        ];
    }
}
