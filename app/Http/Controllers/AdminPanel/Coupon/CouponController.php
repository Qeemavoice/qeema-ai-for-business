<?php


namespace App\Http\Controllers\AdminPanel\Coupon;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Coupon\StoreCouponRequest;
use App\Http\Resources\AdminPanel\Coupon\CouponsResource;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends CoreController
{
    use CouponTrait;

    public function __construct(Coupon $model)
    {
        $this->dirView = 'coupons';
        $this->asRoute = 'coupon';
        $this->route = 'coupons';
        $this->routeUrl = route_admin($this->asRoute . '.index');
        parent::__construct($model);
    }

    public function index()
    {
        $pageTitle = trans_admin('coupons');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_coupon');

        meta_data(trans_admin('coupons'), trans_admin('coupons'), [
            $this->routeUrl => trans_admin('coupons'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'asRoute'));
    }

    public function edit($id)
    {
        $coupon = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_coupon');

        meta_data(trans_admin('coupons'), trans_admin('coupons'), [
            $this->routeUrl => trans_admin('coupons'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'coupon')
        );
    }


    public function data(Request $request)
    {
        $coupons = new $this->model();

        $coupons = $this->filter($request, $coupons);

        $coupons = $this->sort($request, $coupons);

        $coupons = $coupons->paginate(ADMIN_PER_PAGE);

        $data = CouponsResource::collection($coupons);
        $meta = collect($coupons)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta
        ]);
    }

    public function store(StoreCouponRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::find($id);
        } else {
            $store = new $this->model;
        }

        $store->name = $request->name;
        $store->code = $request->code;
        $store->value = $request->value;
        $store->usage_limit_per_coupon = $request->usage_limit_per_coupon;
        $store->usage_limit_per_customer = $request->usage_limit_per_customer;
        $store->is_active = $request->is_active;
        $store->start_date = $request->start_date;
        $store->end_date = $request->end_date;
        $store->minimum_minutes = $request->minimum_minutes;
        $store->is_percent = YES;
        $store->save();

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();
        return $this->deleteResponse($delete);
    }
}
