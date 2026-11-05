<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class RequestStatus extends Model
{
    use HasTranslations, HasTimestamps;

    public const PENDING = 1;
    public const ACCEPTED = 2;
    public const IN_PROGRESS = 3;
    public const REJECTED = 4;
    public const CANCELED = 5;

    public $guarded = [];
    public $translatable = ['name'];

    public static function getRequestStatuses()
    {
        return Cache::remember('requestStatuses', CACHE_TTL, function () {
            return self::select('id', 'name')->get();
        });
    }
}
