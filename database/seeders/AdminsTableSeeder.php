<?php


namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\UserStatus;
use App\Models\UserType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class AdminsTableSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function deleteData()
    {
        Schema::table('users', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('users')->where('role_id', Role::ADMINISTRATION)->truncate();
    }

    private function insert()
    {
        foreach ($this->data() as $row)
            User::create($row);
    }

    private function data(): array
    {
        return [
            [
                'id' => 999998,
                'full_name' => 'admin admin',
                'email' => 'admin@admin.com',
                'password' => Hash::make('asdASD123!@#'),
                'uniq_id' => generate_uniq_id(),
                'role_id' => Role::ADMINISTRATION,
                'user_type_id' => UserType::ADMIN,
                'status_id' => UserStatus::ACCEPTED
            ],

            [
                'id' => 999999,
                'full_name' => 'admin 2',
                'email' => 'admin2@admin.com',
                'password' => Hash::make('asdASD123!@#'),
                'uniq_id' => generate_uniq_id(),
                'role_id' => Role::ADMINISTRATION,
                'user_type_id' => UserType::ADMIN,
                'status_id' => UserStatus::ACCEPTED
            ],
//
//            [
//                'full_name' => 'Voice Over',
//                'email' => 'voice_over@admin.com',
//                'password' => Hash::make('asdASD123!@#'),
//                'uniq_id' => generate_uniq_id(),
//                'role_id' => null,
//                'user_type_id' => UserType::VOICE_ACTOR,
//                'status_id' => UserStatus::ACCEPTED
//            ],
//
//            [
//                'full_name' => 'CLIENT',
//                'email' => 'client@test.com',
//                'password' => Hash::make('asdASD123!@#'),
//                'uniq_id' => generate_uniq_id(),
//                'role_id' => null,
//                'user_type_id' => UserType::CLIENT,
//                'status_id' => UserStatus::ACCEPTED
//            ],
        ];
    }

}
