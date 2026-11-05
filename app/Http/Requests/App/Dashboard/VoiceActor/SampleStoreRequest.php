<?php


namespace App\Http\Requests\App\Dashboard\VoiceActor;


use Illuminate\Foundation\Http\FormRequest;

class SampleStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules['price_per_minute'] = ['required', 'numeric'];
        $rules['dialect'] = ['required'];
        $rules['language'] = ['required'];
        $rules['audio_file'] = ['required'];
        $rules['category'] = ['required'];
        $rules['title'] = ['required'];
        return $rules;
    }

}
