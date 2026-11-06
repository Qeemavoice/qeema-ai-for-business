<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * This is used by Laravel authentication to redirect users after login.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * The controller namespace for the application.
     *
     * When present, controller route declarations will automatically be prefixed with this namespace.
     *
     * @var string|null
     */
    protected $namespace = 'App\\Http\\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            $this->mapApiRoutes();

            $this->mapAuthRoutes();

            $this->mapAppRoutes();

            $this->mapWebRoutes();

            $this->mapAdminRoutes();
        });
    }


    private function mapApiRoutes()
    {
        Route::prefix('api')
            ->middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/api.php'));
    }

    private function mapWebRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/web.php'));
    }

    private function mapAdminRoutes()
    {
        $locale = request()->segment(1);

        Route::prefix($locale . '/' . ADMIN_PREFIX)
            ->middleware('admin')
            ->namespace($this->namespace . '\\' . ADMIN_NAMESPACE)
            ->as(ADMIN_ROUTE . '.')
            ->group(base_path('routes/admin.php'));
    }

    private function mapAuthRoutes()
    {
        $locale = request()->segment(1);

        Route::prefix($locale)
            ->middleware('sys_auth')
            ->namespace($this->namespace . '\\Auth')
            ->as('auth.')
            ->group(base_path('routes/auth.php'));
    }

    private function mapAppRoutes()
    {
        $locale = request()->segment(1);

        Route::prefix($locale)
            ->middleware('app')
            ->namespace($this->namespace . '\\' . APP_NAMESPACE)
            ->as(APP_ROUTE.'.')
            ->group(base_path('routes/app.php'));
    }


    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
        });
    }
}
