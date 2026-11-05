<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class UserRating extends Model
{
    protected $table = 'user_ratings';
    public $guarded = [];


    // Relation

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }


    public function voicAactor()
    {
        return $this->belongsTo(User::class, 'voice_actor_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function criteriasGroup()
    {
        return $this->belongsTo(RatingGroup::class, 'group_id');
    }
}
