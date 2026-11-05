<?php


namespace App\Services;


class BookingPrices
{
    public static function calculatePricesOrder($order) // total
    {
        $script = $order['scenario'];
        $services = $order['services'];
        $voice = $order['voice'];

        $listOfServicesPrice['total'] = 0;
        $result = [];

        $commissionPlatForm = commissions('platform');

        $numberOfWords = numberOfWords($script);
        $numberOfMinutes = numberOfMinutes($script);

        $scenarioPrice = scenarioPrice($script, $voice['total_price']);
        $scenarioPriceWithoutCommissionPlatform = scenarioPrice($script, $voice['price_per_minute']); //without commission platform


        $result['script'] = [
            'voice' => $voice,
            'numberOfWords' => $numberOfWords,
            'scenario' => $script,
            'numberOfMinutes' => $numberOfMinutes,
            'pricePerMinute' => $voice['price_per_minute'],//without commission platform
            'platFormCommission' => [
                'percentage' => $commissionPlatForm,
                'value' => $voice['total_price'] - $voice['price_per_minute']
            ],
            'subTotal' => $scenarioPriceWithoutCommissionPlatform,  //without commission platform
            'total' => $scenarioPrice
        ];

        if (isset($services['list'])) {
            $listOfServicesPrice = servicesPrice($services['list'], $numberOfMinutes, $voice['price_per_minute']);

            $result['services'] = [
                'list' => $listOfServicesPrice['list'],
                'countServices' => count($services['list']),
                'totalPercentage' => $listOfServicesPrice['totalPercentage'], //without commission platform
                'totalValues' => $listOfServicesPrice['totalValues'], //without commission platform
                'subTotalPercentage' => $listOfServicesPrice['subTotalPercentage'], //without commission platform
                'subTotalValues' => $listOfServicesPrice['subTotalValues'],  //without commission platform
                'total' => $listOfServicesPrice['total'], //without commission platform
            ];

        }

        $result['subTotal'] = $scenarioPrice + $listOfServicesPrice['total'];
        $result['total'] = $result['subTotal'];


        if (isset($order['coupon'])) {
            $coupon = $order['coupon'];

            $percentageDiscount = 0;

            if ($coupon['is_percent'] === 1) {
                $valueDiscount = calculateValueFromPercentage($result['subTotal'], $coupon['value']);
                $percentageDiscount = $coupon['value'];
                $result['total'] = $result['subTotal'] - $valueDiscount;

            } else {
                $valueDiscount = $coupon['value'];
                $result['total'] = $result['subTotal'] - $coupon['value'];
            }

            $result['coupon'] = [
                'id' => $coupon['id'],
                'name' => $coupon,
                'percentage' => $percentageDiscount,
                'value' => $valueDiscount,
            ];
        }

//        $commissionPlatForm = commissions('platform');
//
//        $valueCommissionPlatForm = round(calculateValueFromPercentage($result['total'], $commissionPlatForm), 2);
//
//        $result['platFormCommission'] = [
//            'percentage' => $commissionPlatForm,
//            'value' => $valueCommissionPlatForm,
//        ];
//
//        $result['total'] = $result['total'] + $valueCommissionPlatForm;

        $commissionStripe = commissions('stripe');

        if ($commissionStripe) {
            $valueCommissionStripe = calculateValueFromPercentage($result['total'], $commissionStripe);
            $result['total'] = $result['total'] + $valueCommissionStripe;


            $result['paymentCommission'] = [
                'id' => $order['payment_method']['id'],
                'name' => $order['payment_method']['name'],
                'percentage' => $commissionStripe,
                'value' => round($valueCommissionStripe, 2),
            ];
        }

        $result['platFormCommission'] = [
            'percentage' => $commissionPlatForm,
            'value' => $scenarioPrice,
        ];

        $result['total'] = round($result['total'], 2);

        return $result;
    }
}
