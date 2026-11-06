<?php


namespace App\Http\Controllers\AdminPanel\Notification;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController  extends CoreController
{
    public function __construct(Notification $notification)
    {
        $this->dirView = 'notifications';
        $this->asRoute = 'notification';
        $this->route = 'notification';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($notification);
    }

    public function index()
    {
        $pageTitle = trans_admin('notifications');
        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);
        $asRoute = $this->asRoute;
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $notifications = user()->notifications()->paginate(APP_PER_PAGE);
        $data = NotificationResource::collection($notifications);
        $meta = collect($notifications)->except('data');

        $countUnReadNotifications =  user()->unreadNotifications()->count();

        return $this->response([
            'data' => $data,
            'meta' => $meta,
            'countUnReadNotifications' => $countUnReadNotifications,
        ]);

    }


}
