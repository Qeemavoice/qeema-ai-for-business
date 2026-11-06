<?php


namespace App\Http\Controllers\AdminPanel\RatingGroup;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\RatingGroup\StoreGroupRatingRequest;
use App\Http\Resources\AdminPanel\RatingGroup\RatingGroupsResource;
use App\Models\RatingGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RatingGroupController extends CoreController
{
    use RatingGroupTrait;

    public function __construct(RatingGroup $group)
    {
        $this->dirView = 'rating-groups';
        $this->asRoute = 'ratingGroup';
        $this->route = 'rating-groups';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($group);
    }

    public function index()
    {
        $pageTitle = trans_admin('rating_groups');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_group');

        meta_data(trans_admin('rating_groups'), trans_admin('rating_groups'), [
            $this->routeUrl => trans_admin('rating_groups'),
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

        $data = RatingGroupsResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $group = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_group');

        meta_data(trans_admin('rating_groups'), trans_admin('rating_groups'), [
            $this->routeUrl => trans_admin('rating_groups'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'group'));
    }


    public function store(StoreGroupRatingRequest $request)
    {
        if ($request['id']) {
            $store = $this->model::find($request['id']);
        } else {
            $store = new $this->model;
        }

        if ($request['is_active']) {
            $this->deActiveGroupActive();
        }

        $store->name = $request['name'];
        $store->is_active = $request['is_active'];
        $store->save();

        Cache::forget('group_criterias');

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();
        Cache::forget('partners');
        return $this->deleteResponse($delete);
    }

    private function deActiveGroupActive()
    {
        return $this->model::where('is_active', YES)->update(['is_active' => NO]);
    }

    public function active($id)
    {

        $group = DB::transaction(function () use ($id) {
            $this->deActiveGroupActive();

            $group = $this->model::findOrFail($id);
            $group->is_active = YES;
            $group->save();
            return $group;
        });

        Cache::forget('group_criterias');

        return $this->successResponse($group);
    }

    public function deActive($id)
    {

        $group = $this->model::findOrFail($id);
        $group->is_active = NO;
        $group->save();

        Cache::forget('group_criterias');

        return $this->successResponse($group);
    }

    public function search(Request $request)
    {
        $filter = $request->input('query');

        $model = $this->model::query();

        $data = [];

        if ($filter) {

            $lang = get_locale();

            $data = $model->where(function ($query) use ($filter, $lang) {
                $query->where("name->{$lang}", 'LIKE', "%$filter%");
            });

            $data = $data->get();
        }

        return $this->response([
            'data' => $data,
        ]);
    }

}
