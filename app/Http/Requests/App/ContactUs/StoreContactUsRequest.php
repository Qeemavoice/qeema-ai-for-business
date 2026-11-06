<?php


namespace App\Http\Requests\App\ContactUs;


use Illuminate\Foundation\Http\FormRequest;

class StoreContactUsRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => 'required|email|max:191',
            'name' => 'required|string|max:191',
            'mobile' => 'nullable|max:191',
            'message' => 'required|string|max:500',
        ];
    }
}
