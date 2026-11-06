<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class QeemaTextAssistant
{
    public function reply(string $message, array $history, string $language, string $visitorKey, bool $authenticated): array
    {
        $voiceSearch = $this->voiceSearchParams($message);

        if ($localReply = $this->localReply($message, $language)) {
            return $localReply + [
                'source' => 'local',
                'quota' => $this->quotaSnapshot($visitorKey, $authenticated),
            ];
        }

        $apiKey = trim((string) config('services.gemini.api_key'));
        if ($apiKey === '') {
            return $this->fallback($language, 'not_configured', $visitorKey, $authenticated);
        }

        $quota = $this->reserveQuota($visitorKey, $authenticated);
        if (!$quota['allowed']) {
            return $this->fallback($language, 'quota_exhausted', $visitorKey, $authenticated, $quota);
        }

        $model = trim((string) config('services.gemini.model', 'gemini-3.1-flash-lite'));
        $baseUrl = rtrim((string) config('services.gemini.base_url'), '/');

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->timeout(max(5, (int) config('services.gemini.timeout', 15)))
                ->post($baseUrl . '/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey), [
                    'system_instruction' => [
                        'parts' => [['text' => $this->systemPrompt($language)]],
                    ],
                    'contents' => $this->contents($history, $message),
                    'generationConfig' => [
                        'temperature' => 0.5,
                        'maxOutputTokens' => 500,
                    ],
                ]);

            if (!$response->successful()) {
                Log::warning('Gemini text assistant request failed', [
                    'status' => $response->status(),
                    'body' => Str::limit($response->body(), 500),
                ]);

                return $this->fallback($language, 'provider_unavailable', $visitorKey, $authenticated, $quota);
            }

            $text = collect(data_get($response->json(), 'candidates.0.content.parts', []))
                ->pluck('text')
                ->filter()
                ->implode("\n");
            $text = trim($text);
            if ($text === '') {
                return $this->fallback($language, 'empty_response', $visitorKey, $authenticated, $quota);
            }

            $result = [
                'text' => $text,
                'source' => 'gemini',
                'quota' => $quota,
                'suggestedReplies' => $language === 'en'
                    ? ['Find a suitable voice', 'View pricing', 'Contact sales']
                    : ['ابحث عن صوت مناسب', 'الأسعار والباقات', 'تواصل مع المبيعات'],
            ];

            if ($voiceSearch !== null) {
                $result['cardType'] = 'voice_list';
                $result['searchParams'] = $voiceSearch;
                $result['cardData'] = [
                    'targetView' => 'voice-library',
                    'targetTab' => 'human',
                    'ctaLabel' => $language === 'en' ? 'Open Human Voice Library' : 'فتح مكتبة الأصوات البشرية',
                ];
            }

            return $result;
        } catch (ConnectionException $exception) {
            Log::warning('Gemini text assistant connection failed', ['message' => $exception->getMessage()]);
            return $this->fallback($language, 'provider_unavailable', $visitorKey, $authenticated, $quota);
        } catch (\Throwable $exception) {
            Log::warning('Gemini text assistant exception', ['message' => $exception->getMessage()]);
            return $this->fallback($language, 'provider_unavailable', $visitorKey, $authenticated, $quota);
        }
    }

    private function localReply(string $message, string $language): ?array
    {
        $query = Str::lower(trim($message));
        $isEnglish = $language === 'en';

        if ($this->containsAny($query, ['سعر', 'اسعار', 'أسعار', 'باقة', 'باقات', 'pricing', 'price', 'plan', 'cost'])) {
            return [
                'text' => $isEnglish
                    ? 'You can view all QeemaVoice plans and their details without creating an account.'
                    : 'يمكنك مشاهدة جميع أسعار وباقات قيمة فويس وتفاصيلها مباشرة، دون الحاجة إلى تسجيل حساب.',
                'cardType' => 'pricing',
                'cardData' => ['targetView' => 'billing'],
                'suggestedReplies' => $isEnglish
                    ? ['Find a suitable voice', 'Contact sales']
                    : ['ابحث عن صوت مناسب', 'تواصل مع المبيعات'],
            ];
        }

        if ($this->containsAny($query, ['تواصل', 'مبيعات', 'دعم', 'عرض سعر', 'contact', 'sales', 'support', 'demo'])) {
            return [
                'text' => $isEnglish
                    ? 'Send your project details through the contact page and the QeemaVoice team will follow up with you.'
                    : 'أرسل تفاصيل مشروعك من صفحة التواصل، وسيتابع معك فريق قيمة فويس لاختيار الحل المناسب.',
                'cardType' => 'contact_sales',
                'cardData' => ['targetView' => 'contact'],
                'suggestedReplies' => $isEnglish ? ['View pricing'] : ['الأسعار والباقات'],
            ];
        }

        if ($this->containsAny($query, ['ترخيص', 'حقوق', 'تجاري', 'license', 'commercial', 'copyright'])) {
            return [
                'text' => $isEnglish
                    ? 'Licensing depends on the selected service and intended use. Check the plan details or contact the team for written confirmation for your project.'
                    : 'الترخيص يعتمد على الخدمة المختارة وطبيعة الاستخدام. راجع تفاصيل الباقة، وللمشاريع التجارية الكبيرة اطلب تأكيداً مكتوباً من الفريق قبل النشر.',
                'cardType' => 'licensing',
                'cardData' => [
                    'details' => $isEnglish
                        ? ['Commercial usage terms are shown with each plan', 'Enterprise projects can request custom terms']
                        : ['شروط الاستخدام التجاري موضحة مع كل باقة', 'يمكن تخصيص شروط المؤسسات حسب المشروع'],
                ],
                'suggestedReplies' => $isEnglish ? ['View pricing', 'Contact sales'] : ['الأسعار والباقات', 'تواصل مع المبيعات'],
            ];
        }

        if ($this->containsAny($query, ['تحويل النص', 'نص إلى صوت', 'نص لصوت', 'tts', 'text to speech'])) {
            return [
                'text' => $isEnglish
                    ? 'Text-to-speech is available with QeemaVoice voices prepared for generation. Open the studio, choose a voice, enter your text, then generate and download the MP3. Sign-in is required.'
                    : 'تحويل النص إلى صوت متاح عبر أصوات قيمة فويس المهيأة للتوليد. افتح الاستوديو، اختر الصوت، أدخل النص، ثم ولّد الملف واستمع إليه أو نزّله بصيغة MP3. يلزم تسجيل الدخول.',
                'cardType' => 'navigation',
                'cardData' => [
                    'targetView' => 'tts',
                    'ctaLabel' => $isEnglish ? 'Open TTS Studio' : 'فتح استوديو تحويل النص إلى صوت',
                ],
                'suggestedReplies' => $isEnglish ? ['Find a human voice', 'View pricing'] : ['ابحث عن صوت بشري', 'الأسعار والباقات'],
            ];
        }

        if ($this->containsAny($query, ['استنساخ', 'توأم', 'clone', 'cloning', 'voice twin'])) {
            return [
                'text' => $isEnglish
                    ? 'Voice cloning is not available in the current launch phase. The current focus is discovering and booking certified human voices.'
                    : 'الاستنساخ والتوأم الصوتي مؤجلان حالياً. التركيز الحالي على اكتشاف وحجز الأصوات البشرية المعتمدة.',
                'suggestedReplies' => $isEnglish ? ['Explore voices', 'Contact sales'] : ['استعراض الأصوات', 'تواصل مع المبيعات'],
            ];
        }

        if ($this->containsAny($query, ['من نحن', 'كيف تعمل', 'ما هي قيمة', 'what is qeemavoice', 'how does it work', 'about'])) {
            return [
                'text' => $isEnglish
                    ? 'QeemaVoice is an Arabic platform for discovering and booking professional human voice talent. You can browse voices and pricing before signing up.'
                    : 'قيمة فويس منصة عربية لاكتشاف وحجز المعلقين الصوتيين المحترفين. تستطيع استعراض الأصوات والأسعار قبل التسجيل.',
                'cardType' => 'how_it_works',
                'cardData' => ['targetView' => 'how-it-works'],
                'suggestedReplies' => $isEnglish ? ['Explore voices', 'View pricing'] : ['استعراض الأصوات', 'الأسعار والباقات'],
            ];
        }

        return null;
    }

    private function systemPrompt(string $language): string
    {
        $responseLanguage = $language === 'en' ? 'English' : 'Arabic';

        return <<<PROMPT
You are QeemaVoice's friendly text assistant. Reply in {$responseLanguage}, naturally and directly.
You may answer ordinary general-knowledge questions, explain concepts, help with writing, brainstorming, planning, calculations, and everyday questions. Do not force every answer back to QeemaVoice.
When a question is about QeemaVoice, use the verified product facts below and never invent unavailable features or business claims.
QeemaVoice offers two distinct services: discovering and booking certified human Arabic voice talent, and text-to-speech using only QeemaVoice voices that are prepared for generation.
Text-to-speech users can choose an available QeemaVoice voice, generate audio after signing in, listen to it, and download an MP3.
Voice cloning, dubbing, interactive voice bots, and the developer API are postponed and must never be presented as currently available.
Visitors can browse voices and pricing without registration. Registration is required when starting a paid workflow.
Help users choose a dialect, gender, tone, and use case, and direct them to pricing or contact sales when appropriate.
Never invent prices, voice names, legal guarantees, discounts, technical capabilities, or delivery dates.
For time-sensitive facts, clearly say when you are unsure instead of pretending the information is current. For medical, legal, or financial questions, give general information and recommend an appropriate professional when needed.
Do not claim to perform actions, bookings, payments, or audio generation inside this chat; direct TTS requests to the TTS studio.
Keep routine answers concise, but use enough detail to answer the question properly. Do not use markdown tables unless the user explicitly asks for a comparison.
PROMPT;
    }

    private function voiceSearchParams(string $message): ?array
    {
        $query = Str::lower(trim($message));
        $voiceTerms = ['صوت', 'معلق', 'معلّق', 'لهجة', 'نبرة', 'إعلان', 'اعلان', 'وثائقي', 'بودكاست', 'تعليمي', 'رد آلي', 'voice', 'dialect', 'narrator', 'female', 'male'];

        if (!$this->containsAny($query, $voiceTerms)) {
            return null;
        }

        $dialect = 'all';
        if ($this->containsAny($query, ['سعود', 'خليج', 'gulf', 'saudi'])) $dialect = 'gulf';
        elseif ($this->containsAny($query, ['مصر', 'egypt'])) $dialect = 'egyptian';
        elseif ($this->containsAny($query, ['شام', 'سور', 'لبنان', 'أردن', 'اردن', 'levant'])) $dialect = 'levantine';
        elseif ($this->containsAny($query, ['مغرب', 'تونس', 'جزائر', 'maghreb'])) $dialect = 'maghrebi';
        elseif ($this->containsAny($query, ['فصح', 'رسمي', 'msa', 'fusha'])) $dialect = 'fusha';

        $gender = 'all';
        if ($this->containsAny($query, ['رجالي', 'رجل', 'ذكر', 'male', 'man'])) $gender = 'male';
        elseif ($this->containsAny($query, ['نسائي', 'أنثى', 'انثى', 'امرأة', 'female', 'woman'])) $gender = 'female';

        $useCase = null;
        $useCases = [
            'إعلانات' => ['إعلان', 'اعلان', 'advert'],
            'وثائقيات' => ['وثائقي', 'documentary'],
            'تعليمي' => ['تعليمي', 'تدريب', 'education'],
            'رد آلي' => ['رد آلي', 'ivr', 'هاتف'],
            'بودكاست' => ['بودكاست', 'podcast'],
            'قصص' => ['قصة', 'قصص', 'سرد', 'audiobook'],
        ];
        foreach ($useCases as $value => $terms) {
            if ($this->containsAny($query, $terms)) {
                $useCase = $value;
                break;
            }
        }

        return array_filter([
            'type' => 'human',
            'dialect' => $dialect,
            'gender' => $gender,
            'useCase' => $useCase,
        ], fn ($value) => $value !== null);
    }

    private function contents(array $history, string $message): array
    {
        $contents = [];
        foreach (array_slice($history, -6) as $item) {
            if (!is_array($item) || empty($item['text'])) {
                continue;
            }

            $contents[] = [
                'role' => ($item['sender'] ?? '') === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => Str::limit(strip_tags((string) $item['text']), 1200, '')]],
            ];
        }

        $last = end($contents);
        if (!$last || data_get($last, 'role') !== 'user' || data_get($last, 'parts.0.text') !== $message) {
            $contents[] = ['role' => 'user', 'parts' => [['text' => $message]]];
        }

        return $contents;
    }

    private function reserveQuota(string $visitorKey, bool $authenticated): array
    {
        $date = now()->format('Y-m-d');
        $visitorLimit = max(1, (int) config($authenticated ? 'services.gemini.user_daily_limit' : 'services.gemini.guest_daily_limit'));
        $globalLimit = max(1, (int) config('services.gemini.global_daily_limit'));
        $visitorCacheKey = 'qeema:assistant:daily:' . $date . ':' . hash('sha256', $visitorKey);
        $globalCacheKey = 'qeema:assistant:global:' . $date;
        $ttl = now()->endOfDay()->diffInSeconds(now()) + 60;

        Cache::add($visitorCacheKey, 0, $ttl);
        Cache::add($globalCacheKey, 0, $ttl);

        $visitorUsed = (int) Cache::get($visitorCacheKey, 0);
        $globalUsed = (int) Cache::get($globalCacheKey, 0);

        if ($visitorUsed >= $visitorLimit || $globalUsed >= $globalLimit) {
            return $this->quotaData(false, $visitorLimit, $visitorUsed, $globalLimit, $globalUsed);
        }

        $visitorUsed = (int) Cache::increment($visitorCacheKey);
        $globalUsed = (int) Cache::increment($globalCacheKey);

        return $this->quotaData(true, $visitorLimit, $visitorUsed, $globalLimit, $globalUsed);
    }

    private function quotaSnapshot(string $visitorKey, bool $authenticated): array
    {
        $date = now()->format('Y-m-d');
        $visitorLimit = max(1, (int) config($authenticated ? 'services.gemini.user_daily_limit' : 'services.gemini.guest_daily_limit'));
        $globalLimit = max(1, (int) config('services.gemini.global_daily_limit'));
        $visitorUsed = (int) Cache::get('qeema:assistant:daily:' . $date . ':' . hash('sha256', $visitorKey), 0);
        $globalUsed = (int) Cache::get('qeema:assistant:global:' . $date, 0);

        return $this->quotaData($visitorUsed < $visitorLimit && $globalUsed < $globalLimit, $visitorLimit, $visitorUsed, $globalLimit, $globalUsed);
    }

    private function quotaData(bool $allowed, int $visitorLimit, int $visitorUsed, int $globalLimit, int $globalUsed): array
    {
        return [
            'allowed' => $allowed,
            'dailyLimit' => $visitorLimit,
            'used' => min($visitorUsed, $visitorLimit),
            'remaining' => max(0, $visitorLimit - $visitorUsed),
            'globalRemaining' => max(0, $globalLimit - $globalUsed),
            'resetsAt' => now()->endOfDay()->toIso8601String(),
        ];
    }

    private function fallback(string $language, string $reason, string $visitorKey, bool $authenticated, ?array $quota = null): array
    {
        $isEnglish = $language === 'en';
        $quota = $quota ?: $this->quotaSnapshot($visitorKey, $authenticated);

        if ($reason === 'quota_exhausted') {
            $text = $isEnglish
                ? 'Your free AI messages for today have been used. Pricing, voice browsing, and contact options are still available, or you can return tomorrow.'
                : 'استخدمت رسائل الذكاء الاصطناعي المجانية المتاحة لك اليوم. ما زلت تستطيع مشاهدة الأسعار والأصوات أو التواصل مع الفريق، ويمكنك العودة غداً.';
        } else {
            $text = $isEnglish
                ? 'The AI answer is temporarily unavailable. I can still help you view voices, pricing, or contact the QeemaVoice team.'
                : 'الإجابة الذكية غير متاحة مؤقتاً. ما زلت أستطيع مساعدتك في استعراض الأصوات والأسعار أو التواصل مع فريق قيمة فويس.';
        }

        return [
            'text' => $text,
            'source' => 'fallback',
            'reason' => $reason,
            'quota' => $quota,
            'suggestedReplies' => $isEnglish
                ? ['Explore voices', 'View pricing', 'Contact sales']
                : ['استعراض الأصوات', 'الأسعار والباقات', 'تواصل مع المبيعات'],
        ];
    }

    private function containsAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (Str::contains($haystack, $needle)) {
                return true;
            }
        }

        return false;
    }
}
