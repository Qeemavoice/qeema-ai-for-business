<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\OrderStatus;

class OrderStatusesSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            OrderStatus::create($row);
    }

    private function deleteData()
    {
        Schema::table('order_statuses', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('order_statuses')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'id' => OrderStatus::DRAFTED,
                'name' => [
                    'ar' => 'مسودة',
                    'en' => 'Drafted',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => OrderStatus::PENDING,
                'name' => [
                    'ar' => 'قيد الانتظار',
                    'en' => 'Pending',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => OrderStatus::ACCEPTED,
                'name' => [
                    'ar' => 'مقبول',
                    'en' => 'Accepted',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => OrderStatus::IN_PROGRESS,
                'name' => [
                    'ar' => 'قيد المعالجة',
                    'en' => 'In Progress',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => OrderStatus::COMPLETED,
                'name' => [
                    'ar' => 'مكتمل',
                    'en' => 'Completed',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => OrderStatus::REJECTED,
                'name' => [
                    'ar' => 'مرفوض',
                    'en' => 'Rejected',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => OrderStatus::DISPUTED,
                'name' => [
                    'ar' => 'متنازع عليه',
                    'en' => 'Disputed',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => OrderStatus::CANCELED,
                'name' => [
                    'ar' => 'ملغي',
                    'en' => 'Canceled',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => OrderStatus::CANCELLATION_REQUEST,
                'name' => [
                    'ar' => 'طلب إلغاء',
                    'en' => 'Cancellation Request',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ] ,
//            [
//                'id' => OrderStatus::UNDER_FEEDBACK,
//                'name' => [
//                    'ar' => 'قيد التقييم',
//                    'en' => 'Under Feedback',
//                ],
//                'created_at' => date('Y-m-d H:i:s'),
//                'updated_at' => date('Y-m-d H:i:s')
//            ]
        ];
    }
}
