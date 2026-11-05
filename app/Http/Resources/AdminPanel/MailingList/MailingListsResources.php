<?php


namespace App\Http\Resources\AdminPanel\MailingList;


use Illuminate\Http\Resources\Json\JsonResource;

class MailingListsResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'created_at' => $this->created_at,
        ];
    }
}
