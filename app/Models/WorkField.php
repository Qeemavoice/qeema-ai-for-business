<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class WorkField extends Model
{
    use HasTranslations, HasTimestamps;

    public $translatable = ['name'];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];


    public static function getAll()
    {
        return Cache::remember('workFields', CACHE_TTL, function () {
            return self::all();
        });
    }
}

