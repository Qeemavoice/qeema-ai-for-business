<?php


namespace App\Http\Resources\AdminPanel\Language;


use Illuminate\Http\Resources\Json\JsonResource;

class LanguagesResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'dialects' => $this->dialects,
            'created_at' => $this->created_at,
        ];
    }
}
