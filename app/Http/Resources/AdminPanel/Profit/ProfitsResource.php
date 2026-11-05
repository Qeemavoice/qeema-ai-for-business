<?php


namespace App\Http\Resources\AdminPanel\Profit;


use Illuminate\Http\Resources\Json\JsonResource;

class ProfitsResource extends JsonResource
{
    public function toArray($request)
    {
        $payee = $this->payee;
        $withdrawalMethod = $this->methodable ? $this->methodable->name : '';
        return [
            'id' => $this->id,
            'payee' => new PayeeResource($payee),
            'show_amount_paid' => $this->show_amount_paid,
            'withdrawal_method' => $withdrawalMethod,
            'receipt_url' => $this->receipt_url,
            'created_at' => $this->created_at,
        ];
    }
}
