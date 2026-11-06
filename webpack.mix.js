const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app/app.js', 'public/js/app')
    .js('resources/js/app/auth.js', 'public/js/app')
    .js('resources/js/admin/admin.js', 'public/js/admin')
    .js('resources/js/admin/auth.js', 'public/js/admin')
    .vue();

