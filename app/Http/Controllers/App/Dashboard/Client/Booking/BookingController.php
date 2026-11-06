<?php

namespace App\Http\Controllers\App\Dashboard\Client\Booking;

use App\Http\Controllers\App\CoreController;
use App\Http\Controllers\App\Dashboard\Chat\ChatTrait;
use App\Http\Requests\App\Booking\BookingRequest;
use App\Http\Requests\App\Booking\ValidateBookingOrderRequest;
use App\Http\Requests\App\Dashboard\Client\ApplyCouponRequest;
use App\Jobs\SendUserWelcomeEmailJob;
use App\Models\Coupon;
use App\Models\Dialect;
use App\Models\Invoice;
use App\Models\Language;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\Service;
use App\Models\User;
use App\Models\UserStatus;
use App\Models\UserType;
use App\Models\Voice;
use App\Models\VoiceType;
use App\Services\BookingPrices;
use App\Services\CurrencyHelper;
use App\Services\Payment\Gateways\StripePayment;
use App\Services\WalletHelper;
use Illuminate\Support\Facades\DB;

class BookingController extends CoreController
{
    use PaymentTrait, ChatTrait;

    protected $dirView;

    public function __construct()
    {

        $this->dirView = 'booking';
        $this->middleware('throttle:8,1')->except('index');
    }

    public function index($slug)
    {
        meta_data(trans_app('book_a_voiceover_for_your_project'), trans_app('now_booking'), [
            '#' => trans_app('now_booking'),
        ]);

        $voice = Voice::with('dialect', 'language', 'categories.category','category')->findOrFail(get_id_by_slug($slug));
        $user = user();
        $languages = Language::getLanguages();
        $actorTypes = VoiceType::getTypes();
        $dialects = Dialect::dialects();
        $services = Service::getServices();

        $currency = CurrencyHelper::getSymbol();
        $keyStripe = StripePayment::config('key_id');
        $commissions = commissions();

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('voice', 'user', 'languages', 'actorTypes', 'dialects', 'services', 'currency', 'keyStripe', 'commissions')
        );
    }

    public function validateBookingOrderRequest(ValidateBookingOrderRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (user()) {
            $user = User::where('email', user()->email)->first();
        }


        if (!$user) {
            if (!$request->do_not_account) {
                return $this->errorResponse(['do_not_account' => [trans('messages.do_not_account_is_required')]], trans('messages.do_not_account_is_required'));
            }
        } else {
            if ($user->status_id !== UserStatus::ACCEPTED) {
                return $this->errorResponse([], trans('messages.user_is_inactive'));
            }

            if ($user->user_type_id !== UserType::CLIENT) {
                return $this->errorResponse([], trans('messages.user_is_not_client'));
            }
        }


        return $this->successResponse(true);
    }

    public function booking(BookingRequest $request)
    {
        $listOfPriceOrder = BookingPrices::calculatePricesOrder($request->order);

        $pay = false;
        $responsePayment = null;
        $transactionPaymentId = null;

        if ($request->payment_method == PaymentMethod::STRIPE) {
            try {
                $pay = $this->payByStripe($listOfPriceOrder['total'], $request);
                $responsePayment = $pay->getLastResponse()->body;
                $transactionPaymentId = $pay->id;
            } catch (\Exception $exception) {
                return $this->successResponse(false, $exception->getMessage());
            }
        }

        if (!$pay)
            return $this->successResponse(false);


        $storeOrder = DB::transaction(function () use ($request, $responsePayment, $transactionPaymentId, $listOfPriceOrder) {

            $orderRequest = $request->order;
            $voice = $orderRequest['voice'];

            $user = $this->createAccount($orderRequest);

            if (isset($orderRequest->coupon)) {
                $coupon = $orderRequest->coupon;
                $this->updateUsedCoupon($coupon);
            }

            $order = $this->saveOrder($request, $user, $listOfPriceOrder);

            $this->createItem($order, $orderRequest, $listOfPriceOrder);

            $this->updateNumberOfOrdersVoice($voice['id']);

            $paymentTransaction = $this->createTransaction($order, $responsePayment, $transactionPaymentId);

            WalletHelper::addHoldProfits($user, $listOfPriceOrder['script']['pricePerMinute'], $paymentTransaction->id);

//            Invoice::create([
//                'due_value' => $listOfPriceOrder['total'],
//                'order_id' => $order->id,
//                'payment_method_id' => $order->payment_method_id,
//                'payment_status_id' => PaymentStatus::PAID,
//                'type' => Invoice::ORDER,
//            ]);

            $this->openChatWithVoiceActor([
                'u_from_id' => $user->id,
                'u_to_id' => $order->voice_actor_id,
                'order_id' => $order->id
            ]);

            return [
                'order' => $order,
                'user' => $user,
            ];
        });


        if (!$storeOrder['order'])
            return $this->successResponse(false);

        if ($request->order['do_not_account']) {
            dispatch(new SendUserWelcomeEmailJob($storeOrder['user']));
        }

        //todo : send notifcation to admins bes new order ,
        //todo : send email sussess order to client
        $message = user() ? trans('messages.success') : trans('messages.success_save_order');

        return $this->response(
            ['redirectTo' => route_app('client.profile.index') . '#orders'],
            null,
            $message
        );
    }

    public function applyCoupon(ApplyCouponRequest $request)
    {
        $coupon = Coupon::where('code', $request->code)->active()->first();

        if (!$coupon)
            return $this->successResponse(false, trans('messages.the_coupon_is_invalid'));

        $numberOfMinutes = numberOfMinutes($request->scenario);

        if ($numberOfMinutes < $coupon->minimum_minutes) {
            return $this->successResponse(false, trans('messages.the_minimum_script_duration_is_to_benefit_from_the_discount_coupon', ['minit' => $coupon->minimum_minutes, 'coupon' => $coupon->code]));
        }

        $order = Order::select('coupon_id')->where('coupon_id', $coupon->id)->get();
        $usage_limit_per_coupon = count($order);


        if ($coupon->usage_limit_per_coupon <= $usage_limit_per_coupon)
            return $this->successResponse(false, trans('messages.usage_limit_per_coupon'));

        if (user()) {
            $order = Order::select('coupon_id')->where('coupon_id', $coupon->id)->where('customer_id', user()->id)->get();
            $usage_limit_per_customer = count($order);
            if ($coupon->usage_limit_per_customer <= $usage_limit_per_customer)
                return $this->successResponse(false, trans('messages.usage_limit_per_customer'));
        }

        return $this->response([
            'code' => $coupon->code,
            'value' => (float)$coupon->value,
            'calculated_value' => (float)$coupon->value,
            'is_percent' => $coupon->is_percent,
        ]);
    }
}
