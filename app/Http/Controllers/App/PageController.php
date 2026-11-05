<?php


namespace App\Http\Controllers\App;


use App\Models\Banner;
use App\Models\Form;
use App\Models\Page;

class PageController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'pages';
    }


    public function __invoke($slug)
    {
        if (is_null($slug))
            return abort(404);

        $page = Page::where("slug", $slug)->first();

        if (!$page)
            return abort(404);


        $pageTitle = $page->title;

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $banner = null;
        $form = null;
        if ($slug === Page::TRAINING) {
            $banner = get_banner(Banner::$TRAINING);
            $form = Form::where('page_id',$page->id)->with('fields')->first();
        }

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle', 'page', 'banner','form')
        );
    }
}
