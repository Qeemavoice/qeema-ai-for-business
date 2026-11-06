<?php


namespace App\Http\Resources\AdminPanel\Service;


use App\Models\Service;
use Illuminate\Http\Resources\Json\JsonResource;

class ServicesResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type,
            'show_value' => $this->show_value,
            'created_at' => $this->created_at,
        ];
    }
}
