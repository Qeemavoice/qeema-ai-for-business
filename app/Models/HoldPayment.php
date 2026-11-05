<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HoldPayment extends Model
{
    protected $guarded = [];

    public const HOLD = 0;
    public const RELEASED = 1;
    public const REFUNDED = 2;

    public function getStatusAttribute($value)
    {
        return $value == self::HOLD ? trans('app.hold') : trans('app.release');
    }

    public function getValueAttribute($value)
    {
        return $value > 0 ? $value : 0;
    }


    public function subWallet()
    {
        return $this->morphOne(WalletLogs::class, 'subWalletable');
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class, 'wallet_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }
}
