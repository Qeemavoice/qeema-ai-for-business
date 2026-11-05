<?php


namespace App\Http\Controllers\AdminPanel\RatingCriteria;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\RatingCriteria\StoreCriteriaRequest;
use App\Http\Resources\AdminPanel\RatingCriteria\RatingCriteriaResources;
use App\Http\Resources\AdminPanel\RatingGroup\RatingGroupsResource;
use App\Models\RatingCriteria;
use App\Models\RatingGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RatingCriteriaController extends CoreController
{
    use RatingCriteriaTrait;

    public function __construct(RatingCriteria $criteria)
    {
        $this->dirView = 'rating-criterias';
        $this->asRoute = 'ratingCriteria';
        $this->route = 'rating-criterias';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($criteria);
    }

    public function index()
    {
        $pageTitle = trans_admin('rating_criterias');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_criteria');

        meta_data(trans_admin('rating_groups'), trans_admin('rating_criterias'), [
            $this->routeUrl => trans_admin('rating_criterias'),
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

        $data = RatingCriteriaResources::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        request()->request->add(['translate' => true]); //add request

        $criteria = new RatingCriteriaResources($this->model::with('group')->find($id));

        $pageTitle = trans_admin('edit_criteria');

        meta_data(trans_admin('rating_groups'), trans_admin('rating_criterias'), [
            $this->routeUrl => trans_admin('rating_criterias'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'criteria'));
    }


    public function store(StoreCriteriaRequest $request)
    {
        if ($request['id']) {
            $store = $this->model::find($request['id']);
        } else {
            $store = new $this->model;
        }

        $store->name = $request['name'];
        $store->group_id = $request['group'];
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

    private function getGroups()
    {
        return RatingGroupsResource::collection(RatingGroup::all());
    }
}
