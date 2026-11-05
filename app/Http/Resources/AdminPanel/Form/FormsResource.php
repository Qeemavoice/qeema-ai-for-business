<?php


namespace App\Http\Resources\AdminPanel\Form;


use Illuminate\Http\Resources\Json\JsonResource;

class FormsResource extends JsonResource
{
    public function toArray($request)
    {
        $page = $this->page;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'created_at' => $this->created_at,
            'page' => $page ? $page->title : '',
        ];
    }
}
