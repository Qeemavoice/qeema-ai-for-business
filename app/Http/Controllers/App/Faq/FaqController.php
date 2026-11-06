<?php


namespace App\Http\Controllers\App\Faq;


use App\Http\Controllers\App\CoreController;
use App\Models\Banner;
use App\Models\Faq;

class FaqController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'faqs';
    }

    public function index()
    {
        $pageTitle = trans_app('faqs');
        meta_data($pageTitle, null, [
            '' => $pageTitle
        ]);
        $banner = get_banner(Banner::$FAQs);

        $faqs = Faq::getFaqs();
        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle','faqs','banner')
        );
    }
}
