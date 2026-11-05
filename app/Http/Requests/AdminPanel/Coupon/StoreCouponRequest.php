<?php


namespace App\Http\Requests\AdminPanel\Coupon;


use Illuminate\Foundation\Http\FormRequest;

class StoreCouponRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [];
        $rules['code'] = ['required'];
        $rules['value'] = ['required', 'numeric'];
        $rules['usage_limit_per_coupon'] = ['required'];
        $rules['usage_limit_per_customer'] = ['required'];
        $rules['minimum_minutes'] = ['required'];

        foreach (languages() as $key => $value) {
            $rules['name.' . $key] = ['required', 'string'];
        }

        return $rules;
    }

    public function attributes()
    {
        $attributes = [];
        foreach (languages() as $key => $value) {
            $attributes['name.' . $key] = $value;
        }
        return $attributes;
    }
}
