<?php


namespace App\Http\Resources\AdminPanel\Permission;


use Illuminate\Http\Resources\Json\JsonResource;

class PermissionsResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'show_name' => $this->show_name,
            'unique_name' => $this->unique_name,
            'roles' => RoleResources::collection($this->roles),
            'created_at' => $this->created_at,
        ];
    }
}
