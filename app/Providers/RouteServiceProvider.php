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

            $this->mapNewUiRoutes();

            $this->mapAppRoutes();

            $this->mapWebRoutes();

            $this->mapProductionPublicSiteRoutes();

            $this->mapAdminRoutes();
        });
    }

    /**
     * Serve the isolated React preview before the locale-prefixed legacy routes.
     */
    private function mapNewUiRoutes()
    {
        Route::prefix('new-ui')
            ->middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/new-ui.php'));
    }

    /**
     * Serve the React public site from the canonical production URLs while
     * leaving authentication, dashboards, admin routes, and legacy pages to
     * their existing locale-prefixed route groups. These routes must be
     * registered after the legacy app routes because Laravel replaces routes
     * that share the same HTTP method and URI.
     */
    private function mapProductionPublicSiteRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(function () {
                Route::get('/ar/our-works', 'NewUiController')
                    ->name('new-ui.production.success-stories');

                Route::get('/ar/services/{service}', 'NewUiController')
                    ->where('service', 'dubbing|audiobooks|podcast|ivr')
                    ->name('new-ui.production.service');
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
            //->where(['lang' => implode('|', array_keys(languages()))])
            ->middleware('admin')
            ->namespace($this->namespace . '\\' . ADMIN_NAMESPACE)
            ->as(ADMIN_ROUTE . '.')
            ->group(base_path('routes/admin.php'));
    }

    private function mapAuthRoutes()
    {
        $locale = request()->segment(1);
        Route::prefix($locale)
            //->where(['lang' => implode('|', array_keys(languages()))])
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
            ->as(APP_ROUTE . '.')
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
