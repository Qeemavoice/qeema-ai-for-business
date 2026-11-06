<?php

namespace Database\Seeders;

use App\Models\TransactionStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TransactionStatusesSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            TransactionStatus::create($row);
    }

    private function deleteData()
    {
        Schema::table('transaction_statuses', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('transaction_statuses')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'id' => TransactionStatus::SUCCEEDED,
                'name' => [
                    'ar' => 'نجح',
                    'en' => 'Succeeded',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => TransactionStatus::FAILED,
                'name' => [
                    'ar' => 'فشل',
                    'en' => 'Failed',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
        ];
    }
}
