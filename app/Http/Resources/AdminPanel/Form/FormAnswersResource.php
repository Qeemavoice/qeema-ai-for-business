<?php


namespace App\Http\Resources\AdminPanel\Form;


use Illuminate\Http\Resources\Json\JsonResource;

class FormAnswersResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user' => $this->user ? $this->user->full_name : null,
            'answer' => $this->answer,
            'form_field' => $this->field ? $this->form_field->label : null,
            'token' => $this->token,
        ];
    }
}
