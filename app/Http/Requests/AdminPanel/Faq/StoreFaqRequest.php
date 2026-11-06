<?php


namespace App\Http\Requests\AdminPanel\Faq;


use Illuminate\Foundation\Http\FormRequest;

class StoreFaqRequest extends FormRequest
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
            $rules['details.' . $key] = ['required', 'string'];
        }
        return $rules;
    }

    public function attributes()
    {
        $attributes = [];
        foreach (languages() as $key => $value) {
            $attributes['title.' . $key] = $value;
            $attributes['details.' . $key] = $value;
        }
        return $attributes;
    }
}
