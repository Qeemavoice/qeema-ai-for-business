<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        // «روّاد قيمة»: credits, plans, top-up and TTS (same rule as the canUseNewFeatures() helper)
        Gate::define('new-features', fn ($user = null) => \App\Services\RowadService::canUseNewFeatures($user));

//        Gate::define('viewWebSocketsDashboard', function ($user = null) {
//            return $user != null;
//        });
        //
    }
}
