<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Models\Invite;
use App\Services\NewUi\Accounts;
use App\Services\RowadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;

/**
 * «روّاد قيمة» invite links: GET /ar/early?code=… and /ar/early/welcome (pages of the new UI, noindex),
 * plus the token API used by the new UI after its own sign-in (/api/v1/early/*).
 *
 * The code is moved from the URL into the session and an HttpOnly cookie, then the browser is sent to /ar/early
 * without it (UTM parameters kept), so it stays out of the history and of Referer headers.
 */
class EarlyAccessController extends Controller
{
    public function show(Request $request)
    {
        $fromUrl = RowadService::normalizeCode($request->query('code'));
        if ($fromUrl !== '') {
            $request->session()->put('rowad_code', $fromUrl);
            Cookie::queue(Cookie::make(RowadService::COOKIE, $fromUrl, 60 * 24 * 14, '/', null, $request->isSecure(), true, false, 'Lax'));
            $utm = array_filter($request->only(['utm_source', 'utm_medium', 'utm_campaign']));
            return redirect('/ar/early' . ($utm ? '?' . http_build_query($utm) : ''));
        }

        $code = RowadService::normalizeCode($request->session()->get('rowad_code') ?: $request->cookie(RowadService::COOKIE));
        if ($code === '') return $this->page($request, 'invalid');
        $invite = Invite::where('code', $code)->first();
        if (!$invite) return $this->forget($this->page($request, 'invalid'), $request);

        // A client signed in on the old site (session). Staff sessions of the old back office never count:
        // an admin browsing the link must not take the client's invite.
        $webUser = Auth::guard('web')->user();
        if ($webUser && (Accounts::isAdmin($webUser) || !in_array((int) $webUser->user_type_id, [\App\Models\UserType::CLIENT, \App\Models\UserType::CLIENT_ADN_VOICE_ACTOR], true))) $webUser = null;
        if ($invite->status === Invite::REDEEMED) {
            if ($webUser && (int) $invite->redeemed_by_user_id === (int) $webUser->id) return redirect('/ar/early/welcome');
            if ($webUser) return $this->forget($this->page($request, 'used'), $request);
            return $this->page($request, 'login');   // the new UI checks with its token (same account → welcome, other → used)
        }
        if ($invite->isExpired()) {
            if ($invite->status !== Invite::EXPIRED) $invite->update(['status' => Invite::EXPIRED]);
            return $this->forget($this->page($request, 'expired'), $request);
        }
        if (in_array($invite->status, [Invite::CREATED, Invite::SENT], true)) {
            $invite->update(['status' => Invite::OPENED, 'opened_at' => $invite->opened_at ?: now()]);
        }
        if ($webUser) {
            $r = RowadService::redeem($webUser, $invite)['status'];
            if (in_array($r, ['redeemed', 'already'], true)) return $this->forget(redirect('/ar/early/welcome'), $request);
            return $this->page($request, $r === 'error' ? 'error' : $r);
        }
        return $this->page($request, 'login', 200, ['invitedName' => (string) $invite->name]);
    }

    public function welcome(Request $request)
    {
        return $this->page($request, 'welcome');
    }

    /** The SPA page with the server's verdict in window.__QV_EARLY, never indexed */
    public function page(Request $request, string $state, int $status = 200, array $extra = [])
    {
        $resp = app(SpaController::class)($request);
        $data = array_merge([
            'state' => $state,
            'whatsapp' => (string) config('rowad.whatsapp_support'),
            'publicLaunchAt' => RowadService::at('public_launch_at')->toIso8601String(),
            'freeChars' => (int) config('rowad.free_tts_chars'),
        ], $extra);
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
        $html = str_replace('</head>', "<meta name=\"robots\" content=\"noindex, nofollow\" />\n<script>window.__QV_EARLY={$json};</script>\n</head>", $resp->getContent());
        return response($html, $status)->header('Content-Type', 'text/html; charset=utf-8')
            ->header('Cache-Control', 'no-store')->header('X-Robots-Tag', 'noindex, nofollow')->header('Referrer-Policy', 'no-referrer');
    }

    private function forget($response, Request $request)
    {
        $request->session()->forget('rowad_code');
        Cookie::queue(Cookie::forget(RowadService::COOKIE));
        return $response;
    }

    // ---------- token API of the new UI ----------
    /** POST /api/v1/early/redeem: activates the invite saved by /ar/early (cookie) or given as «code» */
    public function redeem(Request $request)
    {
        $user = Accounts::currentUser($request);
        $code = RowadService::normalizeCode($request->input('code') ?: $request->cookie(RowadService::COOKIE));
        $invite = $code !== '' ? Invite::where('code', $code)->first() : null;
        if (!$invite) return response()->json(['status' => 'invalid', 'error' => 'رابط الدعوة غير صالح'], 404);
        $status = RowadService::redeem($user, $invite)['status'];
        if (!in_array($status, ['error', 'staff'], true)) Cookie::queue(Cookie::forget(RowadService::COOKIE));
        $http = ['redeemed' => 200, 'already' => 200, 'used' => 409, 'expired' => 410, 'invalid' => 404, 'staff' => 403][$status] ?? 500;
        return response()->json(['status' => $status] + $this->statusPayload($user->fresh()), $http);
    }

    /** GET /api/v1/early/status: badge, free grant and features of the signed-in user */
    public function status(Request $request)
    {
        return response()->json($this->statusPayload(Accounts::currentUser($request)));
    }

    private function statusPayload($user): array
    {
        return ['features' => RowadService::featuresFor($user), 'freeGrant' => RowadService::freeGrant($user->id),
            'balanceCredits' => Accounts::balance($user->id)];
    }
}
