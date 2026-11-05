<?php


namespace App\Http\Resources\AdminPanel\Faq;


use Illuminate\Http\Resources\Json\JsonResource;

class FaqsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'details' => $this->details,
            'created_at' => $this->created_at,
        ];
    }
}
