<?php


namespace App\Models;


use App\Services\CurrencyHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Service extends Model
{
    use HasTimestamps, HasTranslations, SoftDeletes;

    public $translatable = ['title'];
    protected $appends = ['show_value'];
    protected $guarded = [];

    public const SERVICE_TYPE_PERCENT = 1;
    public const SERVICE_TYPE_VALUE = 2;

    public static function getTypes()
    {
        return [
            self::SERVICE_TYPE_PERCENT => trans_admin('percent'),
            self::SERVICE_TYPE_VALUE => trans_admin('value'),
        ];
    }

    public function getShowValueAttribute()
    {
        return ($this->type == self::SERVICE_TYPE_PERCENT ? '%' : CurrencyHelper::getSymbol()) . $this->value;
    }

    public static function getServices()
    {
        return Cache::remember('services', CACHE_TTL, function () {
            return self::all();
        });
    }

}
