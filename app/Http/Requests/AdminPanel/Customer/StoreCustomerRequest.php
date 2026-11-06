<?php


namespace App\Http\Requests\AdminPanel\Customer;


use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules['image'] = ['required', 'string'];

        foreach (languages() as $key => $value) {
            $rules['name.' . $key] = ['required', 'string'];
            $rules['alt.' . $key] = ['required', 'string'];
        }

        return $rules;
    }

    public function attributes()
    {
        $attributes = [];
        foreach (languages() as $key => $value) {
            $attributes['name.' . $key] = $value;
            $attributes['alt.' . $key] = $value;
        }
        return $attributes;
    }
}
