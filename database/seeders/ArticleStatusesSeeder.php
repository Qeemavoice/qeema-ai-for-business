<?php

namespace Database\Seeders;

use App\Models\ArticleStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ArticleStatusesSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            ArticleStatus::create($row);
    }

    private function deleteData()
    {
        Schema::table('article_statuses', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('article_statuses')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'id' => ArticleStatus::DRAFT,
                'name' => [
                    'ar' => 'مسودة',
                    'en' => 'Draft',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => ArticleStatus::PUBLISHED,
                'name' => [
                    'ar' => 'منشور',
                    'en' => 'Published',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => ArticleStatus::UN_PUBLISHED,
                'name' => [
                    'ar' => 'غير منشور',
                    'en' => 'Un Published',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => ArticleStatus::SCHEDULED,
                'name' => [
                    'ar' => 'مجدولة',
                    'en' => 'Scheduled',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];
    }
}
