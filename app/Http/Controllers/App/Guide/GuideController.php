<?php


namespace App\Http\Controllers\App\Guide;


use App\Http\Controllers\App\CoreController;
use App\Models\Banner;
use App\Models\Guide;

class GuideController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'guides';
    }

    public function index()
    {
        $pageTitle = trans_app('get_valuable_clues_in_the_field_of_voiceover');
        meta_data($pageTitle, $pageTitle, [
            '#' => trans_app('guides'),
        ]);
        $banner = get_banner(Banner::$GUIDES);

        $guides = Guide::paginate(12);
        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle', 'guides','banner')
        );
    }




}
