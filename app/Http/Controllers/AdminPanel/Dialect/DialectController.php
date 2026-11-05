<?php


namespace App\Http\Controllers\AdminPanel\Dialect;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Dialect\StoreDialectRequest;
use App\Http\Resources\AdminPanel\Dialect\DialectsResource;
use App\Models\Dialect;
use Illuminate\Http\Request;

class DialectController extends CoreController
{
    use DialectTrait;

    public function __construct(Dialect $dialect)
    {
        $this->dirView = 'dialects';
        $this->asRoute = 'dialect';
        $this->route = 'dialects';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($dialect);
    }

    public function index()
    {
        $pageTitle = trans_admin('dialects');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_dialect');

        meta_data(trans_admin('dialects'), trans_admin('dialects'), [
            $this->routeUrl => trans_admin('dialects'),
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

        $data = DialectsResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $dialect = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_dialect');

        meta_data(trans_admin('dialects'), trans_admin('dialects'), [
            $this->routeUrl => trans_admin('dialects'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'dialect'));
    }


    public function store(StoreDialectRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->name = $request->name;
        $store->language_id = $request->language;
        $store->save();

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        return $this->deleteResponse($this->model::findOrFail($id)->delete());
    }
}
