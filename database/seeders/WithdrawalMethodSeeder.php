<?php

namespace Database\Seeders;

use App\Models\WithdrawalMethod;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class WithdrawalMethodSeeder extends Seeder
{
    public function run()
    {
        Schema::table('withdrawal_methods', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('withdrawal_methods')->truncate();

        foreach ($this->data() as $s) {
            $status = new WithdrawalMethod();
            $status->id = $s['id'];
            $status->name = $s['name'];
            $status->is_active = $s['is_active'];
            $status->save();
        }
    }

    private function data()
    {
        return [
            [
                'id' => WithdrawalMethod::PAYPAL,
                'is_active' => YES,
                'name' => [
                    'ar' => 'بايبال',
                    'en' => 'PayPal',
                ],
            ],
            [
                'id' => WithdrawalMethod::ACCOUNT_BANK,
                'is_active' => YES,
                'name' => [
                    'ar' => 'حساب بنكي',
                    'en' => 'Account Bank',
                ],
            ],

            [
                'id' => WithdrawalMethod::PAYONEER,
                'is_active' => NO,
                'name' => [
                    'ar' => 'بايونير',
                    'en' => 'Payoneer',
                ],
            ],

            [
                'id' => WithdrawalMethod::VODAFONE_CASH,
                'is_active' => YES,
                'name' => [
                    'ar' => 'فودافون كاش',
                    'en' => 'Vodafone Cash',
                ],
            ],
            [
                'id' => WithdrawalMethod::OFFICE_TRANSFER,
                'is_active' => YES,
                'name' => [
                    'ar' => 'حوالة مكتبية',
                    'en' => 'Office Transfer',
                ],
            ],

        ];
    }
}
