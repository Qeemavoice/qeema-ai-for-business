<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class OrderType extends Model
{
    use HasTranslations;

    public const BOOKING_VOICE = 1;
    public const BUY_GUIDE = 2;

    public $guarded = [];
    public $translatable = ['name'];

    public static function getOrderTypes()
    {
        return Cache::remember('orderTypes', CACHE_TTL, function () {
            return self::select('id', 'name')->get();
        });
    }
}
