<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class PaymentStatus extends Model
{
    use HasFactory, HasTranslations;

    public $translatable = ['name'];

    public const UP_PAID = 1;
    public const PAID = 2;
    public const DEBIT = 3;
    public const CREDIT = 4;
    public const ARCHIVED = 5;
    public const PARTIALLY_PAID = 6;


    public static function getStatuses()
    {
        return Cache::remember('paymentStatuses', CACHE_TTL, function () {
            return self::select('id', 'name')->get();
        });
    }

}
