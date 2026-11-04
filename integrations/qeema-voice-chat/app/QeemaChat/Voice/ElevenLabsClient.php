<?php

namespace App\QeemaChat\Voice;

use Illuminate\Support\Facades\Http;

/**
 * توليد الصوت عبر ElevenLabs. الرصيد يُحسب بعدد الحروف المرسلة.
 */
class ElevenLabsClient
{
    public function __construct(
        private string $apiKey,
        private string $model,
        private string $outputFormat = 'mp3_44100_128',
        private ?string $watermarkPath = null,
    ) {
    }

    /** يرجع بايتات ملف mp3 */
    public function speak(string $voiceId, string $text): string
    {
        $url = 'https://api.elevenlabs.io/v1/text-to-speech/' . rawurlencode($voiceId)
            . '?output_format=' . urlencode($this->outputFormat);

        $res = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
            'Accept' => 'audio/mpeg',
        ])->timeout(60)->post($url, array_filter([
            'text' => $text,
            'model_id' => $this->model,
            // تثبيت اللغة العربية مدعوم في نماذج Flash و Turbo
            'language_code' => preg_match('/flash|turbo/i', $this->model) ? 'ar' : null,
        ]));

        if ($res->failed()) {
            throw new \RuntimeException('ElevenLabs error ' . $res->status() . ': ' . mb_substr($res->body(), 0, 300));
        }

        $audio = $res->body();

        // العلامة الصوتية: ملف mp3 بنفس الصيغة يُلصق في الآخر
        if ($this->watermarkPath && is_readable($this->watermarkPath)) {
            $audio .= file_get_contents($this->watermarkPath);
        }

        return $audio;
    }
}
