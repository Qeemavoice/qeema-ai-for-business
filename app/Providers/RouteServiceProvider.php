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

            // New React UI (new-ui/): its API and pages come before the old app routes so they win for the same paths
            $this->mapNewUiRoutes();

            $this->mapAppRoutes();

            $this->mapWebRoutes();

            $this->mapAdminRoutes();

            // Registered again last: for an identical static path Laravel keeps the LAST route registered
            // (e.g. /sitemap.xml, /ar/careers exist in the old files too) while the matching position stays the early one.
            // The replaced old route's name is kept on the new route (same URL), so the old views' route('app.home.index') etc. still work.
            $key = fn ($r) => implode('|', $r->methods()) . ' ' . $r->uri();
            $oldNames = [];
            foreach (Route::getRoutes()->getRoutes() as $r) if ($r->getName()) $oldNames[$key($r)] = $r->getName();
            $this->mapNewUiRoutes();
            foreach (Route::getRoutes()->getRoutes() as $r) {
                if (!$r->getName() && isset($oldNames[$key($r)])) $r->name($oldNames[$key($r)]);
            }
            Route::getRoutes()->refreshNameLookups();
        });
    }

    private function mapNewUiRoutes()
    {
        Route::prefix('api/v1')
            // AddQueuedCookiesToResponse: lets the Rowad listener clear the qv_rowad_code cookie after a token sign-in
            ->middleware(['throttle:600,1', \Illuminate\Routing\Middleware\SubstituteBindings::class, \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class])
            ->namespace($this->namespace . '\\NewUi')
            ->group(base_path('routes/newui_api.php'));

        Route::middleware('web')
            ->namespace($this->namespace . '\\NewUi')
            ->group(base_path('routes/newui.php'));
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

        // «روّاد قيمة»: invite links (/ar/early and the redeem API), per IP per hour (config/rowad.php)
        // «نسيت كلمة المرور؟» / new password: its own counter per IP (plain throttle:x,y shares one counter with the API's 600/min)
        RateLimiter::for('password', fn (Request $request) => Limit::perMinute(10)->by('password|' . $request->ip())
            ->response(fn () => response()->json(['error' => 'محاولات كثيرة، حاول بعد دقيقة'], 429)));

        // sign-in / sign-up: 10 attempts a minute per IP (stops password guessing)
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(10)->by('login|' . $request->ip())
            ->response(fn () => response()->json(['error' => 'محاولات دخول كثيرة، حاول بعد دقيقة'], 429)));
        // assistant chat: 20 messages a minute per IP (each one may call the AI model)
        RateLimiter::for('assistant', fn (Request $request) => Limit::perMinute(20)->by('assistant|' . $request->ip())
            ->response(fn () => response()->json(['error' => 'رسائل كثيرة، حاول بعد دقيقة'], 429)));

        RateLimiter::for('rowad', function (Request $request) {
            // only attempts that carry a code count (the redirect to the clean /ar/early does not)
            if ($request->isMethod('GET') && !$request->filled('code')) return Limit::none();
            return Limit::perHour((int) config('rowad.redeem_rate_limit', 10))->by('rowad|' . $request->ip())
                ->response(fn () => $request->expectsJson()
                    ? response()->json(['error' => 'محاولات كثيرة، حاول بعد ساعة'], 429)
                    : app(\App\Http\Controllers\NewUi\EarlyAccessController::class)->page($request, 'rate_limited', 429));
        });
    }
}
