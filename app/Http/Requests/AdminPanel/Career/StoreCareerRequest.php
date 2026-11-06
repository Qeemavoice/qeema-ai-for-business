<?php


namespace App\Http\Requests\AdminPanel\Career;

use Illuminate\Foundation\Http\FormRequest;

class StoreCareerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'min_salary' => 'required', 'string',
            'max_salary' => 'required', 'string',
            'external_image' => 'required', 'string',
            'interior_image' => 'required', 'string',
            'job_type' => 'required', 'string',
            'workplace_type' => 'required', 'string',
        ];

        foreach (languages() as $key => $value) {
            $rules['title.' . $key] = ['required', 'string'];
            $rules['job_title.' . $key] = ['required', 'string'];
            $rules['experience.' . $key] = ['required', 'string'];
            $rules['responsibilities.' . $key] = ['required', 'string'];
            $rules['tasks.' . $key] = ['required', 'string'];
        }

        return $rules;
    }

    public function attributes()
    {
        $attributes = [
            'external_image' => trans_admin('external_image'),
            'interior_image' => trans_admin('interior_image'),
            'min_salary' => trans_admin('min_salary'),
            'max_salary' => trans_admin('max_salary'),
        ];
        foreach (languages() as $key => $value) {
            $attributes['title.' . $key] = $value;
            $attributes['job_title.' . $key] = $value;
            $attributes['experience.' . $key] = $value;
            $attributes['responsibilities.' . $key] = $value;
            $attributes['tasks.' . $key] = $value;
        }
        return $attributes;
    }
}
