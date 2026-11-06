<?php


namespace App\Http\Resources\AdminPanel\Banner;


use Illuminate\Http\Resources\Json\JsonResource;

class BannersResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            "id" => $this->id,
            "title" => $this->title,
            "description" => $this->description,
            "position" => $this->position,
            "updated_at" => $this->updated_at,
            "page_show" => $this->page_show,
            "image_url" => $this->image_url,
            "created_at" => $this->created_at,
        ];
    }
}
