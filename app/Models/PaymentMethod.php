<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class PaymentMethod extends Model
{
    use SoftDeletes, HasTimestamps, HasTranslations;

    protected $guarded = [];
    public $translatable = ['name'];

    public const STRIPE = 1;
    public const BANK_TRANSFER = 2;
    public const PAYPAL = 3;
    public const CASH = 4;

    public function getConfigAttribute($data)
    {
        return json_decode($data);
    }

    public function getSandboxConfigAttribute($data)
    {
        return json_decode($data);
    }


    public static function getPaymentMethods()
    {
        return Cache::remember('paymentMethods', CACHE_TTL, function () {
            return self::where('is_active', YES)->get();
        });
    }

    public static function getPaymentMethodsAll()
    {
        return Cache::remember('paymentMethodsAll', CACHE_TTL, function () {
            return self::all();
        });
    }

    public function transactions()
    {
        return $this->morphMany(Transaction::class, 'methodable');
    }
}
