<?php


namespace App\Http\Controllers\AdminPanel\Currency;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Currency;

class CurrencyController extends CoreController
{
    public function __construct(Currency $currency)
    {
        $this->dirView = 'currencies';
        $this->asRoute = 'currency';
        $this->route = 'currencies';

        parent::__construct($currency);
    }

    public function all()
    {
        return $this->response($this->model::getCurrencies());
    }
}
