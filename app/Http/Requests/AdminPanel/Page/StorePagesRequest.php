<?php


namespace App\Http\Requests\AdminPanel\Page;
use Illuminate\Foundation\Http\FormRequest;


class StorePagesRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [];

        foreach (languages() as $key => $value) {
            $rules['title.' . $key] = ['required', 'string'];
            $rules['description.' . $key] = ['required', 'string'];
        }

        return $rules;
    }


    public function attributes()
    {
        $attributes = [];
        foreach (languages() as $key => $value) {
            $attributes['title.' . $key] = $value;
            $attributes['description.' . $key] = $value;
        }
        return $attributes;
    }
}
