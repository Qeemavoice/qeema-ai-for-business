<?php


namespace App\Http\Controllers\AdminPanel\Career;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\Career\ApplicantsCareersResource;
use App\Models\Career;
use App\Models\CareerApplicant;
use Illuminate\Http\Request;

class CareerDetailsController  extends CoreController
{
    public function __construct(CareerApplicant $applicant)
    {
        $this->dirView = 'careers';
        $this->asRoute = 'career';
        $this->route = 'careers';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($applicant);
    }

    public function index($id)
    {
        $pageTitle = trans_admin('careers');

        $job = Career::findOrFail($id);

        meta_data(trans_admin('jobs'), trans_admin('jobs'), [
            $this->routeUrl => trans_admin('jobs'),
            '' => $job->title
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details', compact('pageTitle','job','asRoute'));
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = ApplicantsCareersResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

}
