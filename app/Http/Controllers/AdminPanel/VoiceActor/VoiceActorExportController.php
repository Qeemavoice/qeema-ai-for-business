<?php


namespace App\Http\Controllers\AdminPanel\VoiceActor;


use App\Exports\VoiceActorExport;
use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;

class VoiceActorExportController extends CoreController
{
    public function __construct(User $voiceActor)
    {
        parent::__construct($voiceActor);
    }

    public function export()
    {
        return Excel::download(new VoiceActorExport(), 'voice_actors_'.date(DATE_FORMAT . ' ' . TIME_FORMAT) . '.xlsx');
    }

}
