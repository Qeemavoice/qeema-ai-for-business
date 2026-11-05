<?php


namespace App\Http\Controllers\AdminPanel\Permission;


trait PermissionTrait
{
    public function filter($request, $model){
        return $model;
    }

    public function sort($request, $model){

        return $model;
    }
}
