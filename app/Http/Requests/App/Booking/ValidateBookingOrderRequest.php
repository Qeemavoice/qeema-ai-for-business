<?php


namespace App\Http\Requests\App\Booking;


use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidateBookingOrderRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'scenario' => ['required'],
            'notes' => ['nullable'],
            'whatsapp_number' => ['required'],
            'services' => ['nullable'],
            'coupon' => ['nullable'],
        ];

        if ($this->do_not_account) {
            $rules = [
                'full_name' => ['required', 'string', 'max:191'],
                'email' => ['required', 'string', 'email', 'max:191', Rule::unique('users', 'email')],
                'password' => password_rules(true, MIN_PASSWORD, true),
                'password_confirmation' => 'required|string|max:255',
            ];
        }
        return $rules;
    }
}
