<?php


namespace App\Http\Controllers\AdminPanel\Banner;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Banner\StoreBannerRequest;
use App\Http\Resources\AdminPanel\Banner\BannersResource;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BannerController extends CoreController
{
    use BannerTrait;

    public function __construct(Banner $model)
    {
        $this->dirView = 'banners';
        $this->asRoute = 'banner';
        $this->route = 'banners';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($model);
    }

    public function index()
    {
        $pageTitle = trans_admin('banners');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_banner');

        meta_data(trans_admin('banners'), trans_admin('banners'), [
            $this->routeUrl => trans_admin('banners'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;
        $positions = Banner::positions();
        $pages = Banner::pages();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'asRoute', 'positions', 'pages')
        );
    }

    public function edit($id)
    {
        $banner = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_banner');

        meta_data(trans_admin('banners'), trans_admin('banners'), [
            $this->routeUrl => trans_admin('banners'),
            '' => $pageTitle
        ]);

        $positions = Banner::positions();
        $pages = Banner::pages();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'banner', 'positions', 'pages')
        );
    }


    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $rows = $rows->paginate(ADMIN_PER_PAGE);

        $data = BannersResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta
        ]);
    }

    public function store(StoreBannerRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::find($id);
        } else {
            $store = new $this->model;
        }

        $store->title = $request->title;
        $store->description = $request->description;
        $store->page = $request->page;
        $store->position = $request->position;
        $store->image = $request->image;
        $store->is_active = $request->is_active;
        $store->save();

        Cache::forget('banners');

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();
        return $this->deleteResponse($delete);
    }
}
