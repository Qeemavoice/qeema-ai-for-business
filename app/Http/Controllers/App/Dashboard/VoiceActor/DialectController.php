<?php

namespace App\Http\Controllers\App\Dashboard\VoiceActor;

use App\Http\Controllers\App\CoreController;
use App\Http\Resources\App\Dashboard\VoiceActors\DialectsResource;
use App\Models\Dialect;
use Illuminate\Http\Request;

class DialectController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'dashboard.voice-actors';
    }

    public function getDialectsByLangId(Request $request)
    {
        $lang = $request->language;
        return $this->response(DialectsResource::collection(Dialect::where('language_id', $lang)->get()));
    }
}
