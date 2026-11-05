<?php


namespace App\Http\Resources\AdminPanel\Coupon;


use Illuminate\Http\Resources\Json\JsonResource;

class CouponsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'discount' => $this->value,
            'status' => $this->status,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'usage_limit_per_coupon' => $this->usage_limit_per_coupon,
            'usage_limit_per_customer' => $this->usage_limit_per_customer,
        ];
    }
}
