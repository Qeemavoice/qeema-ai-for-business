<?php


namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PagesTableSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function deleteData()
    {
        Schema::table('pages', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('pages')->truncate();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            Page::create($row);
    }

    private function data(): array
    {
        return [
            [
                'title' => [
                    'ar' => 'سياسة الخصوصية',
                    'en' => 'Privacy Policy',
                ],
                'slug' => Page::PRIVACY_POLICY,
                'content' => [
                    'ar' => '',
                    'en' => '',
                ],
            ],
            [
                'title' => [
                    'ar' => 'شروط الاستخدام',
                    'en' => 'Terms of Use',
                ],
                'slug' => Page::TERMS_OF_USE,
                'content' => [
                    'ar' => '',
                    'en' => '',
                ],
            ],
            [
                'title' => [
                    'ar' => 'من نحن',
                    'en' => 'About Us',
                ],
                'slug' => Page::ABOUT_US,
                'content' => [
                    'ar' => '',
                    'en' => '',
                ],
            ],
            [
                'title' => [
                    'ar' => 'التدريب',
                    'en' => 'Training',
                ],
                'slug' => Page::TRAINING,
                'content' => [
                    'ar' => '',
                    'en' => '',
                ],
            ],
        ];
    }

}
