<?php

use Illuminate\Support\Facades\Route;

/*
 | API of the new Qeema Voice UI (React site in new-ui/), prefix /api/v1.
 | Port of new-ui/server.ts + server/routes/*.ts on the Laravel/MySQL backend.
 | Auth: Bearer token (Sanctum, header Authorization) handled inside App\Services\NewUi\Accounts.
 */

Route::get('health', fn () => response()->json(['status' => 'ok', 'time' => now()->toIso8601String()]));

// ---- auth ----
Route::prefix('auth')->group(function () {
    Route::get('me', 'AuthController@me');
    Route::post('signup', 'AuthController@signup')->middleware('throttle:login');
    Route::post('login', 'AuthController@login')->middleware('throttle:login');
    Route::post('google', 'AuthController@google')->middleware('throttle:login');
    Route::post('forgot', 'AuthController@forgot')->middleware('throttle:password');
    Route::post('reset', 'AuthController@reset')->middleware('throttle:password');
    Route::post('claim', 'AuthController@claim');
    Route::post('logout', 'AuthController@logout');
    Route::middleware('qv.user')->group(function () {
        Route::get('favorites', 'AuthController@favoritesGet');
        Route::put('favorites', 'AuthController@favoritesPut');
    });
    Route::post('switch-company', 'AuthController@switchCompany')->middleware('qv.admin');
});

// ---- public (site pages, forms, lists) ----
Route::get('articles', 'PublicController@articles');
Route::get('guides', 'PublicController@guides');
Route::get('faqs', 'PublicController@faqs');
Route::get('jobs', 'PublicController@jobs');
Route::get('stories', 'PublicController@stories');
Route::get('pages/{key}', 'PublicController@page');
Route::get('page-texts', 'PublicController@pageTexts');
Route::get('site-lists', 'PublicController@siteLists');
Route::get('site-status', 'PublicController@siteStatus');
Route::get('voice-templates', 'PublicController@voiceTemplates');
Route::get('human-voices', 'PublicController@humanVoices');
Route::get('human-voices/{id}/reviews', 'PublicController@voiceReviews');
Route::post('contact', 'PublicController@contact');
Route::post('join', 'PublicController@join');
Route::post('newsletter', 'PublicController@newsletter');

// ---- TTS voices, previews, trial, stored audio ----
Route::get('voices', 'VoicesController@index');
Route::get('tts/munsit-voices', 'VoicesController@munsitVoices');
Route::get('voices/{id}/preview', 'VoicesController@preview');
Route::get('voices/{id}/file', 'VoicesController@file');
Route::get('voices/{id}', 'VoicesController@show');
Route::post('tts/trial', 'VoicesController@trial')->middleware('qv.features');
Route::get('storage/audio/{id}', 'VoicesController@audio');

// ---- «روّاد قيمة» invites ----
Route::middleware('qv.user')->group(function () {
    Route::post('early/redeem', 'EarlyAccessController@redeem')->middleware('throttle:rowad');
    Route::get('early/status', 'EarlyAccessController@status');
});

// ---- signed-in clients ----
Route::middleware('qv.user')->group(function () {
    // TTS studio: Rowad members now, everyone from config('rowad.public_launch_at')
    Route::middleware('qv.features')->group(function () {
        Route::post('generations', 'ClientController@generate');
        Route::get('generations', 'ClientController@generations');
        Route::get('generations/{id}', 'ClientController@generation');
        Route::delete('generations/{id}', 'ClientController@deleteGeneration');
    });
    // plans and top-up: open to every client (the Rowad price applies to members inside the early window)
    Route::get('credits', 'ClientController@credits');
    Route::post('credits/topup', 'ClientController@topup');
    Route::get('usage', 'ClientController@usage');
    Route::get('billing', 'ClientController@billing');
    Route::get('billing/offers', 'ClientController@offers');
    Route::post('billing/change-plan', 'ClientController@changePlan');
    Route::get('client/bookings', 'ClientController@bookings');
    Route::post('client/bookings/{id}/review', 'ClientController@review');
    Route::post('client/feedback', 'ClientController@feedback');
    Route::get('client/projects', 'ClientController@projects');
    Route::post('client/projects', 'ClientController@createProject');
    Route::delete('client/projects/{id}', 'ClientController@deleteProject');
    Route::get('client/team', 'ClientController@team');
    Route::post('client/team/invite', 'ClientController@invite');
});
Route::post('client/bookings', 'ClientController@book');          // guests may book too

