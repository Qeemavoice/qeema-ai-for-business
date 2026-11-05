<?php


namespace App\Http\Controllers\AdminPanel\OrderCancellationRequest;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\OrderCancellationRequest\OrdersCancellationRequestsResource;
use App\Models\Order;
use App\Models\OrderCancellationRequest;
use App\Models\OrderStatus;
use App\Models\RequestStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderCancellationRequestController extends CoreController
{
    use OrderCancellationRequestTrait;

    public function __construct(OrderCancellationRequest $order)
    {
        $this->dirView = 'orders-cancellation-requests';
        $this->asRoute = 'orderCancellationRequest';
        $this->route = 'orders-cancellation-requests';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($order);
    }

    public function index()
    {
        $pageTitle = trans_admin('orders');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->with('from', 'order','status')->paginate($limit);

        $data = OrdersCancellationRequestsResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function accept($id)
    {
        $store = DB::transaction(function () use ($id) {
            $request = $this->model::findOrFail($id);
            $request->request_status_id = RequestStatus::ACCEPTED;
            $request->save();

            $order = Order::findOrFail($request->order_id);
            $order->status_id = OrderStatus::CANCELED;
            $order->save();
            return $order;
        });

        //todo :: send notify to voice actor and client
        return $this->successResponse($store);
    }

    public function reject($id)
    {
        $request = $this->model::findOrFail($id);
        $request->request_status_id = RequestStatus::REJECTED;
        $request->save();

        //todo :: send notify to voice actor and client

        return $this->successResponse($request);
    }
}
