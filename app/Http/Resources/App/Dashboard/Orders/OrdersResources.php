<?php

namespace App\Http\Resources\App\Dashboard\Orders;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class OrdersResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            't' => encrypt($this->id),
            'id' => $this->id,
            'show_id' => $this->show_id,
            'voide_slug' => isset($this->voiceItem) ? $this->voiceItem->itemable->slug : '-',
            'status' => isset($this->status) ? $this->status->name : '-',
            'status_id' => $this->status_id,
            'items' => $this->items,
            'category' => isset($this->category->category) ? $this->category->category->name : '-',
            'date' => Carbon::parse($this->created_at)->format('d-m-Y'),
            'time' => Carbon::parse($this->created_at)->format('h:m:s'),
        ];
    }
}
