<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class TransactionType extends Model
{
    use HasTranslations, SoftDeletes, HasTimestamps;

    public $translatable = ['name', 'description'];

    protected $guarded = [];

    public const BOOKING = 1; // booking voice
    public const DEPOSIT = 2; // charge wallet
    public const WITHDRAW_BALANCE = 3;
    public const WITHDRAW_PROFITS = 4; // سحب ارباح
    public const REFUND = 5;
    public const SUBSCRIPTION_FEES = 6;
    public const BUYING_GUIDE = 7; // buying guide


}
