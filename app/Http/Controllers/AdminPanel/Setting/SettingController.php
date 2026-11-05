<?php


namespace App\Http\Controllers\AdminPanel\Setting;

use App\Http\Requests\AdminPanel\Setting\StoreSettingRequest;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Setting;

class SettingController extends CoreController
{
    public function __construct(Setting $setting)
    {
        $this->dirView = 'settings';
        $this->asRoute = 'setting';
        $this->route = 'settings';
        $this->routeUrl = route_admin($this->asRoute . '.index');

//        if (request('page')) {
//            if (request('page') == PAGE_GENERAL) {
//                $this->middleware('permission:show-general-settings')->only('index');
//            } elseif (request('page') == PAGE_HOME) {
//                $this->middleware('permission:show-home-page')->only('index');
//            } elseif (request('page') == PAGE_ABOUT) {
//                $this->middleware('permission:show-about-page')->only('index');
//            } elseif (request('page') == PAGE_SERVICES) {
//                $this->middleware('permission:show-services-page')->only('index');
//            }
//            $this->routeUrl = route_admin($this->asRoute . '.index', ['page' => request('page')]);
//        }

        parent::__construct($setting);
    }

    public function index($page)
    {
        $pageTitle = $this->getBasenamePage($page);

        meta_data($pageTitle, $pageTitle, [
            '#' => trans_admin('settings'),
            '' => $pageTitle
        ]);

        $settings = getSettings();

        $asRoute = $this->asRoute;
        $paymentMethods = getPaymentMethods();
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.' . $page . '.index',
            compact('pageTitle', 'asRoute', 'settings', 'page', 'paymentMethods')
        );
    }

    public function store(StoreSettingRequest $request)
    {
        $settings = [];
        $currentSettings = getSettings();
        $oldSettings = [];

        $requestArray = $request->toArray();

        if (in_array($request->key, [
                Setting::HOME_PAGE_WELCOME_SECTION,
                Setting::HOME_PAGE_VOICES_SECTION,
                Setting::HOME_PAGE_FAQS_SECTION,
                Setting::HOME_PAGE_CLIENTS_SECTION,
                Setting::HOME_PAGE_PARTNERS_SECTION,
                Setting::HOME_PAGE_MODAL_SECTION,
                Setting::HOME_PAGE_BOOKING_STEPS_SECTION,
                Setting::HOME_PAGE_CATEGORIES_SECTION,
                Setting::HOME_PAGE_WORKS_SECTION,
                Setting::VOICES_PAGE,
            ]
        )) {

            $value = $request->value;

            $save = $this->model->updateOrCreate([
                'key' => $request->key,
            ], [
                'key' => $request->key,
                'value' => json_encode($value),

            ]);
        } else {
            unset($requestArray['key']);

            foreach ($requestArray as $key => $value) {
                $currentKey = $currentSettings->where('key', $key);

                if (count($currentKey) > 0)
                    $oldSettings[] = $key;


                $settings[] = [
                    'key' => $key,
                    'value' => is_array($value) ? json_encode($value) : $value,
                ];
            }
            Setting::whereIn('key', $oldSettings)->delete();
            $save = Setting::insert($settings);
        }

        Cache::forget('settings');

        // the old «commissions» page edits the same platform rate as the new admin
        $platform = $request->input('commissions.platform');
        if (is_numeric($platform)) \App\Services\NewUi\Store::saveSettings(['platformCommissionPercent' => (float) $platform]);

        return $this->successResponse($save);
    }

    private function getBasenamePage($page)
    {
        switch ($page) {
            case PAGE_GENERAL:
                $page = trans_admin('general');
                break;
            case PAGE_CURRENCIES:
                $page = trans_admin('currencies');
                break;
            case PAGE_COMMISSIONS:
                $page = trans_admin('commissions');
                break;
            case PAGE_POLICIES:
                $page = trans_admin('policies');
                break;
            case PAGE_HOME:
                $page = trans_admin('home_page');
                break;

            case PAGE_PAYMENT_METHODS:
                $page = trans_admin('payment_methods');
                break;
            case PAGE_MAIL:
                $page = trans_admin('mail');
                break;
            case PAGE_MAINTENANCES:
                $page = trans_admin('maintenances_config');
                break;
        }

        return $page;
    }
}
