<?php


namespace App\Http\Resources\AdminPanel\Permission;


use Illuminate\Http\Resources\Json\JsonResource;

class RoleResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'name' => $this->name,
        ];
    }
}
