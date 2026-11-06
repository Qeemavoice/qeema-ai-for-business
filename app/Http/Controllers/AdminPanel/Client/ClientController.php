<?php

namespace App\Http\Controllers\AdminPanel\Client;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\Client\ClientsResource;
use App\Models\User;
use Illuminate\Http\Request;


class ClientController extends CoreController
{
    use ClientTrait;

    public function __construct(User $user)
    {
        $this->dirView = 'clients';
        $this->asRoute = 'client';
        $this->route = 'clients';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($user);
    }

    public function index()
    {
        $pageTitle = trans_admin('clients');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $clients = new $this->model();

        $clients = $this->filter($request, $clients);

        $clients = $this->sort($request, $clients);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;

        $clients = $clients->userTypeClient()
            ->with('workFields')
            ->withCount('inProgressOrdersCustomer', 'completedOrdersCustomer')
            ->withSum('ordersCustomer', 'total')
            ->paginate($limit);

        $data = ClientsResource::collection($clients);
        $meta = collect($clients)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

}
