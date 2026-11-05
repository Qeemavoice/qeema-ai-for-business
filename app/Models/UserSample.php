<?php


namespace App\Models;

use App\Services\CurrencyHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class UserSample extends Model
{
    use HasTimestamps, HasTranslations, SoftDeletes;


    public $translatable = ['name'];

    protected $guarded = [];

    public const DIR_SAMPLES_UPLOADS = 'samples';

    public $appends = ['audio_file_url', 'show_price_per_minute', 'show_total_price'];

    public function setTotalPriceAttribute($value)
    {
        $this->attributes['total_price'] = $this->price_per_minute + platformCommission($this->price_per_minute);
    }

    public function getAudioFileUrlAttribute()
    {
        return isset($this->audio_file) ? asset_upload(self::DIR_SAMPLES_UPLOADS . '/' . $this->audio_file) : '';
    }

    public function getShowPricePerMinuteAttribute()
    {
        return CurrencyHelper::getSymbol() . $this->price_per_minute;
    }

    public function getShowTotalPriceAttribute()
    {
        return CurrencyHelper::getSymbol() . $this->total_price;
    }

    public function dialect()
    {
        return $this->belongsTo(Dialect::class, 'dialect_id');
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'language_id');
    }

    public function category()
    {
        return $this->hasOne(VoiceCategory::class, 'voice_id');
    }
}
