<?php

namespace App\QeemaChat\Notify;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * يرسل الطلبات الجديدة وطلبات الدعم للفريق: بريد + Webhook (وكيل واتساب، n8n، Zapier...).
 * فشل الإشعار لا يوقف المحادثة؛ الطلب محفوظ في قاعدة البيانات في كل الأحوال.
 */
class TeamNotifier
{
    public function send(string $title, array $fields): void
    {
        $cfg = config('qeema_chat.notify');

        $lines = [];
        foreach ($fields as $k => $v) {
            $lines[] = $k . ': ' . (is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE));
        }
        $body = $title . "\n\n" . implode("\n", $lines);

        if (!empty($cfg['team_email'])) {
            try {
                Mail::raw($body, fn ($m) => $m->to($cfg['team_email'])->subject('[شات قيمة] ' . $title));
            } catch (\Throwable $e) {
                Log::warning('qv-chat mail failed: ' . $e->getMessage());
            }
        }

        if (!empty($cfg['webhook_url'])) {
            try {
                Http::timeout(10)->post($cfg['webhook_url'], ['title' => $title, 'fields' => $fields, 'text' => $body]);
            } catch (\Throwable $e) {
                Log::warning('qv-chat webhook failed: ' . $e->getMessage());
            }
        }
    }
}
