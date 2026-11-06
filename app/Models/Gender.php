<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Gender extends Model
{
    use HasTranslations;

    public $translatable = ['name'];
    protected $guarded = [];

    public const MALE = MALE;
    public const FEMALE = FEMALE;

    public static function getGenders()
    {
        return Cache::remember('genders', CACHE_TTL, function () {
            return self::all();
        });
    }
}
