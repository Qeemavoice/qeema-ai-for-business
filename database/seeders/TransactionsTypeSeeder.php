<?php

namespace Database\Seeders;
use App\Models\TransactionType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TransactionsTypeSeeder extends Seeder
{
    public function run()
    {
        Schema::table('transaction_types', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('transaction_types')->truncate();
        foreach ($this->data() as $s) {
            $status = new TransactionType();
            $status->id = $s['id'];
            $status->name = $s['name'];
            $status->save();
        }

    }

    private function data()
    {
        return [
            [
                'id' => TransactionType::BOOKING,
                'name' => [
                    'ar' => 'حجز عمل صوتي',
                    'en' => 'Booking',
                ]
            ],
            [
                'id' => TransactionType::DEPOSIT,
                'name' => [
                    'ar' => 'إيداع', //شحن رصيد
                    'en' => 'Deposit',
                ]
            ],
            [
                'id' => TransactionType::WITHDRAW_BALANCE,
                'name' => [
                    'ar' => 'سحب رصيد',
                    'en' => 'Withdraw a balance',
                ]
            ],
            [
                'id' => TransactionType::WITHDRAW_PROFITS,
                'name' => [
                    'ar' => 'سحب أرباح',
                    'en' => 'Withdraw profits',
                ]
            ],
            [
                'id' => TransactionType::REFUND,
                'name' => [
                    'ar' => 'إعادة المال',
                    'en' => 'Refund',
                ]
            ],
            [
                'id' => TransactionType::SUBSCRIPTION_FEES,
                'name' => [
                    'ar' => 'رسوم اشتراك بالخطة',
                    'en' => 'Plan subscription fees',
                ]
            ],
            [
                'id' => TransactionType::BUYING_GUIDE,
                'name' => [
                    'ar' => 'شراء دليل ',
                    'en' => 'Buy Guide',
                ]
            ],
        ];
    }

}
