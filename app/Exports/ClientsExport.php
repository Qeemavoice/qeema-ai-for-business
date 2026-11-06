<?php

namespace App\Exports;

use App\Models\User;
use App\Models\UserType;
use Maatwebsite\Excel\Concerns\FromCollection;

class ClientsExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return User::where('user_type_id',UserType::CLIENT)->all();
    }
}
