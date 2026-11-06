<?php


namespace App\Http\Controllers\AdminPanel\Customer;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Customer\StoreCustomerRequest;
use App\Http\Resources\AdminPanel\Customer\CustomersResource;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends CoreController
{
    use CustomerTrait;

    public function __construct(Customer $customer)
    {
        $this->dirView = 'customers';
        $this->asRoute = 'customer';
        $this->route = 'customers';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($customer);
    }

    public function index()
    {
        $pageTitle = trans_admin('customers');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_customer');

        meta_data(trans_admin('customers'), trans_admin('customers'), [
            $this->routeUrl => trans_admin('customers'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = CustomersResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $customer = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_customer');

        meta_data(trans_admin('customers'), trans_admin('customers'), [
            $this->routeUrl => trans_admin('customers'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'customer'));
    }


    public function store(StoreCustomerRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->name = $request->name;
        $store->alt = $request->alt;
        $store->image = $request->image;
        $store->save();

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        return $this->deleteResponse($this->model::findOrFail($id)->delete());
    }
}
