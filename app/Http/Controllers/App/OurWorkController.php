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

    public function index()
    {
        $pageTitle = trans_app('our_works');

        meta_data($pageTitle, 'أعمال صوتية نفتخر بها', [
            '' => $pageTitle
        ]);

        $works = Work::getWorks();
        $banner = get_banner(Banner::$OUR_WORKS);

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle','works','banner')
        );
    }
}
