<?php


namespace App\Http\Resources\AdminPanel\Partner;


use Illuminate\Http\Resources\Json\JsonResource;

class PartnersResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'job_title' => $this->job_title,
            'description' => $this->description,
            'alt' => $this->alt,
            'image_url' => $this->image_url,
            'created_at' => $this->created_at,
        ];
    }
}
