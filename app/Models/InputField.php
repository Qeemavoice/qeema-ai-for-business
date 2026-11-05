<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class InputField extends Model
{
    use HasFactory;

    protected $guarded = [];

    const FILE = 1;
    const TEXT = 2;
    const TEXT_AREA = 3;
    const RADIO = 4;
    const CHECKBOX = 5;
    const DROP_DOWN_LIST = 6;

    public static function inputFields()
    {
        return Cache::remember('inputFields', CACHE_TTL, function () {
            return self::all();
        });
    }
}
