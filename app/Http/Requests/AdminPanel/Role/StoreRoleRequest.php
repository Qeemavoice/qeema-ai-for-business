<?php


namespace App\Http\Requests\AdminPanel\Role;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'permissions' => ['array','min:1'],
        ];

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
