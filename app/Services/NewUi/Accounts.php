<?php

namespace App\Services\NewUi;

use App\Models\Role;
use App\Models\User;
use App\Models\UserStatus;
use App\Models\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Accounts of the new UI on top of the existing `users` table.
 *  - Sign-in tokens: Sanctum personal access tokens (Bearer), 30 days.
 *  - Client workspace ("company") = the client's own users row; plan, projects, team and favourites in qv_client_accounts.
 *  - Platform admin: users.role_id = administration, users.user_type_id = admin, or an active row in «إدارة المشرفين».
 *  - Narrator: users of type voice actor (narrator id "narrator_u{id}") or an account that claimed an invitation.
 */
class Accounts
{
    public const TOKEN_DAYS = 30;
    private static $current = false;

    // ---------- current user ----------
    public static function currentUser(?Request $request = null): ?User
    {
        if (self::$current !== false) return self::$current;
        $request = $request ?: request();
        $plain = $request->bearerToken();
        if (!$plain) return self::$current = null;
        $token = PersonalAccessToken::findToken($plain);
        if (!$token || $token->name !== 'new-ui') return self::$current = null;
        if ($token->created_at && $token->created_at->lt(now()->subDays(self::TOKEN_DAYS))) { $token->delete(); return self::$current = null; }
        $user = $token->tokenable;
        return self::$current = ($user instanceof User ? $user : null);
    }

    public static function issueToken(User $user): string
    {
        return $user->createToken('new-ui')->plainTextToken;
    }

    public static function revokeToken(?Request $request = null): void
    {
        $plain = ($request ?: request())->bearerToken();
        if ($plain && ($t = PersonalAccessToken::findToken($plain))) $t->delete();
    }

    // ---------- roles ----------
    public static function isAdmin(?User $u): bool
    {
        if (!$u) return false;
        if ((int) $u->role_id === (int) Role::ADMINISTRATION || (int) $u->user_type_id === UserType::ADMIN) return true;
        foreach (Store::list('admins') as $a) {
            if (($a['status'] ?? '') === 'active' && (string) ($a['userId'] ?? '') === (string) $u->id) return true;
        }
        return false;
    }

    public static function narratorId(?User $u): ?string
    {
        if (!$u) return null;
        $links = Store::get('narratorLinks', []) ?: [];
        if (!empty($links[(string) $u->id])) return $links[(string) $u->id];
        return in_array((int) $u->user_type_id, [UserType::VOICE_ACTOR, UserType::CLIENT_ADN_VOICE_ACTOR], true) ? 'narrator_u' . $u->id : null;
    }

    public static function linkNarrator(User $u, string $narratorId): void
    {
        $links = Store::get('narratorLinks', []) ?: [];
        $links[(string) $u->id] = $narratorId;
        Store::set('narratorLinks', $links);
    }

    /** User as the front end expects it (never the password) */
    public static function publicUser(User $u): array
    {
        $narratorId = self::narratorId($u);
        return [
            'id' => (string) $u->id,
            'email' => (string) $u->email,
            'name' => self::name($u),
            'companyId' => self::companyId($u),
            'role' => 'admin',
            'createdAt' => Store::iso(Store::created($u, 'created_at')),
            'avatar' => $u->image ? $u->image_url : null,
            'accountType' => $narratorId && (int) $u->user_type_id !== UserType::CLIENT ? 'talent' : 'client',
            'isPlatformAdmin' => self::isAdmin($u),
            'narratorId' => $narratorId,
            'savedVoiceIds' => self::account($u)['savedVoiceIds'],
        ];
    }

    public static function name(User $u): string
    {
        $n = $u->getTranslation('full_name', 'ar', false) ?: $u->getTranslation('full_name', 'en', false);
        if (!$n && is_string($u->getAttributes()['full_name'] ?? null)) {
            $raw = $u->getAttributes()['full_name'];
            $decoded = json_decode($raw, true);
            $n = is_array($decoded) ? (reset($decoded) ?: '') : $raw;
        }
        return (string) ($n ?: explode('@', (string) $u->email)[0]);
    }

