<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Partner extends Model
{
    use HasTranslations, HasTimestamps;

    public const DIR_PARTNERS_UPLOADS = 'partners';

    public $translatable = ['full_name', 'description', 'alt', 'job_title'];

    protected $guarded = [];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image ? asset_upload(self::DIR_PARTNERS_UPLOADS . '/' . $this->image) : null;
    }


    public static function getPartners($limit = null)
    {
        return Cache::remember('partners-homepage', CACHE_TTL, function () use ($limit) {
            $query = self::query()
                ->where('show_on_homepage', true)
                ->where('permission_confirmed', true)
                ->whereNotNull('reference_url')
                ->where('reference_url', '!=', '')
                ->oldest();

            if (!is_null($limit)) {
                $query->limit($limit);
            }

            return $query->get();
        });
    }

}
