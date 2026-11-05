<?php


namespace App\Http\Controllers\AdminPanel\Setting;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Setting\StorePaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Cache;

class PaymentMethodController extends CoreController
{
    public function __construct(PaymentMethod $paymentMethod)
    {
        $this->dirView = 'payment-methods';
        $this->asRoute = 'paymentMethod';
        $this->route = 'payment-methods';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($paymentMethod);
    }

    public function store(StorePaymentMethodRequest $request)
    {
        $paypal = $request->paypal;
        $stripe = $request->stripe;
        $cash = $request->cash;

        if ($paypal['config']['client_id'] && $paypal['config']['secret']) {
            $db_paypal = getPaymentMethod(PaymentMethod::PAYPAL);
            if (is_null($db_paypal))
                $db_paypal = new PaymentMethod();
            $db_paypal->name = $paypal['name'];
//            $db_paypal->description = $paypal['description'];
            $db_paypal->config = json_encode($paypal['config']);
            $db_paypal->sandbox_config = $paypal['sandbox_config'];
            $db_paypal->is_active = $paypal['is_active'];
            $db_paypal->sandbox_is_active = $paypal['sandbox_is_active'];
            $db_paypal->save();
        }

        if ($stripe['config']['key_id'] && $stripe['config']['secret']) {
            $db_stripe = getPaymentMethod(PaymentMethod::STRIPE);
            if (is_null($db_stripe))
                $db_stripe = new PaymentMethod();
            $db_stripe->name = $stripe['name'];
//            $db_stripe->description = $stripe['description'];
            $db_stripe->config = json_encode($stripe['config']);
            $db_stripe->sandbox_config = $stripe['sandbox_config'];
            $db_stripe->is_active = $stripe['is_active'];
            $db_stripe->sandbox_is_active = $stripe['sandbox_is_active'];
            $db_stripe->save();
        }

        if ($cash['name'] && $cash['description']) {
            $db_cash = getPaymentMethod(PaymentMethod::CASH);
            if (is_null($db_cash))
                $db_cash = new PaymentMethod();

            $db_cash->name = $cash['name'];
//            $db_cash->description = $cash['description'];
            $db_cash->is_active = $cash['is_active'];
            $db_cash->save();
        }

        Cache::forget('paymentMethodsAll');

        return $this->successResponse(true);
    }
}
