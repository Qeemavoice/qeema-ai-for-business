<?php

namespace App\Console\Commands;

use App\Models\Invite;
use App\Models\User;
use App\Services\NewUi\Accounts;
use App\Services\RowadService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * TEST ENVIRONMENTS ONLY: one demo account / invite per acceptance case of «روّاد قيمة».
 * Writes storage/app/rowad_demo_accounts.csv (case, email, password, link) — never printed to the console.
 * Accounts use @rowad-demo.test addresses; running again replaces them.
 */
class RowadSeedDemo extends Command
{
    protected $signature = 'rowad:seed-demo';
    protected $description = '«روّاد قيمة»: demo accounts for every acceptance case (test environments only)';

    private const DOMAIN = 'rowad-demo.test';

    public function handle()
    {
        if (app()->environment('production')) { $this->error('هذا الأمر لبيئة الاختبار فقط'); return 1; }

        // clean previous demo data
        $old = User::where('email', 'like', '%@' . self::DOMAIN)->pluck('id');
        DB::table('qv_credit_transactions')->whereIn('user_id', $old)->delete();
        DB::table('qv_client_accounts')->whereIn('user_id', $old)->delete();
        Invite::where('email', 'like', '%@' . self::DOMAIN)->orWhereIn('redeemed_by_user_id', $old)->delete();
        User::whereIn('id', $old)->forceDelete();

        $rows = [];
        $mk = function (string $slug, string $name) use (&$rows) {
            $pass = Str::random(14);
            $u = Accounts::createAccount($name, "{$slug}@" . self::DOMAIN, $pass, 'client');
            return [$u, $pass];
        };
        $invite = fn (?string $email, array $extra = []) => Invite::create(array_merge(['code' => RowadService::code(), 'email' => $email,
            'name' => $email ? explode('@', $email)[0] : null, 'campaign' => config('rowad.campaign'), 'status' => Invite::SENT,
            'sent_at' => now(), 'expires_at' => RowadService::at('invite_expires_at')], $extra));
        $link = fn (Invite $i) => RowadService::link($i->code, 'email');
        $page = fn (string $path) => rtrim((string) config('rowad.site_url'), '/') . $path;
        $fresh = ' (نافذة خاصة جديدة)';

        [$u, $p] = $mk('case1-member', 'حالة 1: مسجّل + كود صالح');
        $rows[] = ['1 / 3', 'سجّل الدخول من الصفحة الرئيسية ثم افتح الرابط، وافتحه مرة ثانية لاختبار عدم التكرار' . $fresh, $u->email, $p, $link($invite($u->email))];

        $i = $invite('case2-new@' . self::DOMAIN);
        $rows[] = ['2', 'افتح الرابط بدون دخول، اضغط «إنشاء حساب جديد» واختر كلمة سر 8 أحرف أو أكثر' . $fresh, $i->email, '(تختارها عند التسجيل)', $link($i)];

        [$a] = $mk('case4-owner', 'حالة 4: صاحب الدعوة');
        [$b, $pb] = $mk('case4-other', 'حالة 4: حساب آخر');
        $i = $invite($a->email);
        RowadService::redeem($a, $i);
        $rows[] = ['4', 'سجّل الدخول بهذا الحساب ثم افتح الرابط: «هذه الدعوة مستخدمة»' . $fresh, $b->email, $pb, $link($i)];

        $i = $invite('case5-expired@' . self::DOMAIN, ['expires_at' => now()->subDay()]);
        $rows[] = ['5', 'افتح الرابط: «انتهى الوصول المبكر»' . $fresh, $i->email, '-', $link($i)];

        [$u, $p] = $mk('case6-mismatch', 'حالة 6: بريد مختلف');
        $rows[] = ['6', 'سجّل الدخول بهذا الحساب ثم افتح الرابط (الدعوة لبريد آخر): تتفعّل ويظهر «إيميل مختلف» في الإدارة' . $fresh, $u->email, $p, $link($invite('someone-else@' . self::DOMAIN))];

        [$u, $p] = $mk('case7-regular', 'حالة 7: بدون وصول مبكر');
        $rows[] = ['7', 'افتح الرابط وسجّل الدخول: لا تظهر روابط TTS والأسعار، وصفحة TTS تحوّلك لقائمة الانتظار' . $fresh, $u->email, $p, $page('/ar/text-to-speech')];

        [$u, $p] = $mk('case8-rowad', 'حالة 8/9: رائد قيمة');
        RowadService::redeem($u, $invite($u->email));
        $rows[] = ['8 / 9', 'افتح الرابط وسجّل الدخول (رائد مفعّل): من «الباقة والفوترة» اشترك أو اشحن: 16$ بدل 20$ / هدية حروف' . $fresh, $u->email, $p, $page('/ar/account')];

        [$u, $p] = $mk('case10-expiry', 'حالة 10: رصيد منتهي');
        RowadService::redeem($u, $invite($u->email));
        DB::table('qv_credit_transactions')->where('idempotency_key', "early:{$u->id}")->update(['expires_at' => now()->subMinute(), 'created_at' => now()->subDays(31)]);
        (new \App\Jobs\ExpireTtsCredits)->handle();
        $rows[] = ['10', 'افتح الرابط وسجّل الدخول: الهدية انتهت (قيد expire مسجّل)، والرصيد الظاهر 5,000 هو رصيد التسجيل العادي فقط' . $fresh, $u->email, $p, $page('/ar/account')];

        $rows[] = ['11', 'غيّر آخر حرف في الرابط وافتحه أكثر من 30 مرة خلال ساعة: «محاولات كثيرة» (الحد على موقع التجربة 30، وعلى الموقع الحقيقي 10)', '-', '-', rtrim((string) config('rowad.site_url'), '/') . '/ar/early?code=WRONGCODE1'];

        $file = storage_path('app/rowad_demo_accounts.csv');
        $w = fopen($file, 'w');
        fwrite($w, "\xEF\xBB\xBF");
        fputcsv($w, ['case', 'what_to_do', 'email', 'password', 'link']);
        foreach ($rows as $r) fputcsv($w, $r);
        fclose($w);
        @chmod($file, 0640);

        // sample CSV of 3 clients for rowad:generate-invites
        $sample = storage_path('app/rowad_clients.csv');
        $s = fopen($sample, 'w');
        fputcsv($s, ['client_id', 'name', 'email', 'phone']);
        foreach (['csv-client1', 'csv-client2', 'csv-client3'] as $n => $slug) {
            [$u] = $mk($slug, 'عميل CSV ' . ($n + 1));
            fputcsv($s, [$n === 0 ? $u->id : '', 'عميل CSV ' . ($n + 1), $n === 0 ? '' : $u->email, '+96650000000' . ($n + 1)]);
        }
        fclose($s);

        $this->info('تم إنشاء الحسابات التجريبية: ' . $file);
        $this->info('ملف العملاء التجريبي (3 عملاء): ' . $sample);
        return 0;
    }
}
