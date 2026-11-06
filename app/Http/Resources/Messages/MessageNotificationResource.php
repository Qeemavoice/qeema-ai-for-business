<?php


namespace App\Http\Resources\Messages;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class MessageNotificationResource extends JsonResource
{
    public static $countUnReadNotificationsMessage = 0;


    public static function getCountUnReadNotificationsMessage()
    {
        return self::$countUnReadNotificationsMessage;
    }

    public function toArray($request)
    {
        if ($this->unread_messages_admin_count > 0) {
            self::$countUnReadNotificationsMessage += 1;
        }

        $modalId = null;
        $modalTitle = null;

        $modalId = isset($this->project->id) ? $this->project->id : null;
        $modalTitle = isset($this->project->title) ? $this->project->title : null;

        return [
            'modal' => [
                'id' => $modalId,
                'title' => $modalTitle,
                'type' => $this->modal_type,
                'type_name' => $this->modal_type_name,
            ],
            'user_from' => [
                'id' => $this->fromUser->id,
                'full_name' => $this->fromUser->full_name,
                'image' => $this->fromUser->image300,
                'type_id' => $this->fromUser->user_type,
            ],
            'user_to' => [
                'id' => isset($this->toUser) ? $this->toUser->id : null,
                'full_name' => isset($this->toUser) ? $this->toUser->full_name : null,
                'image' => isset($this->toUser) ? $this->toUser->image300 : null,
                'type_id' => isset($this->toUser) ? $this->toUser->user_type : null
            ],
            'message' => [
                'content' => $this->lastMessage ? Str::limit($this->lastMessage->message, 65) : null,
                'created_at' => $this->lastMessage ? Carbon::parse($this->lastMessage->created_at)->diffForHumans() : null,
            ],
            'action' => route('message.index', ['t' => encrypt($this->id), 'type' => $this->modal_type, 'seen_at' => true]),
            'unread_messages_count' => $this->unread_messages_count,
        ];
    }
}
