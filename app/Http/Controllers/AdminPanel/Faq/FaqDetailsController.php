<?php


namespace App\Http\Controllers\AdminPanel\Faq;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Language;

class FaqDetailsController extends CoreController
{

    public function __construct(Language $language)
    {
        $this->dirView = 'faqs';
        $this->asRoute = 'faq';
        $this->route = 'faqs';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($language);
    }

    public function index()
    {
        $pageTitle = trans_admin('faqs');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details', compact('pageTitle', 'asRoute'));
    }

}
