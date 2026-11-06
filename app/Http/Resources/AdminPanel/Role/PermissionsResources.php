<?php


namespace App\Http\Resources\AdminPanel\Role;


use Illuminate\Http\Resources\Json\JsonResource;

class PermissionsResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'show_name' => $this->show_name,
        ];
    }
}
