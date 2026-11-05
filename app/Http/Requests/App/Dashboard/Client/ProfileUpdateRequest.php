<?php


namespace App\Http\Requests\App\Dashboard\Client;


use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'full_name' => ['required', 'string', 'max:191'],
            'email' => ['required', 'string', 'email', 'max:191', 'unique:users,email,' . $this->id],
            'whatsapp_number' => ['required', 'string', 'max:191'],
            'country' => ['required', 'max:191'],
            'image' => ['nullable', 'string', 'max:191'],
        ];
    }
}
