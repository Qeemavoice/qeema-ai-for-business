<?php

namespace App\QeemaChat\Otp;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * توثيق رقم الواتساب برمز من 4 أرقام.
 * driver=log: الرمز يُكتب في سجل Laravel (للتجربة فقط)
 * driver=webhook: يُرسل {phone, code, message} لعنوان يتولى إرساله بالواتساب
 */
class OtpService
{
    public static function normalizePhone(string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', self::latinDigits($phone));
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        return (strlen($digits) >= 9 && strlen($digits) <= 15) ? '+' . $digits : null;
    }

    /** يحوّل الأرقام العربية (٠-٩) والفارسية (۰-۹) إلى أرقام لاتينية */
    public static function latinDigits(string $s): string
    {
        $map = [];
        foreach (['٠١٢٣٤٥٦٧٨٩', '۰۱۲۳۴۵۶۷۸۹'] as $set) {
            foreach (mb_str_split($set) as $i => $ch) {
                $map[$ch] = (string) $i;
            }
        }

        return strtr($s, $map);
    }

    /** @return array{lead: object, verified: bool} */
    public function start(string $phone, ?string $name, ?string $email, string $deviceId, string $ip): array
    {
        $cfg = config('qeema_chat.otp');
        $lead = DB::table('qv_chat_leads')->where('phone', $phone)->first();

        $data = array_filter([
            'name' => $name ? mb_substr($name, 0, 120) : null,
            'email' => $email ? mb_substr($email, 0, 190) : null,
            'device_id' => $deviceId,
            'ip' => $ip,
        ]) + ['updated_at' => now()];

        if (!$lead) {
            $id = DB::table('qv_chat_leads')->insertGetId($data + ['phone' => $phone, 'created_at' => now()]);
        } else {
            $id = $lead->id;
            DB::table('qv_chat_leads')->where('id', $id)->update($data);
        }

        $lead = DB::table('qv_chat_leads')->where('id', $id)->first();

        // رقم موثّق سابقًا أو التوثيق معطّل: لا حاجة لرمز
        if ($lead->verified_at || !$cfg['enabled']) {
            if (!$lead->verified_at) {
                DB::table('qv_chat_leads')->where('id', $id)->update(['verified_at' => now()]);
                $lead->verified_at = now();
            }

            return ['lead' => $lead, 'verified' => true];
        }

        $code = (string) random_int(1000, 9999);
        DB::table('qv_chat_leads')->where('id', $id)->update([
            'otp_hash' => Hash::make($code),
            'otp_expires_at' => now()->addMinutes($cfg['ttl_minutes']),
            'otp_attempts' => 0,
        ]);

        $this->deliver($phone, $code, $cfg);

        return ['lead' => $lead, 'verified' => false];
    }

    public function verify(string $phone, string $code): ?object
    {
        $cfg = config('qeema_chat.otp');
        $lead = DB::table('qv_chat_leads')->where('phone', $phone)->first();
        if (!$lead) {
            return null;
        }
        if ($lead->verified_at) {
            return $lead;
        }
        if (!$lead->otp_hash || now()->greaterThan($lead->otp_expires_at) || $lead->otp_attempts >= $cfg['max_attempts']) {
            return null;
        }

        $code = self::latinDigits(trim($code));
        if (!Hash::check($code, $lead->otp_hash)) {
            DB::table('qv_chat_leads')->where('id', $lead->id)->increment('otp_attempts');

            return null;
        }

        DB::table('qv_chat_leads')->where('id', $lead->id)->update([
            'verified_at' => now(),
            'otp_hash' => null,
            'otp_expires_at' => null,
            'updated_at' => now(),
        ]);

        return DB::table('qv_chat_leads')->where('id', $lead->id)->first();
    }

    private function deliver(string $phone, string $code, array $cfg): void
    {
        $message = "رمز التحقق من قيمة فويس: {$code}\nصالح لمدة {$cfg['ttl_minutes']} دقائق.";

        if ($cfg['driver'] === 'webhook' && !empty($cfg['webhook_url'])) {
            Http::timeout(10)->post($cfg['webhook_url'], ['phone' => $phone, 'code' => $code, 'message' => $message]);

            return;
        }

        Log::info("qv-chat OTP for {$phone}: {$code}");
    }
}
