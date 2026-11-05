<?php

namespace App\Http\Controllers\AdminPanel\VoiceActorSample;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\VoiceActorSample\VoiceActorSamplesResources;
use App\Models\Voice;
use Illuminate\Http\Request;

class VoiceActorSampleController extends CoreController
{
    use VoiceActorSampleTrait;

    public function __construct(Voice $sample)
    {
        $this->dirView = 'voice-actor-samples';
        $this->asRoute = 'voiceActorSample';
        $this->route = 'voice-actor-samples';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($sample);
    }


    public function index()
    {
        $pageTitle = trans_admin('samples');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = VoiceActorSamplesResources::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }


}
