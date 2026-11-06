<?php


namespace App\Http\Controllers\AdminPanel\Career;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Career\StoreCareerRequest;
use App\Http\Resources\AdminPanel\Career\CareersResource;
use App\Models\Career;
use Illuminate\Http\Request;

class CareerController extends CoreController
{
    use CareerTrait;

    public function __construct(Career $job)
    {
        $this->dirView = 'careers';
        $this->asRoute = 'career';
        $this->route = 'careers';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($job);
    }

    public function index()
    {
        $pageTitle = trans_admin('jobs');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_job');

        meta_data(trans_admin('jobs'), trans_admin('jobs'), [
            $this->routeUrl => trans_admin('jobs'),
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

        $data = CareersResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $job = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_job');

        meta_data(trans_admin('jobs'), trans_admin('jobs'), [
            $this->routeUrl => trans_admin('jobs'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'job'));
    }


    public function store(StoreCareerRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->title = $request->title;
        $store->job_title = $request->job_title;
        $store->experience = $request->experience;
        $store->responsibilities = $request->responsibilities;
        $store->tasks = $request->tasks;
        $store->min_salary = $request->min_salary;
        $store->max_salary = $request->max_salary;
        $store->external_image = $request->external_image;
        $store->interior_image = $request->interior_image;
        $store->workplace_type = $request->workplace_type;
        $store->type = $request->job_type;
        $store->save();

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        return $this->deleteResponse($this->model::findOrFail($id)->delete());
    }
}
