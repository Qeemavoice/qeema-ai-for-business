<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletLogs extends Model
{
    protected $guarded = [];

    public const WITHDRAWAL = 0;
    public const DEPOSIT = 1;

    public function wallet()
    {
        return $this->belongsTo(Wallet::class, 'wallet_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

}
