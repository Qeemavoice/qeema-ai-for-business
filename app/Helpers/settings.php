<?php

use App\Models\PaymentMethod;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;


define('PAGE_GENERAL', Setting::PAGE_GENERAL);
define('PAGE_CURRENCIES', Setting::PAGE_CURRENCIES);
define('PAGE_COMMISSIONS', Setting::PAGE_COMMISSIONS);
define('PAGE_HOME', Setting::PAGE_HOME);
define('PAGE_VOICES', Setting::PAGE_VOICES);
define('PAGE_PAYMENT_METHODS', Setting::PAGE_PAYMENT_METHODS);
define('PAGE_MAIL', Setting::PAGE_MAIL);
define('PAGE_MAINTENANCES', Setting::PAGE_MAINTENANCES);
define('PAGE_POLICIES', Setting::PAGE_POLICIES);


//if (!function_exists('getMenuItemsDashboard')) {
//    function getMenuItemsDashboard()
//    {
//        return [
//            ['id' => '','label' => '','asRoute' => '' ,'']
//        ];
//    }
//}

if (!function_exists('getSetting')) {
    function getSetting($key, $isValueDecoded = false)
    {
        if (!Schema::hasTable('settings'))
            return null;

        $setting = getSettings();

        if (is_array($key)) {
            $setting = $setting->whereIn('key', $key);
            return $setting;
        }

        $setting = $setting->where('key', $key)->first();

        return isset($setting) ? ($isValueDecoded ? $setting->value_decoded : $setting->value) : null;
    }
}

if (!function_exists('getSettings')) {
    function getSettings()
    {
        if (!Schema::hasTable('settings'))
            return null;

        return Setting::getSettings();
    }
}


if (!function_exists('admin_image_default')) {
    function admin_image_default()
    {
        return asset_admin('media/avatars/blank.png');
    }
}

if (!function_exists('user_app_image_default')) {
    function user_app_image_default()
    {
        return asset('media/avatar/blank.png');
    }
}


if (!function_exists('getLogo')) {
    function getLogo($key = 'header_logo')
    {
        $logo = collect(getSettings())->where('key', $key)->first();
        return isset($logo) ? $logo->value : logoHeaderApp();
    }
}

if (!function_exists('logoHeaderAdmin')) {
    function logoHeaderAdmin()
    {
        return asset('media/logo/logo.png');
    }
}
if (!function_exists('logoHeaderApp')) {
    function logoHeaderApp()
    {
        return asset('media/logo/logo.png');
    }
}
if (!function_exists('favicon')) {
    function favicon()
    {
        return asset('media/logo/favicon.png');
    }
}
if (!function_exists('defaultCurrency')) {

    function defaultCurrency()
    {

        return [
            'id' => \App\Models\Currency::SAUDI_RIYAL,
            'name' => get_locale() === 'en' ? 'Saudi Riyal' : 'الريال السعودي',
            'iso' => 'SAR',
            'symbol' => get_locale() === 'en' ? 'R.S' : 'ر. س',
        ];
    }
}

function symbolCurrency()
{
    return defaultCurrency()['symbol'];
}

if (!function_exists('getPaymentMethod')) {
    function getPaymentMethod($id)
    {
        return getPaymentMethods()->where('id', $id)->first();
    }
}

if (!function_exists('getPaymentMethods')) {
    function getPaymentMethods()
    {
        return PaymentMethod::getPaymentMethodsAll();
    }
}

if (!function_exists('getMailConfig')) {
    function getMailConfig()
    {
        $array = ['mail_driver', 'mail_host', 'mail_port', 'mail_from_address', 'mail_from_name', 'mail_encryption', 'mail_username', 'mail_password', 'mail_info'];

        $mail = DB::table('settings')->whereIn('key', $array)->get();

        $mailDriver = $mail->where('key', 'mail_driver')->first();
        $mailHost = $mail->where('key', 'mail_host')->first();
        $mailPort = $mail->where('key', 'mail_port')->first();
        $mailFromAddress = $mail->where('key', 'mail_from_address')->first();
        $mailFromName = $mail->where('key', 'mail_from_name')->first();
        $mailEncryption = $mail->where('key', 'mail_encryption')->first();
        $mailUsername = $mail->where('key', 'mail_username')->first();
        $mailPassword = $mail->where('key', 'mail_password')->first();
        $mailInfo = $mail->where('key', 'mail_info')->first();

        $oldConfig = config('mail');

        return [
            'driver' => isset($mailDriver->value) ? $mailDriver->value : (isset($oldConfig['mailers']['smtp']['transport']) ? $oldConfig['mailers']['smtp']['host'] : null),
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
    }
}
