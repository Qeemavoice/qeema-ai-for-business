<?php

namespace App\Http\Middleware\NewUi;

use App\Services\NewUi\Accounts;
use Closure;

/** The new UI's API: a signed-in account (Bearer token) is required */
class RequireUser
{
    public function handle($request, Closure $next)
    {
        if (!Accounts::currentUser($request)) return response()->json(['error' => 'يلزم تسجيل الدخول'], 401);
        return $next($request);
    }
}
