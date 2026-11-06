<?php


namespace App\Http\Resources\Messages;


use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'image' => $this->image300,
            'image300' => $this->image300,
            'type_id' => $this->user_type
        ];
    }
}