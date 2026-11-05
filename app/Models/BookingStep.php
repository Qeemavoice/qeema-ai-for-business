<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class BookingStep extends Model
{
    use HasTranslations, SoftDeletes, HasTimestamps;

    public $translatable = ['title'];

    public $appends = ['image_url'];

    public const DIR_BOOKING_STEPS_UPLOADS = 'booking_steps';

    public $guarded = [];

    public function getImageUrlAttribute()
    {
        return $this->image ? asset_upload(self::DIR_BOOKING_STEPS_UPLOADS . '/' . $this->image) : null;
    }
}
