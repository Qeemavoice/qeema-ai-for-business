# دعوات «روّاد قيمة»

Early access to credits, plans and TTS for previous human-booking clients. Branch `feature/rowad-invites`.
All dates are `Africa/Cairo`; every value is in `config/rowad.php` (dates can also come from `.env`: `ROWAD_*`).

## Deploy
```bash
php artisan migrate                 # invites table, users columns, ledger columns, subscription lock columns
php artisan config:clear
# the scheduler must run every minute (daily ExpireTtsCredits at 03:00 Cairo):
* * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1
```

## Invites
```bash
php artisan rowad:generate-invites storage/app/rowad_clients.csv   # [--force] → storage/app/rowad_invites_export.csv
php artisan rowad:send-invites                                      # e-mails every «created» invite, marks it «sent» (19 Nov)
```
Input CSV: `client_id,name,email,phone` (client_id or email). Sample: `database/seeders/data/rowad_clients.sample.csv`.
Codes: 10 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (`random_bytes`, no 0/O/1/I/L). They go to the export file only.

## Flow
1. `GET /ar/early?code=…` (rate limited: `redeem_rate_limit` per hour per IP) stores the code in the session and an HttpOnly
   cookie `qv_rowad_code`, then redirects to `/ar/early` without the code (UTM kept): no code in the history or Referer.
2. The page is the React site with the server verdict (`window.__QV_EARLY`): invalid / used / expired (status → expired) / login.
3. Signed in on the new site (token) → `POST /api/v1/early/redeem`; signed in on the old site (session) → redeemed on the server.
   Guest → login or sign-up; the `Login` / `Registered` listener (`RedeemRowadInvite`) activates the invite right after.
4. `RowadService::redeem()`: one transaction, invite row locked; `early_access`, `rowad_badge_at`, `rowad_price_until`;
   5,000 characters with `idempotency_key = early:{user_id}`, expiring after 30 days. Any failure rolls everything back.

## Credits ledger
The existing ledger `qv_credit_transactions` got `type, remaining, source, expires_at, idempotency_key, meta, reminded_at`
(instead of a second ledger). Balance = sum of entries minus the unspent part of lapsed batches (`Accounts::balance`).
Spending takes from the batch that expires soonest. `ExpireTtsCredits` closes lapsed batches with an `expire` entry and
e-mails a reminder 7 days before expiry.

## Feature gate
`canUseNewFeatures($user)` (helper), `Gate::allows('new-features')`, middleware `qv.features` on the TTS studio APIs
(generations, TTS trial; 403 JSON `redirect: /ar/waitlist`). The React site hides the TTS links and sends the TTS pages to
`/ar/waitlist`. Opens for everyone at `public_launch_at` without a deploy.
Plans, top-up and credits are open to every client (decision 2026-11-05); `GET /api/v1/billing/offers` returns what the
account pays per plan (Rowad price / top-up gift / White Friday), shown in the top-up window and the plans tab.

## Rowad price
- Subscription: `rowad_discount_pct` off, stored on `qv_client_accounts.locked_plan_id / locked_price / locked_until`
  (= `rowad_price_until`) and reused on every renewal of that plan until then. New subscriptions after
  `early_window_ends_at` pay the list price.
- Top-up: management decision «هدية شحن أعلى» → `rowad_topup_bonus_pct` extra characters on that top-up only.
- White Friday (`white_friday.discount_pct`, 0 = off) is never combined: the larger benefit wins
  (a bonus of b% is compared as b/(100+b)% off).
- There is no payment gateway yet: the price is recorded in the ledger `meta` (`priceUsd`, `listPriceUsd`, `offer`).

## Admin
«المستخدمين ← دعوات روّاد قيمة»: filters, search (e-mail / code / name), email mismatch, resend, extend, cancel
(cancel = expired now), sent / opened / redeemed, free characters used, purchases at the Rowad price and their value.

## Tests
`vendor/bin/phpunit --filter RowadInvitesTest` (SQLite in memory): the 11 acceptance cases + SEO + the generator.
Test environments: `php artisan rowad:seed-demo` → `storage/app/rowad_demo_accounts.csv` (one account per case).

## Still to settle (config only)
- `rowad_discount_pct`, `rowad_topup_bonus_pct`, `rowad_price_months` (⚠️ temporary values)
- `white_friday.discount_pct` if White Friday lowers prices
