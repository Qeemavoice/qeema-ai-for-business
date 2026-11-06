<?php


namespace App\Http\Middleware;

use Closure;

class MaintenanceMode
{
    public function handle($request, Closure $next)
    {
        $maintenanceMode =  config('app.maintenance_mode');

//        if(!$request->dev_alhassan) {
//            if (isset($maintenanceMode) && $maintenanceMode)
//                return abort(503);
//        }


        return $next($request);
    }
}
