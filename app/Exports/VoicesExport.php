<?php

namespace App\Exports;

use App\Models\Voice;
use Maatwebsite\Excel\Concerns\FromCollection;

class VoicesExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Voice::all();
    }
}
