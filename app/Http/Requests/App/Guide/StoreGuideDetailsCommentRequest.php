<?php


namespace App\Http\Requests\App\Guide;
use Illuminate\Foundation\Http\FormRequest;


class StoreGuideDetailsCommentRequest extends FormRequest
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
            'details' => 'required|string|max:500',
        ];
    }
}
