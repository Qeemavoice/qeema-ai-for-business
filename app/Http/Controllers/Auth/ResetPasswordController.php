<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Illuminate\Support\Facades\DB;

class ResetPasswordController extends AuthController
{
    use ResetsPasswords;

    protected $expiredMinuteURL = 60;

    /**
     * Where to redirect users after resetting their password.
     *
     * @var string
     */
    protected $redirectTo = '/dashboard';
    private $isAdmin;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->isAdmin = request('isAdmin') ? true : false;
        $this->middleware('guest');
    }


    private function getDataOfToken($token)
    {
        return DB::table('password_resets')->where('token', $token)
            ->where('created_at', '>', Carbon::now()->subMinutes($this->expiredMinuteURL))
            ->latest()->first();
    }

    private function redirectToLinkRequestForm()
    {
        $error_message = trans('messages.expired_link');
        if ($this->isAdmin) {
            return redirect(route_admin('login'))->with('error_message', $error_message);
        }
        if (request()->expectsJson())
           return $this->successResponse(false, $error_message);

        return redirect(route_app('home.index'))->with('error_message', $error_message);
    }

    public function reset()
    {

        $data = $this->getDataOfToken(request('token'));

        if (!$data) {
            return $this->redirectToLinkRequestForm();
        }

        $this->validatePassword();

        $user = $this->changePassword($data->email);

        if (!$user) {
            $this->errorResponse();
        }

        $this->deleteToken($data->email);

//        $this->loginUser($user);
//        return redirect()->intended();

        if ($this->isAdmin) {
            $redirectTo = route_admin('login');
        } else {
            $redirectTo = route_app('home.index');
        }

        return $this->response(['redirectTo' => $redirectTo], null, trans('messages.reset_password'));
    }

    private function validatePassword()
    {
        return $this->validate(request(), [
            'password' => password_rules(true, MIN_PASSWORD, true),
            'password_confirmation' => 'required|string|max:255',
        ]);
    }

    protected function changePassword($email)
    {
        $user = User::where('email', $email)->first();
        $user->password = bcrypt(request('password'));
        $user->save();
        return $user;
    }

    private function deleteToken($email)
    {
        return DB::table('password_resets')->where('email', $email)->delete();
    }

    private function loginUser($user)
    {
        return auth()->login($user);
    }

}
