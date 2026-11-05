<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Work extends Model
{
    use HasTranslations, HasTimestamps, SoftDeletes;

    public $translatable = ['title'];

    protected $guarded = [];

    public static function getWorks($limit = null)
    {
        return Cache::remember('works', CACHE_TTL, function () use ($limit) {
            if (!is_null($limit)) {
                $data = self::oldest()->limit($limit)->get();
            } else {
                $data = self::all();
            }
            return $data;
        });
    }
}
