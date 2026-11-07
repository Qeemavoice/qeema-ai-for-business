<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserType;
use App\Services\NewUi\Accounts;
use App\Services\NewUi\Store;
use App\Listeners\RedeemRowadInvite;
use App\Services\RowadService;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/** /api/v1/auth/* of the new UI (port of new-ui/server/routes/auth.ts) on the existing users table. */
class AuthController extends Controller
{
    private const EMAIL_RE = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';

    public function me(Request $r)
    {
        $user = Accounts::currentUser($r);
        if (!$user) return response()->json(['error' => 'يلزم تسجيل الدخول'], 401);
        $ctx = Accounts::context($r);
        $available = Accounts::isAdmin($user)
            ? Accounts::clientUsers()->map(fn ($u) => Accounts::company($u))->values()->all()
            : [$ctx['company']];
        return response()->json([
            'user' => Accounts::publicUser($user), 'company' => $ctx['company'],
            'balanceCredits' => $ctx['balance'], 'availableCompanies' => $available,
            'features' => RowadService::featuresFor($user),
        ]);
    }

    public function signup(Request $r)
    {
        $name = mb_substr(trim((string) $r->input('name', '')), 0, 120);
        $email = mb_substr(trim((string) $r->input('email', '')), 0, 160);
        $password = (string) $r->input('password', '');
        $type = $r->input('accountType') === 'talent' ? 'talent' : 'client';
        if (!$name) return response()->json(['error' => 'اكتب الاسم الكامل'], 400);
        if (!preg_match(self::EMAIL_RE, $email)) return response()->json(['error' => 'البريد الإلكتروني غير صحيح'], 400);
        if (mb_strlen($password) < 8) return response()->json(['error' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'], 400);
        // narrators give a WhatsApp number with the country code (+9665XXXXXXXX), kept in the old `mobile` column
        $whatsapp = preg_replace('/[^\d+]/', '', (string) $r->input('whatsapp', ''));
        if ($type === 'talent' && !preg_match('/^\+\d{1,4}[1-9]\d{5,13}$/', $whatsapp)) return response()->json(['error' => 'اكتب رقم الواتساب صحيحاً مع مقدمة الدولة'], 400);
        if (Accounts::findByEmail($email)) return response()->json(['error' => 'هذا البريد مسجّل مسبقاً، سجّل الدخول بدلاً من ذلك'], 409);
        $user = Accounts::createAccount($name, $email, $password, $type);
        if ($type === 'talent') $user->forceFill(['mobile' => $whatsapp])->save();
        $company = trim((string) $r->input('company', ''));
        if ($company) Accounts::saveAccount($user, ['industry' => 'Corporate Business']);
        event(new Registered($user));   // «روّاد قيمة»: activates an invite opened before signing up
        return $this->signedIn($user);
    }

    public function login(Request $r)
    {
        $user = Accounts::findByEmail((string) $r->input('email', ''));
        if (!$user || !Hash::check((string) $r->input('password', ''), $user->password)) {
            return response()->json(['error' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة. إذا كنت تدخل عادةً عبر Google أو نسيت كلمة المرور، اضغط «نسيت كلمة المرور؟».'], 401);
        }
        if ((int) $user->status_id === \App\Models\UserStatus::BLOCKED) return response()->json(['error' => 'هذا الحساب موقوف'], 403);
        event(new Login('new-ui', $user, false));
        return $this->signedIn($user);
    }

    /** «نسيت كلمة المرور؟»: emails a link to /ar/reset-password (Laravel reset token, valid 60 minutes). Same answer whether or not the email exists. */
    public function forgot(Request $r)
    {
        $email = trim((string) $r->input('email', ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return response()->json(['error' => 'اكتب بريداً إلكترونياً صحيحاً'], 400);
        $user = Accounts::findByEmail($email);
        if ($user && (int) $user->status_id !== \App\Models\UserStatus::BLOCKED) {
            $token = \Illuminate\Support\Facades\Password::broker()->createToken($user);
            $site = rtrim((string) (config('rowad.site_url') ?: config('app.url')), '/');
            $link = $site . '/ar/reset-password?' . http_build_query(['token' => $token, 'email' => $user->email]);
            \App\Services\NewUi\Mailer::trySend($user->email, 'تعيين كلمة مرور جديدة لحسابك في قيمة فويس',
                "مرحباً،\n\nوصلنا طلب لتعيين كلمة مرور جديدة لحسابك في قيمة فويس.\nاضغط الرابط التالي واختر كلمة المرور الجديدة (صالح لمدة ساعة):\n\n{$link}\n\nإذا لم تطلب ذلك فتجاهل هذه الرسالة، ولن يتغير شيء في حسابك.\n\nفريق قيمة فويس");
        }
        return response()->json(['success' => true, 'message' => 'إذا كان هذا البريد مسجلاً لدينا فستصلك خلال دقائق رسالة فيها رابط لتعيين كلمة مرور جديدة.']);
    }

    /** New password from the emailed link; signs the user in */
    public function reset(Request $r)
    {
        $user = Accounts::findByEmail((string) $r->input('email', ''));
        $token = (string) $r->input('token', '');
        $password = (string) $r->input('password', '');
        if (mb_strlen($password) < 8) return response()->json(['error' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'], 400);
        $broker = \Illuminate\Support\Facades\Password::broker();
        if (!$user || $token === '' || !$broker->tokenExists($user, $token)) {
            return response()->json(['error' => 'رابط تعيين كلمة المرور غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً من «نسيت كلمة المرور؟».'], 400);
        }
        if ((int) $user->status_id === \App\Models\UserStatus::BLOCKED) return response()->json(['error' => 'هذا الحساب موقوف'], 403);
        $user->forceFill(['password' => Hash::make($password)])->save();
        $broker->deleteToken($user);
        event(new Login('new-ui', $user, false));
        return $this->signedIn($user);
    }

    public function google(Request $r)
    {
        $g = Accounts::googleProfile((string) $r->input('accessToken', ''));
        if (!$g) return response()->json(['error' => 'تعذر التحقق من حساب Google'], 401);
        $user = Accounts::findByEmail($g['email']);
        if ($user) {
            event(new Login('new-ui', $user, false));
        } else {
            $user = Accounts::createAccount($g['name'] ?? explode('@', $g['email'])[0], $g['email'], null, $r->input('accountType') === 'talent' ? 'talent' : 'client');
            event(new Registered($user));
        }
        return $this->signedIn($user);
    }

    /** Invited narrator finishing the claim link: creates (or links) the talent account for that narrator */
    public function claim(Request $r)
    {
        $token = (string) $r->input('claimToken', '');
        $state = NarratorController::state();
        $narrator = null;
        foreach ($state['narrators'] as $n) if (($n['claimToken'] ?? '') === $token && $token !== '') { $narrator = $n; break; }
        if (!$narrator) return response()->json(['error' => 'رابط التفعيل غير صالح'], 404);
        if (!empty($narrator['claimTokenExpiresAt']) && strtotime($narrator['claimTokenExpiresAt']) < time()) return response()->json(['error' => 'انتهت صلاحية رابط التفعيل'], 410);
        if (!NarratorController::claimVerified($token)) return response()->json(['error' => 'أكّد رمز التحقق المرسل إلى بريدك أولاً'], 403);

        $email = (string) ($narrator['email'] ?? '');
        $name = (string) ($narrator['displayName'] ?? '');
        $password = (string) $r->input('password', '');
        if ($r->filled('googleAccessToken')) {
            $g = Accounts::googleProfile((string) $r->input('googleAccessToken'));
            if (!$g) return response()->json(['error' => 'تعذر التحقق من حساب Google'], 401);
            $email = $g['email'];
            $name = $name ?: ($g['name'] ?? '');
        } elseif (mb_strlen($password) < 8) {
            return response()->json(['error' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'], 400);
        }
        if (!$email) return response()->json(['error' => 'لا يوجد بريد مسجّل لهذا المعلق'], 400);

        $existing = Accounts::findByEmail($email);
        $linked = $existing ? Accounts::narratorId($existing) : null;
        if ($existing && $linked && $linked !== $narrator['id']) return response()->json(['error' => 'هذا البريد مرتبط بمعلق آخر'], 409);
        $user = $existing ?: Accounts::createAccount($name, $email, $password ?: null, 'talent');
        if ($existing) {
            // Narrators of the old site already have a users row: the verified e-mail code proves ownership,
            // so the password chosen on the claim page becomes the account password and the account is activated.
            if ($password !== '') $existing->password = Hash::make($password);
            if ((int) $existing->user_type_id === UserType::CLIENT) $existing->user_type_id = UserType::CLIENT_ADN_VOICE_ACTOR;
            if ((int) $existing->status_id !== \App\Models\UserStatus::BLOCKED) $existing->status_id = \App\Models\UserStatus::ACCEPTED;
            $existing->save();
        }
        Accounts::linkNarrator($user, $narrator['id']);
        NarratorController::activateClaimed($narrator['id'], $token);
        return response()->json(['token' => Accounts::issueToken($user), 'user' => Accounts::publicUser($user)]);
    }

    /** Token answer of every sign-in; rowadInvite = result of the invite activated by this sign-in, if any */
    private function signedIn(User $user)
    {
        $user->refresh();
        $invite = RedeemRowadInvite::$lastStatus;
        RedeemRowadInvite::$lastStatus = null;
        return response()->json(['token' => Accounts::issueToken($user), 'user' => Accounts::publicUser($user),
            'features' => RowadService::featuresFor($user), 'rowadInvite' => $invite]);
    }

    public function logout(Request $r)
    {
        Accounts::revokeToken($r);
        \Illuminate\Support\Facades\Cookie::queue(\Illuminate\Support\Facades\Cookie::forget(RowadService::COOKIE));   // a pending invite never passes to the next account
        return response()->json(['success' => true]);
    }

    /** Change the signed-in account's password: needs the current one (accounts made with Google may have none yet). */
    public function changePassword(Request $r)
    {
        $u = Accounts::currentUser($r);
        $current = (string) $r->input('currentPassword', '');
        $new = (string) $r->input('newPassword', '');
        if ($u->password && !Hash::check($current, $u->password)) return response()->json(['error' => 'كلمة المرور الحالية غير صحيحة'], 400);
        if (mb_strlen($new) < 8) return response()->json(['error' => 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'], 400);
        if ($new === $current) return response()->json(['error' => 'اختر كلمة مرور مختلفة عن الحالية'], 400);
        $u->forceFill(['password' => Hash::make($new)])->save();
        return response()->json(['ok' => true]);
    }

    public function favoritesGet(Request $r)
    {
        $u = Accounts::currentUser($r);
        return response()->json(['ids' => Accounts::account($u)['savedVoiceIds']]);
    }

    public function favoritesPut(Request $r)
    {
        $u = Accounts::currentUser($r);
        $ids = $r->input('ids');
        if (!is_array($ids)) return response()->json(['error' => 'قائمة غير صالحة'], 400);
        $ids = array_values(array_unique(array_slice(array_filter($ids, fn ($x) => is_string($x) && mb_strlen($x) <= 120), 0, 500)));
        Accounts::saveAccount($u, ['savedVoiceIds' => $ids]);
        return response()->json(['ids' => $ids]);
    }

    /** Admin: open a client's workspace */
    public function switchCompany(Request $r)
    {
        $uid = Accounts::userIdOfCompany((string) $r->input('companyId', ''));
        $target = $uid ? User::find($uid) : null;
        if (!$target) return response()->json(['error' => 'الشركة غير موجودة'], 404);
        return response()->json(['user' => Accounts::publicUser($target), 'company' => Accounts::company($target), 'balanceCredits' => Accounts::balance($target->id)]);
    }
}
