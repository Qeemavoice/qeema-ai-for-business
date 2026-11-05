<?php


namespace App\Http\Controllers\AdminPanel\MyProfile;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\MyProfile\ChangePasswordRequest;

class MyProfileController  extends CoreController
{

    public function __construct()
    {
        $this->dirView = 'my-profile';
        $this->asRoute = 'myProfile';
        $this->route = 'my-profile';
    }

    public function index()
    {
        $pageTitle = trans_admin('my_profile');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        meta_data('', $pageTitle);

        return view('admin_panel.my-profile.index');
    }

    public function edit()
    {
        $pageTitle = trans_admin('my_profile');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        meta_data('', $pageTitle);

        return view('admin_panel.my-profile.edit');
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = user();

        $user->password = bcrypt($request->new_password);
        $user->save();

        return $this->successResponse($user);
    }
}
