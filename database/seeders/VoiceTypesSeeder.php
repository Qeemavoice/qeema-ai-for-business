<?php

namespace Database\Seeders;

use App\Models\VoiceType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VoiceTypesSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            VoiceType::create($row);
    }

    private function deleteData()
    {
        Schema::table('voice_types', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('voice_types')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'id' => VoiceType::VOICE_TYPE_CHILD,
                'name' => [
                    'ar' => 'طفل',
                    'en' => 'child',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => VoiceType::VOICE_TYPE_MAN,
                'name' => [
                    'ar' => 'رجل',
                    'en' => 'man',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => VoiceType::VOICE_TYPE_WOMEN,
                'name' => [
                    'ar' => 'أمراة',
                    'en' => 'Women',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];
    }
}
