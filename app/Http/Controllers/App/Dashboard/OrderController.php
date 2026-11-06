<?php

namespace App\Http\Controllers\App\Dashboard;

use App\Http\Controllers\App\CoreController;
use App\Http\Resources\App\Dashboard\Orders\OrderDetailsResources;
use App\Http\Resources\App\Dashboard\Orders\OrdersResources;
use App\Models\Order;
use App\Models\UserType;
use Illuminate\Http\Request;

class OrderController extends CoreController
{
    public $model;

    public function __construct(Order $model)
    {
        $this->model = $model;
    }

    public function data(Request $request)
    {
        $orders = new $this->model();

        $limit = $request->limit ? $request->limit : APP_PER_PAGE;

        if (user()->user_type_id == UserType::VOICE_ACTOR)
            $col = 'voice_actor_id';
        else
            $col = 'customer_id';

        $orders = $orders->where($col, user()->getAuthIdentifier());

        $orders = $orders->with('voiceItem')->latest()->paginate($limit);

        $data = OrdersResources::collection($orders);
        $meta = collect($data)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function details($id)
    {
        if (user()->user_type_id == UserType::VOICE_ACTOR)
            $col = 'voice_actor_id';
        else
            $col = 'customer_id';

        $order = Order::with('customer','voiceItem.details.category','servicesItems')->where($col, user()->getAuthIdentifier())->findOrFail($id);


        return $this->response(new OrderDetailsResources($order));
    }
}
