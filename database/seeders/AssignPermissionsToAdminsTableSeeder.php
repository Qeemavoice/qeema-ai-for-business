<?php


namespace Database\Seeders;


use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;
use App\Models\User;
use App\Models\UserType;

class AssignPermissionsToAdminsTableSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function deleteData()
    {
        Schema::table('model_has_permissions', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });
        Schema::table('role_has_permissions', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });
        Schema::table('model_has_roles', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });


        DB::table('model_has_permissions')->truncate();
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();

        Cache::forget('permissions');
        Cache::forget('rolesWithPermissions');
        Cache::forget('roles');
        Artisan::call('optimize:clear');
    }

    private function insert()
    {
        $admins = User::where('user_type_id', UserType::ADMIN)->get();

        foreach ($admins as $admin) {

            $admin->role_id = Role::ADMINISTRATION;
            $admin->save();
        }

        $permissions = Permission::getAll();

        foreach ($permissions as $permission) {
            DB::table('role_has_permissions')->insert([
                'permission_id' => $permission->id,
                'role_id' => Role::ADMINISTRATION,
            ]);
        }

        DB::table('model_has_roles')->insert([
            'model_type' => User::class,
            'role_id' => Role::ADMINISTRATION,
            'model_id' => 1,
        ]);
    }
}
