<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Dialect extends Model
{
    use HasFactory, HasTranslations, HasTimestamps;

    public $translatable = ['name'];

    public $guarded = [];

    public function Language()
    {
        return $this->belongsTo(Language::class);
    }

    public static function dialects()
    {
        return Cache::remember('dialects', CACHE_TTL, function () {
            return self::all();
        });
    }
}
