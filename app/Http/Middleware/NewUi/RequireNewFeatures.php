<?php

namespace App\Http\Middleware\NewUi;

use App\Services\NewUi\Accounts;
use App\Services\RowadService;
use Closure;

/**
 * Credits, plans, top-up and TTS endpoints: Rowad members now, everyone from public_launch_at (config/rowad.php).
 * The front end hides the links and sends visitors to /ar/waitlist; this keeps the API closed too.
 */
class RequireNewFeatures
{
    public function handle($request, Closure $next)
    {
        $user = Accounts::currentUser($request);
        if (RowadService::canUseNewFeatures($user) || Accounts::isAdmin($user)) return $next($request);
        return response()->json([
            'error' => 'هذه الميزة متاحة حالياً لروّاد قيمة فقط، وتفتح للجميع يوم 27 نوفمبر',
            'code' => 'early_access_only', 'redirect' => '/ar/waitlist',
        ], 403);
    }
}
