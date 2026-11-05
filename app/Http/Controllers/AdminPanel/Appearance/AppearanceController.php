<?php


namespace App\Http\Controllers\AdminPanel\Appearance;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Setting;

class AppearanceController extends CoreController
{
    public function __construct(Setting $setting)
    {
        $this->dirView = 'appearance';
        $this->asRoute = 'appearance';
        $this->route = 'appearance';
        $this->routeUrl = route_admin($this->asRoute . '.index');

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

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.' . $page . '.index',
            compact('pageTitle', 'asRoute', 'settings')
        );
    }


    private function getBasenamePage($page)
    {

        switch ($page) {
            case PAGE_GENERAL:
                $page = trans_admin('general');
                break;
            case PAGE_HOME:
                $page = trans_admin('home_page');
                break;
            case PAGE_VOICES:
                $page = trans_admin('voices_page');
                break;
            default:
                $page = trans_admin('site');
                break;
        }

        return $page;
    }
}
