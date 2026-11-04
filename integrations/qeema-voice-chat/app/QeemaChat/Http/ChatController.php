<?php

namespace App\QeemaChat\Http;

use App\QeemaChat\ChatAgent;
use App\QeemaChat\Llm\LlmException;
use App\QeemaChat\Llm\LlmProvider;
use App\QeemaChat\Notify\TeamNotifier;
use App\QeemaChat\Otp\OtpService;
use App\QeemaChat\Tools\LaravelToolExecutor;
use App\QeemaChat\Voice\ElevenLabsClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    // نص أطول من هذا يُعامل كسيناريو ويُحفظ
    private const SCRIPT_MIN_CHARS = 180;

    public function message(Request $request, LlmProvider $llm, ElevenLabsClient $voice, TeamNotifier $notifier): JsonResponse
    {
        $data = $request->validate([
            'conversation_id' => ['nullable', 'uuid'],
            'device_id' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9\-_]+$/'],
            'text' => ['required', 'string', 'max:6000'],
        ]);

        $conversation = $this->loadOrCreateConversation($data['conversation_id'] ?? null, $data['device_id'], $request->ip());

        $limit = config('qeema_chat.limits.messages_per_conversation');
        if ($conversation->message_count >= $limit) {
            return response()->json([
                'conversation_id' => $conversation->id,
                'reply' => 'وصلت هذه المحادثة إلى حدها الأقصى. يمكنك بدء محادثة جديدة من زر التحديث أعلى الشات.',
                'quick_replies' => ['محادثة جديدة'],
                'ui' => [],
            ]);
        }

        $text = trim($data['text']);
        if (mb_strlen($text) >= self::SCRIPT_MIN_CHARS) {
            DB::table('qv_chat_conversations')->where('id', $conversation->id)->update(['script' => $text]);
            $conversation->script = $text;
        }

        $lead = $conversation->lead_id ? DB::table('qv_chat_leads')->where('id', $conversation->lead_id)->first() : null;
        $executor = new LaravelToolExecutor($conversation, $lead, $data['device_id'], (string) $request->ip(), $voice, $notifier);

        $history = json_decode((string) $conversation->history, true) ?: [];

        try {
            $out = (new ChatAgent($llm))->respond(ChatAgent::trimHistory($history), $text, $executor);
        } catch (LlmException $e) {
            Log::error('qv-chat LLM: ' . $e->getMessage());

            return response()->json([
                'conversation_id' => $conversation->id,
                'reply' => 'عذرًا، حدث خلل مؤقت. يرجى إعادة إرسال رسالتك بعد لحظات.',
                'quick_replies' => [],
                'ui' => [],
                'error' => true,
            ], 503);
        }

        DB::table('qv_chat_conversations')->where('id', $conversation->id)->update([
            'history' => json_encode(ChatAgent::trimHistory($out['history'], 60), JSON_UNESCAPED_UNICODE),
            'message_count' => DB::raw('message_count + 1'),
            'updated_at' => now(),
        ]);

        // نموذج تأكيد الرقم يظهر وحده بلا نص قبله
        $hasLeadForm = (bool) array_filter($out['ui'], fn ($u) => ($u['type'] ?? '') === 'lead_form');

        return response()->json([
            'conversation_id' => $conversation->id,
            'reply' => $hasLeadForm ? '' : $out['reply'],
            'quick_replies' => $hasLeadForm ? [] : $out['quick_replies'],
            'ui' => $out['ui'],
        ]);
    }

    public function leadStart(Request $request, OtpService $otp): JsonResponse
    {
        $data = $request->validate([
            'conversation_id' => ['required', 'uuid'],
            'device_id' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9\-_]+$/'],
            'phone' => ['required', 'string', 'max:30'],
            'name' => ['nullable', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:190'],
        ]);

        $conversation = $this->ownedConversation($data['conversation_id'], $data['device_id']);
        $phone = OtpService::normalizePhone($data['phone']);
        if (!$conversation || !$phone) {
            return response()->json(['status' => 'invalid', 'message' => 'الرقم غير صحيح. اكتبه مع رمز الدولة.'], 422);
        }

        $res = $otp->start($phone, $data['name'] ?? null, $data['email'] ?? null, $data['device_id'], (string) $request->ip());

        if ($res['verified']) {
            DB::table('qv_chat_conversations')->where('id', $conversation->id)->update(['lead_id' => $res['lead']->id]);

            return response()->json(['status' => 'verified']);
        }

        return response()->json(['status' => 'code_sent', 'phone' => $phone]);
    }

    public function leadVerify(Request $request, OtpService $otp): JsonResponse
    {
        $data = $request->validate([
            'conversation_id' => ['required', 'uuid'],
            'device_id' => ['required', 'string', 'max:64'],
            'phone' => ['required', 'string', 'max:30'],
            'code' => ['required', 'string', 'max:8'],
        ]);

        $conversation = $this->ownedConversation($data['conversation_id'], $data['device_id']);
        $phone = OtpService::normalizePhone($data['phone']);
        $lead = ($conversation && $phone) ? $otp->verify($phone, $data['code']) : null;

        if (!$lead) {
            return response()->json(['status' => 'invalid', 'message' => 'الرمز غير صحيح أو انتهت صلاحيته.'], 422);
        }

        DB::table('qv_chat_conversations')->where('id', $conversation->id)->update(['lead_id' => $lead->id]);

        return response()->json(['status' => 'verified']);
    }

    /** تشغيل المعاينة: رابط موقّع ومؤقت، بدون تحميل وبدون تخزين في المتصفح */
    public function preview(string $id)
    {
        $row = DB::table('qv_chat_previews')->where('id', $id)->first();
        if (!$row) {
            abort(404);
        }

        $disk = Storage::disk(config('qeema_chat.storage_disk'));
        if (!$disk->exists($row->file_path)) {
            abort(404);
        }

        return response($disk->get($row->file_path), 200, [
            'Content-Type' => 'audio/mpeg',
            'Content-Disposition' => 'inline',
            'Cache-Control' => 'no-store, private',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function loadOrCreateConversation(?string $id, string $deviceId, ?string $ip): object
    {
        if ($id) {
            $existing = $this->ownedConversation($id, $deviceId);
            if ($existing) {
                return $existing;
            }
        }

        $newId = (string) Str::uuid();
        DB::table('qv_chat_conversations')->insert([
            'id' => $newId,
            'device_id' => $deviceId,
            'ip' => $ip,
            'history' => '[]',
            'status' => 'open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // إذا كان لهذا الجهاز رقم موثّق سابقًا نربطه تلقائيًا
        $lead = DB::table('qv_chat_leads')->where('device_id', $deviceId)->whereNotNull('verified_at')->latest('updated_at')->first();
        if ($lead) {
            DB::table('qv_chat_conversations')->where('id', $newId)->update(['lead_id' => $lead->id]);
        }

        return DB::table('qv_chat_conversations')->where('id', $newId)->first();
    }

    private function ownedConversation(string $id, string $deviceId): ?object
    {
        return DB::table('qv_chat_conversations')->where('id', $id)->where('device_id', $deviceId)->first();
    }
}
