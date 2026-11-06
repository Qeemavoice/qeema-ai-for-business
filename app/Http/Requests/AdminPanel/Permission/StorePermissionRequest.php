<?php


namespace App\Http\Requests\AdminPanel\Permission;


use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'unique_name' => ['required', 'string','unique:permissions,name,' . $this->id],
        ];

        foreach (languages() as $key => $value) {
            $rules['show_name.' . $key] = ['required', 'string'];
        }

        return $rules;
    }


    public function attributes()
    {
        $attributes = [
            //'unique_name' => trans_admin('unique_name')
        ];
        foreach (languages() as $key => $value) {
            $attributes['show_name.' . $key] = $value;
        }
        return $attributes;
    }

}
