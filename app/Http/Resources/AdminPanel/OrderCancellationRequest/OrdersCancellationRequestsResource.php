<?php


namespace App\Http\Resources\AdminPanel\OrderCancellationRequest;


use Illuminate\Http\Resources\Json\JsonResource;

class OrdersCancellationRequestsResource extends JsonResource
{
    public function toArray($request)
    {
        $from = $this->from;
        $order = $this->order;

        return [
            'id' => $this->id,
            'reasons' => $this->reasons,
            'from' => isset($from) ? $from->full_name : '-',
            'order_show_id' => isset($order) ? $order->show_id : '-',
            'order_id' => isset($order) ? $order->id : '-',
            'request_status' => isset($this->status) ? $this->status : null,
            'created_at' => $this->created_at,
        ];
    }
}
