<?php


namespace App\Http\Resources\AdminPanel\MailMessage;


use Illuminate\Http\Resources\Json\JsonResource;

class MailMessagesResource extends JsonResource
{
    public function toArray($request)
    {

        return [
            'id' => $this->id,
            'from' => $this->from,
            'to' => $this->to,
            'subject' => $this->subject,
            'full_name' => $this->full_name,
            'content' => $this->content,
            'source' => $this->source,
            'show_source' => $this->show_source,
            'show_status' => $this->show_status,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at,
            'format1_created_at' => $this->format1_created_at,
        ];
    }
}
