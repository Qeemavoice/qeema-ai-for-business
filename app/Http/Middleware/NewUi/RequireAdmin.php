<?php

namespace App\Http\Middleware\NewUi;

use App\Services\NewUi\Accounts;
use Closure;

/** The new UI's admin API: platform staff only */
class RequireAdmin
{
    public function handle($request, Closure $next)
    {
        $u = Accounts::currentUser($request);
        if (!$u) return response()->json(['error' => 'يلزم تسجيل دخول الإدارة'], 401);
        if (!Accounts::isAdmin($u)) return response()->json(['error' => 'هذه الصفحة لفريق إدارة قيمة فويس فقط'], 403);
        return $next($request);
    }
}
