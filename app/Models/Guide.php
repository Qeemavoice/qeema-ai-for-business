<?php

namespace App\Models;

use App\Services\CurrencyHelper;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class Guide extends Model
{
    use HasFactory, HasTranslations, HasTimestamps, SoftDeletes;

    public $translatable = ['name', 'details'];

    public $guarded = [];

    public const TYPE_FREE = 1;
    public const TYPE_PAID = 2;

    public const DIR_GUIDE_UPLOADS = 'guides';

    protected $appends = ['file_url', 'image_url', 'slug', 'total_profits', 'show_total_profits', 'show_unit_price'];

    public function getTotalProfitsAttribute()
    {
        return $this->type == self::TYPE_PAID ? $this->unit_price * $this->number_of_downloads : 0;
    }

    public function getShowTotalProfitsAttribute()
    {
        return CurrencyHelper::getSymbol() . $this->total_profits;
    }

    public function getShowUnitPriceAttribute()
    {
        return CurrencyHelper::getSymbol() . $this->unit_price;
    }

    public function getSlugAttribute()
    {
        return slugify($this->id . ' ' . $this->name);
    }

    public static function types()
    {
        return [
            self::TYPE_FREE => trans_admin('free'),
            self::TYPE_PAID => trans_admin('paid'),
        ];
    }

    public function getFileUrlAttribute()
    {
        return $this->file ? asset_upload(self::DIR_GUIDE_UPLOADS . '/' . $this->file) : null;
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? asset_upload(self::DIR_GUIDE_UPLOADS . '/' . $this->image) : null;
    }

    public function downloads()
    {
        return $this->hasMany(GuideDownload::class, 'guide_id');
    }

    public function comments()
    {
        return $this->hasMany(GuideComment::class, 'guide_id');
    }
}
