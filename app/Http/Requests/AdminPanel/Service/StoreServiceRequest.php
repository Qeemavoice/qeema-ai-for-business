<?php


namespace App\Http\Requests\AdminPanel\Service;


use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules['value'] = ['required'];
        $rules['type'] = ['required'];

        foreach (languages() as $key => $value) {
            $rules['title.' . $key] = ['required', 'string'];
        }

        return $rules;
    }

    public function attributes()
    {
        $attributes = [];
        foreach (languages() as $key => $value) {
            $attributes['title.' . $key] = $value;
        }
        return $attributes;
    }
}
