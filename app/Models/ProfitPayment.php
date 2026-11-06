<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfitPayment extends Model
{
    protected $guarded = [];

    public const DEPOSIT = 0;
    public const WITHDRAW = 1;

    public const DIR_FILES_UPLOAD = 'profits';

    public function getStatusAttribute($value)
    {
        return $value == self::DEPOSIT ? trans_app('deposit') : trans_app('withdraw');
    }

    public function getValueAttribute($value)
    {
        return $value > 0 ? $value : 0;
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
