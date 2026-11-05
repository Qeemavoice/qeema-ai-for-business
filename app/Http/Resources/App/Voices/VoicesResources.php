<?php


namespace App\Http\Resources\App\Voices;


use Illuminate\Http\Resources\Json\JsonResource;

class VoicesResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'show_price_per_minute' => $this->show_price_per_minute,
            'show_total_price' => $this->show_total_price,
            'dialect' => isset($this->dialect) ? $this->dialect->name : '-',
            'language' => isset($this->dialect->language) ? $this->dialect->language->name : '-',
            'category' => isset($this->category->category) ? $this->category->category->name : '-',
            'type' => $this->type,
            'audio_file_url' => $this->audio_file_url,
            'number_of_orders' => $this->number_of_orders,
            'number_of_listened' => $this->number_of_listened,
            'number_of_likes' => $this->number_of_likes,
            'slug' => $this->slug,
        ];
    }
}
