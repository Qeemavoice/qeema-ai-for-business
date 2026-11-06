<?php


namespace App\Services\Payment\Gateways;

use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Config;
use Stripe;

class StripePayment
{
    private $stripConfig;
    private $paymentStripeDescription;
    public const PAYMENT_STRIPE_CENTS = 100;
    public const PAYMENT_STRIPE_CURRENCY = 'usd';

    public function __construct()
    {
        $this->stripConfig = self::config();
        Stripe\Stripe::setApiKey($this->stripConfig['secret']);
    }

    public static function config($key = null)
    {
        $method_db = getPaymentMethod(PaymentMethod::STRIPE);

        $config = Config::get('stripe');


        if ($method_db) {
            $config_live = $method_db->config;
            $config_sand_box = $method_db->sandbox_config;

            if ($method_db->sandbox_is_active == YES)
                $new_config = [
                    'key_id' => $config_sand_box->key_id,
                    'secret' => $config_sand_box->secret,
                ];
            else
                $new_config = [
                    'key_id' => $config_live->key_id,
                    'secret' => $config_live->secret
                ];
        } else {
            if ($config['mode'] != ENV_PRODUCTION) {
                $new_config = [
                    'key_id' => $config['key'],
                    'secret' => $config['secret'],
                ];
            } else {
                $new_config = [
                    'key_id' => $config['test_key'],
                    'secret' => $config['test_secret'],
                ];
            }
        }
        return isset($key) ? $new_config[$key] : $new_config;
    }

    public function pay($totalsAmounts, $stripeToken, $currency = '')
    {
        if (!Config::get('services.payments_enabled', false)) {
            throw new \RuntimeException('Payments are disabled in this environment.');
        }

        try {
            //This value must be greater than or equal to 1
            $pay = Stripe\Charge::create([
                "amount" => $totalsAmounts * self::PAYMENT_STRIPE_CENTS,  // cents
                "currency" => empty($currency) ? self::PAYMENT_STRIPE_CURRENCY : $currency,
                "source" => $stripeToken,
                "description" => $this->paymentStripeDescription,
            ]);

            if ($pay->status == 'succeeded') {
                return $pay;
            }

        } catch (\Stripe\Exception\CardException $e) {
            throw new \Exception($e->getMessage());
        } catch (\Stripe\Exception\RateLimitException  $e) {
            // Too many requests made to the API too quickly
            throw new \Exception($e->getMessage());

        } catch (Stripe\Exception\InvalidRequestException $e) {
            // Invalid parameters were supplied to Stripe's API
            throw new \Exception($e->getMessage());
        } catch (\Stripe\Exception\AuthenticationException $e) {
            // Authentication with Stripe's API failed
            // (maybe you changed API keys recently)
            throw new \Exception($e->getMessage());

        } catch (\Stripe\Exception\ApiConnectionException $e) {
            // Network communication with Stripe failed
            throw new \Exception($e->getMessage());

        } catch (\Stripe\Exception\ApiErrorException $e) {
            // Display a very generic error to the user, and maybe send
            // yourself an email
            throw new \Exception($e->getMessage());
        } catch (\Exception $e) {
            // Something else happened, completely unrelated to Stripe
            throw new \Exception($e->getMessage());
        }
    }

    public function setPaymentStripeDescription($description): void
    {
        $this->paymentStripeDescription = $description;
    }

}
