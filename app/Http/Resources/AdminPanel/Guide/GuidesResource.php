<?php


namespace App\Http\Resources\AdminPanel\Guide;


use Illuminate\Http\Resources\Json\JsonResource;

class GuidesResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'details' => $this->details,
            'price' => $this->unit_price,
            'image_url' => $this->image_url,
            'file_url' => $this->file_url,
            'created_at' => $this->created_at,
        ];
    }
}
