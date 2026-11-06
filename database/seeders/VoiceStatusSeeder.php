<?php

namespace Database\Seeders;

use App\Models\VoiceStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VoiceStatusSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            VoiceStatus::create($row);
    }

    private function deleteData()
    {
        Schema::table('voice_statuses', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('voice_statuses')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'id' => VoiceStatus::DRAFT,
                'name' => [
                    'ar' => 'مسودة',
                    'en' => 'Draft',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => VoiceStatus::ACCEPTED,
                'name' => [
                    'ar' => 'موافق عليه',
                    'en' => 'Accepted',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => VoiceStatus::IN_REVIEW,
                'name' => [
                    'ar' => 'قيد المراجعة',
                    'en' => 'In review',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => VoiceStatus::REJECTED,
                'name' => [
                    'ar' => 'مرفوض',
                    'en' => 'Rejected',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];
    }
}
