<?php


namespace App\Http\Resources\AdminPanel\Order;


use App\Http\Resources\AdminPanel\OrderType\OrderTypeResource;
use App\Http\Resources\AdminPanel\Status\StatusResource;
use App\Services\CurrencyHelper;
use Illuminate\Http\Resources\Json\JsonResource;

class OrdersResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'order_show_id' => $this->show_id,
            'customer_name' => $this->customer_full_name,
            'customer_email' => $this->customer_email,
            'customer_id' => $this->customer_id,
            'status' => new StatusResource($this->status),
            'type' => new OrderTypeResource($this->type),
            'total' => CurrencyHelper::getSymbol() . $this->total,
            'created_at' => $this->created_at,
        ];
    }
}
