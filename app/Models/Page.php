<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Page extends Model
{
    use HasTranslations, HasTimestamps;

    public $translatable = ['title', 'content'];

    protected $guarded = [];

    public const PRIVACY_POLICY = 'privacy-policy';
    public const TERMS_OF_USE = 'terms-of-use';
    public const ABOUT_US = 'about-us';
    public const TRAINING = 'training';

    public static function pages()
    {
        return Cache::remember('pages', CACHE_TTL, function () {
            return self::all();
        });
    }
}
