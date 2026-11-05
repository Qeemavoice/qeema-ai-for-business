<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class Rating extends Model
{
    use HasTranslations, SoftDeletes;

    public const DIR_IMAGE_UPLOADS = 'ratings';

    public $translatable = ['name'];

    public const EXPERT = 3;
    public const MEDIUM = 2;
    public const JUNIOR = 1;

    protected $guarded = [];


    public function getImageAttribute($img)
    {
        return asset_app('images/medal/without/' . $img);
    }
}
