<?php


namespace App\Http\Controllers\App\Dashboard\Client;


use App\Http\Controllers\App\CoreController;
use App\Models\Voice;
use Illuminate\Http\Request;

class VoiceController extends CoreController
{
    public $model;

    public function __construct(Voice $model)
    {
        $this->model = $model;
    }

    public function updateNumberListened(Request $request)
    {
        $voiceId = $request->id;
        $voice = Voice::findOrFail($voiceId);
        $voice->number_of_listened = $voice->number_of_listened + 1;
        $voice->save();
        return $this->successResponse($voice);
    }

    public function updateNumberLikes(Request $request)
    {
        $voiceId = $request->id;
        $voice = Voice::findOrFail($voiceId);
        $voice->number_of_likes = $request->isLike ? --$voice->number_of_likes : ++$voice->number_of_likes;
        $voice->save();
        return $this->successResponse($voice);
    }
}
