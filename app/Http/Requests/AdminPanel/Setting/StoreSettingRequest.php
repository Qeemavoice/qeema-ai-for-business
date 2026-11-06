<?php


namespace App\Http\Requests\AdminPanel\Setting;


use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;

class StoreSettingRequest extends FormRequest
{
    private $rules = [];

    public function authorize()
    {
        return true;
    }


    public function rules()
    {
        switch ($this->key) {
            case Setting::GENERAL_SETTING_TAB :
                $this->rulesGeneralTab();
                break;

            case Setting::GENERAL_SETTING_LOGO_TAB :
                $this->rulesGeneralLogoTab();
                break;

            case Setting::GENERAL_SETTING_SOCIAL_MEDIA_LINKS_TAB :
                $this->rulesGeneralSocialMediaLinksTab();
                break;

            case Setting::GENERAL_CONTACT_US_TAB :
                $this->rulesGeneralContactUsTab();
                break;

            case Setting::GENERAL_FOOTER_TAB :
                $this->rulesGeneralFooterTab();
                break;

            case Setting::HOME_PAGE_WELCOME_SECTION :
                $this->rulesHomePageWelcomeSection();
                break;

            case Setting::PAGE_VOICES :
                $this->rulesVoicesPage();
                break;

            case Setting::PAGE_COMMISSIONS :
                $this->rulesCommissions();
                break;
        }

        return $this->rules;
    }

    public function attributes()
    {
        $attributes = [];

        foreach (languages() as $key => $value) {
            $attributes['value.title.' . $key] = trans_admin('title');
            $attributes['value.short_description.' . $key] = trans_admin('title');
        }
        $attributes['value.video_url'] = trans_admin('video_url');
        return $attributes;
    }

    private function rulesGeneralTab()
    {
        foreach (languages() as $key => $value) {
            $this->rules['website_name.' . $key] = ['required', 'string'];
        }
    }

    private function rulesGeneralLogoTab()
    {
        $this->rules['favicon'] = ['nullable', 'string'];
        $this->rules['logo'] = ['nullable', 'string'];
    }

    private function rulesGeneralSocialMediaLinksTab()
    {
        $this->rules['facebook'] = ['nullable', 'url'];
        $this->rules['youtube'] = ['nullable', 'url'];
        $this->rules['tiktok'] = ['nullable', 'url'];
        $this->rules['instagram'] = ['nullable', 'url'];
        $this->rules['whatsapp'] = ['nullable'];
    }


    private function rulesGeneralContactUsTab()
    {
        $this->rules['mobile_1'] = ['nullable', 'string'];
        $this->rules['mobile_2'] = ['nullable', 'string'];
        $this->rules['email'] = ['nullable', 'email'];
    }

    private function rulesGeneralFooterTab()
    {
        foreach (languages() as $key => $value) {
            $this->rules['footer_about_site.' . $key] = ['required', 'string'];
        }
    }

    private function rulesHomePageWelcomeSection()
    {
        foreach (languages() as $key => $value) {
            $this->rules['value.title.' . $key] = ['required', 'string'];
            $this->rules['value.short_description.' . $key] = ['required', 'string'];
        }
        $this->rules['value.video_url'] = ['required', 'url'];
    }

    private function rulesVoicesPage()
    {

        $this->rules['value.background'] = ['nullable', 'string'];
    }

    private function rulesCommissions()
    {
        $this->rules['commissions.stripe'] = ['required', 'numeric'];
        $this->rules['commissions.paypal'] = ['required', 'numeric'];
        $this->rules['commissions.platform'] = ['required', 'numeric'];

    }

}
