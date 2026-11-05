<?php


namespace App\Http\Controllers\AdminPanel\Dialect;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Dialect;

class DialectDetailsController extends CoreController
{

    public function __construct(Dialect $dialect)
    {
        $this->dirView = 'dialects';
        $this->asRoute = 'dialect';
        $this->route = 'dialects';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($dialect);
    }

    public function index()
    {
        $pageTitle = trans_admin('dialects');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details', compact('pageTitle', 'asRoute'));
    }

}
