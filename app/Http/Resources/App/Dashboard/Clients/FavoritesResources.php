<?php


namespace App\Http\Resources\App\Dashboard\Clients;


use Illuminate\Http\Resources\Json\JsonResource;

class FavoritesResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_full_name' => isset($this->user) ? $this->user->full_name : '-',
            'voice_slug' => isset($this->voice) ? $this->voice->slug : '-',
            'voice_title' => isset($this->voice) ? $this->voice->title : '-',
            'voice_total_price' => isset($this->voice) ? $this->voice->total_price : '-',
            'voice_total_code' => isset($this->voice) ? $this->voice->show_id : '-',
        ];
    }
}
