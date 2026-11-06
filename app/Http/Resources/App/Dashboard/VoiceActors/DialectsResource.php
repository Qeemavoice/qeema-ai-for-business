<?php


namespace App\Http\Resources\App\Dashboard\VoiceActors;


use Illuminate\Http\Resources\Json\JsonResource;

class DialectsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}
