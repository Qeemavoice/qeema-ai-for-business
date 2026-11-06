<?php

namespace App\Http\Controllers\App\Dashboard\Chat;


use App\Models\UserMessage;

trait ChatTrait
{
    public function openChatWithVoiceActor($data)
    {
        $userMessage = new UserMessage();
        $userMessage->u_from_id = $data['u_from_id'];
        $userMessage->u_to_id = $data['u_to_id'];
        $userMessage->order_id = $data['order_id'];
        return $userMessage->save();
    }
}
