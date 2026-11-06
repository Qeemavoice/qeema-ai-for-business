<?php


namespace App\Http\Requests\App\Career;


use Illuminate\Foundation\Http\FormRequest;

class StoreCareerApplicationApplyRequest extends FormRequest
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
            'whatsapp' => 'required|max:191',
            'career_id' => 'required|exists:careers,id',
        ];
    }
}
