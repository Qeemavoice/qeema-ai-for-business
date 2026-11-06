<?php

namespace App\Services;

class Meta
{
    private static $meta = [];

    public static function set($key, $value)
    {
        self::$meta[$key] = $value;
    }

    public static function get($key)
    {
        return self::$meta[$key] ?? null;
    }
}
