<?php


namespace App\Http\Requests\App\Booking;


use App\Models\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;

class BookingRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'payment_method' => ['required'],
            'order.scenario' => ['required'],
            'order.notes' => ['nullable'],
            'order.whatsapp_number' => ['required'],
            'order.services' => ['required'],
            'order.coupon' => ['nullable'],
            'order.voice' => ['required'],
        ];

        if (isset($this->order->do_not_account)) {
            $rules = [
                'order.password' => password_rules(true, MIN_PASSWORD, true),
                'order.password_confirmation' => 'required|string|max:255',
            ];
        }

        if ($this->payment_method == PaymentMethod::STRIPE) {
            $rules['card.number'] = ['required'];
            $rules['card.full_name'] = ['required'];
            $rules['card.expiry_month'] = ['required'];
            $rules['card.expiry_year'] = ['required'];
            $rules['card.cvc'] = ['required'];
        }

        return $rules;
    }
}
