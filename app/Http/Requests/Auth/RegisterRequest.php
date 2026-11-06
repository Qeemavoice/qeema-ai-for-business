<?php


namespace App\Http\Requests\Auth;


use App\Models\UserType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'full_name' => ['required', 'string', 'max:191'],
            'email' => ['required', 'string', 'email', 'max:191', Rule::unique('users', 'email')],
            'password' => password_rules(true, false, true),
            'type' => ['required', 'in:' . UserType::CLIENT . ',' . UserType::VOICE_ACTOR],
        ];

        if ($this->type == UserType::VOICE_ACTOR) {
            $rules = array_merge($rules, [
                'gender' => ['required', 'max:191'],
                'country' => ['required', 'max:191'],
                'business_link' => ['nullable', 'url'],
                'price_per_minute' => ['required', 'numeric'],
                'price_per_hours' => ['required', 'numeric'],
                // 'mobile' => ['required', mobile_regex(), 'max:191'],
                'whatsapp_number' => ['required', 'string', 'max:191'],
            ]);
        }

        if ($this->type == UserType::CLIENT) {
            $rules = array_merge($rules, [
                    'work_fields' => ['required_without:work_field', 'array'],
                    'work_field' => ['required_without:work_fields', 'max:191']
                ]
            );
        }

        return $rules;
    }
}
