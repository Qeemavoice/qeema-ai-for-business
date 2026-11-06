<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasTimestamps;
    protected $guarded = [];
    protected $appends = ['all_profits'];

    public const DIR_WALLET_UPLOADS = 'wallets';

    public function getBalanceAttribute($value)
    {
        return $value > 0 ? $value : (is_null($value) ? 0 : $value);
    }

    public function getRequestProfitAttribute($value)
    {
        //return $value > 0 ? $value : (is_null($value) ? 0 : $value);
        return $value > 0 ? $value : 0;
    }

    public function getWithdrawalProfitsAttribute($value)
    {
        return $value > 0 ? $value : 0;
    }

    public function getAllProfitsAttribute()
    {
        return $this->profits + $this->hold_profits;
    }

    public function getHoldProfitsAttribute($value)
    {
        return $value > 0 ? $value : 0;
    }

    public function getProfitsAttribute($value)
    {
        return $value > 0 ? $value : 0;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function logs()
    {
        return $this->hasMany(WalletLogs::class, 'wallet_id');
    }
}
