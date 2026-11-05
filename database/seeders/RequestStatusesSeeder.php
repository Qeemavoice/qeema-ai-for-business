<?php

namespace Database\Seeders;

use App\Models\RequestStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\OrderStatus;

class RequestStatusesSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            RequestStatus::create($row);
    }

    private function deleteData()
    {
        Schema::table('request_statuses', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('request_statuses')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'id' => RequestStatus::PENDING,
                'name' => [
                    'ar' => 'قيد الانتظار',
                    'en' => 'Pending',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => RequestStatus::IN_PROGRESS,
                'name' => [
                    'ar' => 'قيد المعالجة',
                    'en' => 'In Progress',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => RequestStatus::ACCEPTED,
                'name' => [
                    'ar' => 'مقبول',
                    'en' => 'Accepted',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => RequestStatus::REJECTED,
                'name' => [
                    'ar' => 'مرفوض',
                    'en' => 'Rejected',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => RequestStatus::CANCELED,
                'name' => [
                    'ar' => 'ملغي',
                    'en' => 'Canceled',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
        ];
    }
}
