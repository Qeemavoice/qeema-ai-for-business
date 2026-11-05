<?php

namespace App\Http\Controllers\Auth;

use App\Mail\ForgotPasswordMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ForgotPasswordController extends AuthController
{

    use SendsPasswordResetEmails;

    public function __construct()
    {
        $this->middleware('guest');
    }

    public function sendResetLinkEmail(Request $request)
    {
        $validator = $this->validateForgetPassword($request->all());


        if ($validator->fails()) {
            return $this->errorResponse($validator->errors(), trans('messages.the_given_data_was_invalid'));
        }

        $user = $this->getUser();

        if (!$user) {
            $errors = ['email' => [trans('messages.error_forgot_email')]];
            $message = trans('messages.the_given_data_was_invalid');

            return $this->errorResponse($errors, $message);
        }

        $token = $this->storePasswordRest($user);

        if (!$token)
            return $this->successResponse(false);

        try {
            Mail::to($user->email)->send(new ForgotPasswordMail($user, $token));
        } catch (\Exception $exception) {
            Log::channel('email_errors')->error('Failed to send mail: ' . $exception->getMessage());
        }

        return $this->response(null, null, trans('messages.success_send_email'));
    }

    protected function validateForgetPassword(array $request)
    {
        return Validator::make($request, [
            'email' => 'required|email',
        ]);
    }

    protected function getUser()
    {
        return User::select('email', 'full_name')->where('email', request('email'))->first();
    }

    protected function storePasswordRest($user)
    {
        $token = $this->token($user);
        $store = DB::table('password_resets')->insert([
            'email' => $user->email,
            'token' => $token,
            'created_at' => Carbon::now()->toDateTimeString()
        ]);
        return $store ? $token : false;
    }

    protected function token($user)
    {
        return $this->generateToken($user);
    }

    protected function generateToken($user)
    {
        return app('auth.password.broker')->createToken($user);
    }
}
