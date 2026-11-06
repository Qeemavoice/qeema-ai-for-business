<?php


namespace App\Http\Controllers\App\Dashboard\Client;


use App\Http\Controllers\App\CoreController;
use App\Http\Requests\App\Dashboard\Client\WorkFieldUpdateRequest;
use App\Models\UserProfile;
use App\Models\UserWorkField;
use Illuminate\Support\Facades\DB;

class WorkFieldController extends CoreController
{
    public function update(WorkFieldUpdateRequest $request)
    {
        $update = DB::transaction(function () use ($request) {

            $userId = user()->id;
            $works = $request->work_fields;
            $work = $request->work_field;

            if ($works) {

                $_works = [];

                foreach ($works as $key => $value) {
                    $_works [] = [
                        'work_field_id' => $value,
                        'user_id' => $userId,
                    ];
                }

                UserWorkField::where('user_id', $userId)->delete();

                $update = UserWorkField::insert($_works);
            }

            if ($work && $work != user()->profile->$work) {

                $update = UserProfile::where('user_id', $userId)->update([
                    'work_field' => $work
                ]);

            }

            return $update;
        });

        return $this->successResponse($update);
    }
}
