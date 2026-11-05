<?php

namespace App\Http\Resources\Messages;

use Illuminate\Http\Resources\Json\JsonResource;

class UserMessageResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'to_user' => isset($this->toUser) ? new UserResource($this->toUser) : null,
            'from_user' => isset($this->fromUser) ? new UserResource($this->fromUser) : null,
            'last_message' => isset($this->lastMessage) ? new LastMessageResource($this->lastMessage) : null,
            'created_at' => isset($this->created_at) ? $this->created_at : null,
            'unread_messages_count' => isset($this->unread_messages_count) ? $this->unread_messages_count : 0,
            'id' => isset($this->id) ? $this->id : null,
        ];
    }

}
