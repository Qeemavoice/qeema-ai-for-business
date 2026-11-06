<?php


namespace App\Services;


use App\Models\Currency;

class CurrencyHelper
{
    public static function getCurrent()
    {
        $currencyId = getSetting('currency');
        $currencies = Currency::getCurrencies();
        $currency = $currencies->where('id', $currencyId)->first();
        return isset($currency) ?
            [
                'iso' => $currency->iso,
                'symbol' => $currency->symbol,
                'id' => $currency->id
            ]
            :
            [
                'iso' => 'USD',
                'symbol' => '$',
                'id' => 1
            ];
    }

    public static function getIso()
    {
        return self::getCurrent()['iso'];
    }

    public static function getSymbol()
    {
        return self::getCurrent()['symbol'];
    }

    public static function getId()
    {
        return self::getCurrent()['id'];
    }
}
