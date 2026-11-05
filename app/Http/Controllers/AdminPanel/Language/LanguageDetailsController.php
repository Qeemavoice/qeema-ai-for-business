<?php


namespace App\Http\Controllers\AdminPanel\Language;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Language;

class LanguageDetailsController extends CoreController
{

    public function __construct(Language $language)
    {
        $this->dirView = 'languages';
        $this->asRoute = 'language';
        $this->route = 'languages';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($language);
    }

    public function index()
    {
        $pageTitle = trans_admin('languages');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details', compact('pageTitle', 'asRoute'));
    }

}
