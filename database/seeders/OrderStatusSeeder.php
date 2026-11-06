<?php

namespace Database\Seeders;

use App\Models\OrderStatus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Seeder;

class OrderStatusSeeder extends Seeder
{
    public function run()
    {
        Schema::table('order_statuses', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('order_statuses')->truncate();

        Cache::forget('order_statuses');

        foreach ($this->statuses() as $s) {
            $status = new OrderStatus();
            $status->id = $s['id'];
            $status->name = $s['name'];
            $status->save();
        }
    }

    private function statuses()
    {
        return [
            [
                'id' => OrderStatus::PENDING,
                'name' => [
                    'ar' => 'قيد المراجعة',
                    'en' => 'In Review',
                ],
                'code' => 'in_review',
                'description' => null,
            ],
            [
                'id' => OrderStatus::ACCEPTED,
                'name' => [
                    'ar' => 'قبلت',
                    'en' => 'Accepted',
                ],
                'code' => 'accepted',
                'description' => null,
            ],
            [
                'id' => OrderStatus::REJECTED,
                'name' => [
                    'ar' => 'مرفوض',
                    'en' => 'Rejected',
                ],
                'code' => 'rejected',
                'description' => null,
            ],
            [
                'id' => OrderStatus::COMPLETED,
                'name' => [
                    'ar' => 'اكتملت',
                    'en' => 'Completed',
                ],
                'code' => 'completed',
                'description' => null,
            ],
        ];
    }
}
