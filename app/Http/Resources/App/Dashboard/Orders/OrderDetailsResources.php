<?php


namespace App\Http\Resources\App\Dashboard\Orders;


use App\Services\CurrencyHelper;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailsResources extends JsonResource
{
    public function toArray($request)
    {
        $customer = $this->customer;
        $voiceItem = $this->voiceItem;
        $servicesItems = $this->servicesItems;
        $listOfPrice = json_decode($this->list_of_price);
        $currency = CurrencyHelper::getSymbol();

        return [
            'show_id' => $this->show_id,
            'customer_name' => isset($customer) ? $customer->full_name : '-',
            'customer_email' => isset($customer) ? $customer->email : '-',
            'language' => isset($voiceItem->details->language) ? $voiceItem->details->language->name : '-',
            'dialect' => isset($voiceItem->details->dialect) ? $voiceItem->details->dialect->name : '-',
            'category' => isset($voiceItem->details->category) ? $voiceItem->details->category->name : '-',
            'senario' => isset($voiceItem) ? $voiceItem->item : '-',
            'notes' => isset($voiceItem) ? $voiceItem->notes : '-',
            'voice_id' => isset($voiceItem->details) ? $voiceItem->details->item_id : '-',
            'audio_file_url' => isset($voiceItem->itemable) ? $voiceItem->itemable->audio_file_url : '-',
            'services' => isset($servicesItems) ? $servicesItems : '-',
            'numberOfWords' => isset($listOfPrice) ? $listOfPrice->script->numberOfWords : '-',
            'pricePerMinute' => isset($listOfPrice) ? $currency . $listOfPrice->script->voice->total_price : '-',
            'numberOfMinutes' => isset($listOfPrice) ? $listOfPrice->script->numberOfMinutes : '-',
            'pricePerMinutes' => isset($listOfPrice) ? $currency . $listOfPrice->script->total : '-',
            'priceServices' => isset($listOfPrice) ? $currency . $listOfPrice->services->total : '-',
            'subTotal' => isset($listOfPrice) ? $currency . $listOfPrice->subTotal : '-',
            'total' => isset($listOfPrice) ? $currency . $listOfPrice->total : '-',
            'paymentCommissionPercentagee' => isset($listOfPrice) ? $listOfPrice->paymentCommission->percentage : '-',
            'paymentCommissionValue' => isset($listOfPrice) ? $currency . $listOfPrice->paymentCommission->value : '-',
            'currency' => isset($this->currency) ? $this->currency->symbol : '',

        ];
    }
}
