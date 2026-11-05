<?php

namespace Database\Seeders;

use App\Models\ArticleStatus;
use App\Models\RatingGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RatingGroupSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            RatingGroup::create($row);
    }

    private function deleteData()
    {
        Schema::table('rating_groups', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('rating_groups')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'name' => [
                    'ar' => 'مجموعة معايير التقييم 2023',
                ],
                'is_active' => 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
        ];
    }
}
