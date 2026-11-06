<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Category extends Model
{
    use HasFactory, HasTranslations, HasTimestamps, SoftDeletes;

    public $translatable = ['name'];
    protected $appends = ['slug'];
    public $guarded = [];

    public function getSlugAttribute()
    {
        return slugify($this->id . ' ' . $this->name);
    }

    public static function categories()
    {
        return Cache::remember('categories', CACHE_TTL, function () {
            return self::all();
        });
    }

}
