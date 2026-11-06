<?php


namespace App\Http\Resources\AdminPanel\BookingStep;


use Illuminate\Http\Resources\Json\JsonResource;

class BookingStepsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'alt' => $this->alt,
            'created_at' => $this->created_at,
        ];
    }
}
