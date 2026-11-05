<?php


namespace App\Http\Requests\AdminPanel\Dialect;


use Illuminate\Foundation\Http\FormRequest;

class StoreDialectRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = ['language' => 'required', 'exists:languages,id'];
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
