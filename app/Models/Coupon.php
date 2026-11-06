<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Coupon extends Model
{
    use HasFactory, HasTranslations, HasTimestamps;

    protected $appends = ['status'];
    public $translatable = ['name'];
    protected $guarded = [];

    public function getStatusAttribute($data)
    {
        return $this->is_active ? trans_admin('active') : trans_admin('deactivate');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', YES);
    }

}
