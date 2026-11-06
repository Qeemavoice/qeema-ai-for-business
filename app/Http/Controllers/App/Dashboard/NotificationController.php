<?php


namespace App\Http\Controllers\App\Dashboard;


use App\Http\Controllers\App\CoreController;
use App\Http\Resources\NotificationResource;

class NotificationController extends CoreController
{
    public function data()
    {
        $notifications = user()->notifications()->paginate(APP_PER_PAGE);
        $data = NotificationResource::collection($notifications);
        $meta = collect($notifications)->except('data');

        $countUnReadNotifications = user()->unreadNotifications()->count();

        return $this->response([
            'data' => $data,
            'meta' => $meta,
            'countUnReadNotifications' => $countUnReadNotifications
        ]);
    }

    public function getTheNumberOfUnreadMessages()
    {
        $countUnReadNotifications = user()->unreadNotifications()->count();
        return $this->response([
            'countUnReadNotifications' => $countUnReadNotifications
        ]);
    }
}
