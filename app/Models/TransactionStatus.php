<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class TransactionStatus extends Model
{
    use HasTranslations, HasTimestamps;

        public const SUCCEEDED = 1;
    public const FAILED = 2;

    public $guarded = [];
    public $translatable = ['name'];

    public static function getRequestStatuses()
    {
        return Cache::remember('transactionStatuses', CACHE_TTL, function () {
            return self::select('id', 'name')->get();
        });
    }
}
