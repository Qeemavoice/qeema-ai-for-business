<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class UserType extends Model
{
    public const ADMIN = 1;
    public const CLIENT = 2;
    public const VOICE_ACTOR = 3;
    public const CLIENT_ADN_VOICE_ACTOR = 4;

    protected $guarded = [];

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

    public static function getTypes()
    {
        return Cache::remember('userTypes', CACHE_TTL, function () {
            return self::all();
        });
    }
}
