<?php


namespace App\Http\Controllers\AdminPanel\Transaction;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\Transaction\TransactionsResource;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends CoreController
{
    use TransactionTrait;

    public function __construct(Transaction $transaction)
    {
        $this->dirView = 'transactions';
        $this->asRoute = 'transaction';
        $this->route = 'transactions';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($transaction);
    }

    public function index()
    {
        $pageTitle = trans_admin('transactions');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $transactions = new $this->model();

        $transactions = $this->filter($request, $transactions);

        $transactions = $this->sort($request, $transactions);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $transactions = $transactions->with('transactionType','methodable','payer','payee','order')->paginate($limit);

        $data = TransactionsResource::collection($transactions);
        $meta = collect($transactions)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }
}
