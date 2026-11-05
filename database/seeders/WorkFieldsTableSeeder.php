<?php


namespace Database\Seeders;

use App\Models\WorkField;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class WorkFieldsTableSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function deleteData()
    {
        Schema::table('work_fields', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('work_fields')->truncate();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            WorkField::create($row);
    }

    private function data(): array
    {
        return [
            [
                'id' => 1,
                'name' => [
                    'ar'  => ' شركة موشن جرافيك',
                    'en'  => ' شركة موشن جرافيك',
                ],
            ],
            [
                'id' => 2,
                'name' => [
                    'ar'  => 'شركة دعاية و إعلان',
                    'en'  => ' شركة دعاية و إعلان',
                ],
            ],
            [
                'id' => 3,
                'name' => [
                    'ar'  => ' شركة خدمات تسويقية',
                    'en'  => '  شركة خدمات تسويقية',
                ],
            ],
            [
                'id' => 4,
                'name' => [
                    'ar'  => '  شركة انتاج فني',
                    'en'  => '   شركة انتاج فني',
                ],
            ],
            [
                'id' => 5,
                'name' => [
                    'ar'  => 'شركة انتاج رقمي',
                    'en'  => 'شركة انتاج رقمي',
                ],
            ],
            [
                'id' => 6,
                'name' => [
                    'ar'  => 'شركة برمجيات',
                    'en'  => 'شركة برمجيات',
                ],
            ],
            [
                'id' => 7,
                'name' => [
                    'ar'  => 'شركة العاب فيديو',
                    'en'  => 'شركة العاب فيديو',
                ],
            ],
            [
                'id' => 8,
                'name' => [
                    'ar'  => 'شركة دوبلاج',
                    'en'  => 'شركة دوبلاج',
                ],
            ],
            [
                'id' => 9,
                'name' => [
                    'ar'  => 'منصة تعليمية',
                    'en'  => 'منصة تعليمية',
                ],
            ],
            [
                'id' => 10,
                'name' => [
                    'ar'  => ' قناة يويتوب',
                    'en'  => ' قناة يويتوب',
                ],
            ],
            [
                'id' => 11,
                'name' => [
                    'ar'  => 'مؤسسة صحفية',
                    'en'  => 'مؤسسة صحفية',
                ],
            ],
            [
                'id' => 12,
                'name' => [
                    'ar'  => 'قناة تلفازية',
                    'en'  => 'قناة تلفازية',
                ],
            ],
            [
                'id' => 13,
                'name' => [
                    'ar'  => 'إذاعة',
                    'en'  => 'إذاعة',
                ],
            ],
            [
                'id' => 14,
                'name' => [
                    'ar'  => 'شركة صوتيات',
                    'en'  => 'شركة صوتيات',
                ],
            ],
//            [
//                'id' => 16,
//                'name' => [
//                    'ar'  => 'آخرى',
//                    'en'  => 'آخرى',
//                ],
//            ],
        ];
    }

}
