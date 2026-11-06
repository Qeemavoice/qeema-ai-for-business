<?php


namespace App\Http\Resources\AdminPanel\Exports;


use Illuminate\Http\Resources\Json\JsonResource;

class GenerateVoiceExportResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type ? $this->type->name : null,
            'price_per_minute' => $this->price_per_minute,
            'total_price' => $this->total_price,
            'voiceover' => $this->voiceOver ? $this->voiceOver->full_name : null,
            'category' => $this->category ? $this->category->name : null,
            'dialect' => $this->dialect ? $this->dialect->name : null,
            'created_at' => $this->created_at,
        ];
    }
}
