<?php


namespace App\Http\Controllers\AdminPanel\Guide;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\Guide\GuideDownloadsResource;
use App\Models\GuideDownload;
use Illuminate\Http\Request;

class GuideDownloadController extends CoreController
{
    use GuideDownloadTrait;


    public function __construct(GuideDownload $guide)
    {
        $this->dirView = 'guides';
        $this->asRoute = 'guide';
        $this->route = 'guides';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($guide);
    }


    public function data($id, Request $request)
    {

        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->with('user','order')->paginate($limit);

        $data = GuideDownloadsResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

}
