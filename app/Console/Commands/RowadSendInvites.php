<?php

namespace App\Console\Commands;

use App\Models\Invite;
use App\Services\NewUi\Mailer;
use App\Services\RowadService;
use Illuminate\Console\Command;

/** php artisan rowad:send-invites [--id=]: e-mails the «روّاد قيمة» invites not sent yet and marks them «sent». */
class RowadSendInvites extends Command
{
    protected $signature = 'rowad:send-invites {--id= : one invite only (resend)}';
    protected $description = '«روّاد قيمة»: sends the invite e-mails';

    public function handle()
    {
        $q = Invite::query()->whereNotNull('email');
        $this->option('id') ? $q->whereKey((int) $this->option('id')) : $q->where('status', Invite::CREATED);
        $sent = 0; $failed = 0;
        foreach ($q->get() as $invite) {
            if (!$invite->isValid()) continue;
            self::sendOne($invite) ? $sent++ : $failed++;
        }
        $this->info("أُرسلت: {$sent} | تعذّر الإرسال: {$failed}");
        return 0;
    }

    public static function sendOne(Invite $invite): bool
    {
        $name = $invite->name ?: 'عميلنا العزيز';
        $chars = number_format((int) config('rowad.free_tts_chars'));
        $until = $invite->expires_at->copy()->timezone(config('rowad.timezone'))->format('Y/m/d');
        $text = "أهلاً {$name}،\n\n"
            . "شكراً لثقتك بقيمة فويس في مشاريعك السابقة. ندعوك لتكون من «روّاد قيمة»:\n"
            . "- وصول مبكر لاستوديو TTS والرصيد والباقات قبل إطلاقها للجميع\n"
            . "- {$chars} حرف TTS هدية\n"
            . "- سعر روّاد قيمة عند الاشتراك أو الشحن\n\n"
            . "فعّل دعوتك من هذا الرابط الخاص بك (صالح حتى {$until}):\n"
            . RowadService::link($invite->code, 'email') . "\n\n"
            . "فريق قيمة فويس";
        if (!Mailer::trySend($invite->email, 'دعوتك الخاصة إلى روّاد قيمة', $text)) return false;
        $invite->update(['status' => in_array($invite->status, [Invite::CREATED], true) ? Invite::SENT : $invite->status, 'sent_at' => now()]);
        return true;
    }
}
