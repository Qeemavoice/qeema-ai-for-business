<?php


namespace App\Http\Controllers\Auth;


use App\Http\Requests\Auth\RegisterRequest;
use App\Jobs\SendUserWelcomeEmailJob;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserStatus;
use App\Models\UserWorkField;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;


class RegisterController extends AuthController
{
    use ThrottlesLogins;

    public function __construct()
    {
        $this->middleware('guest');
    }

    public function showRegisterForm()
    {
        return view('app.auth.register');
    }

    public function register(RegisterRequest $request)
    {
//        $validator = $this->validator($request->all());
//
//        if ($validator->fails()) {
//            return $this->errorResponse($validator->errors(), trans('messages.the_given_data_was_invalid'));
//        }

        if (method_exists($this, 'hasTooManyLoginAttempts') &&
            $this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);

            return $this->sendLockoutResponse($request);
        }

        $user = DB::transaction(function () use ($request) {

            $data = $request->all();

            $user = $this->create($data);

            $this->createProfile($user->id,$data);

            $this->createWorkFields($user, $request->work_fields, $request->work_field);

            $this->createWallet($user);

            //event(new Registered($user));

            return $user;
        });
        try {
            dispatch(new SendUserWelcomeEmailJob($user));
        } catch (\Exception $exception) {
            Log::channel('email_errors')->error('Failed to send mail: ' . $exception->getMessage());
        }

        $this->guard()->login($user);

        $redirectTo = $request->redirectUrl ? $request->redirectUrl : $this->redirectTo();

        return $this->response(['redirectTo' => $redirectTo]);
    }

//    protected function validator(array $data)
//    {
//        if ($data['i_agree'] === false)
//            unset($data['i_agree']);
//
//        $rules = [
//            'full_name' => ['required', 'string', 'max:191'],
//            'email' => ['required', 'string', 'email', 'max:191', Rule::unique('users', 'email')],
//            'password' => password_rules(true, false, true),
//            'type' => ['required', 'in:' . UserType::CLIENT . ',' . UserType::VOICE_ACTOR],
//        ];
//
//        if ($data['type'] === UserType::VOICE_ACTOR) {
//            $rules = array_merge($rules, [
//                'gender' => ['required'],
//                'country' => ['required'],
//                'business_link' => ['nullable', 'url'],
//                'price_per_minute' => ['required', 'numeric'],
//                'price_per_hours' => ['required', 'numeric'],
//                'mobile' => ['required', mobile_regex(), 'max:191'],
//                'whatsapp_number' => ['required','string', 'max:191'],
//            ]);
//        }
//
//        if ($data['type'] === UserType::CLIENT) {
//            $rules = array_merge($rules, [
//                    'working_fields' => ['required_without:working_field', 'array'],
//                    'working_field' => ['required_without:working_fields', 'string', 'max:191']]
//            );
//        }
//
//        return Validator::make($data, $rules);
//    }

    protected function create(array $data)
    {
        return User::create([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'user_type_id' => $data['type'],
            'status_id' => UserStatus::ACCEPTED,
        ]);
    }

    protected function createWorkFields($user, $works, $otherWork = '')
    {
        $store = DB::transaction(function () use ($user, $works, $otherWork) {

            $userId = $user->id;
            $store = true;
            if ($works) {
                $_works = [];
                foreach ($works as $key => $value) {
                    $_works [] = [
                        'work_field_id' => $value,
                        'user_id' => $userId,
                    ];
                }

                $store = UserWorkField::insert($_works);
            }

            if ($otherWork) {

                $store = UserProfile::where('user_id', $userId)->update([
                    'work_field' => $otherWork
                ]);

            }
            return $store;
        });

        return isset($store) ? $store : false;
    }
}
