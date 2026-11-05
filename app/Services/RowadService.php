<?php

namespace App\Services;

use App\Models\Invite;
use App\Models\User;
use App\Services\NewUi\Accounts;
use App\Services\NewUi\Store;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * «روّاد قيمة»: invite activation, the new-features gate and the Rowad price. Settings: config/rowad.php (Africa/Cairo).
 */
class RowadService
{
    // no 0/O, 1/I/L: codes are read and typed by people
    public const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    public const CODE_LENGTH = 10;
    public const COOKIE = 'qv_rowad_code';

    /** A config date (Africa/Cairo) as a Carbon instant */
    public static function at(string $key): Carbon
    {
        return Carbon::parse((string) config("rowad.$key"), config('rowad.timezone', 'Africa/Cairo'));
    }

    public static function code(): string
    {
        $alphabet = self::CODE_ALPHABET;
        $max = strlen($alphabet);
        $out = '';
        // rejection sampling on random_bytes: no modulo bias
        while (strlen($out) < self::CODE_LENGTH) {
            foreach (str_split(random_bytes(16)) as $byte) {
                $v = ord($byte);
                if ($v >= intdiv(256, $max) * $max) continue;
                $out .= $alphabet[$v % $max];
                if (strlen($out) === self::CODE_LENGTH) break;
            }
        }
        return $out;
    }

