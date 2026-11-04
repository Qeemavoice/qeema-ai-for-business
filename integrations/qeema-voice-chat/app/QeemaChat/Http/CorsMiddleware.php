<?php

namespace App\QeemaChat\Http;

use Closure;
use Illuminate\Http\Request;

/**
 * يسمح باستدعاء الشات من نطاقات محددة فقط (QV_CHAT_ALLOWED_ORIGINS).
 * إذا كانت الواجهة على نفس نطاق الموقع فلا حاجة لأي إعداد.
 */
class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');
        $allowed = config('qeema_chat.allowed_origins', []);

        $response = $request->isMethod('OPTIONS') ? response('', 204) : $next($request);

        if ($origin && in_array($origin, $allowed, true)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Vary', 'Origin');
            $response->headers->set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept');
        }

        return $response;
    }
}
