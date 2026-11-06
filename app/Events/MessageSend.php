<?php

namespace App\Events;

use App\Http\Resources\Messages\UserResource;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;


class MessageSend implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $fromUser;
    public $toUser;
    public $userMessage;
    public $orderId;

    public function __construct($message, $orderId, $userMessage = null)
    {
        $this->message = $message;
        $this->orderId = $orderId;
        $this->fromUser = $message->fromUser;
        $this->toUser = $message->toUser;
        $this->userMessage = $userMessage;

    }

    public function broadcastOn()
    {
        $to = $this->message->u_to_id;
        if (is_null($to)) {
            $to = $this->toUser->id;
        }
        return new PrivateChannel('App.User.' . $to);
    }

    public function broadcastWith()
    {

        return [
            'message' => $this->message,
            'is_admin' => isset($this->userMessage) ? $this->userMessage->is_admin : null,
            'orderId' => $this->orderId,
            'fromUser' => new UserResource($this->fromUser),
            'toUser' => isset($this->toUser) ? new UserResource($this->toUser) : null,
        ];
    }
}
