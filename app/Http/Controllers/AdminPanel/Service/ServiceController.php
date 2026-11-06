<?php


namespace App\Http\Controllers\AdminPanel\Service;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Service\StoreServiceRequest;
use App\Http\Resources\AdminPanel\Service\ServicesResource;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ServiceController extends CoreController
{
    use ServiceTrait;

    public function __construct(Service $service)
    {
        $this->dirView = 'services';
        $this->asRoute = 'service';
        $this->route = 'services';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($service);
    }

    public function index()
    {
        $pageTitle = trans_admin('services');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_service');

        meta_data(trans_admin('services'), trans_admin('services'), [
            $this->routeUrl => trans_admin('services'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;
        $types = $this->model::getTypes();
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'asRoute','types'));
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = ServicesResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $service = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_service');

        meta_data(trans_admin('services'), trans_admin('services'), [
            $this->routeUrl => trans_admin('services'),
            '' => $pageTitle
        ]);
        $types = $this->model::getTypes();
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'service','types'));
    }


    public function store(StoreServiceRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->title = $request->title;
        $store->value = $request->value;
        $store->type = $request->type;
        $store->save();
        Cache::forget('services');
        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        Cache::forget('services');
        return $this->deleteResponse($this->model::findOrFail($id)->delete());
    }
}
