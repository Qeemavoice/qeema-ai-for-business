<?php


namespace App\Http\Requests\App\DownloadFile;


use Illuminate\Foundation\Http\FormRequest;

class StoreDownloadFileRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => 'required|email|max:191',
        ];
    }
}
