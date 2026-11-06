<?php


namespace App\Http\Controllers\App\Dashboard\Client;

use App\Http\Controllers\App\CoreController;
use App\Models\Order;
use App\Models\OrderCancellationRequest;
use App\Models\OrderStatus;
use App\Services\WalletHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends CoreController
{
    public function complete($orderId)
    {
        $order = DB::transaction(function () use ($orderId) {

            $order = Order::where('customer_id', user()->getAuthIdentifier())
                ->where('status_id', OrderStatus::IN_PROGRESS)
                ->findOrFail($orderId);

            $order->status_id = OrderStatus::COMPLETED;
            $order->save();

            WalletHelper::releaseHoldPayment($orderId);

            return $order;
        });

        // todo :: send notify voice over complete order
        // todo :: send to admin
        return $this->successResponse($order);
    }

    public function cancellationRequest($orderId, Request $request)
    {
        $order = DB::transaction(function () use ($orderId, $request) {

            OrderCancellationRequest::create([
                'from_id' => user()->getAuthIdentifier(),
                'order_id' => $orderId,
                'reasons' => $request->reasons,
            ]);

            $order = Order::where('customer_id', user()->getAuthIdentifier())->findOrFail($orderId);
            $order->status_id = OrderStatus::CANCELLATION_REQUEST;
            $order->save();

            return $order;
        });

        return $this->successResponse($order);
    }
}
