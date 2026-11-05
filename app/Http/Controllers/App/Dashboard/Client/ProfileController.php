<?php

namespace App\Http\Controllers\App\Dashboard\Client;

use App\Http\Controllers\App\CoreController;
use App\Http\Requests\App\Dashboard\Client\ProfileUpdateRequest;
use App\Http\Resources\App\Dashboard\Clients\ClientResources;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProfileController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'dashboard.clients';
    }

    public function index()
    {
        meta_data(trans_app('book_a_voiceover_for_your_project'), null, [
            '#' => trans_app('profile'),
        ]);

        $DIR_FILE_UPLOADS = User::DIR_IMAGE_UPLOADS;

        $user = new ClientResources(user());
        $workFields = $user->workFields->pluck('id');
        $workField = isset($user->profile) ? $user->profile->work_field : '';

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('DIR_FILE_UPLOADS', 'user', 'workFields', 'workField')
        );
    }

    public function update(ProfileUpdateRequest $request)
    {
        $update = DB::transaction(function () use ($request) {
            $user = User::findOrFail(user()->id);
            $user->email = $request->email;
            $user->full_name = $request->full_name;
            $user->image = $request->image;
            $user->save();

            $user->profile->update([
                'country_id' => $request->country,
                'whatsapp_number' => $request->whatsapp_number,
            ]);

            return $user;
        });

        return $this->successResponse($update);
    }
}
