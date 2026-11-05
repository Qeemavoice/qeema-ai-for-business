<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** «روّاد قيمة» invitation (config/rowad.php). */
class Invite extends Model
{
    public const CREATED = 'created';
    public const SENT = 'sent';
    public const OPENED = 'opened';
    public const REDEEMED = 'redeemed';
    public const EXPIRED = 'expired';

    protected $guarded = [];

    protected $casts = [
        'email_mismatch' => 'boolean',
        'sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'redeemed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // never serialise the code into logs / JSON by accident
    protected $hidden = ['code'];

    public function isExpired(): bool
    {
        return $this->status === self::EXPIRED || ($this->expires_at && now()->greaterThan($this->expires_at));
    }

    /** Still usable: not redeemed and not expired */
    public function isValid(): bool
    {
        return $this->status !== self::REDEEMED && !$this->isExpired();
    }

    public function redeemedBy()
    {
        return $this->belongsTo(User::class, 'redeemed_by_user_id');
    }
}
