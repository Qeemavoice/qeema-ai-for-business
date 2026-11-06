<?php

namespace App\Http\Controllers\App\Dashboard\Client;

use App\Http\Controllers\App\CoreController;
use App\Http\Resources\App\Dashboard\Invoices\InvoicesResources;
//use App\Models\Invoice;
use App\Models\Transaction;
use Illuminate\Http\Request;

class InvoiceController extends CoreController
{
    public $model;

    public function __construct()
    {
        //  $this->model = $invoice;
    }

    public function data(Request $request)
    {
        $invoices = new Transaction();

        $limit = $request->limit ? $request->limit : APP_PER_PAGE;
        $invoices = $invoices->where('payer_id', user()->getAuthIdentifier())
            ->orderBy('id','desc')
            ->paginate($limit);

        $data = InvoicesResources::collection($invoices);
        $meta = collect($data)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }
}
