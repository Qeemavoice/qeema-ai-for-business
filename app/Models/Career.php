<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class Career extends Model
{
    use HasFactory, SoftDeletes, HasTranslations, HasTimestamps;

    public $translatable = [
        'title',
        'job_title',
        'show_type',
        'experience',
        'responsibilities',
        'tasks'
    ];

    protected $guarded = [];


    public const DIR_JOBS_UPLOADS = 'jobs';
    public const WORKPLACE_TYPE_ON_SITE = 1;
    public const WORKPLACE_TYPE_REMOTE = 2;

    public const TYPE_PART_TIME = 1;
    public const TYPE_FULL_TIME = 2;

    protected $appends = ['external_image_url', 'interior_image_url', 'show_workplace_type', 'show_type', 'slug'];

    public function getSlugAttribute()
    {
        return slugify($this->id . ' ' . $this->title);
    }

    public function getShowWorkplaceTypeAttribute()
    {
        return Career::getWorkplaceTypes()[$this->workplace_type];
    }

    public function getShowTypeAttribute()
    {
        return Career::getWorkplaceTypes()[$this->type];
    }

    public function getExternalImageUrlAttribute()
    {
        return $this->external_image ? asset_upload(self::DIR_JOBS_UPLOADS . '/' . $this->external_image) : null;
    }

    public function getInteriorImageUrlAttribute()
    {
        return $this->interior_image ? asset_upload(self::DIR_JOBS_UPLOADS . '/' . $this->interior_image) : null;
    }

    public static function getWorkplaceTypes()
    {
        return [
            self::WORKPLACE_TYPE_ON_SITE => trans_admin('on_site'),
            self::WORKPLACE_TYPE_REMOTE => trans_admin('remote'),
        ];
    }

    public static function getJobTypes()
    {
        return [
            self::TYPE_FULL_TIME => trans_admin('full_time'),
            self::TYPE_PART_TIME => trans_admin('part_time'),
        ];
    }
}
