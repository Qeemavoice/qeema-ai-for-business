<?php


namespace App\Http\Resources\Messages;


use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'u_from_id' => $this->u_from_id,
            'u_to_id' => $this->u_to_id,
            'message' => $this->message,
            'read_at' => $this->read_at,
            'user_message_id' => $this->user_message_id,
            'created_at_human' => Carbon::parse($this->created_at)->diffForHumans(),
        ];
    }
}