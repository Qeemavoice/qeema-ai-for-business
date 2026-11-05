<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory, HasTimestamps;

    protected $guarded = [];
    protected $appends = ['show_amount_paid', 'receipt_url'];
    public const DIR_FILES_UPLOAD = 'transactions';

    public function getShowAmountPaidAttribute()
    {
        $currency = $this->currency;
        if ($currency) {
            $currency = $currency->symbol;
        }
        return $currency . $this->amount_paid;
    }

    public function getReceiptUrlAttribute()
    {
        return $this->receipt ? asset_upload(self::DIR_FILES_UPLOAD . '/' . $this->receipt) : null;
    }

    public function status()
    {
        return $this->belongsTo(TransactionStatus::class, 'status_id');
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function methodable()
    {
        return $this->morphTo();
    }

//    public function paymentMethod()
//    {
//        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
//    }

    public function transactionType()
    {
        return $this->belongsTo(TransactionType::class, 'transaction_type_id');
    }

    public function payer()
    {
        return $this->belongsTo(User::class, 'payer_id');
    }

    public function payee()
    {
        return $this->belongsTo(User::class, 'payee_id');
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class, 'transaction_id');
    }
}
