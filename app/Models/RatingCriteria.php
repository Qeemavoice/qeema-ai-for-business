<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class RatingCriteria extends Model
{
    use HasTranslations, HasTimestamps;

    public $translatable = ['name'];


    public function group()
    {
        return $this->belongsTo(RatingGroup::class, 'group_id');
    }
}
