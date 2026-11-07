<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URL'),
    ],

    'elevenlabs' => [
        'api_key' => env('ELEVENLABS_API_KEY'),
        'agent_id' => env('ELEVENLABS_AGENT_ID'),
        'environment' => env('ELEVENLABS_ENVIRONMENT', 'production'),
        'base_url' => env('ELEVENLABS_BASE_URL', 'https://api.elevenlabs.io'),
        'tts_model' => env('ELEVENLABS_TTS_MODEL', 'eleven_multilingual_v2'),
        'tts_output_format' => env('ELEVENLABS_TTS_OUTPUT_FORMAT', 'mp3_44100_128'),
        'tts_timeout' => (int) env('ELEVENLABS_TTS_TIMEOUT', 45),
        'tts_max_chars' => (int) env('ELEVENLABS_TTS_MAX_CHARS', 2000),
    ],

    'munsit' => [
        'api_key' => env('MUNSIT_API_KEY'),
        'base_url' => env('MUNSIT_BASE_URL', 'https://api.munsit.com/api/v1'),
        'model' => env('MUNSIT_TTS_MODEL', 'faseeh-v1-preview'),
        'timeout' => (int) env('MUNSIT_TIMEOUT', 60),
    ],

    'tts' => [
        'default_provider' => env('TTS_DEFAULT_PROVIDER', 'munsit'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-3.1-flash-lite'),
        'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
        'timeout' => (int) env('GEMINI_TIMEOUT', 15),
        'guest_daily_limit' => (int) env('GEMINI_GUEST_DAILY_LIMIT', 5),
        'user_daily_limit' => (int) env('GEMINI_USER_DAILY_LIMIT', 20),
        'global_daily_limit' => (int) env('GEMINI_GLOBAL_DAILY_LIMIT', 500),
    ],

    'zeptomail' => [
        'api_key' => env('ZEPTO_API_KEY'),
        'bounce_address' => env('ZEPTO_BOUNCE'),
        'from_address' => env('ZEPTO_FROM_ADDRESS'),
        'from_name' => env('ZEPTO_FROM_NAME'),
    ],

    'recaptcha' => [
        'key' => env('RECAPTCHA_SITE_KEY'),
        'secret' => env('RECAPTCHA_SECRET')
    ],

    'payments_enabled' => env('PAYMENTS_ENABLED', env('APP_ENV') === 'production'),

    // New UI: top-ups and plan changes add credit with no charge (no payment gateway yet), so only admins may use them
    // unless this is switched on (tests). Turn it off for good once the gateway charges first.
    'newui_grant_without_payment' => (bool) env('NEWUI_GRANT_WITHOUT_PAYMENT', false),

    // New UI admin dashboard: a private address (not linked anywhere public). Only admins are told it (auth/me)
    // and only that page carries it in its config. Set NEWUI_ADMIN_PATH on each server, e.g. ar/qv-control-xxxxxxxx
    'newui_admin_path' => trim((string) env('NEWUI_ADMIN_PATH', 'ar/admin'), '/'),


];
