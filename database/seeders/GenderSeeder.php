<?php
namespace Database\Seeders;

use App\Models\Gender;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class GenderSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            Gender::create($row);
    }

    private function deleteData()
    {
        Schema::table('genders', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('genders')->truncate();

    }

    private function data(): array
    {
        return [
            [
                'id' => Gender::MALE,
                'name' => [
                    'en' => 'Male',
                    'ar' => 'ذكر',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => Gender::FEMALE,
                'name' => [
                    'en' => 'Female',
                    'ar' => 'أنثى',
                ],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
        ];
    }
}
