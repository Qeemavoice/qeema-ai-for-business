<?php

namespace Database\Seeders;

use App\Models\PermissionGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PermissionGroupTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function deleteData()
    {
        Schema::table('permission_groups', function () {
            DB::statement('
                SET foreign_key_checks = 0;
            ');
        });


        DB::table('permission_groups')->truncate();
    }

    private function insert()
    {
        foreach ($this->data() as $group)
            PermissionGroup::create($group);
    }

    private function data(): array
    {
        return [
            [
                'id' => PermissionGroup::DASHBOARD,
                'name' => [
                    'ar' => ' لوحة التحكم',
                    'en' => 'Dashboard',
                ]
            ],
            [
                'id' => PermissionGroup::ORDERS,
                'name' => [
                    'ar' => ' الحجوزات',
                    'en' => 'Orders',
                ]
            ],
            [
                'id' => PermissionGroup::TRANSACTIONS,
                'name' => [
                    'ar' => 'المعاملات',
                    'en' => 'Transactions',
                ]
            ],
            [
                'id' => PermissionGroup::CLIENTS,
                'name' => [
                    'ar' => 'الزبائن',
                    'en' => 'Clients',
                ]
            ],
            [
                'id' => PermissionGroup::VOICE_ACTORS,
                'name' => [
                    'ar' => 'المعلقين الصوتيين',
                    'en' => 'Voice Actors',
                ]
            ],
            [
                'id' => PermissionGroup::VOICE_ACTOR_SAMPLES,
                'name' => [
                    'ar' => 'العينات',
                    'en' => 'Voice Actor Samples',
                ]
            ],
            [
                'id' => PermissionGroup::MAIL_MESSAGES,
                'name' => [
                    'ar' => 'الرسائل البريدية',
                    'en' => 'Mail Messages',
                ]
            ],
            [
                'id' => PermissionGroup::MAILING_LISTS,
                'name' => [
                    'ar' => 'القائمة البريدية',
                    'en' => 'Mailing Lists',
                ]
            ],
            [
                'id' => PermissionGroup::CAREERS,
                'name' => [
                    'ar' => 'الوظائف',
                    'en' => 'Careers',
                ]
            ],
            [
                'id' => PermissionGroup::ARTICLES,
                'name' => [
                    'ar' => 'المقالات',
                    'en' => 'Articles',
                ]
            ],
            [
                'id' => PermissionGroup::FAQS,
                'name' => [
                    'ar' => 'الأسئلة الشائعة',
                    'en' => 'Faqs',
                ]
            ],
            [
                'id' => PermissionGroup::GUIDES,
                'name' => [
                    'ar' => 'الأدلة',
                    'en' => 'Guides',
                ]
            ],
            [
                'id' => PermissionGroup::PAGES,
                'name' => [
                    'ar' => 'الصفحات',
                    'en' => 'Pages',
                ]
            ],
            [
                'id' => PermissionGroup::VOICES,
                'name' => [
                    'ar' => 'الأصوات',
                    'en' => 'Voices',
                ]
            ],
            [
                'id' => PermissionGroup::COUPONS,
                'name' => [
                    'ar' => 'القسائم',
                    'en' => 'Coupons',
                ]
            ],
            [
                'id' => PermissionGroup::BANNERS,
                'name' => [
                    'ar' => 'الاعلانات',
                    'en' => 'Banners',
                ]
            ],
            [
                'id' => PermissionGroup::SERVICES,
                'name' => [
                    'ar' => 'الخدمات',
                    'en' => 'Services',
                ]
            ],
            [
                'id' => PermissionGroup::LANGUAGES,
                'name' => [
                    'ar' => 'اللغات',
                    'en' => 'Languages',
                ]
            ],
            [
                'id' => PermissionGroup::DIALECTS,
                'name' => [
                    'ar' => 'اللهجات',
                    'en' => 'Dialects',
                ]
            ],
            [
                'id' => PermissionGroup::CATEGORIES,
                'name' => [
                    'ar' => 'التصنيفات',
                    'en' => 'Categories',
                ]
            ],
            [
                'id' => PermissionGroup::WORKS,
                'name' => [
                    'ar' => 'الموشن جرافيك',
                    'en' => 'Motion graphics',
                ]
            ],
            [
                'id' => PermissionGroup::FORMS,
                'name' => [
                    'ar' => 'النماذج',
                    'en' => 'Forms',
                ]
            ],
            [
                'id' => PermissionGroup::ADMINS,
                'name' => [
                    'ar' => 'المشرفين',
                    'en' => 'Admins',
                ]
            ],
            [
                'id' => PermissionGroup::ROLES,
                'name' => [
                    'ar' => 'الادوار',
                    'en' => 'Roles',
                ]
            ],
            [
                'id' => PermissionGroup::PERMISSIONS,
                'name' => [
                    'ar' => 'الصلاحيات',
                    'en' => 'Permissions',
                ]
            ],
            [
                'id' => PermissionGroup::APPEARANCE,
                'name' => [
                    'ar' => 'المظهر',
                    'en' => 'Appearance',
                ]
            ],
            [
                'id' => PermissionGroup::SETTINGS,
                'name' => [
                    'ar' => 'الإعدادات',
                    'en' => 'Settings',
                ]
            ],
        ];
    }
}
