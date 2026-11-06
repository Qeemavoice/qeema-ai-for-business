<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Customer extends Model
{
    use HasFactory, HasTranslations, HasTimestamps;

    public $translatable = ['name','alt'];

    public const DIR_CUSTOMER_UPLOADS = 'customers';

    protected $appends = ['image_url'];

    public $guarded = [];


    public function getImageUrlAttribute()
    {
        return $this->image ? asset_upload(self::DIR_CUSTOMER_UPLOADS . '/' . $this->image) : null;
    }


    public static function getCustomers($limit = null)
    {
        return Cache::remember('customers', CACHE_TTL, function () use ($limit) {
            if (!is_null($limit)) {
                $data = self::latest()->limit($limit)->get();
            } else {
                $data = self::all();
            }
            return $data;
        });
    }
}
