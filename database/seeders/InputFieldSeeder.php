<?php


namespace Database\Seeders;


use App\Models\InputField;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class InputFieldSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            InputField::create($row);
    }

    private function deleteData()
    {
        Schema::table('input_fields', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('input_fields')->truncate();

        Cache::forget('inputFields');

    }

    private function data(): array
    {
        return [
            [
                'id' => InputField::FILE,
                'title' => 'File',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => InputField::TEXT,
                'title' => 'Text',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => InputField::TEXT_AREA,
                'title' => 'Textarea',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => InputField::RADIO,
                'title' => 'Radio',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => InputField::CHECKBOX,
                'title' => 'Checkbox',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => InputField::DROP_DOWN_LIST,
                'title' => 'Drop Down List',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
        ];
    }
}
