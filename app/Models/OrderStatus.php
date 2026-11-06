<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class OrderStatus extends Model
{
    use HasTranslations;

    public const DRAFTED = 1;
    public const PENDING = 2;
    public const ACCEPTED = 3;
    public const IN_PROGRESS = 4;
    public const COMPLETED = 5;
    public const REJECTED = 6;
    public const DISPUTED = 7;
    public const CANCELLATION_REQUEST = 8;
    public const CANCELED = 9;
   // public const UNDER_FEEDBACK = 10;

    public $guarded = [];
    public $translatable = ['name'];


    public static function getStatuses()
    {
        return Cache::remember('orderStatuses', CACHE_TTL, function () {
            return self::select('id', 'name')->get();
        });
    }
}
