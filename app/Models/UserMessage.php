<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class UserMessage extends Model
{
    protected $guarded = [];


    public function fromUser()
    {
        return $this->belongsTo(User::class, 'u_from_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'u_to_id');
    }

    public function lastMessage()
    {
        return $this->hasOne(Message::class, 'user_message_id')->latest();
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'user_message_id');
    }

    public function messagesOrderDesc()
    {
        return $this->hasMany(Message::class, 'user_message_id')->orderBy('created_at', 'desc');
    }

    public function unreadMessages()
    {
        return $this->hasMany(Message::class, 'user_message_id')
            ->whereNull('read_at')
            ->where('u_to_id', user()->id);
    }

    public function unreadMessagesAdmin()
    {
        return $this->hasMany(Message::class, 'user_message_id')
            ->whereNull('read_at')
            ->where('is_admin', YES);
    }
}
