<?php


namespace App\Http\Requests\AdminPanel\Voice;


use Illuminate\Foundation\Http\FormRequest;

class StoreVoiceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules['price_per_minute'] = ['required','numeric','min:1'];
        $rules['voiceover'] = ['required'];
        $rules['dialect'] = ['required'];
        $rules['language'] = ['required'];
        $rules['type'] = ['required'];
        $rules['audio_file'] = ['required'];
        $rules['categories_ids'] = ['required','array'];

        foreach (languages() as $key => $value) {
            $rules['title.' . $key] = ['required', 'string'];
        }

        return $rules;
    }

    public function attributes()
    {
        $attributes = [];
        foreach (languages() as $key => $value) {
            $attributes['title.' . $key] = $value;
        }
        return $attributes;
    }
}
