<?php


namespace App\Http\Controllers\AdminPanel\Order;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\Order\OrdersResource;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends CoreController
{
    use OrderTrait;

    public function __construct(Order $order)
    {
        $this->dirView = 'orders';
        $this->asRoute = 'order';
        $this->route = 'orders';
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

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle', 'asRoute')
        );
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->with('type')->paginate($limit);

        $data = OrdersResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

}
