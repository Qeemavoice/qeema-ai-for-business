<?php


namespace App\Http\Controllers\AdminPanel\Voice;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Voice\StoreVoiceRequest;
use App\Http\Resources\AdminPanel\Voice\VoicesResource;
use App\Models\Voice;
use App\Models\VoiceCategory;
use App\Models\VoiceStatus;
use App\Models\VoiceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoiceController extends CoreController
{
    use VoiceTrait;

    public function __construct(Voice $voice)
    {
        $this->dirView = 'voices';
        $this->asRoute = 'voice';
        $this->route = 'voices';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($voice);
    }

    public function index()
    {
        $pageTitle = trans_admin('voices');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_voice');

        meta_data(trans_admin('voices'), trans_admin('voices'), [
            $this->routeUrl => trans_admin('voices'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        $types = VoiceType::getTypes();

        $commissions = commissions();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'asRoute', 'types','commissions')
        );
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = VoicesResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $voice = $this->model::with('categories','voiceOver')->findOrFail($id);

        $pageTitle = trans_admin('edit_voice');

        meta_data(trans_admin('voices'), trans_admin('voices'), [
            $this->routeUrl => trans_admin('voices'),
            '' => $pageTitle
        ]);
        $types = VoiceType::getTypes();
        $platformCommission = commissions()->platform;
        $commissions = commissions();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'voice', 'types', 'platformCommission', 'commissions')
        );
    }


    public function store(StoreVoiceRequest $request)
    {
        $store = DB::transaction(function () use ($request) {

            $id = $request->id;

            if ($id) {
                $store = $this->model::findOrFail($id);
            } else {
                $store = new $this->model();
            }

            $store->title = $request->title;
            $store->price_per_minute = $request->price_per_minute;
            $store->total_price = $request->price_per_minute;
            $store->voiceover_id = $request->voiceover;
            $store->dialect_id = $request->dialect;
            $store->language_id = $request->language;
            $store->meta_title = $request->meta_title;
            $store->meta_description = $request->meta_description;
            $store->audio_file = $request->audio_file;
            $store->elevenlabs_voice_id = $request->elevenlabs_voice_id ?: null;
            $store->voice_status_id = VoiceStatus::ACCEPTED;
            $store->voice_type_id = $request->type;
            $store->save();

            VoiceCategory::sync($request->categories_ids, $store->id);

            return $store;
        });


        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        return $this->deleteResponse($this->model::findOrFail($id)->delete());
    }

    public function search(Request $request)
    {
        $filter = $request->input('query');

        $model = Voice::query();

        $data = [];

        if ($filter) {

            $lang = get_locale();

            $data = $model->where(function ($query) use ($filter, $lang) {
                $query->where("title->{$lang}", 'LIKE', "%$filter%");
            });

            $data = $data->get();
        }


        return $this->response([
            'data' => $data,
        ]);
    }

}
