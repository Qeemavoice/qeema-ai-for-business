<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormField extends Model
{
    use HasFactory;

    protected $appends = ['listOfOptions'];
    protected $guarded = [];

    public function getListOfOptionsAttribute()
    {
        return $this->options ? json_decode($this->options) : null;
    }

    public function inputField()
    {
        return $this->belongsTo(InputField::class, 'input_field_id');
    }

    public function form()
    {
        return $this->belongsTo(Form::class, 'form_id');
    }

    public function answers()
    {
        return $this->hasMany(FormField::class, 'form_field_id')->groupBy('token');
    }
}
