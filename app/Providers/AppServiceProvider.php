<?php

namespace App\Providers;

use App\Models\Page;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{

    public function register()
    {

    }

    public function boot()
    {
        if (config('app.force_https')) {
            URL::forceScheme('https');
        }

        Paginator::useBootstrap();

        Validator::extend('match_old_password', function ($attribute, $value, $old_password) {
            return Hash::check($value, $old_password[0]);
        });

        view()->composer(['admin_panel.layouts.includes.sidebar'], function ($view) {
            $pages = Page::pages();
            $view->with('pages', $pages);
        });

        view()->composer('*', function ($view) {
            $view->with('slugCategories', slugRouteCategories());
            $view->with('slugVoices', slugRouteVoices());
            $view->with('slugBookingSteps', slugRouteBookingSteps());
            $view->with('slugBlogs', slugRouteBlogs());
            $view->with('slugOurWorks', slugRouteOurWorks());
            $view->with('slugContactUs', slugRouteContactUs());
            $view->with('slugFaq', slugRouteFaq());
        });
    }
}
