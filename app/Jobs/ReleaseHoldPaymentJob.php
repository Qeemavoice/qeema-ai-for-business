<?php

namespace App\Jobs;

use App\Models\HoldPayment;
use App\Models\ProfitPayment;
use App\Models\Wallet;
use App\Models\WalletLogs;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ReleaseHoldPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
    }


    public function handle()
    {
        Log::info("ReleaseHoldPaymentJob2 is working fine! ...." . Carbon::now()->toDateString());

        HoldPayment::where('status', HoldPayment::HOLD)
            ->whereDate('expected_release_date', '<=', Carbon::now()->toDateString())
            ->chunk(50, function ($data) {
                foreach ($data as $hold) {
                    $historyReleaseHoldPayments[] = DB::transaction(function () use ($hold) {
                        $holdProfits = $hold->value;

                        $wallet = Wallet::find($hold->wallet_id);
                        $wallet->hold_profits = $wallet->hold_profits - $holdProfits;
                        $wallet->profits = $wallet->profits + $holdProfits;
                        $wallet->save();

                        $hold->status = HoldPayment::RELEASED;
                        $hold->release_date = Carbon::now()->toDateTimeString();
                        $hold->save();

                        $newProfit = new ProfitPayment();
                        $newProfit->wallet_id = $wallet->id;
                        $newProfit->status = ProfitPayment::DEPOSIT;
                        $newProfit->value = $holdProfits;
                        $newProfit->transaction_id = $hold->transaction_id;
                        $newProfit->release_date = Carbon::now()->toDateTimeString();
                        $newProfit->save();

                        $walletProfitLog = new WalletLogs();
                        $walletProfitLog->wallet_id = $wallet->id;
                        $walletProfitLog->sub_wallet_type = get_class($newProfit);
                        $walletProfitLog->sub_wallet_id = $newProfit->id;
                        $walletProfitLog->save();


                        $logs = 'wallet: ' . $wallet->account_id . ', profit_value: ' . $holdProfits;
                        Log::channel('releaseholdprofits')->info($logs);
                    });
                }
            });
    }
}
