<?php

namespace App\Http\Middleware;

use App\Models\UserType;
use App\Traits\Response;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    use Response;

    public function handle(Request $request, Closure $next, ...$guards)
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {

            if (Auth::guard($guard)->check()) {

                $redirectTo = route_app('home.index');

                if (user()->role_id == UserType::ADMIN) {
                    if ($request->expectsJson()) {
                        return $this->response(
                            ['redirectTo' => route_admin('dashboard.index')]
                        );
                    }

                    $redirectTo = route_admin('dashboard.index');
                }

                if (user()->user_type_id == UserType::CLIENT) {

                    if ($request->expectsJson()) {
                        return $this->response(
                            ['redirectTo' => route_app('client.profile.index')]
                        );
                    }

                    $redirectTo = route_app('client.profile.index');
                }

                if (user()->user_type_id == UserType::VOICE_ACTOR) {

                    if ($request->expectsJson()) {
                        return $this->response(
                            ['redirectTo' => route_app('voiceActor.profile.index')]
                        );
                    }

                    $redirectTo = route_app('voiceActor.profile.index');
                }

                return redirect($redirectTo);
            }
        }
        return $next($request);
    }
}
