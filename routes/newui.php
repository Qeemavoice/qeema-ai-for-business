<?php

use Illuminate\Support\Facades\Route;

/*
 | Pages of the new Qeema Voice UI (React site in new-ui/, built into public/new-ui).
 | Registered BEFORE routes/app.php so these paths are served by the new site; every old Laravel page
 | the new UI does not replace (old client/voice-actor dashboards, chat, admin panel at /ar/dashboard/...)
 | keeps working as before.
 */

Route::get('sitemap.xml', 'SitemapController@sitemap');
Route::get('robots.txt', 'SitemapController@robots');

// Old URLs that carried SEO value: permanent redirects to their new page
Route::permanentRedirect('/ar/careers', '/ar/jobs');
Route::permanentRedirect('/ar/booking', '/ar/voices');   // target of the old /booking/... rules in public/.htaccess
Route::permanentRedirect('/ar/voice-templates', '/ar/voice-models');
Route::get('/ar/voices/{slug}', fn () => redirect('/ar/voices', 301))->where('slug', '.+');
Route::get('/ar/categories/{slug}', fn () => redirect('/ar/categories', 301))->where('slug', '.+');
Route::get('/ar/blogs/{slug}', fn () => redirect('/ar/blogs', 301))->where('slug', '^(?!details/).+');
Route::get('/ar/contact-us/{slug}', fn () => redirect('/ar/contact-us', 301))->where('slug', '.+');
Route::get('/ar/faqs/{slug}', fn () => redirect('/ar/faqs', 301))->where('slug', '.+');
Route::get('/ar/booking-steps/{slug}', fn () => redirect('/ar/booking-steps', 301))->where('slug', '.+');
Route::get('/ar/jobs/details/{slug}', fn () => redirect('/ar/jobs', 301))->where('slug', '.+');
Route::get('/ar/our-works/{slug}', function ($slug) {
    // the old list page had one fixed slug; story ids of the new site pass through to the SPA
    return $slug === config('slugroute.slug_our_works') ? redirect('/ar/our-works', 301) : app(\App\Http\Controllers\NewUi\SpaController::class)(request());
})->where('slug', '.+');
Route::get('/ar/services/{slug}', function ($slug) {
    return $slug === 'dubbing' ? app(\App\Http\Controllers\NewUi\SpaController::class)(request()) : redirect('/ar/voice-models/' . $slug, 301);
});

// «روّاد قيمة» invite links (noindex, not in the sitemap)
Route::get('/ar/early', 'EarlyAccessController@show')->middleware('throttle:rowad');
Route::get('/ar/early/welcome', 'EarlyAccessController@welcome');

// Blog article: a duplicate copy goes to its original (config/seo.php), the rest is the React page
Route::get('/ar/blogs/details/{slug}', function ($slug) {
    $to = config('seo.duplicate_article_redirects')[(int) $slug] ?? null;
    $a = $to ? \App\Models\Article::find($to) : null;
    return $a ? redirect('/ar/blogs/details/' . \App\Http\Controllers\NewUi\PublicController::articleSlug($a), 301)
        : app(\App\Http\Controllers\NewUi\SpaController::class)(request());
})->where('slug', '.+');

// Pages of the new site (the React router renders them)
$spa = [
    '/', '/ar', '/ar/voices', '/ar/voice-models', '/ar/voice-models/{slug}', '/ar/text-to-speech', '/ar/pricing',
    '/ar/our-works', '/ar/blogs', '/ar/guides', '/ar/guides/{slug}', '/ar/jobs',
    '/ar/categories', '/ar/booking-steps', '/ar/booking/{slug}', '/ar/faqs', '/ar/contact-us',
    '/ar/p/about-us', '/ar/p/terms-of-use', '/ar/p/privacy-policy', '/ar/p/revisions-policy',
    '/ar/saudi-voice-over', '/ar/emirati-voice-over', '/ar/egyptian-voice-over', '/ar/generate', '/ar/chatbot',
    '/ar/account', '/ar/talent-dashboard', '/ar/talent-profile', '/ar/talent-earnings', '/ar/talent-samples',
    '/ar/talent-voices', '/ar/talent-settings', '/ar/claim', '/claim/{token}', '/ar/waitlist', '/ar/reset-password',
    '/narrator/dashboard', '/narrator/profile', '/narrator/earnings', '/narrator/settings',
];
foreach ($spa as $path) {
    Route::get($path, 'SpaController')->where('slug', '.+');
}
// the admin dashboard, at its private address (config/services.php «newui_admin_path»)
Route::get('/' . config('services.newui_admin_path'), 'SpaController');
