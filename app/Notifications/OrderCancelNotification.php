<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;


class OrderCancelNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    private $order;
    private $title;
    private $body;

    public function __construct($order)
    {
        $this->order = $order;
    }


    public function via($notifiable)
    {
        return ['broadcast', 'database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $subject = trans('notification.order_cancel.title', [], get_locale());

        return (new MailMessage)
            ->view('emails.order_booing',
                [
                    'subject' => $subject,
                    'content' => trans('notification.order_cancel.body', ['order' => $this->order], get_locale())
                ]
            )->subject($subject);
    }

    public function toArray($notifiable = null)
    {
        return [
            'title' => json_encode([
                'ar' => trans('notification.order_cancel.title', [], 'ar'),
            ]),
            'body' => json_encode([
                'ar' => trans('notification.order_cancel.body', [], 'ar'),
            ]),
            'action' => [
                'key' => 'order_booking',
                'value' => $this->order->id
            ],
        ];
    }

    public function toBroadcast($notifiable = null): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => [
                'ar' => trans('notification.order_cancel.title', [], 'ar'),
            ],
            'body' => [
                'ar' => trans('notification.order_cancel.body', [], 'ar'),
            ],
            'action' => '#',
            'created_at' => Carbon::now()->toDateTimeString(),
            '_type' => APP_NOTIFICATION_TYPE,
        ]);
    }
}
