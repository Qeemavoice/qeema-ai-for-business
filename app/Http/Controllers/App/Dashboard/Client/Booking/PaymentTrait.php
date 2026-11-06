<?php

namespace App\Http\Controllers\App\Dashboard\Client\Booking;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemDetail;
use App\Models\OrderStatus;
use App\Models\OrderType;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionStatus;
use App\Models\TransactionType;
use App\Models\User;
use App\Models\UserStatus;
use App\Models\UserType;
use App\Models\Voice;
use App\Services\CurrencyHelper;
use App\Services\Payment\Gateways\StripePayment;


trait PaymentTrait
{
    private $payment_stripe_description;

    private function payByCash($total, $request)
    {
        return true;
    }

    private function payByStripe($total, $request)
    {
        $payment = new StripePayment();
        $description = '';
        $payment->setPaymentStripeDescription($description);
        return $payment->pay($total, $request->stripeToken);
    }

    private function createAccount($order)
    {
        $user = User::where('email', $order['email'])->userTypeClient()->active()->first();

        if (!$user && isset($order['do_not_account'])) {
            $fullName = $order['full_name'];
            $email = $order['email'];
            $password = $order['password'];

            $user = User::create([
                'full_name' => $fullName,
                'email' => $email,
                'user_type_id' => UserType::CLIENT,
                'status_id' => UserStatus::ACCEPTED,
                'password' => bcrypt($password)
            ]);
        }

        return $user;
    }

    private function saveOrder($request, $customer, $listOfPriceOrder)
    {
        $orderRequest = $request->order;

        $couponId = null;
        $discountPercentage = null;
        $discountValue = null;

        if (isset($orderRequest['coupon']['id'])) {
            $couponId = $orderRequest['coupon']['id'];
            $discountPercentage = $listOfPriceOrder['coupon']['percentage'];
            $discountValue = $listOfPriceOrder['coupon']['value'];
        }

        return Order::create([
            'voice_actor_id' => $orderRequest['voice']['voiceover_id'],
            'customer_id' => $customer->id,
            'customer_full_name' => $orderRequest['full_name'],
            'billing_full_name' => $request->card['full_name'],
            'customer_phone' => $orderRequest['whatsapp_number'],
            'customer_email' => $orderRequest['email'],
            'coupon_id' => $couponId,
            'discount_percentage' => $discountPercentage,
            'discount_value' => $discountValue,
            'payment_method_id' => $request->payment_method,
            'payment_method_percentage' => $listOfPriceOrder['paymentCommission']['percentage'],
            'payment_method_value' => $listOfPriceOrder['paymentCommission']['value'],
            'sub_total' => $listOfPriceOrder['subTotal'],
            'total' => $listOfPriceOrder['total'],
            'currency_id' => CurrencyHelper::getId(),
            'list_of_price' => json_encode($listOfPriceOrder),
            'note' => '',
            'status_id' => OrderStatus::IN_PROGRESS,
            'order_type_id' => OrderType::BOOKING_VOICE,
        ]);
    }

    public function updateUsedCoupon($couponId)
    {
        $db_coupon = Coupon::find($couponId);
        $db_coupon->used = $db_coupon->used + 1;
        $db_coupon->save();
    }

    public function createTransaction($order, $response, $transactionId, $transactionType = TransactionType::BOOKING)
    {
        $responseObj = json_decode($response);

        if ($responseObj->status === 'succeeded')
            $status = TransactionStatus::SUCCEEDED;
        else
            $status = TransactionStatus::FAILED;

        return Transaction::create([
            'order_id' => $order->id,
            'transaction_id' => $transactionId,
            'methodable_id' => $order->payment_method_id,
            'methodable_type' => PaymentMethod::class,
            'transaction_type_id' => $transactionType,
            'response' => $response,
            'description' => $order->note,
            'payer_id' => $order->customer_id,
            'amount_paid' => $order->total,
            'transaction_fee' => $order->payment_method_value,
            //'status' => $responseObj->status,
            'transaction_status_id' => $status,
           // 'currency' => $responseObj->currency,
            'currency_id' => CurrencyHelper::getId(),
        ]);
    }

    public function updateNumberOfOrdersVoice($voiceId)
    {
        $voice = Voice::find($voiceId);
        $voice->number_of_orders = $voice->number_of_orders + 1;
        $voice->save();
    }

    public function createItem($order, $orderData, $listOfPriceOrder)
    {
        $itemVoice = [
            'order_id' => $order->id,
            'itemable_id' => $orderData['voice']['id'],
            'notes' => $orderData['notes'],
            'itemable_type' => Voice::class,
            'item' => $orderData['scenario'],
            'unit_price' => $listOfPriceOrder['script']['pricePerMinute'],
            'percentage' => $listOfPriceOrder['script']['platFormCommission']['percentage'],
            'line_total' => $listOfPriceOrder['script']['total'],
        ];

        $item = OrderItem::create($itemVoice);

        OrderItemDetail::create([
            //'senario' => $orderData['scenario'],
            'voice_audio_file' => $orderData['voice']['audio_file'],
            'notes' => $orderData['notes'],
            'item_id' => $item->id,
            'language_id' => $orderData['voice']['language_id'],
            'category_id' => isset($orderData['voice']['category']) ? $orderData['voice']['category']['category_id'] : null,
            'dialect_id' => $orderData['voice']['dialect_id'],
            'voice_type_id' => $orderData['voice']['voice_type_id'],
            'word_count' => $listOfPriceOrder['script']['numberOfWords'],
            'number_of_minutes' => $listOfPriceOrder['script']['numberOfMinutes'],
        ]);

        if (isset($listOfPriceOrder['services']['list'])) {
            foreach ($listOfPriceOrder['services']['list'] as $key => $item) {
                $newItem = [
                    'order_id' => $order->id,
                    'itemable_id' => $item['id'],
                    'itemable_type' => Service::class,
                    'item' => $item['title'][get_locale()],
                    'unit_price' => $item['price_per_minute'],
                    'percentage' => Service::SERVICE_TYPE_PERCENT == $item['type'] ? $item['value'] : null,
                    'line_total' => $item['total'],
                    'notes' => null,
                ];

                $itemService = OrderItem::create($newItem);

                OrderItemDetail::create([
                    'item_id' => $itemService->id,
                    'word_count' => $listOfPriceOrder['script']['numberOfWords'],
                    'number_of_minutes' => $item['number_of_minutes'],
                ]);
            }
        }
    }
}
