<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RolesTableSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function insert()
    {
        foreach ($this->data() as $role)
            Role::create($role);
    }

    private function deleteData()
    {
        Schema::table('roles', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });


        DB::table('roles')->truncate();
    }

    private function data(): array
    {
        return [
            [
                'id' => Role::ADMINISTRATION,
                'name' => [
                    'ar' => 'سوبر أدمن',
                    'en' => 'Administration'
                ],
                'guard_name' => config('auth.defaults.guard')
            ],
        ];
    }
}
