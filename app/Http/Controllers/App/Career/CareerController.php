<?php


namespace App\Http\Controllers\App\Career;


use App\Http\Controllers\App\CoreController;
use App\Http\Requests\App\Career\StoreCareerApplicationApplyRequest;
use App\Models\Banner;
use App\Models\Career;
use App\Models\CareerApplicant;

class CareerController extends CoreController
{

    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'careers';
    }

    public function index()
    {
        $pageTitle = trans_app('careers');
        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);
        meta('canonical', route_app('career.index'));

        $jobs = Career::where('status', YES)->oldest()->get();
        $banner = get_banner(Banner::$CAREERS);
        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle', 'jobs', 'banner')
        );
    }

    public function details($slug)
    {
        $career = Career::where('status', YES)->findOrFail(explode('-', $slug)[0]);

        if ($slug !== $career->slug) {
            return redirect()->to(route_app('career.details', ['slug' => $career->slug]), 301);
        }

        meta_data($career->title, null, [
            route_app('career.index') => trans_app('careers'),
            '#' => $career->title,
        ]);

        meta('canonical', route_app('career.details', ['slug' => $career->slug]));

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.details', compact('career'));
    }

    public function apply(StoreCareerApplicationApplyRequest $request)
    {
        $store = CareerApplicant::query()->updateOrCreate([
            'career_id' => $request->career_id,
            'email' => $request->email,
            'mobile' => $request->whatsapp,
        ], [
            'career_id' => $request->career_id,
            'full_name' => $request->name,
            'email' => $request->email,
            'mobile' => $request->whatsapp,
        ]);

        return $this->successResponse($store);
    }

}
