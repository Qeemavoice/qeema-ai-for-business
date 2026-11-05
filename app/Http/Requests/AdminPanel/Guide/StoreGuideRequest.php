<?php


namespace App\Http\Requests\AdminPanel\Guide;


use App\Models\Guide;
use Illuminate\Foundation\Http\FormRequest;

class StoreGuideRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'price' => ['required_if:type,' . Guide::TYPE_PAID],
            'type' => ['required', 'in:' . Guide::TYPE_PAID . ',' . Guide::TYPE_FREE],
            'image' => ['required'],
            'file' => ['required'],
        ];
        foreach (languages() as $key => $value) {
            $rules['name.' . $key] = ['required', 'string'];
            $rules['details.' . $key] = ['required', 'string'];
        }
        return $rules;
    }

    public function attributes()
    {
        $attributes = [];
        foreach (languages() as $key => $value) {
            $attributes['name.' . $key] = $value;
            $attributes['details.' . $key] = $value;
        }
        return $attributes;
    }
}
