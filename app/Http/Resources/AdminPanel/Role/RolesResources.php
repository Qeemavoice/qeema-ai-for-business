<?php


namespace App\Http\Resources\AdminPanel\Role;


use Illuminate\Http\Resources\Json\JsonResource;

class RolesResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'permissions' => PermissionsResources::collection($this->permissions),
            'created_at' => $this->created_at,
        ];
    }
}
