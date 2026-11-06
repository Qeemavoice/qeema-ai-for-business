<?php


namespace App\Http\Resources\App\Dashboard\Clients;

use Illuminate\Http\Resources\Json\JsonResource;

class ClientResources extends JsonResource
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
            'country' => isset($profile) ? $profile->country_id : '',
         //   'workFields' => $this->workFields,
        ];
    }
}
