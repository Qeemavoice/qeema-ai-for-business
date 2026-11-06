<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class WithdrawalMethod extends Model
{
    use HasTranslations;
    protected $guarded = [];
    public $translatable = ['name'];

    public const PAYPAL = 1;
    public const ACCOUNT_BANK = 2;
    public const PAYONEER = 3;
    public const VODAFONE_CASH = 4;
    public const OFFICE_TRANSFER = 5;


    public static function getMethods() {
        return Cache::remember('withdrawalMethods', CACHE_TTL, function () {
            return self::select('id', 'name')->where('is_active', YES)->get();
        });
    }

    public function transactions()
    {
        return $this->morphMany(Transaction::class, 'methodable');
    }
}
