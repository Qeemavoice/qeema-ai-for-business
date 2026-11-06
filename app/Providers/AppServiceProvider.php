<?php

namespace App\Providers;

use App\Models\Page;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{

    public function register()
    {

    }

    public function boot()
    {
        Paginator::useBootstrap();

        Validator::extend('match_old_password', function ($attribute, $value, $old_password) {
            return Hash::check($value, $old_password[0]);
        });

        view()->composer(['admin_panel.layouts.includes.sidebar'], function ($view) {
            $pages = Page::pages();
            $view->with('pages', $pages);
        });

        view()->composer('*', function ($view) {
            $view->with('slugCategories', config('slugroute.slug_categories'));
            $view->with('slugVoices', config('slugroute.slug_voices'));
            $view->with('slugBookingSteps', config('slugroute.slug_booking_steps'));
            $view->with('slugBlogs', config('slugroute.slug_blogs'));
            $view->with('slugOurWorks', config('slugroute.slug_our_works'));
            $view->with('slugContactUs', config('slugroute.slug_contact_us'));
            $view->with('slugFaq', config('slugroute.slug_faq'));
        });
    }
}
