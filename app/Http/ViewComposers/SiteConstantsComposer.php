<?php


namespace App\Http\ViewComposers;

use App\Models\Category;
use App\Models\Country;
use App\Models\Gender;
use App\Models\WorkField;
use Illuminate\Contracts\View\View;


class SiteConstantsComposer
{
    protected $data;

    public function __construct()
    {
        $lang = get_locale();


        $favicon = getSetting('favicon', true);
        //$alt_favicon = getSetting('alt_favicon')->{$lang};

        $header_logo = getSetting('header_logo', true);
        $alt_header_logo = getSetting('alt_header_logo',true);

        $alt_header_logo = isset($alt_header_logo) ? $alt_header_logo->{$lang} : null;

        $footer_logo = $header_logo;
        $footer_about_site = getSetting('footer_about_site',true);
        $footerAboutSite = isset($footer_about_site) ? $footer_about_site->{$lang}  : null;

        $facebook = getSetting('facebook');
        $twitter = getSetting('twitter');
        $youtube = getSetting('youtube');
        $instagram = getSetting('instagram');
        $linkedin = getSetting('linkedin');
        $email = getSetting('email');
        $whatsapp = getSetting('whatsapp');

        $categories = Category::categories();
        $workFields = WorkField::getAll();

        $genders = Gender::getGenders();
        $countries = Country::getCountries();

        $this->data = [
            'favicon' => $favicon,
            //'alt_favicon' => $alt_favicon,
            'header_logo' => $header_logo,
            'alt_header_logo' => $alt_header_logo,

            'whatsapp' => $whatsapp,
            'email' => $email,
            'footer_logo' => $footer_logo,
            'footer_about_site' => $footerAboutSite,
            'facebook' => $facebook,
            'twitter' => $twitter,
            'youtube' => $youtube,
            'instagram' => $instagram,
            'linkedin' => $linkedin,
            'categories' => $categories,
            'genders' => $genders,
            'workFields' => $workFields,
            'countries' => $countries,
        ];
    }


    public function compose(View $view)
    {
        $view->with('data', $this->data);
    }
}
