<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormAnswer extends Model
{
    use HasFactory, HasTimestamps;

    protected $guarded = [];

//    public function inputField()
//    {
//        return $this->hasMany(InputField::class, 'input_field_id');
//    }

    public function field()
    {
        return $this->belongsTo(FormField::class, 'form_field_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function form()
    {
        return $this->belongsTo(Form::class, 'form_id');
    }
}
