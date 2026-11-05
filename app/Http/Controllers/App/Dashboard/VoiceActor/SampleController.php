<?php


namespace App\Http\Controllers\App\Dashboard\VoiceActor;


use App\Http\Controllers\App\CoreController;
use App\Http\Requests\App\Dashboard\VoiceActor\SampleStoreRequest;
use App\Http\Resources\App\Dashboard\VoiceActors\SamplesResources;
use App\Models\Voice;
use App\Models\VoiceCategory;
use App\Models\VoiceStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SampleController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'dashboard.voice-actors';
    }

    public function store(SampleStoreRequest $request)
    {
        $store = DB::transaction(function () use ($request) {

            $id = $request->id;

            if ($id) {
                $store = Voice::findOrFail($id);
            } else {
                $store = new Voice();
            }

            $store->title = $request->title;
            $store->price_per_minute = $request->price_per_minute;
            $store->total_price = $request->price_per_minute;
            $store->voiceover_id = user()->getAuthIdentifier();
            $store->dialect_id = $request->dialect;
            $store->language_id = $request->language;
            $store->audio_file = $request->audio_file;
            $store->is_sample = YES;
            $store->voice_status_id = VoiceStatus::IN_REVIEW;
            $store->save();

            VoiceCategory::sync([$request->category], $store->id);

            return $store;
        });


        return $this->successResponse($store);
    }

    public function data(Request $request)
    {
        $samples = new Voice();

        $limit = $request->limit ? 2 : 2;
        $samples = $samples->where('voiceover_id', user()->getAuthIdentifier())
            ->where('is_sample', YES)
            ->with('category.category')
            ->latest()
            ->paginate($limit);

        $data = SamplesResources::collection($samples);
        $meta = collect($samples)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $sample = Voice::where('voiceover_id', user()->getAuthIdentifier())->where('is_sample', YES)->with('category')->findOrFail($id);
        return $this->response($sample);
    }

    public function destroy($id)
    {
        return $this->deleteResponse(Voice::findOrFail($id)->delete());
    }
}
