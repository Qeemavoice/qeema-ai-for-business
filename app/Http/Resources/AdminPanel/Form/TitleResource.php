<?php


namespace App\Http\Resources\AdminPanel\Form;


use Illuminate\Http\Resources\Json\JsonResource;

class TitleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'title' => $this->title,
        ];
    }
}
