<?php


namespace App\Http\Resources\AdminPanel\Permission;


use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'show_name' => $this->show_name,
            'group_id' => $this->group_id,
            'group_name' => isset($this->group) ? $this->group->name : '',
        ];
    }
}
