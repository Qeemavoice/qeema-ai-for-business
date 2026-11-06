<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use App\Models\UserType;
use App\Services\WalletHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;

class AuthController extends Controller
{
    protected function redirectTo()
    {
        $redirectTo = route_app('home.index');

        if(user()) {
           $redirectTo =  user()->user_type_id === UserType::CLIENT ? route_app('client.profile.index') : route_app('voiceActor.profile.index');
        }

        return $redirectTo;
    }

    public function authenticate(Request $request)
    {
        if ($request->hasSession()) {
            $request->session()->reflash();
        }
        return Broadcast::auth($request);
    }

    protected function guard()
    {
        return Auth::guard();
    }

    protected function username()
    {
        return 'email';
    }

    protected function createProfile($userId,$data)
    {
        return UserProfile::create([
            'user_id' => $userId,
            'work_field' => $data['work_field'] ? $data['work_field'] : null,
            'country_id' => $data['country'],
            'gender_id' => $data['gender'],
            'price_per_minute' => $data['price_per_minute'],
            'price_per_hours' => $data['price_per_hours'],
           // 'business_link' => $user->business_link,
            'whatsapp_number' => $data['whatsapp_number'],
        ]);
    }

    protected function createWallet($user)
    {
        return WalletHelper::create($user->id);
    }

}
