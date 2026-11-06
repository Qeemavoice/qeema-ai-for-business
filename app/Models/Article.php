<?php


namespace App\Models;


use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Article extends Model
{
    use HasFactory, HasTranslations, HasTimestamps;

    public $translatable = [
        'title',
        'short_description',
        'content',
        'meta_description',
        'meta_keywords',
        'slug',

    ];

    public $guarded = [];

    public const DIR_ARTICLES_UPLOADS = 'articles';

    protected $appends = ['format_y_m_d_created_at', 'internal_image_url', 'external_image_url'];



//
//    public static function getStatuses()
//    {
//        return [
//            ArticleStatus::DRAFT => trans_admin('draft'),
//            ArticleStatus::SPUBLISHED => trans_admin('published'),
//            ArticleStatus::UN_PUBLISHED => trans_admin('un_published'),
//            ArticleStatus::SCHEDULED => trans_admin('scheduled'),
//        ];
//    }

    public function getSlugAttribute()
    {
        return slugify($this->id . ' ' . $this->title);
    }

    public function getExternalImageUrlAttribute()
    {
        return $this->external_image ? asset_upload(self::DIR_ARTICLES_UPLOADS . '/' . $this->external_image) : null;
    }

    public function getInternalImageUrlAttribute()
    {
        return $this->internal_image ? asset_upload(self::DIR_ARTICLES_UPLOADS . '/' . $this->internal_image) : null;
    }

    public function getFormatYMDCreatedAtAttribute()
    {
        return Carbon::parse($this->created_at)->format('y/m/d');
    }

}
