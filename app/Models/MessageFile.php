<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class MessageFile extends Model
{
    protected $guarded = [];

    public const DIR_UPLOADS = 'messages';

    protected $appends = ['show_file_url'];

    public function getShowFileUrlAttribute()
    {
        return $this->file_url ? asset_upload(self::DIR_UPLOADS . '/' . $this->file_url) : null;
    }

    public function message()
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
