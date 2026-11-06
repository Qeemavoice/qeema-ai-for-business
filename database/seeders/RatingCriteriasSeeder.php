<?php

namespace Database\Seeders;

use App\Models\ArticleStatus;
use App\Models\RatingCriteria;
use App\Models\RatingGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RatingCriteriasSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            RatingCriteria::create($row);
    }

    private function deleteData()
    {
        Schema::table('rating_criterias', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('rating_criterias')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'name' => [
                    'ar' => 'جودة التسجيلات',
                ],
                'group_id' => 1,
                'type' => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => [
                    'ar' => 'مستوى الأداء',
                ],
                'group_id' => 1,
                'type' => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => [
                    'ar' => 'سرعة التسليم',
                ],
                'group_id' => 1,
                'type' => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
        ];
    }
}
