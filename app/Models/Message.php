<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $guarded = [];

    protected $appends = ['human_seen', 'human_created_at'];


    public function getHumanSeenAttribute($value)
    {
        if ($this->read_at) {
            return trans_admin('seen') . ' ' . Carbon::parse($this->read_at)->diffForHumans();
        }
    }

    public function getHumanCreatedAtAttribute($value)
    {
        if ($this->created_at) {
            return Carbon::parse($this->created_at)->diffForHumans();
        }
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'u_from_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'u_to_id');
    }

    public function userMessage()
    {
        return $this->belongsTo(UserMessage::class, 'user_message_id');
    }

    public function files()
    {
        return $this->belongsTo(MessageFile::class, 'message_id');
    }

}
