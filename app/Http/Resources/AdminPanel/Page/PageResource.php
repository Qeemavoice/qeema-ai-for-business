<?php


namespace App\Http\Resources\AdminPanel\Page;


use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content ,
            'seo' => $this->seo ,
        ];
    }
}
