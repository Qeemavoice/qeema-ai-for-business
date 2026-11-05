<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class VoiceType extends Model
{
    use HasTranslations, HasTimestamps;

    public $translatable = ['name'];

    protected $guarded = [];

    public const VOICE_TYPE_CHILD = 1;
    public const VOICE_TYPE_MAN = 2;
    public const VOICE_TYPE_WOMEN = 3;

    public static function getTypes()
    {
        return Cache::remember('voiceTypes', CACHE_TTL, function () {
            return self::all();
        });
    }
}
