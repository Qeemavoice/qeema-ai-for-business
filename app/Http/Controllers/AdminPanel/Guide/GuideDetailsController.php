<?php


namespace App\Http\Controllers\AdminPanel\Guide;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Guide;

class GuideDetailsController extends CoreController
{
    public function __construct(Guide $guide)
    {
        $this->dirView = 'guides';
        $this->asRoute = 'guide';
        $this->route = 'guides';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($guide);
    }

    public function index($id)
    {
        $pageTitle = trans_admin('details');

        $guide = $this->model::findOrFail($id);


        meta_data($pageTitle, $pageTitle, [
            $this->routeUrl => trans_admin('guides'),
            '' => $guide->name
        ]);


        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details.index',
            compact('pageTitle', 'guide')
        );
    }
}
