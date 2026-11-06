<?php


namespace App\Http\Resources\AdminPanel\Work;


use Illuminate\Http\Resources\Json\JsonResource;

class WorksResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'url' => $this->url,
            'created_at' => $this->created_at,
        ];
    }
}
