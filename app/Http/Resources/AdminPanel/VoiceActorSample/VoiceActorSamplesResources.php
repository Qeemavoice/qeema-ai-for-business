<?php


namespace App\Http\Resources\AdminPanel\VoiceActorSample;


use Illuminate\Http\Resources\Json\JsonResource;

class VoiceActorSamplesResources extends JsonResource
{
    public function toArray($request)
    {
        $voiceOver = $this->voiceOver;
        $dialect = $this->dialect;
        $language = $this->language;
        $category = $this->category;
        $status = $this->status;

        return [
            'id' => $this->id,
            'user' => isset($voiceOver) ? $voiceOver : '-',
            'title' => $this->title,
            'price_per_minute' => $this->price_per_minute,
            'created_at' => $this->created_at,
            'total_price' => $this->total_price,
            'file_url' => $this->audio_file_url,
            'language' => isset($language) ? $language->name : '-',
            'category' => isset($category) ? $category->name : '-',
            'dialect' => isset($dialect) ? $dialect->name : '-',
            'status' => isset($status) ? $status->name : '-',
        ];
    }
}