    public static function normalizeCode(?string $code): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) $code));
    }

    public static function link(string $code, string $source): string
    {
        return rtrim((string) config('rowad.site_url'), '/') . '/ar/early?' . http_build_query([
            'code' => $code, 'utm_source' => $source, 'utm_medium' => 'invite', 'utm_campaign' => 'rowad',
        ]);
    }

    // ---------- feature gate ----------
    public static function canUseNewFeatures(?User $user): bool
    {
        return ($user && $user->early_access) || now()->greaterThanOrEqualTo(self::at('public_launch_at'));
    }

    /** What the front end needs to show or hide the new features */
    public static function featuresFor(?User $user): array
    {
        return [
            'newFeatures' => self::canUseNewFeatures($user),
            'earlyAccess' => (bool) ($user->early_access ?? false),
            'rowadBadgeAt' => $user && $user->rowad_badge_at ? $user->rowad_badge_at->toIso8601String() : null,
            'rowadPriceUntil' => $user && $user->rowad_price_until ? $user->rowad_price_until->toIso8601String() : null,
            'rowadPriceActive' => $user ? self::rowadPriceActive($user) : false,
            'publicLaunchAt' => self::at('public_launch_at')->toIso8601String(),
            'earlyWindowEndsAt' => self::at('early_window_ends_at')->toIso8601String(),
        ];
    }

    // ---------- activation ----------
    /**
     * Activates the invite for $user. Returns ['status' => redeemed|already|used|expired|error].
     * Everything happens in one transaction with the invite row locked; any failure rolls everything back.
     */
    public static function redeem(User $user, Invite $invite): array
    {
        try {
            return DB::transaction(function () use ($user, $invite) {
                $inv = Invite::whereKey($invite->id)->lockForUpdate()->first();
                if (!$inv) return ['status' => 'invalid'];
                if ($inv->status === Invite::REDEEMED) {
                    return ['status' => (int) $inv->redeemed_by_user_id === (int) $user->id ? 'already' : 'used'];
                }
                if ($inv->isExpired()) {
                    $inv->update(['status' => Invite::EXPIRED]);
                    return ['status' => 'expired'];
                }

                $mismatch = $inv->email && mb_strtolower(trim($inv->email)) !== mb_strtolower(trim((string) $user->email));
                $inv->update(['status' => Invite::REDEEMED, 'redeemed_at' => now(), 'redeemed_by_user_id' => $user->id,
                    'email_mismatch' => $mismatch, 'opened_at' => $inv->opened_at ?: now()]);

                $u = User::whereKey($user->id)->lockForUpdate()->first();
                $u->early_access = true;
                if (!$u->rowad_badge_at) $u->rowad_badge_at = now();
                if (!$u->rowad_price_until) $u->rowad_price_until = now()->addMonths((int) config('rowad.rowad_price_months'));
                $u->save();

                $chars = (int) config('rowad.free_tts_chars');
                Accounts::addCredits($u->id, $u->id, $chars, 'early_access',
                    'هدية روّاد قيمة: ' . number_format($chars) . ' حرف TTS مجاناً', 'invite-' . $inv->id, [
                        'type' => 'grant', 'source' => 'early_access', 'idempotencyKey' => "early:{$u->id}",
                        'expiresAt' => now()->addDays((int) config('rowad.free_tts_valid_days')),
                        'meta' => ['inviteId' => $inv->id, 'campaign' => $inv->campaign],
                    ]);
                Store::audit('c' . $u->id, (string) $u->id, 'ROWAD_REDEEMED', ['inviteId' => $inv->id, 'emailMismatch' => $mismatch]);
                $user->forceFill($u->only(['early_access', 'rowad_badge_at', 'rowad_price_until']));
                return ['status' => 'redeemed'];
            });
        } catch (\Throwable $e) {
            Log::error('Rowad redeem failed', ['inviteId' => $invite->id, 'userId' => $user->id, 'error' => $e->getMessage()]);
            return ['status' => 'error'];
        }
    }

    /** The early-access grant of a user (remaining part, expiry) or null */
    public static function freeGrant(int $userId): ?array
    {
        $g = DB::table('qv_credit_transactions')->where('idempotency_key', "early:{$userId}")->first();
        if (!$g) return null;
        $remaining = $g->expires_at && Carbon::parse($g->expires_at)->isPast() ? 0 : (int) $g->remaining;
        return ['chars' => (int) $g->delta, 'remaining' => $remaining, 'used' => (int) $g->delta - (int) $g->remaining,
            'expiresAt' => $g->expires_at ? Carbon::parse($g->expires_at)->toIso8601String() : null];
    }

    // ---------- Rowad price ----------
    public static function rowadPriceActive(User $user): bool
    {
        return $user->rowad_badge_at !== null && now()->lessThanOrEqualTo(self::at('early_window_ends_at'));
    }

    public static function whiteFridayPct(): float
    {
        $wf = config('rowad.white_friday');
        $tz = config('rowad.timezone');
        if (empty($wf['discount_pct'])) return 0.0;
        $active = now()->between(Carbon::parse($wf['starts_at'], $tz), Carbon::parse($wf['ends_at'], $tz));
        return $active ? (float) $wf['discount_pct'] : 0.0;
    }

    /**
     * Price of a plan subscription for $user: a valid lock wins; otherwise the larger of the Rowad discount (only for
     * a Rowad member inside the early window, then locked until rowad_price_until) and the White Friday discount.
     * @return array{price: float, listPrice: float, offer: ?string, discountPct: float, lock: ?array}
     */
    public static function subscriptionPrice(User $user, array $plan, ?array $account = null): array
    {
        $list = (float) ($plan['priceUsd'] ?? 0);
        $out = ['price' => $list, 'listPrice' => $list, 'offer' => null, 'discountPct' => 0.0, 'lock' => null];
        if ($list <= 0) return $out;
        $acc = $account ?? (array) (DB::table('qv_client_accounts')->where('user_id', $user->id)->first() ?: []);
        if (($acc['locked_plan_id'] ?? null) === $plan['id'] && !empty($acc['locked_until']) && now()->lessThanOrEqualTo(Carbon::parse($acc['locked_until']))) {
            return array_merge($out, ['price' => (float) $acc['locked_price'], 'offer' => 'rowad_locked',
                'discountPct' => round((1 - (float) $acc['locked_price'] / $list) * 100, 2)]);
        }
        $rowad = self::rowadPriceActive($user) ? (float) config('rowad.rowad_discount_pct') : 0.0;
        $wf = self::whiteFridayPct();
        if ($rowad <= 0 && $wf <= 0) return $out;
        [$pct, $offer] = $rowad >= $wf ? [$rowad, 'rowad'] : [$wf, 'white_friday'];
        $price = round($list * (1 - $pct / 100), 2);
        $lock = $offer === 'rowad' ? ['plan_id' => $plan['id'], 'price' => $price, 'until' => $user->rowad_price_until] : null;
        return array_merge($out, ['price' => $price, 'offer' => $offer, 'discountPct' => $pct, 'lock' => $lock]);
    }

    /**
     * A top-up for $user: Rowad members inside the early window get extra characters (the higher top-up gift);
     * White Friday lowers the price. Never both: the larger benefit wins (a bonus of b% is worth b/(100+b) off).
     * @return array{price: float, listPrice: float, chars: int, bonusChars: int, offer: ?string}
     */
    public static function topupPrice(User $user, float $listPrice, int $chars): array
    {
        $out = ['price' => $listPrice, 'listPrice' => $listPrice, 'chars' => $chars, 'bonusChars' => 0, 'offer' => null];
        $bonusPct = self::rowadPriceActive($user) ? (float) config('rowad.rowad_topup_bonus_pct') : 0.0;
        $wf = self::whiteFridayPct();
        $bonusWorth = $bonusPct > 0 ? $bonusPct / (100 + $bonusPct) * 100 : 0.0;
        if ($bonusWorth <= 0 && $wf <= 0) return $out;
        if ($bonusWorth >= $wf) {
            $bonus = (int) round($chars * $bonusPct / 100);
            return array_merge($out, ['chars' => $chars + $bonus, 'bonusChars' => $bonus, 'offer' => 'rowad']);
        }
        return array_merge($out, ['price' => round($listPrice * (1 - $wf / 100), 2), 'offer' => 'white_friday']);
    }
}
