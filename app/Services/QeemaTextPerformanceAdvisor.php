<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class QeemaTextPerformanceAdvisor
{
    public function analyze(string $text, Collection $voices): array
    {
        $voiceCatalog = $voices->map(function ($voice) {
            $categories = $voice->categories
                ->map(fn ($item) => optional($item->category)->name)
                ->filter()
                ->values();

            return [
                'id' => (string) $voice->id,
                'name' => (string) ($voice->title ?: $voice->show_id),
                'gender' => optional(optional($voice->voiceOver)->profile)->gender === FEMALE ? 'female' : 'male',
                'dialect' => (string) (optional($voice->dialect)->name ?: 'فصحى'),
                'styles' => $categories->all(),
                'ttsReady' => filled($voice->elevenlabs_voice_id),
            ];
        })->values();

        $cacheKey = 'qeema:text-performance:' . hash('sha256', $text . '|' . $voiceCatalog->pluck('id')->implode(','));

        return Cache::remember($cacheKey, now()->addHours(12), function () use ($text, $voiceCatalog) {
            try {
                return $this->requestGemini($text, $voiceCatalog);
            } catch (\Throwable $exception) {
                Log::warning('Gemini text performance analysis failed', ['message' => $exception->getMessage()]);
                return $this->fallback($text, $voiceCatalog);
            }
        });
    }

    private function requestGemini(string $text, Collection $voiceCatalog): array
    {
        $apiKey = trim((string) config('services.gemini.api_key'));
        if ($apiKey === '') {
            throw new RuntimeException('Gemini is not configured.');
        }

        $model = trim((string) config('services.gemini.model', 'gemini-3.1-flash-lite'));
        $baseUrl = rtrim((string) config('services.gemini.base_url'), '/');
        $catalogJson = json_encode($voiceCatalog->all(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $prompt = <<<PROMPT
حلّل النص العربي التالي كمخرج تعليق صوتي محترف. حسّن الصياغة لتصبح طبيعية عند الإلقاء من دون تغيير المعنى أو إضافة ادعاءات. حدّد حالة النص والمشاعر والسرعة والوقفات وإرشادات الأداء، ثم اختر حتى 3 معلقين مناسبين حصراً من القائمة المرفقة. لا تختر أي معرّف غير موجود.

النص:
{$text}

معلقو قيمة فويس المتاحون:
{$catalogJson}
PROMPT;

        $response = Http::asJson()
            ->acceptJson()
            ->timeout(max(8, (int) config('services.gemini.timeout', 15)))
            ->post($baseUrl . '/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey), [
                'contents' => [[
                    'role' => 'user',
                    'parts' => [['text' => $prompt]],
                ]],
                'generationConfig' => [
                    'temperature' => 0.25,
                    'maxOutputTokens' => 1200,
                    'responseMimeType' => 'application/json',
                    'responseSchema' => $this->schema(),
                ],
            ]);

        if (!$response->successful()) {
            throw new RuntimeException('Gemini analysis request failed: ' . $response->status());
        }

        $raw = collect(data_get($response->json(), 'candidates.0.content.parts', []))
            ->pluck('text')
            ->filter()
            ->implode('');
        $result = json_decode($raw, true);
        if (!is_array($result)) {
            throw new RuntimeException('Gemini returned an invalid analysis.');
        }

        return $this->normalize($result, $voiceCatalog);
    }

    private function schema(): array
    {
        return [
            'type' => 'object',
            'required' => ['improvedText', 'textType', 'emotion', 'tone', 'pace', 'direction', 'performanceTips', 'pronunciationNotes', 'recommendedVoices', 'settings'],
            'properties' => [
                'improvedText' => ['type' => 'string'],
                'textType' => ['type' => 'string', 'enum' => ['advertisement', 'documentary', 'podcast', 'educational', 'ivr', 'story', 'general']],
                'emotion' => ['type' => 'string', 'enum' => ['none', 'excited', 'curious', 'sad', 'mischievous', 'whisper', 'shout', 'laugh', 'sigh']],
                'tone' => ['type' => 'string'],
                'pace' => ['type' => 'string', 'enum' => ['slow', 'medium', 'fast']],
                'direction' => ['type' => 'string'],
                'performanceTips' => ['type' => 'array', 'maxItems' => 4, 'items' => ['type' => 'string']],
                'pronunciationNotes' => ['type' => 'array', 'maxItems' => 4, 'items' => ['type' => 'string']],
                'recommendedVoices' => [
                    'type' => 'array',
                    'maxItems' => 3,
                    'items' => [
                        'type' => 'object',
                        'required' => ['voiceId', 'reason'],
                        'properties' => [
                            'voiceId' => ['type' => 'string'],
                            'reason' => ['type' => 'string'],
                        ],
                    ],
                ],
                'settings' => [
                    'type' => 'object',
                    'required' => ['stability', 'similarityBoost', 'style', 'speed'],
                    'properties' => [
                        'stability' => ['type' => 'number', 'minimum' => 0, 'maximum' => 1],
                        'similarityBoost' => ['type' => 'number', 'minimum' => 0, 'maximum' => 1],
                        'style' => ['type' => 'number', 'minimum' => 0, 'maximum' => 1],
                        'speed' => ['type' => 'number', 'minimum' => 0.7, 'maximum' => 1.2],
                    ],
                ],
            ],
        ];
    }

    private function normalize(array $result, Collection $voiceCatalog): array
    {
        $voicesById = $voiceCatalog->keyBy('id');
        $recommendations = collect($result['recommendedVoices'] ?? [])
            ->filter(fn ($item) => is_array($item) && $voicesById->has((string) ($item['voiceId'] ?? '')))
            ->unique(fn ($item) => (string) $item['voiceId'])
            ->take(3)
            ->map(function ($item) use ($voicesById) {
                $voice = $voicesById->get((string) $item['voiceId']);
                return [
                    'voiceId' => $voice['id'],
                    'voiceName' => $voice['name'],
                    'dialect' => $voice['dialect'],
                    'ttsReady' => (bool) $voice['ttsReady'],
                    'reason' => trim((string) ($item['reason'] ?? 'مناسب لطبيعة النص وأسلوب أدائه.')),
                ];
            })->values()->all();

        $settings = $result['settings'] ?? [];

        return [
            'improvedText' => trim((string) ($result['improvedText'] ?? '')),
            'textType' => (string) ($result['textType'] ?? 'general'),
            'emotion' => (string) ($result['emotion'] ?? 'none'),
            'tone' => trim((string) ($result['tone'] ?? 'طبيعي وواضح')),
            'pace' => (string) ($result['pace'] ?? 'medium'),
            'direction' => trim((string) ($result['direction'] ?? 'أداء طبيعي مع إبراز الكلمات المهمة.')),
            'performanceTips' => array_values(array_slice(array_filter($result['performanceTips'] ?? [], 'is_string'), 0, 4)),
            'pronunciationNotes' => array_values(array_slice(array_filter($result['pronunciationNotes'] ?? [], 'is_string'), 0, 4)),
            'recommendedVoices' => $recommendations,
            'settings' => [
                'stability' => $this->clamp($settings['stability'] ?? 0.45, 0, 1),
                'similarityBoost' => $this->clamp($settings['similarityBoost'] ?? 0.75, 0, 1),
                'style' => $this->clamp($settings['style'] ?? 0.3, 0, 1),
                'speed' => $this->clamp($settings['speed'] ?? 1, 0.7, 1.2),
            ],
            'source' => 'gemini',
        ];
    }

    private function fallback(string $text, Collection $voiceCatalog): array
    {
        $excited = Str::contains($text, ['!', '؟', 'عرض', 'الآن', 'اكتشف', 'جرّب']);

        return [
            'improvedText' => trim(preg_replace('/\s+/u', ' ', $text)),
            'textType' => $excited ? 'advertisement' : 'general',
            'emotion' => $excited ? 'excited' : 'none',
            'tone' => $excited ? 'حماسي وواثق' : 'طبيعي وواضح',
            'pace' => $excited ? 'fast' : 'medium',
            'direction' => $excited ? 'ابدأ بطاقة واضحة، اترك وقفة قصيرة قبل الفكرة الرئيسية، وأنهِ الدعوة للفعل بثقة.' : 'حافظ على إيقاع هادئ، وافصل بين الجمل بوقفات قصيرة.',
            'performanceTips' => ['أبرز الكلمات المفتاحية من دون مبالغة', 'اترك وقفة قصيرة عند علامات الترقيم'],
            'pronunciationNotes' => [],
            'recommendedVoices' => $voiceCatalog->take(3)->map(fn ($voice) => [
                'voiceId' => $voice['id'],
                'voiceName' => $voice['name'],
                'dialect' => $voice['dialect'],
                'ttsReady' => (bool) $voice['ttsReady'],
                'reason' => 'صوت بشري متاح من مكتبة قيمة فويس.',
            ])->values()->all(),
            'settings' => ['stability' => 0.45, 'similarityBoost' => 0.75, 'style' => $excited ? 0.45 : 0.2, 'speed' => $excited ? 1.05 : 1],
            'source' => 'local',
        ];
    }

    private function clamp($value, float $min, float $max): float
    {
        return round(max($min, min($max, (float) $value)), 2);
    }
}
