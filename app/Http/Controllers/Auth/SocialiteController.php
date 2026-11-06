<?php

namespace App\Http\Controllers\Auth;

use App\Models\AuthServiceProvider;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserStatus;
use App\Models\UserType;
use App\Services\WalletHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;


class SocialiteController extends AuthController
{
    public function redirectToProvider($provider, Request $request)
    {
        abort_unless($provider === 'google', 404);

        $returnTo = $this->safeNewUiReturnTo((string) $request->query('return_to', ''));

        session([
            'inner_lang' => get_locale(),
            'type' => $request->type ?: UserType::CLIENT,
            'new_ui_return_to' => $returnTo,
        ]);
        return Socialite::driver($provider)->redirect();
    }


    public function handleProviderCallback($provider)
    {
        abort_unless($provider === 'google', 404);

        $inner_lang = session('inner_lang', 'ar');
        $type = session('type', UserType::CLIENT);
        $returnTo = session()->pull('new_ui_return_to');

        try {
            $user = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            flash_error($e->getMessage());
            return redirect(route_app('home.index'));
        }

        $userProvider = AuthServiceProvider::query()
            ->where('auth_service_name', $provider)
            ->where('auth_service_id', $user->getId())
            ->first();

        $getUser = $userProvider ? $userProvider->user : User::where('email', $user->getEmail())->first();

        DB::transaction(function () use ($provider, $user, $type, &$getUser, &$userProvider) {
            if (!$getUser) {
                $getUser = User::create([
                    'full_name' => $user->getName() ?: $user->getEmail(),
                    'email' => $user->getEmail(),
                    'image' => $user->getAvatar(),
                    'email_verified_at' => now(),
                    'uniq_id' => generate_uniq_id(),
                    'user_type_id' => in_array((int) $type, [UserType::CLIENT, UserType::VOICE_ACTOR], true)
                        ? (int) $type
                        : UserType::CLIENT,
                    'status_id' => UserStatus::ACCEPTED,
                ]);

                UserProfile::create(['user_id' => $getUser->id]);
                WalletHelper::create($getUser->id);
            }

            if (!$userProvider) {
                $userProvider = AuthServiceProvider::create([
                    'user_id' => $getUser->id,
                    'auth_service_name' => $provider,
                    'auth_service_id' => $user->getId(),
                    'auth_service_image' => $user->getAvatar(),
                ]);
            }
        });

        auth()->login($getUser);

        return redirect()->to($returnTo ?: '/' . $inner_lang);
    }

    private function safeNewUiReturnTo(string $returnTo): ?string
    {
        if ($returnTo === '' || !str_starts_with($returnTo, '/') || str_starts_with($returnTo, '//')) {
            return null;
        }

        $path = parse_url($returnTo, PHP_URL_PATH);
        if (!in_array($path, ['/', '/ar', '/new-ui', '/new-ui/'], true)) {
            return null;
        }

        return $returnTo;
    }
}
