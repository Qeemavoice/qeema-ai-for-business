<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\PaymentStatus;

class PaymentStatusesSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            PaymentStatus::create($row);
    }

    private function deleteData()
    {
        Schema::table('payment_statuses', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('payment_statuses')->truncate();

        Cache::forget('paymentStatuses');
    }

    private function data(): array
    {
        return [
            [
                'id' => PaymentStatus::UP_PAID,
                'name' => [
                    'ar' => 'Un Paid',
                    'en' => 'Un Paid',
                    'de' => trans_admin('up_paid'),
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => PaymentStatus::PAID,
                'name' => [
                    'ar' => 'Paid',
                    'en' => 'Paid',
                    'de' => trans_admin('paid'),
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
//            [
//                'id' => PaymentStatus::CREDIT,
//                'name' => [
//                    'ar' => 'Credit',
//                    'en' => 'Credit',
//                ],
//                'created_at' => date('Y-m-d H:i:s'),
//                'updated_at' => date('Y-m-d H:i:s')
//            ],
            [
                'id' => PaymentStatus::PARTIALLY_PAID,
                'name' => [
                    'ar' => 'مدفوع جزئي',
                    'en' => 'Partially paid',
                    'de' => trans_admin('partially_paid'),
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => PaymentStatus::ARCHIVED,
                'name' => [
                    'ar' => 'مؤرشفة',
                    'en' => 'Archived',
                    'de' => trans_admin('archived'),
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
        ];
    }
}
