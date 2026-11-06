<?php


namespace App\Http\Resources\AdminPanel\VoiceActor;


use Illuminate\Http\Resources\Json\JsonResource;

class VoiceActorResources extends JsonResource
{
    public function toArray($request)
    {
        $profile = $this->profile;

        return [
            'id' => $this->id,
            'uniq_id' => $this->uniq_id,
            'image' => $this->image,
            'full_name' => $this->full_name,
            'show_full_name' => $this->show_full_name,
            'email' => $this->email,
            'mobile' => $this->mobile,
            'country' => isset($profile->country) ? $profile->country->name : '-',
            'price_per_minute' => isset($profile) ? $profile->price_per_minute : '-',
            'created_at' => $this->created_at,
            'languages' => $this->languages->pluck('name'),
            'payment_methods' => $this->paymentMethods->pluck('name'),
        ];
    }
}
