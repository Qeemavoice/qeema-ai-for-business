<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\UserMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;


class SendMessageNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    private $message;
    private $userMessage;

    public function __construct(Message $message, UserMessage $userMessage)
    {
        $this->message = $message;
        $this->userMessage = $userMessage;
        $this->setType(APP_MESSAGE_NOTIFICATION_TYPE);
    }

    private function setType($value)
    {
        $this->message->_type = $value;
    }

    public function via($notifiable): array
    {
        $drive = ['broadcast'];

        if (Carbon::now()->toDateString() > $this->userMessage->is_send_email || is_null($this->userMessage->is_send_email)) {
            array_push($drive, 'mail');
        }

        return $drive;
    }

    public function toMail($notifiable)
    {
        $this->userMessage->is_send_email = Carbon::now()->toDateTimeString();
        $this->userMessage->save();

        $subject = trans_notification('new_message_from_admin.subject');

        return (new MailMessage)
            ->view('emails.new_message_from_admin', [
                'user' => $this->message->toUser,
                'subject' => $subject,
                'content' => trans_notification('notification.new_message_from_admin.content'),
                'url' => url('/' . get_locale() . '/messages/all') . '?t=' . encrypt($this->userMessage->id),
            ])->subject($subject);
    }

    public function toBroadcast($notifiable = null): BroadcastMessage
    {
        return new BroadcastMessage(['message' => $this->message, '_type' => APP_MESSAGE_NOTIFICATION_TYPE]);
    }
}
