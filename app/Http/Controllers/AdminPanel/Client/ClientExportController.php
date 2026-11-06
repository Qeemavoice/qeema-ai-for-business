<?php


namespace App\Http\Controllers\AdminPanel\Client;


use App\Exports\ClientExport;
use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;

class ClientExportController extends CoreController
{
    public function __construct(User $voiceActor)
    {
        parent::__construct($voiceActor);
    }

    public function export()
    {
        return Excel::download(new ClientExport(), 'clients_'.date(DATE_FORMAT . ' ' . TIME_FORMAT) . '.xlsx');
    }

}
