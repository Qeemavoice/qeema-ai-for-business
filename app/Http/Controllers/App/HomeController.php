<?php


namespace App\Http\Controllers\App;

use App\Http\Requests\App\DownloadFile\StoreDownloadFileRequest;
use App\Models\Customer;
use App\Models\Faq;
use App\Models\MailingList;
use App\Models\Partner;
use App\Models\PaymentMethod;
use App\Models\Setting;
use App\Models\Voice;
use App\Models\Work;
use Illuminate\Support\Facades\Auth;

class HomeController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'home';
    }

    public function index()
    {
        meta_data(trans_app('qeemavoice_site'));

        $homePageWelcomeSection = getSetting(Setting::HOME_PAGE_WELCOME_SECTION, true);
        $homePageModalSection = getSetting(Setting::HOME_PAGE_MODAL_SECTION, true);

        $ourWorks = Work::getWorks(6);
        $partners = Partner::getPartners(2);
        $customers = Customer::getCustomers(8);


        $voices = [];
        $voiceSetting = getSetting(Setting::HOME_PAGE_VOICES_SECTION, true);

        if ($voiceSetting) {
            $voices = $voiceSetting->voices_ids;
            $titleVoiceSetting = isset($voiceSetting->title->{get_locale()}) ? $voiceSetting->title->{get_locale()} : '';
            $subTitleVoiceSetting = isset($voiceSetting->sub_title->{get_locale()}) ? $voiceSetting->sub_title->{get_locale()} : '';
        } else {
            $titleVoiceSetting = '';
            $subTitleVoiceSetting = '';
        }


        $faqs = [];
        $faqsIds = getSetting(Setting::HOME_PAGE_FAQS_SECTION, true);

        if (isset($faqsIds)) {
            $faqs = $faqsIds;
        }


        $titlePartnersSection = getSetting(Setting::HOME_PAGE_PARTNERS_SECTION, true);

        $bookingStepsSetting = getSetting(Setting::HOME_PAGE_BOOKING_STEPS_SECTION, true);

        if ($bookingStepsSetting) {
            $titleBookingStepsSetting = isset($bookingStepsSetting->title->{get_locale()}) ? $bookingStepsSetting->title->{get_locale()} : '';
            $subTitleBookingStepsSetting = isset($bookingStepsSetting->sub_title->{get_locale()}) ? $bookingStepsSetting->sub_title->{get_locale()} : '';
        } else {
            $titleBookingStepsSetting = '';
            $subTitleBookingStepsSetting = '';
        }

        $categoriesSetting = getSetting(Setting::HOME_PAGE_CATEGORIES_SECTION, true);
        if ($categoriesSetting) {
            $titleCategoriesSetting = isset($categoriesSetting->title->{get_locale()}) ? $categoriesSetting->title->{get_locale()} : '';
            $subTitleCategoriesSetting = isset($categoriesSetting->sub_title->{get_locale()}) ? $categoriesSetting->sub_title->{get_locale()} : '';
        } else {
            $titleCategoriesSetting = '';
            $subTitleCategoriesSetting = '';
        }

        $worksSetting = getSetting(Setting::HOME_PAGE_WORKS_SECTION, true);
        if ($worksSetting) {
            $titleWorksSetting = isset($worksSetting->title->{get_locale()}) ? $worksSetting->title->{get_locale()} : '';
            $subTitleWorksSetting = isset($worksSetting->sub_title->{get_locale()}) ? $worksSetting->sub_title->{get_locale()} : '';
        } else {
            $titleWorksSetting = '';
            $subTitleWorksSetting = '';
        }

        $clientsSetting = getSetting(Setting::HOME_PAGE_CLIENTS_SECTION, true);
        if ($clientsSetting) {
            $titleClientsSetting = isset($clientsSetting->title->{get_locale()}) ? $clientsSetting->title->{get_locale()} : '';
            $subTitleClientsSetting = isset($clientsSetting->sub_title->{get_locale()}) ? $clientsSetting->sub_title->{get_locale()} : '';
        } else {
            $titleClientsSetting = '';
            $subTitleClientsSetting = '';
        }


        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('homePageWelcomeSection',
                'homePageModalSection',
                'ourWorks',
                'partners',
                'customers',
                'faqs',
                'voices',
                'titleVoiceSetting',
                'subTitleVoiceSetting',
                'titlePartnersSection',
                'titleBookingStepsSetting',
                'subTitleBookingStepsSetting',
                'titleWorksSetting',
                'subTitleWorksSetting',
                'titleCategoriesSetting',
                'subTitleCategoriesSetting',
                'titleClientsSetting',
                'subTitleClientsSetting',
            )
        );
    }

    public function downloadFile(StoreDownloadFileRequest $request)
    {
        $storeEmail = MailingList::create(['email' => $request->email]);
        $homePageModalSection = getSetting('home_page_modal_section', true);

        if (!$storeEmail)
            return $this->successResponse(false);


        $file = public_path(DIR_UPLOAD . '/' . Setting::DIR_HOME_PAGE_UPLOADS . '/' . $homePageModalSection->file->file_link);
        $fileName = $homePageModalSection->file->name;
        $headers = ['Content-Type: application/pdf'];

        return response()->download($file, $fileName, $headers);
    }
}
