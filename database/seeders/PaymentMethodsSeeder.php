<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PaymentMethodsSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function deleteData()
    {
        Schema::table('payment_methods', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('payment_methods')->truncate();
        Cache::forget('paymentMethods');
        Cache::forget('paymentMethodsAll');
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            PaymentMethod::create($row);
    }


    private function data(): array
    {
        return [
            [
                'id' => PaymentMethod::STRIPE,
                'name' => [
                    'ar' => 'بطاقة الائتمان/الخصم',
                    'en' => 'Credit/Debit Card',
                ],
                'slug' => 'credit-debit-card',
                'is_active' => (string)YES
            ],
            [
                'id' => PaymentMethod::BANK_TRANSFER,
                'name' => [
                    'ar' => 'تحويل بنكي',
                    'en' => 'Bank Transfer',
                ],
                'slug' => 'bank-transfer',
                'is_active' => (string)YES
            ],
            [
                'id' => PaymentMethod::CASH,
                'name' => [
                    'ar' => 'كاش',
                    'en' => 'Cash',
                ],
                'slug' => 'cash',
                'is_active' => (string)YES
            ],
            [
                'id' => PaymentMethod::PAYPAL,
                'name' => [
                    'ar' => 'بايبال',
                    'en' => 'PayPal'
                ],

                'slug' => 'paypal',
                'is_active' => (string)YES
            ],
        ];
    }

}
