<?php

namespace App\Http\Controllers\AdminPanel;


use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;


class CoreController extends Controller
{

    protected $model;
    protected $dirView;
    protected $subDirView;
    protected $asRoute;
    protected $route;
    protected $routeUrl;


    public function __construct(Model $model)
    {
        $this->model = $model;
    }
}
