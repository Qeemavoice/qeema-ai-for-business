<?php


namespace App\Http\Resources\App\Dashboard\VoiceActors;


use Illuminate\Http\Resources\Json\JsonResource;

class SamplesResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'number_of_orders' => $this->number_of_orders,
            'number_of_likes' => $this->number_of_likes,
            'show_total_price' => $this->show_total_price,
            'dialect' => isset($this->dialect) ? $this->dialect->name : '-',
            'language' => isset($this->dialect->language) ? $this->dialect->language->name : '-',
            'category' => isset($this->category->category) ? $this->category->category->name : '',
            'audio_file_url' => $this->audio_file_url,
        ];

    }
}
