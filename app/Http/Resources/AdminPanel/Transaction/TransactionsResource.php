<?php


namespace App\Http\Resources\AdminPanel\Transaction;


use Illuminate\Http\Resources\Json\JsonResource;

class TransactionsResource extends JsonResource
{
    public function toArray($request)
    {
        $payer = $this->payer;
        $payee = $this->payee;
        $transactionType = $this->transactionType ? $this->transactionType->name : '';


        $paymentMethod = $this->methodable ? $this->methodable->name : '';

        return [
            //'order_id' => $this->order_id,
            //'order_show_id' => isset($order) ? $order->show_id : '-',
            'payer' => isset($payer) ? $payer->full_name : '-',
            'payee' => isset($payee) ? $payee->full_name : app_name(),
            'transaction_id' => $this->transaction_id,
            'payment_method' => $paymentMethod,
            'transaction_type' => $transactionType,
            'transaction_status' => $this->status,
            'show_amount_paid' => $this->show_amount_paid,
            'created_at' => $this->created_at,
        ];
    }
}
