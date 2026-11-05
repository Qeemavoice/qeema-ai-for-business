<?php


namespace App\Http\Middleware;


use App\Models\Role;
use App\Models\UserType;
use App\Traits\Response;
use Closure;
use Illuminate\Support\Facades\Auth;

class RedirectIfUnAuthenticatedClient
{
    use Response;

    public function handle($request, Closure $next, $guard = null)
    {
        $message = trans('messages.is_login');

        if (!Auth::guard()->check()) {
            if ($request->expectsJson()) {
                return $this->response(
                    null,
                    null,
                    $message,
                    Response::$UNAUTHORIZED
                );
            }
            return redirectToBack($message);
        }


        if (Auth::guard()->check() && user()->user_type_id !== UserType::CLIENT) {
            if ($request->expectsJson()) {
                return $this->response(
                    null,
                    null,
                    $message,
                    Response::$UNAUTHORIZED
                );
            }

            return redirectToBack($message);
        }

        return $next($request);
    }
}
