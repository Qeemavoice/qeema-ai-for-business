<?php


namespace App\Http\Requests\App\Dashboard\Client;


use Illuminate\Foundation\Http\FormRequest;

class WorkFieldUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'work_fields' => ['required_without:work_field', 'array'],
            'work_field' => ['required_without:work_fields', 'max:191']
        ];
    }
}
