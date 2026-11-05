<?php


namespace App\Http\Middleware;

use Closure;

class MaintenanceMode
{
    public function handle($request, Closure $next)
    {
        $maintenanceMode = getSetting('maintenance_mode');

        if (isset($maintenanceMode) && $maintenanceMode == YES)
            return abort(503);

        return $next($request);
    }
}
