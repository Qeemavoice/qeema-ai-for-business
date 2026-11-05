<?php


namespace App\Http\Resources\AdminPanel\Dialect;


use Illuminate\Http\Resources\Json\JsonResource;

class DialectsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'language' => $this->language->name,
            'created_at' => $this->created_at,
        ];
    }
}
