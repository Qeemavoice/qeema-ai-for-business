<?php

/*
 | «روّاد قيمة»: early access to credits, plans and TTS for previous human-booking clients.
 | Every date is Africa/Cairo time (see App\Services\RowadService::at()).
 | ⚠️ marks values the management has not settled yet: change them here, no code change needed.
 */
return [
    'timezone'               => 'Africa/Cairo',
    'campaign'               => 'rowad_2026',

    'invite_expires_at'      => env('ROWAD_INVITE_EXPIRES_AT', '2026-11-23 23:59:59'),
    'early_window_ends_at'   => env('ROWAD_EARLY_WINDOW_ENDS_AT', '2026-11-26 23:59:59'), // last moment for the Rowad price
    'public_launch_at'       => env('ROWAD_PUBLIC_LAUNCH_AT', '2026-11-27 00:00:00'),     // features open to everyone

    'free_tts_chars'         => 5000,
    'free_tts_valid_days'    => 30,
    'reminder_days_before'   => 7,      // expiry reminder e-mail

    // Rowad price. Management decision: «هدية شحن أعلى» → top-ups get extra characters instead of a lower price.
    'rowad_discount_pct'     => 20,     // ⚠️ discount on a plan subscription, locked for rowad_price_months
    'rowad_topup_bonus_pct'  => 20,     // ⚠️ extra characters added to a top-up (the higher top-up gift)
    'rowad_price_months'     => 12,     // ⚠️

    // White Friday: never combined with the Rowad price, the larger benefit wins
    'white_friday' => [
        'discount_pct' => env('WHITE_FRIDAY_DISCOUNT_PCT', 0), // ⚠️ 0 = no White Friday discount in the price
        'starts_at'    => env('WHITE_FRIDAY_STARTS_AT', '2026-11-20 00:00:00'),
        'ends_at'      => env('WHITE_FRIDAY_ENDS_AT', '2026-11-30 23:59:59'),
    ],

    'redeem_rate_limit'      => (int) env('ROWAD_REDEEM_RATE_LIMIT', 10), // attempts per hour per IP on /ar/early
    'site_url'               => env('ROWAD_SITE_URL', 'https://qeemavoice.com'),
    'whatsapp_support'       => env('ROWAD_WHATSAPP', 'https://wa.me/96893822649'), // support WhatsApp (+968 9382 2649)
];
