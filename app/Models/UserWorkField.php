<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;


class UserWorkField extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function workField()
    {
        return $this->belongsTo(WorkField::class, 'work_field_id');
    }
}

