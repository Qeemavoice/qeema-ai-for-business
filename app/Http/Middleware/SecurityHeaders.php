<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/** Baseline security headers on every response (no CSP yet: the old pages load scripts from many places) */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        $h = $response->headers;
        if (!$h->has('X-Frame-Options')) $h->set('X-Frame-Options', 'SAMEORIGIN');   // no framing by other sites
        $h->set('X-Content-Type-Options', 'nosniff');
        $h->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        // behind the HTTPS proxy (TrustProxies has no proxy list, so isSecure() alone is false there)
        if ($request->isSecure() || $request->header('X-Forwarded-Proto') === 'https') $h->set('Strict-Transport-Security', 'max-age=31536000');
        return $response;
    }
}
