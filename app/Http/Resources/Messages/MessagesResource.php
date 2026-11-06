<?php


namespace App\Http\Resources\Messages;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class MessagesResource extends JsonResource
{

    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'to_user' => new UserResource($this->toUser),
            'from_user' => new UserResource($this->fromUser),
            'message' => $this->message,
            'read_at' => $this->read_at,
            'user_message_id' => $this->user_message_id,
            'human_seen' => $this->human_seen,
            'seen' => $this->seen,
            'created_at_human' => Carbon::parse($this->created_at)->diffForHumans(),
        ];
    }
}