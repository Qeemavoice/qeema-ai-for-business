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

    public function index($slug = null)
    {
        $canonicalSlug = config('slugroute.slug_categories');

        if ($slug !== $canonicalSlug) {
            return redirect()->to(route_app('category.index', ['slug' => $canonicalSlug]), 301);
        }

        $pageTitle = trans_app('categories');

        meta_data(
            $pageTitle,
            $pageTitle,
            ['' => $pageTitle],
            'استكشف تصنيفات التعليق الصوتي في قيمة فويس واختر الأداء المناسب للإعلانات والوثائقيات والدوبلاج والبودكاست والكتب والمشاريع الصوتية.'
        );

        meta('canonical', route_app('category.index', ['slug' => config('slugroute.slug_categories')]));

        $categories = Category::categories();
        $faqs = Faq::getFaqs(8);
        $banner = get_banner(Banner::$CATEGORIES);


        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle', 'categories', 'faqs', 'banner')
        );
    }
}
