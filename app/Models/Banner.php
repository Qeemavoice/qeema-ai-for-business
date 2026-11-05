<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Banner extends Model
{
    use HasTranslations, SoftDeletes, HasTimestamps;

    public $translatable = ['title', 'description'];
    public $guarded = [];
    public $appends = ['image_url', 'page_show'];
    public const DIR_BANNER_UPLOADS = 'banners';

    public static $HOME = 'home';
    public static $CATEGORIES = 'categories';
    public static $VOICES = 'voices';
    public static $BOOKING_STEPS = 'booking-steps';
    public static $GUIDES = 'guides';
    public static $BLOG = 'blog';
    public static $OUR_WORKS = 'our_works';
    public static $TRAINING = 'training';
    public static $CAREERS = 'careers';
    public static $FAQs = 'faqs';
    public static $CONTACT_US = 'contact_us';

    public static function pages()
    {
        return [
            //self::$HOME => trans_admin('home'),
            self::$CATEGORIES => trans_admin('categories'),
            self::$VOICES => trans_admin('voices'),
            self::$BOOKING_STEPS => trans_admin('booking_steps'),
            self::$GUIDES => trans_admin('guides'),
            self::$BLOG => trans_admin('blog'),
            self::$OUR_WORKS => trans_admin('our_works'),
            self::$TRAINING => trans_admin('training'),
            self::$CAREERS => trans_admin('careers'),
            self::$FAQs => trans_admin('faqs'),
            self::$CONTACT_US => trans_admin('contact_us'),
        ];
    }

    public static function positions($slug = null)
    {
        $positions = [
            'top' => 'top',
//            'top-left' => 'top-left',
//            'top-center' => 'top-center',
//            'top-right' => 'top-right',
//
//            'center' => 'center',
//            'center-left' => 'center-left',
//            'center-right' => 'center-right',
//            'center-center' => 'center-center',
//
//            'bottom' => 'bottom',
//            'bottom-left' => 'bottom-left',
//            'bottom-center' => 'bottom-center',
//            'bottom-right' => 'bottom-right',
//
//            'left' => 'left',
//            'right' => 'right',
        ];

//        if ($slug === 'home') {
//            $positions = [
//                'center' => 'center',
//                'bottom-left' => 'bottom-left',
//                'bottom-right' => 'bottom-right',
//            ];
//        }
        return $positions;
    }

    public static function getPagesList()
    {
        return [
            ['title' => ['en' => 'Home', 'ar' => 'الرئيسية'], 'slug' => 'home'],
        ];
    }


    public static function getBanners()
    {
        return Cache::remember('banners', CACHE_TTL, function () {
            return self::all();
        });
    }

    public function getPageShowAttribute()
    {
        $pages = self::pages();
        return isset($pages[$this->page]) ? $pages[$this->page] : null;
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? asset_upload(self::DIR_BANNER_UPLOADS . '/' . $this->image) : null;
    }
}
