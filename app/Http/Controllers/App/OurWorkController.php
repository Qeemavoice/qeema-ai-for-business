<?php


namespace App\Http\Controllers\App;


use App\Models\Banner;
use App\Models\Work;

class OurWorkController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'our-works';
    }

    public function index($slug)
    {
        $canonicalSlug = config('slugroute.slug_our_works');

        if ($slug !== $canonicalSlug) {
            return redirect()->to(route_app('ourWork.index', ['slug' => $canonicalSlug]), 301);
        }

        $pageTitle = trans_app('our_works');

        meta_data(
            $pageTitle,
            'أعمال صوتية نفتخر بها',
            ['' => $pageTitle],
            'شاهد نماذج من أعمال التعليق الصوتي والدوبلاج التي نفذها معلقو قيمة فويس لمشاريع وعلامات تجارية متنوعة.'
        );

        meta('canonical', route_app('ourWork.index', ['slug' => $canonicalSlug]));

        $works = Work::getWorks();
        $banner = get_banner(Banner::$OUR_WORKS);

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle','works','banner')
        );
    }
}
