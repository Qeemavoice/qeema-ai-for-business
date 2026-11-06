<?php


namespace App\Http\Resources\AdminPanel\Guide;


use Illuminate\Http\Resources\Json\JsonResource;

class GuideDownloadsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user' => isset($this->user) ? $this->user->full_name : '-',
            'order_show_id' => isset($this->order) ? $this->order->show_id : '-',
            'order_id' => isset($this->order) ? $this->order->id : '-',
            'created_at' => $this->created_at,
        ];
    }
}
