<?php


namespace App\Http\Controllers\AdminPanel\Work;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Work\StoreWorkRequest;
use App\Http\Resources\AdminPanel\Work\WorksResource;
use App\Models\Work;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class WorkController extends CoreController
{
    use WorkTrait;

    public function __construct(Work $work)
    {
        $this->dirView = 'works';
        $this->asRoute = 'work';
        $this->route = 'works';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($work);
    }

    public function index()
    {
        $pageTitle = trans_admin('works');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_work');

        meta_data(trans_admin('works'), trans_admin('works'), [
            $this->routeUrl => trans_admin('works'),
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

        $data = WorksResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $work = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_work');

        meta_data(trans_admin('works'), trans_admin('works'), [
            $this->routeUrl => trans_admin('works'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'work'));
    }


    public function store(StoreWorkRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->title = $request->title;
        $store->url = $request->url;
        $store->save();

        Cache::forget('works');

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();
        Cache::forget('works');
        return $this->deleteResponse($delete);
    }
}
