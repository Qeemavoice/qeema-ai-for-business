<?php


namespace App\Http\Resources\AdminPanel\Currency;

use Illuminate\Http\Resources\Json\JsonResource;


class CurrencyResource extends JsonResource
{
    public function toArray($request)
    {

        return [
            'id' => $this->id,
            'name' => $this->name,
            'iso' => $this->iso,
            'symbol' => $this->symbol,
            'created_at' => $this->created_at,
        ];
    }
}
