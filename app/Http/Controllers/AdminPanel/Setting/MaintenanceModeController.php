<?php


namespace App\Http\Controllers\AdminPanel\Setting;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MaintenanceModeController extends CoreController
{
    public function __construct(Setting $setting)
    {
        parent::__construct($setting);
    }

    public function store(Request $request)
    {
        $save = $this->model->updateOrCreate([
            'key' => $request->key,
        ], [
            'key' => $request->key,
            'value' => $request->value,

        ]);


        Cache::forget('settings');

        return $this->successResponse($save);
    }
}
