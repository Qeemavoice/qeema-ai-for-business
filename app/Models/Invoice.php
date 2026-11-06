<?php

namespace App\Models;

use App\Services\CurrencyHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Invoice extends Model
{
    use HasFactory;

    public const ORDER = 1;
    public const CREDITOR = 2; //إلى الزبون
    public const DEBTOR = 3; //من الزبون


    protected $appends = [
        'show_id', 'show_due_value'
    ];

    protected $guarded = [];

    public function getShowDueValueAttribute($data)
    {
        return CurrencyHelper::getSymbol() . $this->due_value;
    }

    public function getShowIdAttribute($data)
    {
        return get_invoice_number($this->id);
    }

    public function getCreatedAtAttribute($data)
    {
        return Carbon::parse($data)->format(DATE_DMY_FORMAT);
    }

//    public function transaction()
//    {
//        return $this->hasOne(Transaction::class, 'invoice_id');
//    }

    public function paymentStatus()
    {
        return $this->belongsTo(PaymentStatus::class, 'payment_status_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function details()
    {
        return $this->hasMany(InvoiceDetails::class, 'invoice_id');
    }
}
