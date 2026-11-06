<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemDetail extends Model
{
    protected $guarded = [];
    protected $appends = ['voice_audio_file_url'];

    public function getVoiceAudioFileUrlAttribute()
    {
        return isset($this->voice_audio_file) ? asset_upload(Voice::DIR_VOICES_UPLOADS . '/' . $this->voice_audio_file) : '';
    }

    public function item()
    {
        return $this->belongsTo(OrderItem::class, 'item_id');
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'language_id');
    }

    public function dialect()
    {
        return $this->belongsTo(Dialect::class, 'dialect_id');
    }

    public function voiceType()
    {
        return $this->belongsTo(VoiceType::class, 'voice_type_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
