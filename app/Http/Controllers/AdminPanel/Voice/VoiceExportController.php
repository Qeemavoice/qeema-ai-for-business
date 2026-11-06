<?php


namespace App\Http\Controllers\AdminPanel\Voice;


use App\Exports\VoiceExport;
use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Voice;
use Maatwebsite\Excel\Facades\Excel;

class VoiceExportController extends CoreController
{
    public function __construct(Voice $voice)
    {
        parent::__construct($voice);
    }

    public function export()
    {
        return Excel::download(new VoiceExport(), 'voices_'.date(DATE_FORMAT . ' ' . TIME_FORMAT) . '.xlsx');
    }
}
