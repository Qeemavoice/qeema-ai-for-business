<?php


namespace App\Http\Requests\AdminPanel\Partner;


use Illuminate\Foundation\Http\FormRequest;

class StorePartnerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules['image'] = ['required', 'string'];
        $rules['job_title'] = ['nullable'];
        $rules['show_on_homepage'] = ['nullable', 'boolean'];
        $rules['permission_confirmed'] = ['nullable', 'boolean'];
        $rules['reference_url'] = [
            $this->boolean('show_on_homepage') ? 'required' : 'nullable',
            'url',
            'max:2048',
        ];
        if ($this->boolean('show_on_homepage')) {
            $rules['permission_confirmed'][] = 'accepted';
        }

        foreach (languages() as $key => $value) {
            $rules['full_name.' . $key] = ['required', 'string'];
            $rules['description.' . $key] = ['nullable', 'string'];
            $rules['alt.' . $key] = ['nullable', 'string'];
        }

        return $rules;
    }

    public function attributes()
    {
        $attributes = [];
        foreach (languages() as $key => $value) {
            $attributes['full_name.' . $key] = $value;
            $attributes['description.' . $key] = $value;
            $attributes['alt.' . $key] = $value;
        }
        return $attributes;
    }
}
