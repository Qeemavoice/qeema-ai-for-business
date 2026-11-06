<?php


namespace App\Http\Controllers\AdminPanel\Order;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\UserMessage;
use App\Models\Voice;

class OrderDetailsController extends CoreController
{
    public function __construct(Order $order)
    {
        $this->dirView = 'orders';
        $this->asRoute = 'order';
        $this->route = 'orders';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($order);
    }

    public function index($orderId)
    {
        $pageTitle = trans_admin('orders');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);


        $order = $this->model::with(
            'transaction.transactionType',
            'transaction.invoice',
            'status',
            'type',
            'customer',
            'voiceActor.profile',
            'currency',
            'items'
        )->findOrFail($orderId);


        $asRoute = $this->asRoute;
        $orderStatuses = OrderStatus::getStatuses();

        $userMessage = UserMessage::with('fromUser','toUser')->where('order_id', $order->id)->first();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details.index',
            compact('pageTitle', 'asRoute', 'order', 'orderStatuses','userMessage')
        );
    }

}
