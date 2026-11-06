<?php

namespace Database\Seeders;

use App\Models\ArticleStatus;
use App\Models\OrderType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OrderTypesSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            OrderType::create($row);
    }

    private function deleteData()
    {
        Schema::table('order_types', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('order_types')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'id' => OrderType::BOOKING_VOICE,
                'name' => [
                    'ar' => 'حجز صوت',
                    'en' => 'Booking Voice',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => OrderType::BUY_GUIDE,
                'name' => [
                    'ar' => 'شراء دليل',
                    'en' => 'Buy Guide',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
        ];
    }
}
