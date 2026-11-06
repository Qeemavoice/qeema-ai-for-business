<?php

use App\Models\PaymentMethod;
use App\Models\Service;

if (!function_exists('platformCommission')) {
    function platformCommission($price)
    {
        $commissions = getSetting('commissions', true);
        $fee = $commissions ? $commissions->platform : COMMISSION_PLATFORM;
        return $price * $fee / 100;
    }
}

if (!function_exists('paymentGatewayCommission')) {
    function paymentGatewayCommission($price, $paymentMethod = PaymentMethod::STRIPE)
    {
        $commissions = getSetting('commissions', true);
        $fee = 0;
        if ($paymentMethod === PaymentMethod::PAYPAL)
            $fee = $commissions ? $commissions->paypal : COMMISSION_PAYPAL;

        if ($paymentMethod === PaymentMethod::STRIPE) {
            $fee = $commissions ? $commissions->stripe : COMMISSION_STRIPE;
        }

        return $price * $fee / 100;
    }
}

if (!function_exists('totalCommission')) {
    function totalCommission($price, $paymentMethod = PaymentMethod::STRIPE)
    {
        return platformCommission($price) + paymentGatewayCommission($price, $paymentMethod);
    }
}

if (!function_exists('scenarioPrice')) {
    function scenarioPrice($script, $pricePerMinute)
    {
        return $pricePerMinute * numberOfMinutes($script);
    }
}

if (!function_exists('numberOfWords')) {
    function numberOfWords($string)
    {
        $string = preg_replace('/\s+/', ' ', trim($string));
        $words = explode(" ", $string);
        return count($words);
    }
}

if (!function_exists('numberOfMinutes')) {
    function numberOfMinutes($string)
    {
        $numberOfWords = numberOfWords($string);
        $minutes = 1;
        if ($numberOfWords >= 100) {
            $minutes = $numberOfWords / 100;
        }
        return $minutes;
    }
}

if (!function_exists('amountToBePaid')) {
    function amountToBePaid($script, $pricePerMinute, $paymentMethod = PaymentMethod::STRIPE)
    {
        $scenarioPrice = scenarioPrice($script, $pricePerMinute);
        return $scenarioPrice + totalCommission($scenarioPrice, $paymentMethod);
    }
}

if (!function_exists('commissions')) {
    function commissions($type = null)
    {
        $commission = getSetting('commissions', true);
        // dd($commission);
        $defCommissions = json_decode(json_encode([
            'platform' => COMMISSION_PLATFORM,
            'paypal' => COMMISSION_PAYPAL,
            'stripe' => COMMISSION_STRIPE,
        ]));

        return $commission ? ($type ? $commission->{$type} : $commission) : ($type ? $defCommissions->{$type} : $defCommissions);
    }
}

if (!function_exists('calculatePriceFromPercentage')) {
    function calculatePriceFromPercentage($price, $percentage)
    {
        return $price + ($price * $percentage / 100);
    }
}

if (!function_exists('servicesPrice')) {
    function servicesPrice($services, $numberOfMinutes, $totalPrice)
    {
        $totalValue = 0;
        $totalPercentage = 0;
        $arrPercentage = [];
        $arrValue = [];

        $list = $services;

        foreach ($services as $key => $service) {
            if ($service['type'] == Service::SERVICE_TYPE_PERCENT) {
                $arrPercentage[] = $service['value'];
                $calculateValueFromPercentage = calculateValueFromPercentage($totalPrice, $service['value']);
                $list[$key]['price_per_minute'] = $calculateValueFromPercentage;
                $list[$key]['total'] = $calculateValueFromPercentage * $numberOfMinutes;
            }
            if ($service['type'] == Service::SERVICE_TYPE_VALUE) {
                $arrValue [] = $service['value'];
                $list[$key]['price_per_minute'] = $service['value'];
                $list[$key]['total'] = $service['value'] * $numberOfMinutes;
            }

            $list[$key]['number_of_minutes'] = $numberOfMinutes;
        }

        $arSumPercentage = 0;
        if (count($arrPercentage) > 0) {
            $arSumPercentage = array_sum($arrPercentage);
            $totalPercentage = calculateValueFromPercentage($totalPrice, $arSumPercentage) * $numberOfMinutes;
        }

        $arrSumValue = 0;
        if (count($arrValue) > 0) {
            $arrSumValue = array_sum($arrValue);
            $totalValue = $arrSumValue * $numberOfMinutes;
        }

        $total = $totalValue + $totalPercentage;

        return [
            'list' => $list,
            'totalPercentage' => $arSumPercentage,
            'totalValues' => $arrSumValue,
            'subTotalPercentage' => $totalPercentage,
            'subTotalValues' => $totalValue,
            'total' => $total,
        ];
    }
}

if (!function_exists('calculateValueFromPercentage')) {
    function calculateValueFromPercentage($price, $percentage)
    {
        return $price * $percentage / 100;
    }
}
