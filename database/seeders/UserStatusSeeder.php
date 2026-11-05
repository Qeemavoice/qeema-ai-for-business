<?php
namespace Database\Seeders;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\UserStatus;
use Illuminate\Database\Seeder;

class UserStatusSeeder extends Seeder
{
    public function run()
    {
        Schema::table('user_statuses', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });

        DB::table('user_statuses')->truncate();

        Cache::forget('userStatus');

        foreach ($this->statuses() as $s) {
            $status = new UserStatus();
            $status->id = $s['id'];
            $status->name = $s['name'];
            $status->save();
        }
    }

    private function statuses()
    {
        return [
            [
                'id' => UserStatus::PENDING,
                'name' => [
                    'ar' => 'قيد المراجعة',
                    'en' => 'In Review',
                    'de' => 'In Review',
                ],
                'code' => 'in_review',
                'description' => null,
            ],
            [
                'id' => UserStatus::ACCEPTED,
                'name' => [
                    'ar' => 'قبلت',
                    'en' => 'Accepted',
                    'de' => 'Accepted',
                ],
                'code' => 'accepted',
                'description' => null,
            ],
            [
                'id' => UserStatus::ACTIVATED,
                'name' => [
                    'ar' => 'فعال',
                    'en' => 'Activated',
                    'de' => 'Activated',
                ],
                'code' => 'activated',
                'description' => null,
            ],
            [
                'id' => UserStatus::REJECTED,
                'name' => [
                    'ar' => 'مرفوض',
                    'en' => 'Rejected',
                    'de' => 'Rejected',
                ],
                'code' => 'rejected',
                'description' => null,
            ],
            [
                'id' => UserStatus::BLOCKED,
                'name' => [
                    'ar' => 'محظور',
                    'en' => 'Blocked',
                    'de' => 'Blocked',
                ],
                'code' => 'blocked',
                'description' => null,
            ],
            [
                'id' => UserStatus::DEACTIVATED,
                'name' => [
                    'ar' => 'معطل',
                    'en' => 'Disabled',
                    'de' => 'Disabled',
                ],
                'code' => 'disabled',
                'description' => null,
            ],
            [
                'id' => UserStatus::FINISHED,
                'name' => [
                    'ar' => 'انتهاء العمل',
                    'en' => 'Finished',
                    'de' => 'Finished',
                ],
                'code' => 'disabled',
                'description' => null,
            ],
        ];
    }
}
