<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Services\NewUi\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

/** Assistant widget endpoints (port of new-ui/server/routes/assistant.ts; the Gemini chat needs GEMINI_API_KEY). */
class AssistantController extends Controller
{
    private function agentId(): string
    {
        return (string) (Store::integrations()['elevenlabs']['agentId'] ?? '') ?: (string) env('ELEVENLABS_AGENT_ID', '');
    }

    public function config()
    {
        $agent = $this->agentId();
        $has = strlen(trim($agent)) > 3;
        return response()->json([
            'status' => 'ok', 'hasAgent' => $has, 'agentId' => $has ? $agent : null, 'supportedLanguages' => ['ar', 'en'],
            'capabilities' => ['voice_search', 'pricing_calculation', 'licensing_compliance', 'voice_twins_guidance', 'human_talent_booking', 'b2b_sales_routing'],
        ]);
    }

    public function signedUrl()
    {
        $agent = $this->agentId();
        $key = \App\Services\NewUi\Tts::elevenLabsKey();
        if (!$agent || !$key) return response()->json(['error' => 'لم يتم تكوين ELEVENLABS_AGENT_ID أو ELEVENLABS_API_KEY على الخادم'], 400);
        try {
            $r = Http::withHeaders(['xi-api-key' => $key])->timeout(20)->get('https://api.elevenlabs.io/v1/convai/conversation/get_signed_url', ['agent_id' => $agent]);
            if (!$r->successful()) return response()->json(['error' => 'تعذر توليد رابط محادثة معتمد من ElevenLabs'], 502);
            return response()->json(['signedUrl' => $r->json('signed_url')]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'خطأ في الاتصال بمزود الخدمة الصوتية'], 500);
        }
    }

    public function chat(Request $r)
    {
        $message = trim((string) $r->input('message', ''));
        if ($message === '') return response()->json(['error' => 'الرسالة مطلوبة'], 400);
        if (mb_strlen($message) > 1000) return response()->json(['error' => 'الرسالة طويلة، اختصرها إلى 1000 حرف'], 400);
        $key = (string) env('GEMINI_API_KEY', '');
        if (!$key || $key === 'MY_GEMINI_API_KEY') {
            return response()->json(['reply' => 'مرحباً بك في قيمة فويس. تصفح مكتبة الأصوات من /ar/voices أو اكتب لنا عبر صفحة تواصل معنا وسنساعدك في اختيار الصوت المناسب.', 'provider' => 'static']);
        }
        try {
            $r2 = Http::timeout(30)->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $key, [
                'contents' => [['role' => 'user', 'parts' => [['text' => "أنت مساعد منصة قيمة فويس للتعليق الصوتي العربي. أجب باختصار وبالعربية.\n\n" . $message]]]],
            ]);
            $text = $r2->json('candidates.0.content.parts.0.text') ?: 'تعذر الرد الآن.';
            return response()->json(['reply' => $text, 'provider' => 'gemini']);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'تعذر الاتصال بالمساعد'], 502);
        }
    }
}
