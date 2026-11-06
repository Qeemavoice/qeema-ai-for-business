<?php


namespace App\Http\Requests\AdminPanel\MyProfile;


use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'current_password' => 'required|match_old_password:'.user()->password,
            'new_password' => 'required|string|min:8',
            'confirm_new_password' => 'required|string|same:new_password',
        ];
    }
}