// ---- narrators (talent dashboard + claim pages) ----
Route::prefix('narrators')->group(function () {
    Route::post('otp/send', 'NarratorController@otpSend');
    Route::post('otp/verify', 'NarratorController@otpVerify');
    Route::get('state', 'NarratorController@getState');
    Route::put('state', 'NarratorController@putState');
    Route::post('claim-link', 'NarratorController@claimLink');
    Route::post('manual-review', 'NarratorController@manualReview');
    Route::post('invite-all', 'NarratorController@inviteAll')->middleware('qv.admin');
    Route::post('{id}/invite', 'NarratorController@invite')->middleware('qv.admin');
    Route::post('{id}/requests', 'NarratorController@requests');
    Route::get('{id}/studio-voices', 'NarratorController@studioVoices');
    Route::get('{id}/earnings', 'NarratorController@earnings');
});

// ---- assistant widget ----
Route::get('assistant/config', 'AssistantController@config');
Route::get('assistant/signed-url', 'AssistantController@signedUrl');
Route::post('assistant/chat', 'AssistantController@chat')->middleware('throttle:assistant');

// ---- admin dashboard (platform staff only) ----
Route::prefix('admin')->middleware('qv.admin')->group(function () {
    Route::get('overview', 'AdminController@overview');
    Route::get('bookings', 'AdminController@bookings');
    Route::get('bookings/{id}', 'AdminController@bookingDetail');
    Route::post('bookings/{id}/status', 'AdminController@bookingStatus');
    Route::get('payouts', 'AdminController@payouts');
    Route::post('payouts/{talentId}/process', 'AdminController@processPayout');
    Route::post('voices/create', 'VoicesController@adminLegacyCreate');
    Route::post('voices/{id}/toggle', 'VoicesController@adminToggle');
    Route::post('voices/{id}/update', 'VoicesController@adminLegacyUpdate');
    Route::get('tts-voices', 'VoicesController@adminIndex');
    Route::post('tts-voices', 'VoicesController@adminCreate');
    Route::put('tts-voices/{id}', 'VoicesController@adminUpdate');
    Route::post('companies/{id}/update-plan', 'AdminController@updatePlan');
    Route::post('credits/grant', 'AdminController@grantCredits');
    Route::post('system/settings', 'AdminController@systemSettings');
    Route::get('customers', 'AdminController@customers');
    Route::get('customers/{id}', 'AdminController@customer');
    Route::post('customers/{id}/status', 'AdminController@customerStatus');
    Route::post('customers/{id}/notes', 'AdminController@customerNote');
    Route::get('narrator-earnings', 'AdminController@narratorEarnings');
    Route::get('generations', 'AdminController@generations');
    Route::get('settings', 'AdminController@settingsGet');
    Route::post('settings', 'AdminController@settingsPost');
    Route::get('reviews', 'AdminController@reviews');
    Route::post('reviews/{bookingId}', 'AdminController@reviewStatus');
    Route::get('collections/{name}', 'CollectionsController@index');
    Route::post('collections/{name}', 'CollectionsController@store');
    Route::put('collections/{name}/{id}', 'CollectionsController@update');
    Route::delete('collections/{name}/{id}', 'CollectionsController@destroy');
    // «روّاد قيمة» invites
    Route::get('rowad/invites', 'AdminController@rowadInvites');
    Route::post('rowad/invites/{id}/resend', 'AdminController@rowadResend');
    Route::post('rowad/invites/{id}/extend', 'AdminController@rowadExtend');
    Route::post('rowad/invites/{id}/cancel', 'AdminController@rowadCancel');
});
