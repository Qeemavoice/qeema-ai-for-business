<?php

namespace App\Http\Controllers\AdminPanel\Profit;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Profit\StoreProfitRequest;
use App\Http\Resources\AdminPanel\Profit\ProfitsResource;
use App\Models\ProfitPayment;
use App\Models\Transaction;
use App\Models\TransactionStatus;
use App\Models\TransactionType;
use App\Models\WalletLogs;
use App\Models\WithdrawalMethod;
use App\Services\CurrencyHelper;
use App\Services\WalletHelper;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfitController extends CoreController
{
    use ProfitTrait;

    public function __construct(Transaction $transaction)
    {
        $this->dirView = 'profits';
        $this->asRoute = 'profit';
        $this->route = 'profits';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($transaction);
    }

    public function index()
    {
        $pageTitle = trans_admin('profits');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $profits = new $this->model();

        $profits = $this->filter($request, $profits);

        $profits = $this->sort($request, $profits);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $profits = $profits->with('payee','methodable')->paginate($limit);

        $data = ProfitsResource::collection($profits);
        $meta = collect($profits)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }


    public function create()
    {
        $pageTitle = trans_admin('add_profit');

        meta_data(trans_admin('profits'), trans_admin('profits'), [
            $this->routeUrl => trans_admin('profits'),
            '' => $pageTitle
        ]);
        $withdrawalMethod = WithdrawalMethod::getMethods();
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'withdrawalMethod'));
    }


    public function edit($id)
    {
        $profit = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_profit');

        meta_data(trans_admin('profits'), trans_admin('profits'), [
            $this->routeUrl => trans_admin('profits'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'profit'));
    }

    public function store(StoreProfitRequest $request)
    {
        $wallet = WalletHelper::getWalletByUserId($request->voiceover);

        $amount = $request->amount;

        if ($amount > $wallet->profits ) {
            $message = trans_admin('wallet_profits_max_profits');
            return $this->errorResponse(null, $message);
        }

        $store = DB::transaction(function () use ($request, $wallet, $amount) {

            $transactionId = $request->transaction_id;

            $transaction = Transaction::create([
                'transaction_id' => $transactionId,
                'methodable_id' => $request->withdrawal_method,
                'methodable_type' => WithdrawalMethod::class,
                'transaction_type_id' => TransactionType::WITHDRAW_PROFITS,
                'payee_id' => $request->voiceover,
                'amount_paid' => $amount,
                'transaction_status_id' => TransactionStatus::SUCCEEDED,
                'currency_id' => CurrencyHelper::getId(),
                'receipt' => $request->receipt,
            ]);

            $wallet->profits = $wallet->profits - $amount;
            $wallet->withdrawal_profits = $wallet->withdrawal_profits + $amount;
            $wallet->save();

            $newProfit = new ProfitPayment();
            $newProfit->transaction_id = $transaction->id;
            $newProfit->wallet_id = $wallet->id;
            $newProfit->value = $amount;
            $newProfit->status = ProfitPayment::WITHDRAW;
            $newProfit->release_date = Carbon::now()->toDateTimeString();
            $newProfit->save();

            $walletProfitLog = new WalletLogs();
            $walletProfitLog->wallet_id = $wallet->id;
            $walletProfitLog->sub_wallet_type = get_class($newProfit);
            $walletProfitLog->sub_wallet_id = $newProfit->id;
            $walletProfitLog->save();

            return $wallet;
        });

        return $this->successResponse($store);
    }

    public function destroy($id)
    {

    }

}
