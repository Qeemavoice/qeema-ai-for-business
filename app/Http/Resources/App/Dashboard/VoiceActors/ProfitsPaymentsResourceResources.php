<?php


namespace App\Http\Resources\App\Dashboard\VoiceActors;


use App\Services\CurrencyHelper;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfitsPaymentsResourceResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'date' => Carbon::parse($this->transaction->created_at)->toDateTimeString(),
            'order' => $this->order->show_id,
            'value' => CurrencyHelper::getSymbol() . $this->value,
            'status' => $this->status,
            'release_date' => $this->release_date,
        ];
    }
}
