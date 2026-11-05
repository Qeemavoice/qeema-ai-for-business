<?php


namespace App\Http\Resources\AdminPanel\OrderType;


use Illuminate\Http\Resources\Json\JsonResource;

class OrderTypeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}
