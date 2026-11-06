<?php


namespace App\Http\Controllers\App\Dashboard\Client;


use App\Http\Controllers\App\CoreController;
use App\Models\Favorite;

class CartController extends CoreController
{
    public $model;

    public function __construct(Favorite $model)
    {
        $this->model = $model;
    }

    public function index()
    {

    }
}
