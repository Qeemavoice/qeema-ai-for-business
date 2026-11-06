<?php


namespace App\Http\Requests\App\NewsLetter;


use Illuminate\Foundation\Http\FormRequest;

class NewsLetterStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => 'required|email',
        ];
    }
}