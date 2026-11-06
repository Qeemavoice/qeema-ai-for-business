<?php

namespace App\Models;

use App\Http\Resources\AdminPanel\Currency\CurrencyResource;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Currency extends Model
{
    use HasFactory, HasTranslations, HasTimestamps;

    public $translatable = ['name'];

    public const AMERICAN_DOLLAR = 1;
    public const SAUDI_RIYAL = 2;

    public static function getCurrencies()
    {
        return Cache::remember('currencies', CACHE_TTL, function () {
            return CurrencyResource::collection(self::select('id', 'name', 'symbol', 'iso')->get());
        });
    }

}
