<?php


namespace App\Http\Resources\AdminPanel\Profit;


use Illuminate\Http\Resources\Json\JsonResource;

class PayeeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'image_url' => $this->image_url,
        ];
    }
}
