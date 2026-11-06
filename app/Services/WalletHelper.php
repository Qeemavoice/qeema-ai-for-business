<?php


namespace App\Services;

use App\Models\HoldPayment;
use App\Models\ProfitPayment;
use App\Models\Wallet;
use App\Models\WalletLogs;
use Carbon\Carbon;

class WalletHelper
{
    public static function create($userId)
    {
        return Wallet::create([
            'account_id' => self::generateAccountIdToWallet($userId),
            'user_id' => $userId
        ]);
    }

    public static function getWalletByUserId($userId)
    {
        $wallet = Wallet::where('user_id', $userId)->first();

        if (!$wallet)
            $wallet = self::create($userId);

        return $wallet;
    }

    private static function generateAccountIdToWallet($userId)
    {
        return 'QEE-' . self::generateUniqid();
    }


    private static function generateUniqid()
    {
        return substr(strtoupper(bin2hex(random_bytes(8))), 0, 12);
    }

    public static function addHoldProfits($user, $total, $transactionId)
    {

        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            $wallet = self::create($user->id);
        }
        $wallet->hold_profits = $wallet->hold_profits + $total;
        $wallet->save();

        $hold = new HoldPayment();
        $hold->transaction_id = $transactionId;
        $hold->wallet_id = $wallet->id;
        $hold->status = HoldPayment::HOLD;
        $hold->value = $total;
        $hold->save();

        $walletLog = new WalletLogs();
        $walletLog->wallet_id = $wallet->id;
        $walletLog->transaction_id = $transactionId;
        $walletLog->sub_wallet_type = get_class($hold);
        $walletLog->sub_wallet_id = $hold->id;
        $walletLog->save();
    }

    public static function setExpectedReleaseDateHoldPayment($orderId)
    {
        $setting = getSetting('payment_hold_days_voice_actor');
        $paymentHoldDaysVoiceActor = isset($setting->value) ? $setting->value : null;

        $holdPayment = HoldPayment::whereHas('transaction', function ($q) use ($orderId) {
            $q->where('order_id', $orderId);
            $q->where('payer_id', user()->getAuthIdentifier());
        })->whereNull('expected_release_date')->first();

        $holdPayment->expected_release_date = Carbon::now()->addDays($paymentHoldDaysVoiceActor)->toDateTimeString();
        $holdPayment->save();
    }


    public static function releaseHoldPayment($orderId)
    {
        $holdPayment = HoldPayment::whereHas('transaction', function ($q) use ($orderId) {
            $q->where('order_id', $orderId);
            $q->where('payer_id', user()->getAuthIdentifier());
        })->first();


        $holdProfits = $holdPayment->value;

        $wallet = Wallet::find($holdPayment->wallet_id);
        $wallet->hold_profits = $wallet->hold_profits - $holdProfits;
        $wallet->profits = $wallet->profits + $holdProfits;
        $wallet->save();


        $holdPayment->status = HoldPayment::RELEASED;
        $holdPayment->release_date = Carbon::now()->toDateTimeString();
        $holdPayment->save();

        $newProfit = new ProfitPayment();
        $newProfit->wallet_id = $wallet->id;
        $newProfit->status = ProfitPayment::DEPOSIT;
        $newProfit->value = $holdProfits;
        $newProfit->transaction_id = $holdPayment->transaction_id;
        $newProfit->release_date = Carbon::now()->toDateTimeString();
        $newProfit->save();

        $walletProfitLog = new WalletLogs();
        $walletProfitLog->wallet_id = $wallet->id;
        $walletProfitLog->sub_wallet_type = get_class($newProfit);
        $walletProfitLog->sub_wallet_id = $newProfit->id;
        $walletProfitLog->save();


        return $walletProfitLog;
    }


    public static function withdrawalProfitPayment()
    {

    }

}
