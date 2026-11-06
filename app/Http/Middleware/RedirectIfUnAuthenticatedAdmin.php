<?php


namespace App\Http\Middleware;

use App\Models\Role;
use App\Traits\Response;
use Closure;
use Illuminate\Support\Facades\Auth;

class RedirectIfUnAuthenticatedAdmin
{
    use Response;

    public function handle($request, Closure $next, $guard = null)
    {

        $message = trans('messages.is_login');

        if (!Auth::guard()->check()) {

            if ($request->expectsJson()) {
                return $this->response(
                    ['redirectTo' => redirectToBack($message, true)],
                    [],
                    $message,
                    Response::$UNAUTHORIZED
                );
            }

            return redirect(route_auth('admin.login'));
        }


        if (Auth::guard()->check() && user()->role_id !== Role::ADMINISTRATION) {

            if ($request->expectsJson()) {
                return $this->response(
                    [],
                    [],
                    $message,
                    Response::$UNAUTHORIZED
                );
            }

            return redirectToBack($message);
        }


        return $next($request);
    }

}
