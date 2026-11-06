<?php


namespace App\Http\Requests\AdminPanel\Profit;


use Illuminate\Foundation\Http\FormRequest;

class StoreProfitRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'amount' => ['required','numeric','min:1'],
            'receipt' => ['required'],
            'voiceover' => ['required'],
            'withdrawal_method' => ['required'],
            'transaction_id' => ['required'],
        ];

        return $rules;
    }

}
