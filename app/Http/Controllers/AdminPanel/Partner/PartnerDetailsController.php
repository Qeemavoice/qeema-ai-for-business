<?php


namespace App\Http\Controllers\AdminPanel\Partner;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Partner;

class PartnerDetailsController extends CoreController
{

    public function __construct(Partner $partner)
    {
        $this->dirView = 'partners';
        $this->asRoute = 'partner';
        $this->route = 'partners';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($partner);
    }

    public function index()
    {
        $pageTitle = trans_admin('partners');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details', compact('pageTitle', 'asRoute'));
    }

}
