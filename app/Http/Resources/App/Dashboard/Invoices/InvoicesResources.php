<?php


namespace App\Http\Resources\App\Dashboard\Invoices;


use Illuminate\Http\Resources\Json\JsonResource;

class InvoicesResources extends JsonResource
{
    public function toArray($request)
    {
        $paymentMethod = $this->methodable;
        $transactionType = $this->transactionType;
        $order = $this->order;
        return [
            'id' => $this->id,
            'order_show_id' => isset($order) ? $order->show_id : '-',
            'transaction_id' => $this->transaction_id,
            'transaction_type' => isset($transactionType) ? $transactionType->name : '-',
            'payment_method' => isset($paymentMethod) ? $this->methodable->name : '-',
            'amount_paid' => $this->show_amount_paid,
            'status' => $this->amount_paid,
            'created_at' => $this->created_at,
        ];
    }
}
