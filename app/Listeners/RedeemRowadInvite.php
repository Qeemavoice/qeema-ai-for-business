<?php

namespace App\Listeners;

use App\Models\Invite;
use App\Models\User;
use App\Services\RowadService;
use Illuminate\Support\Facades\Cookie;

/**
 * After a sign-in or a new account: activates the «روّاد قيمة» invite the visitor opened on /ar/early.
 * The code comes from the session (old site, web login) or from the qv_rowad_code cookie (new UI: token sign-in
 * through /api/v1/auth/*, which has no session).
 */
class RedeemRowadInvite
{
    /** Result of the last activation in this request (read by the API to tell the front end) */
    public static ?string $lastStatus = null;

    public function handle($event): void
    {
        $user = $event->user ?? null;
        if (!$user instanceof User) return;
        $request = request();
        $code = null;
        if ($request->hasSession()) $code = $request->session()->get('rowad_code');
        $code = RowadService::normalizeCode($code ?: $request->cookie(RowadService::COOKIE));
        if ($code === '') return;

        $invite = Invite::where('code', $code)->first();
        if (!$invite) return;
        self::$lastStatus = RowadService::redeem($user, $invite)['status'];
        if (in_array(self::$lastStatus, ['redeemed', 'already', 'used', 'expired'], true)) {
            if ($request->hasSession()) $request->session()->forget('rowad_code');
            Cookie::queue(Cookie::forget(RowadService::COOKIE));
        }
    }
}