    public static function findByEmail(string $email): ?User
    {
        return User::whereRaw('LOWER(email) = ?', [mb_strtolower(trim($email))])->orderBy('id')->first();
    }

    /** New account on the old `users` table; clients receive the welcome credits. */
    public static function createAccount(string $name, string $email, ?string $password, string $accountType = 'client', array $extra = []): User
    {
        $u = User::create(array_merge([
            'full_name' => ['ar' => $name, 'en' => $name],
            'email' => mb_strtolower(trim($email)),
            'password' => Hash::make($password ?: Str::random(24)),
            'user_type_id' => $accountType === 'talent' ? UserType::VOICE_ACTOR : UserType::CLIENT,
            'status_id' => UserStatus::ACCEPTED,
            'uniq_id' => Str::random(12),
            'email_verified_at' => now(),
            // rating columns of users have no default (strict SQL mode would refuse the insert otherwise)
            'client_rating_count' => 0, 'client_average_rating' => 0, 'voice_actor_rating_count' => 0, 'voice_actor_average_rating' => 0,
        ], $extra));
        if ($accountType === 'client') {
            self::addCredits($u->id, $u->id, Plans::SIGNUP_BONUS_CREDITS, 'signup_bonus',
                'رصيد ترحيبي مجاني (' . number_format(Plans::SIGNUP_BONUS_CREDITS) . ' حرف)');
        }
        return $u;
    }

    // ---------- client workspace ("company") ----------
    public static function companyId(User $u): string
    {
        return 'c' . $u->id;
    }

    public static function userIdOfCompany(string $companyId): ?int
    {
        return preg_match('/^c(\d+)$/', $companyId, $m) ? (int) $m[1] : null;
    }

    public static function account(User $u): array
    {
        $r = DB::table('qv_client_accounts')->where('user_id', $u->id)->first();
        $j = fn ($v, $d) => $v ? (json_decode($v, true) ?: $d) : $d;
        return [
            'planId' => $r->plan_id ?? Plans::DEFAULT_PLAN_ID,
            'status' => $r->status ?? 'active',
            'industry' => $r->industry ?? 'Corporate Business',
            'country' => $r->country ?? 'المملكة العربية السعودية',
            'notes' => $j($r->notes ?? null, []),
            'projects' => $j($r->projects ?? null, []),
            'teamInvites' => $j($r->team_invites ?? null, []),
            'savedVoiceIds' => $j($r->saved_voice_ids ?? null, []),
        ];
    }

    public static function saveAccount(User $u, array $patch): void
    {
        $cols = [];
        foreach (['planId' => 'plan_id', 'status' => 'status', 'industry' => 'industry', 'country' => 'country'] as $k => $c) {
            if (array_key_exists($k, $patch)) $cols[$c] = $patch[$k];
        }
        foreach (['notes' => 'notes', 'projects' => 'projects', 'teamInvites' => 'team_invites', 'savedVoiceIds' => 'saved_voice_ids'] as $k => $c) {
            if (array_key_exists($k, $patch)) $cols[$c] = json_encode($patch[$k], JSON_UNESCAPED_UNICODE);
        }
        $cols['updated_at'] = now();
        if (!DB::table('qv_client_accounts')->where('user_id', $u->id)->exists()) {
            $cols['user_id'] = $u->id;
            $cols['created_at'] = now();
            DB::table('qv_client_accounts')->insert($cols);
        } else {
            DB::table('qv_client_accounts')->where('user_id', $u->id)->update($cols);
        }
    }

    /** The company object of the new UI for a client user */
    public static function company(User $u): array
    {
        $a = self::account($u);
        return [
            'id' => self::companyId($u),
            'name' => self::name($u),
            'industry' => $a['industry'],
            'country' => $a['country'],
            'createdAt' => Store::iso(Store::created($u, 'created_at')),
            'planId' => $a['planId'],
            'status' => $a['status'],
            'contactEmail' => (string) $u->email,
            'phone' => (string) ($u->mobile ?? ''),
            'notes' => $a['notes'],
            'projects' => $a['projects'],
            'teamInvites' => $a['teamInvites'],
        ];
    }

