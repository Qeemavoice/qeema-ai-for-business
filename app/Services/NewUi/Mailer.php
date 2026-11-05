<?php

namespace App\Services\NewUi;

use Illuminate\Support\Facades\Mail;

/**
 * Plain-text mail for the new UI (verification codes, invitations, team invites).
 *
 * Order of preference:
 *  1. the SMTP server saved in the new admin «إعدادات SMTP» (qv_kv);
 *  2. MAIL_MAILER=log in .env (development / tests): messages go to storage/logs;
 *  3. the site's own mail setup: App\Providers\MailConfigServiceProvider loads the SMTP account of the
 *     old admin panel (settings table) as a legacy-style `mail.driver` config, which Laravel's MailManager
 *     uses as the default mailer. In that legacy mode Laravel ignores named mailers, so cases 1 and 2
 *     clear `mail.driver` for the request before using their own mailer.
 */
class Mailer
{
    public static function send(string $to, string $subject, string $text): void
    {
        $smtp = Store::integrations()['smtp'] ?? [];
        $name = null;
        $from = null;
        if (!empty($smtp['host'])) {
            config(['mail.driver' => null, 'mail.mailers.qv_smtp' => [
                'transport' => 'smtp', 'host' => $smtp['host'], 'port' => (int) ($smtp['port'] ?: 465),
                'encryption' => ($smtp['encryption'] ?? 'SSL') === 'none' ? null : strtolower($smtp['encryption'] ?? 'ssl'),
                'username' => $smtp['username'] ?: null, 'password' => $smtp['password'] ?: null, 'timeout' => 20, 'auth_mode' => null,
            ]]);
            $name = 'qv_smtp';
            if (!empty($smtp['fromAddress'])) $from = [$smtp['fromAddress'], $smtp['fromName'] ?: 'Qeema Voice'];
        } elseif (env('MAIL_MAILER') === 'log') {
            config(['mail.driver' => null, 'mail.mailers.qv_log' => ['transport' => 'log']]);
            $name = 'qv_log';
        }
        if (!$from) {
            $addr = config('mail.from.address') ?: (string) env('MAIL_FROM_ADDRESS', '');
            if ($addr) $from = [$addr, config('mail.from.name') ?: (string) env('MAIL_FROM_NAME', 'Qeema Voice')];
        }
        $pending = $name ? Mail::mailer($name) : Mail::mailer();
        $pending->raw($text, function ($m) use ($to, $subject, $from) {
            $m->to($to)->subject($subject);
            if ($from) $m->from($from[0], $from[1]);
        });
    }

    /** true when the message went out, false when mail is not configured or failed */
    public static function trySend(string $to, string $subject, string $text): bool
    {
        try { self::send($to, $subject, $text); return true; } catch (\Throwable $e) { report($e); return false; }
    }
}
