<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class VoiceStatus extends Model
{
    use HasTranslations, HasTimestamps;

    public const DRAFT = 1;
    public const IN_REVIEW = 2;
    public const ACCEPTED = 3;
    public const REJECTED = 4;

    public $guarded = [];
    public $translatable = ['name'];


    public static function getStatuses()
    {
        return Cache::remember('voiceStatus', CACHE_TTL, function () {
            return self::select('id', 'name')->get();
        });
    }
}