    /** All client workspaces (admin lists) */
    public static function clientUsers()
    {
        return User::whereIn('user_type_id', [UserType::CLIENT, UserType::CLIENT_ADN_VOICE_ACTOR])->orderByDesc('id')->get();
    }

    /** Who this request acts for: the signed-in client, or (admins only) the company given in x-company-id */
    public static function context(Request $request): array
    {
        $user = self::currentUser($request);
        if (!$user) throw new \Illuminate\Http\Exceptions\HttpResponseException(response()->json(['error' => 'يلزم تسجيل الدخول'], 401));
        $asked = (string) $request->header('x-company-id', '');
        $target = $user;
        if ($asked && self::isAdmin($user) && ($uid = self::userIdOfCompany($asked)) && ($t = User::find($uid))) $target = $t;
        return ['user' => $user, 'companyUser' => $target, 'company' => self::company($target), 'balance' => self::balance($target->id)];
    }

    // ---------- credits ledger ----------
    public static function balance(int $userId): int
    {
        $last = DB::table('qv_credit_transactions')->where('user_id', $userId)->orderByDesc('created_at')->orderByDesc('id')->value('balance_after');
        return (int) ($last ?? 0);
    }

    public static function addCredits(int $userId, ?int $actorId, int $amount, string $reason, string $description, ?string $referenceId = null): int
    {
        return DB::transaction(function () use ($userId, $actorId, $amount, $reason, $description, $referenceId) {
            $new = self::balance($userId) + $amount;
            DB::table('qv_credit_transactions')->insert([
                'id' => (string) Str::uuid(), 'user_id' => $userId, 'actor_user_id' => $actorId, 'delta' => $amount, 'balance_after' => $new,
                'reason' => $reason, 'reference_id' => $referenceId, 'description' => $description, 'created_at' => now(),
            ]);
            Store::audit('c' . $userId, (string) ($actorId ?? 'system'), "GRANT_CREDITS: +{$amount}", ['reason' => $reason, 'newBalance' => $new]);
            return $new;
        });
    }

    public static function deductCredits(int $userId, ?int $actorId, int $amount, string $referenceId, string $description): bool
    {
        return DB::transaction(function () use ($userId, $actorId, $amount, $referenceId, $description) {
            $cur = self::balance($userId);
            if ($cur < $amount) return false;
            DB::table('qv_credit_transactions')->insert([
                'id' => (string) Str::uuid(), 'user_id' => $userId, 'actor_user_id' => $actorId, 'delta' => -$amount, 'balance_after' => $cur - $amount,
                'reason' => 'generation', 'reference_id' => $referenceId, 'description' => $description, 'created_at' => now(),
            ]);
            return true;
        });
    }

    public static function transactions(int $userId): array
    {
        return DB::table('qv_credit_transactions')->where('user_id', $userId)->orderByDesc('created_at')->get()->map(fn ($t) => [
            'id' => $t->id, 'companyId' => 'c' . $t->user_id, 'userId' => (string) $t->actor_user_id, 'delta' => (int) $t->delta,
            'balanceAfter' => (int) $t->balance_after, 'reason' => $t->reason, 'referenceId' => $t->reference_id,
            'description' => $t->description, 'createdAt' => Store::iso(Store::created($t, 'created_at')),
        ])->all();
    }

    /** Verifies a Google access token with Google itself; returns the profile or null */
    public static function googleProfile(string $accessToken): ?array
    {
        if (!$accessToken) return null;
        try {
            $r = \Illuminate\Support\Facades\Http::withToken($accessToken)->timeout(15)->get('https://www.googleapis.com/oauth2/v3/userinfo');
            if (!$r->successful()) return null;
            $g = $r->json();
            return !empty($g['email']) && ($g['email_verified'] ?? true) !== false ? $g : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
