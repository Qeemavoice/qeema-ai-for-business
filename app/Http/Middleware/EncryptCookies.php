<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;

class EncryptCookies extends Middleware
{
    /**
     * The names of the cookies that should not be encrypted.
     *
     * @var array<int, string>
     */
    protected $except = [
        // «روّاد قيمة» invite code: read by the token API (/api/v1/auth/*), which does not decrypt cookies. HttpOnly.
        'qv_rowad_code',
    ];
}
