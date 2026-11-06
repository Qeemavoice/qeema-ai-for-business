<?php


namespace App\Http\Requests\AdminPanel\Work;


use Illuminate\Foundation\Http\FormRequest;

class StoreWorkRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules['url'] = ['required', 'url'];

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
