<?php


namespace App\Providers;


use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class MailConfigServiceProvider extends ServiceProvider
{
    public function boot()
    {

    }

    public function register()
    {
        if (Schema::hasTable('settings')) {

            $array = ['mail_host', 'mail_port', 'mail_from_address', 'mail_from_name', 'mail_encryption', 'mail_username', 'mail_password', 'mail_info'];

            $mail = DB::table('settings')->whereIn('key', $array)->get();

            $mailHost = $mail->where('key', 'mail_host')->first();
            $mailPort = $mail->where('key', 'mail_port')->first();
            $mailFromAddress = $mail->where('key', 'mail_from_address')->first();
            $mailFromName = $mail->where('key', 'mail_from_name')->first();
            $mailEncryption = $mail->where('key', 'mail_encryption')->first();
            $mailUsername = $mail->where('key', 'mail_username')->first();
            $mailPassword = $mail->where('key', 'mail_password')->first();
            $mailInfo = $mail->where('key', 'mail_info')->first();

            $oldConfig = config('mail');


            $config = [
                'driver' => 'smtp',
                'host' => isset($mailHost->value) ? $mailHost->value : (isset($oldConfig['mailers']['smtp']['host']) ? $oldConfig['mailers']['smtp']['host'] : null),
                'port' => isset($mailPort->value) ? $mailPort->value : (isset($oldConfig['mailers']['smtp']['port']) ? $oldConfig['mailers']['smtp']['port'] : null),
                'from' => [
                    'address' => isset($mailFromAddress->value) ? $mailFromAddress->value : (isset($oldConfig['from']['address']) ? $oldConfig['from']['address'] : null),
                    'name' => isset($mailFromName->value) ? $mailFromName->value : (isset($oldConfig['from']['name']) ? $oldConfig['from']['name'] : null),
                ],
                'encryption' => isset($mailEncryption->value) ? $mailEncryption->value : (isset($oldConfig['mailers']['smtp']['encryption']) ? $oldConfig['mailers']['smtp']['encryption'] : null),
                'username' => isset($mailUsername->value) ? $mailUsername->value : (isset($oldConfig['mailers']['smtp']['username']) ? $oldConfig['mailers']['smtp']['username'] : null),
                'password' => isset($mailPassword->value) ? $mailPassword->value : (isset($oldConfig['mailers']['smtp']['password']) ? $oldConfig['mailers']['smtp']['password'] : null),
                'sendmail' => '/usr/sbin/sendmail -bs',
                'pretend' => false,
                'emails' => [
                    'info' => isset($mailInfo->value) ? $mailInfo->value : (isset($oldConfig['emails']['info']) ? $oldConfig['emails']['info'] : null),
                ]
            ];

            Config::set('mail', $config);
        }
    }
}
