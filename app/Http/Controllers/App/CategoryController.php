<?php


namespace App\Http\Controllers\App;


use App\Models\Banner;
use App\Models\Category;
use App\Models\Faq;

class CategoryController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'categories';
    }

    public function index()
    {
        $pageTitle = trans_app('categories');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $categories = Category::categories();
        $faqs = Faq::getFaqs(8);
        $banner = get_banner(Banner::$CATEGORIES);


        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle', 'categories', 'faqs', 'banner')
        );
    }
}
