<?php


namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CurrenciesTableSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function deleteData()
    {
        Schema::table('currencies', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('currencies')->truncate();
        Cache::forget('currencies');
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            Currency::create($row);
    }

    private function data(): array
    {
        return [
            [
                'id' => Currency::AMERICAN_DOLLAR,
                'name' => [
                    'en' => 'Dollar',
                    'ar' => 'دولار أمريكي',
                ],
                'iso' => 'USD',
                'symbol' => '$',
            ],
            [
                'id' => Currency::SAUDI_RIYAL,
                'name' => [
                    'en' => 'Saudi Riyal',
                    'ar' => 'الريال السعودي',
                ],
                'iso' => 'SAR',
                'symbol' => 'ر. س',
            ],
        ];
    }
}
