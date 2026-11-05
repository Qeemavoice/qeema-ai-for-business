<?php

namespace App\Models;

use App\Services\CurrencyHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class Voice extends Model
{
    use HasTranslations, HasTimestamps, SoftDeletes;

    public $translatable = ['title', 'meta_title', 'meta_description'];

    public const DIR_VOICES_UPLOADS = 'voices';

    protected $guarded = [];

    public $appends = ['audio_file_url', 'show_id', 'slug', 'show_price_per_minute', 'show_total_price'];


    public function setTotalPriceAttribute($value)
    {
        $this->attributes['total_price'] = $this->price_per_minute + platformCommission($this->price_per_minute);
    }

    public function scopeWithWhereHas($query, $relation, $constraint)
    {
        return $query->whereHas($relation, $constraint)->with([$relation => $constraint]);
    }

    public function getAudioFileUrlAttribute()
    {
        return isset($this->audio_file) ? asset_upload(self::DIR_VOICES_UPLOADS . '/' . $this->audio_file) : '';
    }

    public function getTotalPriceAttribute()
    {
        return $this->price_per_minute + platformCommission($this->price_per_minute);
    }

    public function getSlugAttribute()
    {
        return slugify($this->id . ' ' . $this->title);
    }

    public function getShowPricePerMinuteAttribute()
    {
        return CurrencyHelper::getSymbol() . $this->price_per_minute;
    }

    public function getShowTotalPriceAttribute()
    {
        $total = $this->price_per_minute + platformCommission($this->price_per_minute);
        return CurrencyHelper::getSymbol() . $total;
    }

    public function getShowIdAttribute()
    {
        return get_voice_number($this->id);
    }

    public function voiceOver()
    {
        return $this->belongsTo(User::class, 'voiceover_id');
    }

    public function dialect()
    {
        return $this->belongsTo(Dialect::class, 'dialect_id');
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'language_id');
    }

    public function status()
    {
        return $this->belongsTo(VoiceStatus::class, 'voice_status_id');
    }

    public function category()
    {
        return $this->hasOne(VoiceCategory::class, 'voice_id');
    }


    public function favorite()
    {
        $relation = $this->hasOne(Favorite::class, 'voice_id');
        if (user())
            $relation = $relation->where('user_id', user()->getAuthIdentifier());
        return $relation;
    }

    public function type()
    {
        return $this->belongsTo(VoiceType::class, 'voice_type_id');
    }

    public function categories()
    {
        return $this->hasMany(VoiceCategory::class, 'voice_id');
    }
}
