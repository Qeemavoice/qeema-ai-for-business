<?php


namespace App\Http\Requests\App\Guide;


use App\Models\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;

class GuidePurchaseRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'payment_method' => ['required'],
            'guide' => ['required'],
        ];

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
