<?php

namespace App\Models;

use App\Services\CurrencyHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes, HasTimestamps;

    protected $appends = [
        'hash_id',
        'show_id',
        'show_payment_method',
        'show_date_created',
        'show_list_of_price',
        'show_payment_method_value',
        'show_discount_value',
        'show_total',
    ];

    protected $guarded = [];

    public function getShowTotalAttribute($data)
    {
        $value = $this->total > 0 ? $this->total : 0;
        return CurrencyHelper::getSymbol() . $value;
    }

    public function getShowDiscountValueAttribute($data)
    {
        $value = $this->discount_value > 0 ? $this->discount_value : 0;
        return CurrencyHelper::getSymbol() . $value;
    }

    public function getShowPaymentMethodValueAttribute($data)
    {
        $value = $this->payment_method_value > 0 ? $this->payment_method_value : 0;

        return CurrencyHelper::getSymbol() . $value;
    }

    public function getShowDateCreatedAttribute($data)
    {
        return Carbon::parse($this->created_at)->toDateString();
    }

    public function getShowPaymentMethodAttribute($data)
    {
        $method = PaymentMethod::getPaymentMethods()->where('id', $this->payment_method_id)->first();
        return isset($method) ? $method->name : null;
    }

    public function getHashIdAttribute($data)
    {
        return uniqid() . 'ORD' . base64_encode($this->id);
    }

    public function getShowListOfPriceAttribute($data)
    {
        return json_decode($this->list_of_price);
    }

    public function getShowIdAttribute($data)
    {
        return get_order_number($this->id);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function voiceActor()
    {
        return $this->belongsTo(User::class, 'voice_actor_id');
    }

    public function status()
    {
        return $this->belongsTo(OrderStatus::class, 'status_id');
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class, 'coupon_id');
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_id');
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function type()
    {
        return $this->belongsTo(OrderType::class, 'order_type_id');
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class, 'order_id')->orderBy('id', 'desc');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'order_id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'invoice_id');
    }

//    public function item()
//    {
//        return $this->hasOne(OrderItem::class, 'order_id');
//    }

    public function voiceItem()
    {
        return $this->hasOne(OrderItem::class, 'order_id')->latest();
    }

    public function servicesItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id')->where('itemable_type', '!=', Voice::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

}
