<?php


namespace App\Http\Resources\AdminPanel\Form;


use Illuminate\Http\Resources\Json\JsonResource;

class FormAnswersResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user' => $this->user,
            'answer' => $this->answer,
            'token' => $this->token,
        ];
    }
}
