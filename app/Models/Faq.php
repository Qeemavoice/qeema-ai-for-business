<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Faq extends Model
{
    use HasTranslations, SoftDeletes, HasTimestamps;

    public $translatable = ['title', 'details'];
    protected $guarded = [];

    public static function getFaqs($limit = null)
    {
        return Cache::remember('faqs', CACHE_TTL, function () use ($limit) {
            if (!is_null($limit)) {
                $data = self::oldest()->limit($limit)->get();
            } else {
                $data = self::oldest()->get();
            }
            return $data;
        });

    }

    public static function getAll($rows = null, $where = null)
    {
        $data = new static();

        if ($rows == '*' || is_null($rows))
            $rows = '*';

        if (!is_null($where))
            $data = $data->where($where);

        $data = $data->select($rows)->get();
        return $data;
    }

}
