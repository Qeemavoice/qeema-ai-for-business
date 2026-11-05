<?php


namespace App\Http\Requests\AdminPanel\Banner;


use Illuminate\Foundation\Http\FormRequest;

class StoreBannerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'position' => ['required', 'string'],
            'page' => ['required', 'string'],
        ];
        foreach (languages() as $key => $value) {
           // $rules['image.' . $key] = ['required', 'string'];
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
