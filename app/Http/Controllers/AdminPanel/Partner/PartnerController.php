<?php


namespace App\Http\Controllers\AdminPanel\Partner;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Category\StoreCategoryRequest;
use App\Http\Requests\AdminPanel\Partner\StorePartnerRequest;
use App\Http\Resources\AdminPanel\Category\CategoriesResource;
use App\Http\Resources\AdminPanel\Partner\PartnersResource;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PartnerController extends CoreController
{
    use PartnerTrait;

    public function __construct(Partner $partner)
    {
        $this->dirView = 'partners';
        $this->asRoute = 'partner';
        $this->route = 'partners';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($partner);
    }

    public function index()
    {
        $pageTitle = trans_admin('partners');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_partner');

        meta_data(trans_admin('partners'), trans_admin('partners'), [
            $this->routeUrl => trans_admin('partners'),
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

        $data = PartnersResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $partner = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_partner');

        meta_data(trans_admin('partners'), trans_admin('partners'), [
            $this->routeUrl => trans_admin('partners'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'partner'));
    }


    public function store(StorePartnerRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->full_name = $request->full_name;
        $store->description = $request->description;
        $store->alt = $request->alt;
        $store->job_title = $request->job_title;
        $store->image = $request->image;
        $store->reference_url = $request->reference_url;
        $store->show_on_homepage = $request->boolean('show_on_homepage');
        $store->permission_confirmed = $request->boolean('permission_confirmed');
        $store->save();

        Cache::forget('partners');
        Cache::forget('partners-homepage');
        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();
        Cache::forget('partners');
        Cache::forget('partners-homepage');
        return $this->deleteResponse($delete);
    }

}
