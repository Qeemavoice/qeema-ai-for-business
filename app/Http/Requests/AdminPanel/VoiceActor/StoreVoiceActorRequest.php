<?php


namespace App\Http\Requests\AdminPanel\VoiceActor;


use Illuminate\Foundation\Http\FormRequest;

class StoreVoiceActorRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules['email'] = ['required', 'email', 'string', 'max:255', 'unique:users,email,' . $this->id];
        $rules['languageIds'] = ['nullable', 'array'];
        $rules['mobile'] = ['nullable', mobile_regex(), 'max:191', 'unique:users,mobile,' . $this->id];
        $rules['payment_method'] = ['nullable'];
        $rules['price_per_minute'] = ['required'];
        foreach (languages() as $key => $value) {
            $rules['full_name.' . $key] = ['required', 'string'];
        }

        return $rules;
    }

    public function attributes()
    {
        return [
            'languageIds' => trans_admin('language')
        ];
    }
}
