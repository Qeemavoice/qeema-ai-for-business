<?php


namespace App\Http\Resources\AdminPanel\Customer;


use Illuminate\Http\Resources\Json\JsonResource;

class CustomersResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image_url' => $this->image_url,
            'alt' => $this->alt,
            'created_at' => $this->created_at,
        ];
    }
}
