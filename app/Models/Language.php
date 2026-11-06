<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Language extends Model
{
    use HasFactory, HasTranslations, HasTimestamps;

    public $translatable = ['name'];

    public $guarded = [];

    public static function getLanguages()
    {
        return Cache::remember('languages', CACHE_TTL, function () {
            return self::with('dialects')->get();
        });
    }

    public function dialects()
    {
        return $this->hasMany(Dialect::class, 'language_id');
    }
}
