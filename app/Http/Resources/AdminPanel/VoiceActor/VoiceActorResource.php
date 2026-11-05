<?php


namespace App\Http\Resources\AdminPanel\VoiceActor;


use Illuminate\Http\Resources\Json\JsonResource;

class VoiceActorResource extends JsonResource
{
    public function toArray($request)
    {
        $profile = $this->profile;
        $paymentMethods = $this->paymentMethods;

        return [
            'id' => $this->id,
            'full_name' => $this->getTranslations('full_name'),
            'image_url' => $this->image_url,
            'email' => $this->email,
            'mobile' => $this->mobile,
            'country' => isset($profile) ? $profile->country_id : '-',
            'price_per_minute' => isset($profile) ? $profile->price_per_minute : '-',
            'languages' => $this->languages->pluck('id'),
            'payment_methods' => count($paymentMethods) > 0 ? $paymentMethods->first()->pivot->payment_method_id : '',
        ];
    }
}
