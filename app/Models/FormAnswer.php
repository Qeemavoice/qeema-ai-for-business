<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormAnswer extends Model
{
    use HasFactory, HasTimestamps;

    protected $guarded = [];

    public function inputField()
    {
        return $this->hasMany(InputField::class, 'input_field_id');
    }
}
