<?php

namespace App\Http\Controllers\Auth;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\UserStatus;
use App\Models\UserType;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;

class LoginController extends AuthController
{
    use AuthenticatesUsers;

    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    public function showLoginForm()
    {
        return view('app.auth.login');
    }

    public function login(LoginRequest $request)
    {
//        $validator = $this->validateLogin($request->all());
//
//        if ($validator->fails()) {
//            return $this->errorResponse($validator->errors(), trans('messages.the_given_data_was_invalid'));
//        }

        // If the class is using the ThrottlesLogins trait, we can automatically throttle
        // the login attempts for this application. We'll key this by the username and
        // the IP address of the client making these requests into this application.
        if (method_exists($this, 'hasTooManyLoginAttempts') &&
            $this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);

            return $this->sendLockoutResponse($request);
        }


        if (!$this->attemptLogin($request)) {
            return $this->errorResponse([], trans('auth.failed'));
        }

        return $this->sendLoginResponse($request);

        // If the login attempt was unsuccessful we will increment the number of attempts
        // to login and redirect the user back to the login form. Of course, when this
        // user surpasses their maximum number of attempts they will get locked out.
        $this->incrementLoginAttempts($request);

        return $this->sendFailedLoginResponse($request);
    }

//    protected function validateLogin(array $request)
//    {
//        return Validator::make($request, [
//            $this->username() => 'required|string|email',
//            'password' => 'required|string',
//        ]);
//    }


    protected function password()
    {
        return 'password';
    }

    protected function attemptLogin(Request $request)
    {
        $user = User::where($this->username(), $request->email)
            ->whereIn('user_type_id', [UserType::CLIENT, UserType::VOICE_ACTOR])
            ->first();

        if (!$user) {
            return false;
        }

        return $this->guard()->attempt(
            array_merge($this->credentials($request), [
                'status_id' => UserStatus::ACCEPTED,
            ]), $request->filled('remember')
        );
    }

    protected function credentials(Request $request)
    {
        return [
            $this->username() => $request->email,
            $this->password() => $request->password,
        ];
    }

    protected function sendLoginResponse(Request $request)
    {
        $request->session()->regenerate();
        $this->clearLoginAttempts($request);
        return $this->authenticated($request, $this->guard()->user()) ?: redirect()->intended($this->redirectPath());
    }

    protected function authenticated(Request $request, $user)
    {
        $redirectTo = $request->redirectUrl ? $request->redirectUrl : $this->redirectTo();

        $message = $this->message($user);

        return response()->json([
            'status' => (bool)$user,
            'message' => $message,
            'data' => ['redirectTo' => $redirectTo,]
        ]);
    }


    private function message($user)
    {
        return $user ? trans('messages.success.login') : trans('messages.error_msg');
    }

    public function logout(Request $request)
    {
        $this->guard()->logout();
        $request->session()->invalidate();
        return $this->loggedOut($request) ?: redirect()->route('app.home.index');
    }
}
