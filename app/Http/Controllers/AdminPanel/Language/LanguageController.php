<?php


namespace App\Http\Controllers\AdminPanel\Language;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Language\StoreLanguageRequest;
use App\Http\Resources\AdminPanel\Language\LanguagesResource;
use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LanguageController extends CoreController
{
    use LanguageTrait;

    public function __construct(Language $language)
    {
        $this->dirView = 'languages';
        $this->asRoute = 'language';
        $this->route = 'languages';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($language);
    }

    public function index()
    {
        $pageTitle = trans_admin('languages');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_language');

        meta_data(trans_admin('languages'), trans_admin('languages'), [
            $this->routeUrl => trans_admin('languages'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = LanguagesResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $language = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_language');

        meta_data(trans_admin('languages'), trans_admin('languages'), [
            $this->routeUrl => trans_admin('languages'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'language'));
    }


    public function store(StoreLanguageRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->name = $request->name;
        $store->code = $request->code;
        $store->save();

        Cache::forget('languages');

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();

        Cache::forget('languages');

        return $this->deleteResponse($delete);
    }

    public function all()
    {
        return $this->response(LanguagesResource::collection($this->model::getLanguages()));
    }
}
