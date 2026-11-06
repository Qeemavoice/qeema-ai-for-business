<?php


namespace App\Http\Resources\AdminPanel\Client;


use App\Services\CurrencyHelper;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientsResource extends JsonResource
{
    public function toArray($request)
    {
        $profile = $this->profile;
        $workFields = $this->workFields;

        if (isset($workFields)) {
            $workFields = $workFields->pluck('name')->toArray();
        }

        if (isset($profile)) {
            $workField = $profile->work_field;
            if ($workField)
                array_push($workFields, $workField);
        }


        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'image_url' => $this->image_url,
            'mobile' => $this->mobile,
            'in_progress_orders_customer_count' => $this->in_progress_orders_customer_count,
            'number_of_completed_reservations' => $this->completed_orders_customer_count,
            'total_payment' => $this->orders_customer_sum_total > 0 ? CurrencyHelper::getSymbol() . $this->orders_customer_sum_total : '-',
            'show_created_at' => $this->show_created_at,
            'country' => isset($profile->country) ? $profile->country->name : '-',
            'created_at' => $this->created_at,
            'status' => $this->status_id,
            'work_fields' => $workFields,
        ];
    }
}
