<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
//
//Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//    return $request->user();
//});

Route::prefix('v1')->group(function () {
    Route::get('voices', 'NewUiApiController@voices');
    Route::get('partners', 'NewUiApiController@partners');
    Route::get('stories', 'NewUiApiController@stories');
    Route::get('stories/{story:slug}', 'NewUiApiController@story');
    Route::get('articles', 'NewUiApiController@articles');
    Route::get('articles/{article}', 'NewUiApiController@article');
    Route::get('assistant/config', 'NewUiApiController@assistantConfig');
    Route::get('assistant/signed-url', 'NewUiApiController@assistantSignedUrl')
        ->middleware('throttle:10,1');
    Route::middleware('web')->group(function () {
        Route::get('tts/voices', 'NewUiApiController@ttsVoices')->middleware('throttle:20,1');
        Route::get('admin/tts/providers', 'NewUiApiController@ttsProviderSettings')->middleware('throttle:20,1');
        Route::post('admin/tts/providers', 'NewUiApiController@updateTtsProviderSettings')->middleware('throttle:10,1');
        Route::post('leads', 'NewUiApiController@storeLead')->middleware('throttle:10,1');
        Route::post('assistant/chat', 'NewUiApiController@assistantChat')->middleware('throttle:12,1');
        Route::post('tts/generate', 'NewUiApiController@ttsGenerate');
        Route::post('tts/analyze', 'NewUiApiController@ttsAnalyze')->middleware('throttle:8,1');
        Route::get('tts/history', 'NewUiApiController@ttsHistory')->middleware('throttle:30,1');
        Route::get('auth/csrf', 'NewUiApiController@csrf');
        Route::get('auth/me', 'NewUiApiController@me');
        Route::post('auth/login', 'NewUiApiController@login');
        Route::post('auth/register', 'NewUiApiController@register');
        Route::post('auth/logout', 'NewUiApiController@logout');
        Route::get('billing', 'NewUiApiController@billing');
        Route::get('credits/status', 'NewUiApiController@creditStatus');
        Route::post('credits/checkout', 'NewUiApiController@creditCheckout');
        Route::post('credits/confirm', 'NewUiApiController@creditConfirm');
    });
});
