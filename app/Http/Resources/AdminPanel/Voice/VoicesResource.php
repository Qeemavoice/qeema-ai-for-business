<?php


namespace App\Http\Resources\AdminPanel\Voice;


use Illuminate\Http\Resources\Json\JsonResource;

class VoicesResource extends JsonResource
{
    public function toArray($request)
    {
        $voiceOver = $this->voiceOver;
        $dialect = $this->dialect;

        return [
            'id' => $this->id,
            'show_id' => $this->show_id,
            'title' => $this->title,
            'show_price_per_minute' => $this->show_price_per_minute,
            'show_total_price_per_minute' => $this->show_total_price,
            'total_price' => $this->total_price,
            'type' => isset($this->type) ? $this->type->name : '-',
            'voiceover' => isset($voiceOver) ? $voiceOver->full_name : '-',
            'dialect' => isset($dialect) ? $dialect->name : '-',
            'audio_file_url' => $this->audio_file_url,
            'created_at' => $this->created_at,
            'is_sample' => $this->is_sample,
        ];
    }
}
