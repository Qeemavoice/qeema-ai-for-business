<?php


namespace App\Http\Resources\AdminPanel\Admin;

use Illuminate\Http\Resources\Json\JsonResource;


class AdminsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'image_url' => $this->image_url,
            'mobile' => $this->mobile,
            'show_last_login' => $this->show_last_login,
            'show_created_at' => $this->show_created_at,
            'created_at' => $this->created_at,
            'role' => $this->role ? $this->role->name : '',
            'status' => $this->status_id,
        ];
    }
}
