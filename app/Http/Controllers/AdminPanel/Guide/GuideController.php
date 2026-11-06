<?php


namespace App\Http\Controllers\AdminPanel\Guide;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Guide\StoreGuideRequest;
use App\Http\Resources\AdminPanel\Guide\GuidesResource;
use App\Models\Guide;
use Illuminate\Http\Request;

class GuideController extends CoreController
{
    use GuideTrait;

    public function __construct(Guide $guide)
    {
        $this->dirView = 'guides';
        $this->asRoute = 'guide';
        $this->route = 'guides';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($guide);
    }

    public function index()
    {
        $pageTitle = trans_admin('guides');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_guide');

        meta_data(trans_admin('guides'), trans_admin('guides'), [
            $this->routeUrl => trans_admin('guides'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;
        $types = $this->model::types();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'asRoute', 'types'));
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = GuidesResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $faq = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_guide');

        meta_data(trans_admin('guides'), trans_admin('guides'), [
            $this->routeUrl => trans_admin('guides'),
            '' => $pageTitle
        ]);

        $types = $this->model::types();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'faq', 'types')
        );
    }


    public function store(StoreGuideRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->name = $request->name;
        $store->details = $request->details;
        $store->image = $request->image;
        $store->file = $request->file;
        $store->unit_price = $request->price;
        $store->type = $request->type;
        $store->save();

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        return $this->deleteResponse($this->model::findOrFail($id)->delete());
    }
}
