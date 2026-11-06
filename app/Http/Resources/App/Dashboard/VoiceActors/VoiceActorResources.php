<?php


namespace App\Http\Resources\App\Dashboard\VoiceActors;


use Illuminate\Http\Resources\Json\JsonResource;

class VoiceActorResources extends JsonResource
{
    public function toArray($request)
    {
        $profile = isset($this->profile) ? $this->profile : null;
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'whatsapp_number' => isset($profile) ? $profile->whatsapp_number : '',
            'country' => isset($profile->country) ? $profile->country->name : '',
        ];
    }
}
