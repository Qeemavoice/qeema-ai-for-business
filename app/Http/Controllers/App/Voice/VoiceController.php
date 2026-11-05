<?php


namespace App\Http\Controllers\App\Voice;

use App\Http\Controllers\App\CoreController;
use App\Http\Resources\App\Voices\VoicesResources;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Dialect;
use App\Models\Language;
use App\Models\Setting;
use App\Models\Voice;
use App\Models\VoiceType;
use Illuminate\Http\Request;

class VoiceController extends CoreController
{
    use VoiceTrait;

    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'voices';
    }

    public function index()
    {

        meta_data(trans_app('choose_from_the_value_of_one_voice'), trans_app('voices'), [
            '#' => trans_app('voices'),
        ]);

        $languages = Language::getLanguages();
        $types = VoiceType::getTypes();
        $dialects = Dialect::dialects();
        $categories = Category::categories();
        $banner = get_banner(Banner::$VOICES);
        $voicesPageSetting = getSetting(Setting::VOICES_PAGE, true);

        $voices = Voice::query()
            ->with('dialect.language')
            ->orderBy('number_of_orders', 'desc')->paginate(21);


        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('languages', 'types', 'dialects', 'categories', 'banner', 'voicesPageSetting', 'voices')
        );
    }

    public function data(Request $request)
    {
        $rows = Voice::query();

        $rows = $this->filter($request, $rows);
        $limit = $request->limit ? $request->limit : 12;
        $rows = $this->sort($request, $rows);
        $rows = $rows->paginate($limit);

        $data = VoicesResources::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }


    public function loadMore(Request $request)
    {
        $voices = Voice::query();

        $voices = $this->filter($request, $voices);
        $limit = $request->limit ? $request->limit : 12;

        $voices = $this->sort($request, $voices);
        $voices = $voices->paginate($limit);

        return $this->response([
            'html' => view(APP_VIEWS_DIR . '.' . $this->dirView .'.includes.sounds-more', compact('voices'))->render(),
            'currentPage' => $voices->currentPage(),
            'total' => $voices->total(),
        ]);
    }

}
