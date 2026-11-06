<?php

namespace App\Http\Controllers\Auth;

use App\Models\AuthServiceProvider;
use App\Models\User;
use App\Models\UserStatus;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;


class SocialiteController extends AuthController
{
    public function redirectToProvider($provider, Request $request)
    {
        session(['inner_lang' => get_locale(), 'type' => $request->type]);
        return Socialite::driver($provider)->redirect();
    }


    public function handleProviderCallback($provider)
    {
        $inner_lang = session('inner_lang');
        $type = session('type');

        try {
            $user = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            flash_error($e->getMessage());
            return redirect(route_app('home.index'));
        }

        $userProvider = AuthServiceProvider::where('user_id', $user->getId())->first();
        $getUser = User::where('email', $user->getEmail())->first();

        if (!$userProvider) {
            if (!$getUser) {
                $getUser = User::craete([
                    'full_name' => $user->getName(),
                    'email' => $user->getEmail(),
                    'uniq_id' => generate_uniq_id(),
                    'user_type_id' => $type,
                    'status_id' => UserStatus::ACCEPTED,
                ]);

                $this->createProfile($getUser);

                $this->createWallet($getUser);
            }

            AuthServiceProvider::create([
                'user_id' => $getUser->id,
                'auth_service_name' => $provider,
                'auth_service_id' => $user->getId(),
            ]);

        } else {
            if (!$getUser) {
                $getUser = User::craete([
                    'full_name' => $user->getName(),
                    'email' => $user->getEmail(),
                    'uniq_id' => generate_uniq_id(),
                    'user_type_id' => $type,
                    'status_id' => UserStatus::ACCEPTED,
                ]);


                $this->createProfile($getUser);

                $this->createWallet($getUser);
            }
        }

        auth()->login($getUser);

        return redirect()->to('/' . $inner_lang);
    }
}
