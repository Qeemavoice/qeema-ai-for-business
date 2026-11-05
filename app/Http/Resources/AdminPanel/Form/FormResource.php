<?php


namespace App\Http\Resources\AdminPanel\Form;


use Illuminate\Http\Resources\Json\JsonResource;

class FormResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'page_id' => $this->page_id,
            'label' => $this->label,
            'fields' =>$this->fields,
        ];
    }
}
