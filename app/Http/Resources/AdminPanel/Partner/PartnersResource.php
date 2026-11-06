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
            'reference_url' => $this->reference_url,
            'show_on_homepage' => (bool) $this->show_on_homepage,
            'permission_confirmed' => (bool) $this->permission_confirmed,
            'created_at' => $this->created_at,
        ];
    }
}
