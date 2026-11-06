<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class Form extends Model
{
    use HasFactory, HasTranslations, HasTimestamps, SoftDeletes;

    public $translatable = ['title'];
    protected $guarded = [];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    public function fields()
    {
        return $this->hasMany(FormField::class, 'form_id');
    }

    public function answers()
    {
        return $this->hasMany(FormAnswer::class,'form_id')->groupBy('token');
    }

}
