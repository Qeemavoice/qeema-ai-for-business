<?php

use Illuminate\Support\Facades\Route;

Route::group(['prefix' => ADMIN_PREFIX, 'as' => ADMIN_ROUTE . '.', 'middleware' => 'admin_language'], function () {
    Route::get('auth', 'AdminLoginController@showLoginForm')->name('login');
    Route::post('auth', 'AdminLoginController@login')->name('do_login');
    Route::any('logout', 'AdminLoginController@logout')->name('logout');

//   Route::post('password/email', 'ForgotPasswordController@sendResetLinkEmail')->name('password.do_email');
//   Route::get('password/reset', 'ResetPasswordController@showResetForm')->name('password.reset');
//   Route::post('password/reset', 'ResetPasswordController@reset')->name('password.do_reset');
});


Route::post('register', 'RegisterController@register')->name('do_register');
Route::post('login', 'LoginController@login')->name('do_login');
Route::any('logout', 'LoginController@logout')->name('logout');

Route::get('password/email', 'ForgotPasswordController@showForgotForm')->name('password.email');
Route::post('password/email', 'ForgotPasswordController@sendResetLinkEmail')->name('password.do_email');
Route::get('password/reset', 'ResetPasswordController@showResetForm')->name('password.reset');
Route::post('password/reset', 'ResetPasswordController@reset')->name('password.do_reset');

Route::get('auth/{service}', 'SocialiteController@redirectToProvider')
    ->where('service', 'google')
    ->name('socialite.auth');
Route::get('auth/{service}/callback', 'SocialiteController@handleProviderCallback')
    ->where('service', 'google')
    ->name('socialite.callback');
Route::post('authenticate', 'AuthController@authenticate')->name('broadcast.authenticate');
