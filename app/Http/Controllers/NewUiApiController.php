<?php

namespace App\Http\Controllers;

use App\Models\Voice;
use App\Models\Partner;
use App\Models\SuccessStory;
use App\Models\PaymentMethod;
use App\Models\Article;
use App\Models\ArticleStatus;
use App\Models\MailMessage;
use App\Models\VoiceStatus;
use App\Models\OrderStatus;
use App\Models\User;
use App\Models\Setting;
use App\Models\UserProfile;
use App\Models\UserStatus;
use App\Models\UserType;
use App\Services\WalletHelper;
use App\Services\QeemaTextAssistant;
use App\Services\QeemaTextPerformanceAdvisor;
use App\Services\ElevenLabsTts;
use App\Services\MunsitTts;
use App\Services\Payment\Gateways\StripePayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NewUiApiController extends Controller
{
    public function articles(Request $request): JsonResponse
    {
        $query = Article::query()
            ->where('status', ArticleStatus::PUBLISHED)
            ->latest();

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', '%' . $search . '%')
                    ->orWhere('short_description', 'like', '%' . $search . '%');
            });
        }

        $articles = $query
            ->limit(min(max((int) $request->input('limit', 30), 1), 100))
            ->get()
            ->map(fn (Article $article) => $this->articlePayload($article, false));

        return response()->json(['articles' => $articles])
            ->header('Cache-Control', 'public, max-age=180');
    }

    public function article(Article $article): JsonResponse
    {
        abort_unless((int) $article->status === ArticleStatus::PUBLISHED, 404);

        return response()->json(['article' => $this->articlePayload($article, true)])
            ->header('Cache-Control', 'public, max-age=300');
    }

    public function stories(): JsonResponse
    {
        $stories = SuccessStory::public()
            ->orderBy('sort_order')
            ->latest('id')
            ->get()
            ->map(fn (SuccessStory $story) => $this->successStoryPayload($story, false))
            ->values();

        return response()->json(['items' => $stories])->header('Cache-Control', 'public, max-age=300');
    }

    public function story(SuccessStory $story): JsonResponse
    {
        abort_unless($story->is_published && $story->permission_confirmed, 404);

        return response()->json(['item' => $this->successStoryPayload($story, true)])
            ->header('Cache-Control', 'public, max-age=300');
    }

    public function partners(): JsonResponse
    {
        $partners = Partner::query()
            ->where('show_on_homepage', true)
            ->where('permission_confirmed', true)
            ->whereNotNull('reference_url')
            ->where('reference_url', '!=', '')
            ->oldest('id')
            ->limit(30)
            ->get()
            ->map(fn (Partner $partner) => [
                'id' => (string) $partner->id,
                'name' => (string) $partner->full_name,
                'jobTitle' => (string) ($partner->job_title ?: ''),
                'description' => (string) ($partner->description ?: ''),
                'imageUrl' => $partner->image_url,
                'alt' => (string) ($partner->alt ?: $partner->full_name),
                'referenceUrl' => filter_var($partner->reference_url, FILTER_VALIDATE_URL) ? (string) $partner->reference_url : null,
            ])
            ->values();

        return response()->json(['partners' => $partners])
            ->header('Cache-Control', 'public, max-age=300');
    }

    public function ttsVoices(Request $request, ElevenLabsTts $elevenLabs, MunsitTts $munsit): JsonResponse
    {
        $providers = $this->ttsProviderOptions($elevenLabs, $munsit);
        $provider = (string) $request->query('provider', $providers['active']);
        if ($provider === '') {
            return response()->json(['configured' => false, 'provider' => '', 'providers' => $providers, 'voices' => [], 'message' => 'لم يتم إعداد مزوّد صوت بعد.']);
        }
        abort_unless(in_array($provider, ['elevenlabs', 'munsit'], true), 422);
        abort_unless($providers['providers'][$provider]['enabled'], 403, 'مزوّد الصوت غير مفعّل حالياً.');

        if ($provider === 'munsit') {
            try {
                return response()->json([
                    'configured' => true,
                    'provider' => $provider,
                    'providers' => $providers,
                    'model' => (string) config('services.munsit.model', 'faseeh-v1-preview'),
                    'voices' => $munsit->voices(),
                ])->header('Cache-Control', 'public, max-age=300');
            } catch (\Throwable $exception) {
                Log::warning('Munsit voice catalogue request failed', ['message' => $exception->getMessage()]);
                return response()->json(['message' => 'تعذر تحميل أصوات منصّت الآن.'], 502);
            }
        }

        $voices = Voice::query()
            ->with(['dialect', 'voiceOver.profile', 'categories.category'])
            ->where('voice_status_id', VoiceStatus::ACCEPTED)
            ->whereNotNull('voiceover_id')
            ->latest('id')
            ->get()
            ->map(function (Voice $voice) {
                $categories = $voice->categories->map(fn ($item) => optional($item->category)->name)->filter()->values();
                $profile = optional($voice->voiceOver)->profile;
                return [
                    'id' => (string) $voice->id,
                    'name' => (string) ($voice->title ?: $voice->show_id),
                    'category' => 'معلقو قيمة فويس',
                    'description' => (string) ($categories->first() ?: 'معلق صوتي بشري من مكتبة قيمة فويس'),
                    'labels' => array_values(array_filter([optional($voice->dialect)->name])),
                    'previewUrl' => (string) $voice->audio_file_url,
                    'avatar' => $voice->voiceOver ? (string) $voice->voiceOver->image_url : '',
                    'dialect' => (string) (optional($voice->dialect)->name ?: 'فصحى'),
                    'gender' => optional($profile)->gender === FEMALE ? 'female' : 'male',
                    'style' => (string) ($categories->first() ?: 'تعليق صوتي'),
                    'ttsReady' => filled($voice->elevenlabs_voice_id),
                ];
            })
            ->sortByDesc('ttsReady')
            ->values();

        return response()->json([
            'configured' => $elevenLabs->isConfigured(),
            'provider' => $provider,
            'providers' => $providers,
            'model' => (string) config('services.elevenlabs.tts_model', 'eleven_multilingual_v2'),
            'voices' => $voices,
            'message' => $voices->isEmpty() ? 'لا توجد نماذج أصوات بشرية منشورة حالياً.' : null,
        ])->header('Cache-Control', 'public, max-age=300');
    }

    public function ttsGenerate(Request $request, ElevenLabsTts $elevenLabs, MunsitTts $munsit)
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'سجّل الدخول أولاً لاستخدام تحويل النص إلى صوت.',
            ], 401);
        }

        $providerSettings = $this->ttsProviderOptions($elevenLabs, $munsit);
        $provider = (string) $request->input('provider', $providerSettings['active']);
        abort_unless(in_array($provider, ['elevenlabs', 'munsit'], true), 422);
        abort_unless($providerSettings['providers'][$provider]['enabled'], 403, 'مزوّد الصوت غير مفعّل حالياً.');

        $maxChars = max(100, (int) config('services.elevenlabs.tts_max_chars', 2000));
        $data = $request->validate([
            'provider' => ['nullable', 'in:elevenlabs,munsit'],
            'voiceId' => ['required', 'string', 'max:191'],
            'voiceName' => ['nullable', 'string', 'max:191'],
            'text' => ['required', 'string', 'max:' . $maxChars],
            'settings' => ['nullable', 'array'],
            'settings.stability' => ['nullable', 'numeric', 'between:0,1'],
            'settings.similarityBoost' => ['nullable', 'numeric', 'between:0,1'],
            'settings.style' => ['nullable', 'numeric', 'between:0,1'],
            'settings.speed' => ['nullable', 'numeric', 'between:0.7,1.2'],
            'settings.speakerBoost' => ['nullable', 'boolean'],
            'settings.model' => ['nullable', 'in:eleven_multilingual_v2,eleven_v3'],
            'settings.emotion' => ['nullable', 'in:none,excited,curious,sad,mischievous,whisper,shout,laugh,sigh,happy,calm,serious,fearful,angry'],
            'settings.dialect' => ['nullable', 'in:auto,emirati,fusha'],
            'settings.diacritize' => ['nullable', 'boolean'],
        ]);

        $userId = (int) $request->user()->getAuthIdentifier();
        $characters = mb_strlen(trim($data['text']));
        $voice = null;
        $voiceId = (string) $data['voiceId'];
        $voiceName = (string) ($data['voiceName'] ?? '');
        if ($provider === 'elevenlabs') {
            $voice = Voice::query()
                ->where('voice_status_id', VoiceStatus::ACCEPTED)
                ->whereNotNull('elevenlabs_voice_id')
                ->where('elevenlabs_voice_id', '!=', '')
                ->findOrFail((int) $voiceId);
            $voiceId = (string) $voice->elevenlabs_voice_id;
            $voiceName = (string) ($voice->title ?: $voice->show_id);
        }

        try {
            $audio = $provider === 'munsit'
                ? $munsit->generate($voiceId, trim($data['text']), $data['settings'] ?? [])
                : $elevenLabs->generate($voiceId, trim($data['text']), $data['settings'] ?? []);

            $generationId = null;
            try {
                $relativePath = 'uploads/tts/' . $userId . '/' . Str::uuid() . ($provider === 'munsit' ? '.wav' : '.mp3');
                $absolutePath = public_path($relativePath);
                File::ensureDirectoryExists(dirname($absolutePath));
                File::put($absolutePath, $audio->body());

                $generationId = DB::table('tts_generations')->insertGetId([
                    'user_id' => $userId,
                    'voice_id' => $provider . ':' . $data['voiceId'],
                    'voice_name' => $voiceName ?: (string) $data['voiceId'],
                    'text' => trim($data['text']),
                    'characters' => $characters,
                    'file_path' => $relativePath,
                    'mime_type' => $audio->header('Content-Type') ?: 'audio/mpeg',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $historyException) {
                Log::warning('TTS history save failed', [
                    'message' => $historyException->getMessage(),
                    'user_id' => $userId,
                ]);
            }

            $headers = [
                'Content-Type' => $audio->header('Content-Type') ?: 'audio/mpeg',
                'Content-Disposition' => 'inline; filename="qeemavoice-tts.' . ($provider === 'munsit' ? 'wav' : 'mp3') . '"',
                'Cache-Control' => 'no-store, private',
                'X-Content-Type-Options' => 'nosniff',
            ];
            if ($generationId) {
                $headers['X-Qeema-Generation-Id'] = (string) $generationId;
            }

            return response($audio->body(), 200, $headers);
        } catch (\Throwable $exception) {
            Log::warning('TTS generation failed', [
                'provider' => $provider,
                'message' => $exception->getMessage(),
                'user_id' => $request->user()->getAuthIdentifier(),
            ]);

            $status = (int) $exception->getCode();
            if ($status < 400 || $status > 599) {
                $isConfigured = $provider === 'munsit' ? $munsit->isConfigured() : $elevenLabs->isConfigured();
                $status = $isConfigured ? 502 : 503;
            }

            return response()->json([
                'message' => $status === 401
                    ? 'خدمة التوليد غير مهيأة بشكل صحيح.'
                    : 'تعذر توليد الصوت الآن. حاول مرة أخرى بعد قليل.',
            ], $status);
        }
    }

    public function ttsProviderSettings(Request $request, ElevenLabsTts $elevenLabs, MunsitTts $munsit): JsonResponse
    {
        abort_unless($request->user() && (int) $request->user()->user_type_id === UserType::ADMIN, 403);
        return response()->json($this->ttsProviderOptions($elevenLabs, $munsit));
    }

    private function ttsProviderOptions(ElevenLabsTts $elevenLabs, MunsitTts $munsit): array
    {
        $configured = [
            'elevenlabs' => $elevenLabs->isConfigured(),
            'munsit' => $munsit->isConfigured(),
        ];
        $stored = Setting::query()->where('key', 'new-ui-tts-providers')->value('value');
        $saved = is_string($stored) ? json_decode($stored, true) : null;
        $defaultProvider = (string) config('services.tts.default_provider', 'munsit');
        $enabled = is_array($saved['enabled'] ?? null)
            ? array_values(array_intersect($saved['enabled'], ['elevenlabs', 'munsit']))
            : (isset($configured[$defaultProvider]) && $configured[$defaultProvider] ? [$defaultProvider] : []);

        // Do not expose a stale or misconfigured provider as an active choice.
        $enabled = array_values(array_filter($enabled, fn ($provider) => $configured[$provider] ?? false));
        $active = (string) ($saved['active'] ?? $defaultProvider);
        if (!in_array($active, $enabled, true)) {
            $active = $enabled[0] ?? '';
        }

        return [
            'active' => $active,
            'providers' => [
                'elevenlabs' => [
                    'label' => 'ElevenLabs',
                    'configured' => $configured['elevenlabs'],
                    'enabled' => in_array('elevenlabs', $enabled, true),
                ],
                'munsit' => [
                    'label' => 'منصّت',
                    'configured' => $configured['munsit'],
                    'enabled' => in_array('munsit', $enabled, true),
                ],
            ],
        ];
    }

    public function updateTtsProviderSettings(Request $request, ElevenLabsTts $elevenLabs, MunsitTts $munsit): JsonResponse
    {
        abort_unless($request->user() && (int) $request->user()->user_type_id === UserType::ADMIN, 403);

        $data = $request->validate([
            'enabledProviders' => ['required', 'array', 'min:1'],
            'enabledProviders.*' => ['required', 'in:elevenlabs,munsit'],
            'activeProvider' => ['required', 'in:elevenlabs,munsit'],
        ]);
        abort_unless(in_array($data['activeProvider'], $data['enabledProviders'], true), 422, 'المزوّد الافتراضي يجب أن يكون مفعّلاً.');

        $configured = [
            'elevenlabs' => $elevenLabs->isConfigured(),
            'munsit' => $munsit->isConfigured(),
        ];
        foreach ($data['enabledProviders'] as $provider) {
            abort_unless($configured[$provider], 422, 'أضف مفتاح المزوّد في .env.staging أولاً ثم أعد تشغيل التطبيق.');
        }

        Setting::query()->updateOrCreate(
            ['key' => 'new-ui-tts-providers'],
            ['value' => json_encode([
                'enabled' => array_values(array_unique($data['enabledProviders'])),
                'active' => $data['activeProvider'],
            ])]
        );

        return response()->json($this->ttsProviderOptions($elevenLabs, $munsit));
    }

    public function ttsAnalyze(Request $request, QeemaTextPerformanceAdvisor $advisor): JsonResponse
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'سجّل الدخول أولاً لتحليل النص واقتراح أسلوب الأداء.',
            ], 401);
        }

        $data = $request->validate([
            'text' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $voices = Voice::query()
            ->with(['dialect', 'voiceOver.profile', 'categories.category'])
            ->where('voice_status_id', VoiceStatus::ACCEPTED)
            ->whereNotNull('voiceover_id')
            ->latest('id')
            ->limit(60)
            ->get();

        return response()->json([
            'analysis' => $advisor->analyze(trim($data['text']), $voices),
        ])->header('Cache-Control', 'no-store, private');
    }

    public function ttsHistory(Request $request): JsonResponse
    {
        if (!$request->user()) {
            return response()->json(['message' => 'سجّل الدخول أولاً لعرض تسجيلاتك.'], 401);
        }

        $recordings = DB::table('tts_generations')
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->latest('id')
            ->limit(100)
            ->get()
            ->map(fn ($recording) => [
                'id' => (string) $recording->id,
                'voiceId' => (string) $recording->voice_id,
                'voiceName' => (string) ($recording->voice_name ?: 'صوت مولّد'),
                'text' => (string) $recording->text,
                'characters' => (int) $recording->characters,
                'audioUrl' => asset($recording->file_path),
                'createdAt' => $recording->created_at,
            ]);

        return response()->json(['recordings' => $recordings])
            ->header('Cache-Control', 'no-store, private');
    }

    public function assistantChat(Request $request, QeemaTextAssistant $assistant): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'language' => ['nullable', 'in:ar,en'],
            'history' => ['nullable', 'array', 'max:6'],
            'history.*.sender' => ['required_with:history', 'in:user,assistant,system'],
            'history.*.text' => ['required_with:history', 'string', 'max:1200'],
        ]);

        $user = $request->user();
        $visitorKey = $user
            ? 'user:' . $user->getAuthIdentifier()
            : 'guest:' . $request->session()->getId() . ':' . $request->ip();

        $reply = $assistant->reply(
            trim($data['message']),
            $data['history'] ?? [],
            $data['language'] ?? 'ar',
            $visitorKey,
            (bool) $user
        );

        return response()->json($reply)->header('Cache-Control', 'no-store, private');
    }

    public function storeLead(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:191'],
            'email' => ['required', 'email', 'max:191'],
            'mobile' => ['nullable', 'string', 'max:191'],
            'message' => ['required', 'string', 'max:2000'],
            'metadata' => ['nullable', 'array'],
        ]);

        $details = collect($data['metadata'] ?? [])
            ->map(fn ($value, $key) => $key . ': ' . (is_scalar($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE)))
            ->implode("\n");

        $lead = MailMessage::create([
            'to' => getMailConfig()['from']['address'],
            'from' => $data['email'],
            'full_name' => $data['name'],
            'mobile' => $data['mobile'] ?? null,
            'content' => '[' . $data['type'] . "]\n" . $data['message'] . ($details ? "\n\n" . $details : ''),
        ]);

        return response()->json(['success' => true, 'id' => (string) $lead->id], 201);
    }

    public function assistantConfig(): JsonResponse
    {
        $agentId = trim((string) config('services.elevenlabs.agent_id'));
        $apiKey = trim((string) config('services.elevenlabs.api_key'));

        return response()->json([
            'hasAgent' => $agentId !== '' && $apiKey !== '',
            'provider' => $agentId !== '' && $apiKey !== '' ? 'elevenlabs' : 'browser',
        ]);
    }

    public function assistantSignedUrl(): JsonResponse
    {
        $agentId = trim((string) config('services.elevenlabs.agent_id'));
        $apiKey = trim((string) config('services.elevenlabs.api_key'));

        if ($agentId === '' || $apiKey === '') {
            return response()->json([
                'message' => 'ElevenLabs voice assistant is not configured.',
            ], 503);
        }

        try {
            $response = Http::timeout(12)
                ->withHeaders(['xi-api-key' => $apiKey])
                ->get('https://api.elevenlabs.io/v1/convai/conversation/get-signed-url', [
                    'agent_id' => $agentId,
                    'environment' => config('services.elevenlabs.environment', 'production'),
                ]);

            if (!$response->successful() || !$response->json('signed_url')) {
                Log::warning('ElevenLabs signed URL request failed', [
                    'status' => $response->status(),
                    'body' => Str::limit($response->body(), 500),
                ]);

                return response()->json([
                    'message' => 'تعذر بدء المساعد الصوتي الآن. حاول مرة أخرى.',
                ], 502);
            }

            return response()->json([
                'signedUrl' => $response->json('signed_url'),
                'expiresInSeconds' => 900,
            ])->header('Cache-Control', 'no-store, private');
        } catch (\Throwable $exception) {
            Log::warning('ElevenLabs signed URL request exception', [
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'تعذر الاتصال بخدمة المساعد الصوتي الآن.',
            ], 502);
        }
    }

    public function csrf(Request $request): JsonResponse
    {
        return response()->json(['token' => csrf_token()]);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $eligibleUser = User::query()
            ->where('email', $credentials['email'])
            ->where('status_id', UserStatus::ACCEPTED)
            ->whereIn('user_type_id', [UserType::CLIENT, UserType::VOICE_ACTOR])
            ->exists();

        if (!$eligibleUser || !Auth::attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'status_id' => UserStatus::ACCEPTED,
        ], (bool) ($credentials['remember'] ?? false))) {
            return response()->json(['message' => trans('auth.failed')], 422);
        }

        $request->session()->regenerate();

        return $this->me($request);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'email' => ['required', 'email', 'max:191', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:191'],
            'company' => ['nullable', 'string', 'max:191'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'full_name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'uniq_id' => generate_uniq_id(),
                'user_type_id' => UserType::CLIENT,
                'status_id' => UserStatus::ACCEPTED,
            ]);

            UserProfile::create([
                'user_id' => $user->id,
                'work_field' => $data['company'] ?? null,
            ]);
            WalletHelper::create($user->id);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return $this->me($request);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'authenticated' => false,
                'user' => null,
                'company' => null,
                'balanceCredits' => 0,
                'availableCompanies' => [],
            ]);
        }

        $company = [
            'id' => (string) $user->id,
            'name' => $user->show_full_name ?: $user->email,
            'industry' => '',
            'country' => '',
            'createdAt' => optional($user->created_at)->toIso8601String(),
            'planId' => 'legacy',
        ];

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => (string) $user->id,
                'email' => $user->email,
                'name' => $user->show_full_name ?: $user->email,
                'companyId' => (string) $user->id,
                'role' => 'member',
                'avatar' => $user->image_url,
                'createdAt' => optional($user->created_at)->toIso8601String(),
            ],
            'company' => $company,
            'balanceCredits' => (int) $this->ttsCreditAccount((int) $user->id)->balance,
            'availableCompanies' => [$company],
        ]);
    }

    public function creditStatus(Request $request): JsonResponse
    {
        abort_unless($request->user(), 401);
        $userId = (string) $request->user()->getAuthIdentifier();

        $account = $this->ttsCreditAccount((int) $userId);
        return response()->json([
            'balanceCredits' => (int) $account->balance,
            'trialAvailable' => !(bool) $account->trial_used,
            'trialCharacters' => 50,
            'paymentsEnabled' => $this->mainSiteStripeSecret() !== null,
        ])->header('Cache-Control', 'no-store, private');
    }

    public function creditCheckout(Request $request): JsonResponse
    {
        abort_unless($request->user(), 401);
        $data = $request->validate(['packId' => ['required', 'in:pack-5k,pack-25k,pack-100k']]);
        $packs = [
            'pack-5k' => ['credits' => 5000, 'price' => 900, 'name' => '5,000 نقطة صوتية'],
            'pack-25k' => ['credits' => 25000, 'price' => 2900, 'name' => '25,000 نقطة صوتية'],
            'pack-100k' => ['credits' => 100000, 'price' => 9900, 'name' => '100,000 نقطة صوتية'],
        ];

        $stripeSecret = $this->mainSiteStripeSecret();
        if ($stripeSecret === null) {
            return response()->json(['message' => 'بوابة الدفع غير مفعلة في لوحة الإدارة.'], 503);
        }

        $pack = $packs[$data['packId']];
        try {
            \Stripe\Stripe::setApiKey($stripeSecret);
            $checkout = \Stripe\Checkout\Session::create([
                'mode' => 'payment',
                'customer_email' => $request->user()->email,
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'unit_amount' => $pack['price'],
                        'product_data' => ['name' => $pack['name']],
                    ],
                    'quantity' => 1,
                ]],
                'metadata' => [
                    'user_id' => (string) $request->user()->getAuthIdentifier(),
                    'credits' => (string) $pack['credits'],
                ],
                'success_url' => $request->getSchemeAndHttpHost() . '/ar?view=client-dashboard&payment=success&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $request->getSchemeAndHttpHost() . '/ar?view=client-dashboard&payment=cancelled',
            ]);
        } catch (\Throwable $exception) {
            Log::error('TTS credit checkout creation failed', ['message' => $exception->getMessage()]);
            return response()->json(['message' => 'تعذر بدء الدفع الآن. تحقق من إعدادات بوابة الدفع في لوحة الإدارة.'], 502);
        }

        return response()->json(['checkoutUrl' => $checkout->url]);
    }

    public function creditConfirm(Request $request): JsonResponse
    {
        abort_unless($request->user(), 401);
        $data = $request->validate(['sessionId' => ['required', 'string', 'max:255']]);

        $stripeSecret = $this->mainSiteStripeSecret();
        if ($stripeSecret === null) {
            return response()->json(['message' => 'بوابة الدفع غير مفعلة.'], 503);
        }

        try {
            \Stripe\Stripe::setApiKey($stripeSecret);
            $checkout = \Stripe\Checkout\Session::retrieve($data['sessionId']);
        } catch (\Throwable $exception) {
            Log::warning('TTS credit payment confirmation failed', ['message' => $exception->getMessage()]);
            return response()->json(['message' => 'تعذر التحقق من عملية الدفع.'], 502);
        }
        $userId = (string) $request->user()->getAuthIdentifier();

        if ($checkout->payment_status !== 'paid' || (string) $checkout->metadata->user_id !== $userId) {
            return response()->json(['message' => 'لم يتم تأكيد عملية الدفع.'], 422);
        }

        DB::transaction(function () use ($checkout, $userId) {
            $alreadyProcessed = DB::table('tts_credit_payments')
                ->where('provider_session_id', $checkout->id)
                ->exists();
            if ($alreadyProcessed) return;

            $account = $this->ttsCreditAccount((int) $userId);
            DB::table('tts_credit_accounts')->where('user_id', $userId)->update([
                'balance' => (int) $account->balance + (int) $checkout->metadata->credits,
                'updated_at' => now(),
            ]);
            DB::table('tts_credit_payments')->insert([
                'user_id' => $userId,
                'provider' => 'stripe',
                'provider_session_id' => $checkout->id,
                'credits' => (int) $checkout->metadata->credits,
                'amount_cents' => (int) ($checkout->amount_total ?: 0),
                'currency' => strtolower((string) ($checkout->currency ?: 'usd')),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return $this->creditStatus($request);
    }

    public function billing(Request $request): JsonResponse
    {
        $user = $request->user();
        $plans = $this->billingPlans();
        $payments = $user
            ? DB::table('tts_credit_payments')->where('user_id', $user->id)->latest()->limit(50)->get()
            : collect();

        $company = [
            'id' => $user ? (string) $user->id : 'guest',
            'name' => $user ? ($user->show_full_name ?: $user->email) : 'زائر قيمة فويس',
            'industry' => '',
            'country' => '',
            'createdAt' => $user ? optional($user->created_at)->toIso8601String() : null,
            'planId' => 'starter',
        ];

        return response()->json([
            'company' => $company,
            'currentPlan' => $plans[0],
            'availablePlans' => $plans,
            'balanceCredits' => $user ? (int) $this->ttsCreditAccount((int) $user->id)->balance : 0,
            'invoices' => $payments->map(fn ($payment) => [
                'id' => (string) $payment->provider_session_id,
                'date' => \Carbon\Carbon::parse($payment->created_at)->toIso8601String(),
                'description' => 'شحن رصيد تحويل النص إلى صوت',
                'creditsAdded' => (int) $payment->credits,
                'amountUsd' => strtolower((string) $payment->currency) === 'usd'
                    ? ((int) $payment->amount_cents / 100)
                    : 0,
                'status' => 'paid',
            ])->values(),
        ])->header('Cache-Control', 'no-store, private');
    }

    public function voices(Request $request): JsonResponse
    {
        $query = Voice::query()
            ->select('voices.*')
            ->selectSub(function ($orders) {
                $orders->from('order_items')
                    ->join('orders', 'orders.id', '=', 'order_items.order_id')
                    ->selectRaw('COUNT(DISTINCT orders.customer_id)')
                    ->whereColumn('order_items.itemable_id', 'voices.id')
                    ->where('order_items.itemable_type', Voice::class)
                    ->where('orders.status_id', OrderStatus::COMPLETED)
                    ->whereNull('orders.deleted_at')
                    ->whereNotNull('orders.customer_id');
            }, 'trusted_clients_count')
            ->with(['dialect.language', 'voiceOver.profile', 'categories.category'])
            ->where('voice_status_id', VoiceStatus::ACCEPTED)
            ->whereNotNull('voiceover_id');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where('title', 'like', '%' . $search . '%');
        }

        if ($request->filled('dialect') && $request->input('dialect') !== 'all') {
            $dialect = $request->input('dialect');
            $query->whereHas('dialect', function ($dialectQuery) use ($dialect) {
                $dialectQuery->where('name', 'like', '%' . $dialect . '%');
            });
        }

        if ($request->input('type') === 'ai') {
            return response()->json($this->voicesPayload(collect()));
        }

        $voices = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(min(max((int) $request->input('limit', 48), 1), 100))
            ->get();

        if ($request->filled('gender')) {
            $gender = $request->input('gender') === 'female' ? FEMALE : MALE;
            $voices = $voices->filter(function (Voice $voice) use ($gender) {
                return optional(optional($voice->voiceOver)->profile)->gender === $gender;
            })->values();
        }

        return response()->json($this->voicesPayload($voices));
    }

    private function voicesPayload($voices): array
    {
        $items = $voices->map(function (Voice $voice) {
            $dialectLabel = optional($voice->dialect)->name ?: 'فصحى';
            $language = optional(optional($voice->dialect)->language)->name ?: 'العربية';
            $profile = optional($voice->voiceOver)->profile;
            $categories = $voice->categories
                ->map(fn ($item) => optional($item->category)->name)
                ->filter()
                ->values();

            return [
                'id' => (string) $voice->id,
                'type' => 'human',
                'name' => $voice->title ?: $voice->show_id,
                'nameEn' => $voice->show_id,
                'gender' => optional($profile)->gender === FEMALE ? 'female' : 'male',
                'language' => $language,
                'dialect' => $this->dialectKey($dialectLabel),
                'dialectLabel' => $dialectLabel,
                'style' => Str::slug($categories->first() ?: 'voice-over'),
                'styleLabel' => $categories->first() ?: 'تعليق صوتي',
                'useCases' => $categories->all(),
                'provider' => 'qeemavoice',
                'previewUrl' => $voice->audio_file_url,
                'isActive' => true,
                'isFeatured' => (int) $voice->number_of_orders > 0,
                'avatar' => $voice->voiceOver ? $voice->voiceOver->image_url : '',
                'humanTalentId' => $voice->voiceover_id ? (string) $voice->voiceover_id : null,
                'bookingsCount' => (int) $voice->number_of_orders,
                'usageCount' => (string) ((int) $voice->number_of_listened),
                'trustedClientsCount' => (int) ($voice->trusted_clients_count ?? 0),
                'pricing' => $voice->show_total_price,
                'isHuman' => true,
                'isVerified' => true,
            ];
        })->values();

        return [
            'total' => $items->count(),
            'voices' => $items,
            'metadata' => [
                'dialects' => $items->unique('dialect')->map(fn ($voice) => [
                    'code' => $voice['dialect'],
                    'labelAr' => $voice['dialectLabel'],
                ])->values(),
                'types' => [
                    ['code' => 'human', 'labelAr' => 'بشري'],
                ],
            ],
        ];
    }

    private function dialectKey(string $dialect): string
    {
        $value = Str::lower($dialect);

        if (Str::contains($value, ['مصر', 'egypt'])) return 'egyptian';
        if (Str::contains($value, ['شام', 'سور', 'لبنان', 'أردن', 'levant'])) return 'levantine';
        if (Str::contains($value, ['مغرب', 'تونس', 'جزائر', 'maghreb'])) return 'maghrebi';
        if (Str::contains($value, ['فصح', 'standard', 'msa'])) return 'fusha';

        return 'gulf';
    }

    private function billingPlans(): array
    {
        return [
            [
                'id' => 'starter',
                'name' => 'Starter Production Plan',
                'nameAr' => 'باقة الإنتاج الأساسية (Starter)',
                'monthlyCredits' => 50000,
                'priceUsd' => 49,
                'features' => [
                    '50,000 نقطة صوتية (حوالي 50 دقيقة)',
                    'وصول كامل لمكتبة المعلقين الصوتيين البشريين',
                    'ترخيص تجاري كامل للإعلانات والسوشيال ميديا',
                    'تصدير بجودة ستوديو 48kHz WAV',
                ],
            ],
            [
                'id' => 'growth',
                'name' => 'Growth & Agency Plan',
                'nameAr' => 'باقة الشركات والوكالات (Growth)',
                'monthlyCredits' => 200000,
                'priceUsd' => 149,
                'features' => [
                    '200,000 نقطة صوتية شهرياً',
                    'خصم 15% على حجوزات المعلقين البشريين',
                    'مفاتيح API مخصصة للربط البرمجي',
                    'أولوية في حجز المعلقين الصوتيين',
                    'دعم فني مخصص ذو أولوية 24/7',
                ],
            ],
            [
                'id' => 'enterprise',
                'name' => 'Enterprise Custom Plan',
                'nameAr' => 'باقة المؤسسات المخصصة (Enterprise)',
                'monthlyCredits' => 1000000,
                'priceUsd' => 499,
                'features' => [
                    'أرصدة غير محدودة أو استهلاك مخصص (SLA)',
                    'إدارة إنتاج مخصصة للمؤسسات',
                    'ربط خاص بأنظمة IVR ومراكز الاتصال',
                    'عقود تجارية مخصصة وفواتير ضريبية رسمية',
                ],
            ],
        ];
    }

    private function ttsCreditAccount(int $userId): object
    {
        DB::table('tts_credit_accounts')->updateOrInsert(
            ['user_id' => $userId],
            ['updated_at' => now(), 'created_at' => now()]
        );

        return DB::table('tts_credit_accounts')->where('user_id', $userId)->first();
    }

    private function successStoryPayload(SuccessStory $story, bool $details): array
    {
        return [
            'id' => (string) $story->id,
            'slug' => $story->slug,
            'brand' => $story->brand,
            'brandEn' => $story->brand_en,
            'brandColor' => $story->brand_color,
            'about' => $story->about,
            'voiceCategory' => $story->voice_category,
            'industry' => $story->industry,
            'title' => $story->title,
            'titleEn' => $story->title_en,
            'date' => $story->story_date,
            'audioUrl' => $story->audio_url,
            'audioDuration' => $story->audio_duration,
            'audioDurationSecs' => $story->audio_duration_secs,
            'heroSubtitle' => $story->hero_subtitle,
            'highlights' => $story->highlights ?: [],
            'stats' => $details ? ($story->stats ?: []) : [],
            'paragraphs' => $details ? ($story->paragraphs ?: []) : [],
            'clips' => $details ? ($story->clips ?: []) : [],
            'content' => $details ? $story->content : null,
            'quote' => $details ? ['text' => $story->quote_text, 'author' => $story->quote_author, 'role' => $story->quote_role] : null,
        ];
    }

    private function articlePayload(Article $article, bool $withContent): array
    {
        $plainContent = trim(strip_tags((string) $article->content));
        $wordCount = count(preg_split('/\s+/u', $plainContent, -1, PREG_SPLIT_NO_EMPTY));
        $keywords = collect(preg_split('/[,،]/u', (string) $article->meta_keywords))
            ->map(fn ($keyword) => trim($keyword))
            ->filter()
            ->take(8)
            ->values();

        return [
            'id' => (string) $article->id,
            'slug' => (string) $article->slug,
            'title' => (string) $article->title,
            'summary' => (string) $article->short_description,
            'image' => $article->external_image_url ?: $article->internal_image_url,
            'date' => optional($article->created_at)->toIso8601String(),
            'readMinutes' => max(1, (int) ceil($wordCount / 220)),
            'tags' => $keywords,
            'bodyHtml' => $withContent ? (string) $article->content : null,
            'videoUrl' => $withContent ? (string) ($article->video_url ?: '') : null,
        ];
    }

    private function mainSiteStripeSecret(): ?string
    {
        if (!config('services.payments_enabled')) return null;

        $method = getPaymentMethod(PaymentMethod::STRIPE);
        if (!$method || (int) $method->is_active !== YES) return null;

        try {
            $secret = StripePayment::config('secret');
            return filled($secret) ? (string) $secret : null;
        } catch (\Throwable $exception) {
            Log::warning('Main site Stripe configuration is unavailable', ['message' => $exception->getMessage()]);
            return null;
        }
    }
}
