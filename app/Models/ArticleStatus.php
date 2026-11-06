<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class ArticleStatus extends Model
{
    use HasTranslations, HasTimestamps;

    public const DRAFT = 1;
    public const PUBLISHED = 2;
    public const UN_PUBLISHED = 3;
    public const SCHEDULED = 4;

    public $guarded = [];
    public $translatable = ['name'];


    public static function getStatuses()
    {
        return Cache::remember('articleStatus', CACHE_TTL, function () {
            return self::select('id', 'name')->get();
        });
    }
}
