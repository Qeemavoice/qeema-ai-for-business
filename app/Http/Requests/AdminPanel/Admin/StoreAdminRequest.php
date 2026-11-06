<?php


namespace App\Http\Requests\AdminPanel\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $this->id],
            'role' => ['required'],
            'mobile' => ['nullable', mobile_regex(), 'max:191', 'unique:users,mobile,' . $this->id],
        ];
        if (!$this->id) {
            $rules = array_merge($rules, [
                'password' => password_rules(true, true, true),
                'personal_photo' => ['nullable', 'string', 'max:255']
            ]);
        }
        return $rules;
    }
}
