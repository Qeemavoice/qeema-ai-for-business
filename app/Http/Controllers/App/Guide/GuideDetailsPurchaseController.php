<?php


namespace App\Http\Controllers\App\Guide;


use App\Http\Controllers\App\CoreController;
use App\Http\Controllers\App\Dashboard\Client\Booking\PaymentTrait;
use App\Http\Requests\App\Guide\GuidePurchaseRequest;
use App\Models\Guide;
use App\Models\GuideDownload;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatus;
use App\Models\OrderType;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\TransactionType;
use App\Services\CurrencyHelper;
use Illuminate\Support\Facades\DB;


class GuideDetailsPurchaseController extends CoreController
{
    use PaymentTrait;

    public function purchase(GuidePurchaseRequest $request)
    {
        $guide = Guide::findOrFail($request->guide);

        $guideFile = public_path(DIR_UPLOAD . DS . Guide::DIR_GUIDE_UPLOADS . DS . $guide->file);

        if (!file_exists($guideFile)) {
            return $this->successResponse(false, trans('messages . file_not_found'));
        }

        $guidePrice = $guide->unit_price;
        $commissionStripe = commissions('stripe');

        if ($commissionStripe) {
            $valueCommissionStripe = calculateValueFromPercentage($guidePrice, $commissionStripe);
            $total = $guidePrice + $valueCommissionStripe;
        }

        $pay = false;
        $responsePayment = null;
        $transactionPaymentId = null;

        if ($request->payment_method == PaymentMethod::STRIPE) {
            try {
                $pay = $this->payByStripe($total, $request);
                $responsePayment = $pay->getLastResponse()->body;
                $transactionPaymentId = $pay->id;
            } catch (\Exception $exception) {
                return $this->successResponse(false, $exception->getMessage());
            }
        }

        if (!$pay)
            return $this->successResponse(false);


        $storeOrder = DB::transaction(function () use ($request, $guide, $valueCommissionStripe, $commissionStripe, $total, $responsePayment, $transactionPaymentId) {
            $order = Order::create([
                'customer_id' => user()->getAuthIdentifier(),
                'billing_full_name' => $request->card['full_name'],
                'payment_method_id' => $request->payment_method,
                'payment_method_percentage' => $valueCommissionStripe,
                'payment_method_value' => $valueCommissionStripe,
                'sub_total' => $commissionStripe,
                'total' => $total,
                'currency_id' => CurrencyHelper::getId(),
                'note' => '',
                'status_id' => OrderStatus::COMPLETED,
                'order_type_id' => OrderType::BUY_GUIDE,
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'itemable_id' => $guide->id,
                'itemable_type' => Guide::class,
                'item' => $guide->file,
                'unit_price' => $guide->unit_price,
                'line_total' => $guide->unit_price,
            ]);

            $this->createTransaction($order, $responsePayment, $transactionPaymentId, TransactionType::BUYING_GUIDE);

            GuideDownload::create([
                'guide_id' => $guide->id,
                'order_id' => $order->id,
                'user_id' => user()->getAuthIdentifier(),
            ]);

            $guide->number_of_downloads = $guide->number_of_downloads + 1;
            $guide->save();


            Invoice::create([
                'due_value' => $total,
                'order_id' => $order->id,
                'payment_method_id' => $order->payment_method_id,
                'payment_status_id' => PaymentStatus::PAID,
                'type' => Invoice::ORDER,
            ]);

            return $order;
        });

        if (!$storeOrder) {
            return $this->successResponse(false);
        }

        return response()->download($guideFile);
    }


}
