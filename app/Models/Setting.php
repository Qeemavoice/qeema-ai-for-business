<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    public $guarded = [];

    public const DIR_LOGOS_UPLOADS = 'logos';
    public const DIR_HOME_PAGE_UPLOADS = 'home';
    public const DIR_VOICES_PAGE_UPLOADS = 'voices_page';


    public const PAGE_GENERAL = 'general';
    public const PAGE_HOME = 'home-page';
    public const PAGE_CURRENCIES = 'currencies';
    public const PAGE_COMMISSIONS = 'commissions';
    public const PAGE_POLICIES = 'policies';
    public const PAGE_PAYMENT_METHODS = 'payment-methods';
    public const PAGE_MAIL = 'mail';
    public const PAGE_VOICES = 'voices-page';
    public const PAGE_MAINTENANCES = 'maintenances';

//
//
    public const GENERAL_SETTING_TAB = 'general_setting';
    public const GENERAL_SETTING_LOGO_TAB = 'general_setting_logo';
    public const GENERAL_SETTING_SOCIAL_MEDIA_LINKS_TAB = 'general_setting_social_media_links';
    public const GENERAL_CONTACT_US_TAB = 'general_contact_us';
    public const GENERAL_FOOTER_TAB = 'general_footer';


    public const GENERAL_SETTING_LOGO = 'logo';
    public const GENERAL_SETTING_HEADER_LOGO = 'header_logo';
    public const GENERAL_SETTING_FAVICON = 'favicon';

    public const HOME_PAGE_WELCOME_SECTION = 'home_page_welcome_section';
    public const HOME_PAGE_VOICES_SECTION = 'home_page_voices_section';
    public const HOME_PAGE_FAQS_SECTION = 'home_page_faqs_section';
    public const HOME_PAGE_MODAL_SECTION = 'home_page_modal_section';
    public const HOME_PAGE_CLIENTS_SECTION = 'home_page_clients_section';
    public const HOME_PAGE_PARTNERS_SECTION = 'home_page_partners_section';
    public const HOME_PAGE_BOOKING_STEPS_SECTION = 'home_page_booking_steps_section';
    public const HOME_PAGE_CATEGORIES_SECTION = 'home_page_categories_section';
    public const HOME_PAGE_WORKS_SECTION = 'home_page_works_section';
    public const VOICES_PAGE = 'voices_page';


    protected $appends = ['value_decoded'];

    public static function getFileUrl($file, $key)
    {
        $fileUrl = null;

//        switch ($key) {
//
//            case self::HOME_PAGE_SUCCESS_STORIES_SECTION:
//            case self::HOME_PAGE_ABOUT_SECTION:
//            case self::HOME_PAGE_WELCOME_SECTION:
//                $fileUrl = asset_upload(self::DIR_HOME_PAGE_UPLOADS . '/' . $file);
//                break;
//            case self::DIR_MEDIA_CENTER_PAGE_UPLOADS:
//                $fileUrl = asset_upload(self::DIR_MEDIA_CENTER_PAGE_UPLOADS . '/' . $file);
//                break;
//            default:
//                break;
//
//        }

        return $fileUrl;
    }

    public function getValueDecodedAttribute()
    {
        $value = '';

        if ($this->value) {

            switch ($this->key) {

                case self::HOME_PAGE_MODAL_SECTION:
                    $value = json_decode($this->value);
                    $value->file = add_properties_to_object_from_another($value->file, [
                        'name' => $value->file->file_link,
                        'url' => asset_upload(self::DIR_HOME_PAGE_UPLOADS . '/' . $value->file->file_link),
                    ]);
                    break;
                case self::HOME_PAGE_WELCOME_SECTION:
                    $value = json_decode($this->value);
                    $value->image = add_properties_to_object_from_another($value->image, [
                        'name' => $value->image->file_link,
                        'url' => asset_upload(self::DIR_HOME_PAGE_UPLOADS . '/' . $value->image->file_link),
                    ]);
                    break;
                case self::VOICES_PAGE:
                    $value = json_decode($this->value);
                    $value->background = add_properties_to_object_from_another($value->background, [
                        'name' => $value->background->file_link,
                        'url' => asset_upload(self::DIR_VOICES_PAGE_UPLOADS . '/' . $value->background->file_link),
                    ]);
                    break;
                case self::GENERAL_SETTING_FAVICON:
                    $faviconPath = public_path(DIR_UPLOAD . '/' . self::DIR_LOGOS_UPLOADS . '/' . $this->value);
                    $value = file_exists($faviconPath)
                        ? asset_upload(self::DIR_LOGOS_UPLOADS . '/' . $this->value)
                        : favicon();
                    break;
                case self::GENERAL_SETTING_HEADER_LOGO:
                case self::GENERAL_SETTING_LOGO:
                    $logoPath = public_path(DIR_UPLOAD . '/' . self::DIR_LOGOS_UPLOADS . '/' . $this->value);
                    $value = file_exists($logoPath)
                        ? asset_upload(self::DIR_LOGOS_UPLOADS . '/' . $this->value)
                        : logoHeaderApp();
                    break;
                case self::HOME_PAGE_VOICES_SECTION  :
                    $value = json_decode($this->value);
                    $value->voices_ids = Voice::whereIn('id', $value->voices_ids)->get();
                    break;
                case self::HOME_PAGE_BOOKING_STEPS_SECTION  :
                    $value = json_decode($this->value);
                    break;
                case self::HOME_PAGE_CATEGORIES_SECTION  :
                    $value = json_decode($this->value);
                    break;
                case self::HOME_PAGE_WORKS_SECTION  :
                    $value = json_decode($this->value);
                    break;
                case self::HOME_PAGE_FAQS_SECTION  :
                    $value = json_decode($this->value);
                    $value = Faq::whereIn('id', $value->faqs_ids)->get();
                    break;
                default:
                    $value = json_decode($this->value);
            }
        }

        return $value;
    }


    public static function getSettings()
    {
        return Cache::remember('settings', CACHE_TTL, function () {
            return self::select('key', 'value')->get();
        });
    }


}
