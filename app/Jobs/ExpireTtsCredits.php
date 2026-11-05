<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\NewUi\Accounts;
use App\Services\NewUi\Mailer;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\DB;

/**
 * Daily (app/Console/Kernel.php): closes lapsed TTS credit batches with an «expire» entry and e-mails a reminder
 * reminder_days_before days before a batch expires to whoever still has part of it.
 */
class ExpireTtsCredits implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function handle(): void
    {
        Accounts::expireCredits();
        $this->remind();
    }

    private function remind(): void
    {
        $limit = now()->addDays((int) config('rowad.reminder_days_before', 7));
        $batches = DB::table('qv_credit_transactions')->whereNotNull('expires_at')->where('expires_at', '>', now())
            ->where('expires_at', '<=', $limit)->where('remaining', '>', 0)->whereNull('reminded_at')->get();
        foreach ($batches as $b) {
            $u = User::find($b->user_id);
            if (!$u || !$u->email) continue;
            $day = Carbon::parse($b->expires_at)->timezone(config('rowad.timezone'))->format('Y/m/d');
            $text = "أهلاً،\n\nتبقّى في رصيدك " . number_format((int) $b->remaining) . " حرف TTS ينتهي بتاريخ {$day}.\n"
                . "استخدمه قبل انتهائه من استوديو TTS:\n" . rtrim((string) config('rowad.site_url'), '/') . "/ar/text-to-speech\n\nفريق قيمة فويس";
            if (Mailer::trySend($u->email, 'تذكير: رصيدك المجاني ينتهي قريباً', $text)) {
                DB::table('qv_credit_transactions')->where('id', $b->id)->update(['reminded_at' => now()]);
            }
        }
    }
}
