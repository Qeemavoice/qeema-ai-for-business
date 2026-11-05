<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\PermissionGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PermissionsTableSeeder extends Seeder
{
    public function run()
    {
        $this->deleteData();

        $this->insert();
    }

    private function deleteData()
    {
        Schema::table('permissions', function () {
            DB::statement('SET foreign_key_checks = 0;');
        });


        DB::table('permissions')->truncate();
    }

    private function insert()
    {
        foreach ($this->data() as $permission)
            Permission::create($permission);
    }

    private function data(): array
    {
        return [
            [
                'group_id' => PermissionGroup::DASHBOARD,
                'show_name' => [
                    'ar' => 'لوحة التحكم',
                    'en' => 'Dashboard',
                ],
                'name' => 'dashboard-index',
                'guard_name' => config('auth.defaults.guard')
            ],

            //================Orders====================================
            [
                'group_id' => PermissionGroup::ORDERS,
                'show_name' => [
                    'ar' => 'الحجوزات - الرئيسية',
                    'en' => 'Orders - Home',
                ],
                'name' => 'order-index',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //================Transactions====================================
            [
                'group_id' => PermissionGroup::TRANSACTIONS,
                'show_name' => [
                    'ar' => 'المعاملات - الرئيسية',
                    'en' => 'Transactions - Home',
                ],
                'name' => 'transaction-index',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //================Clients====================================
            [
                'group_id' => PermissionGroup::CLIENTS,
                'show_name' => [
                    'ar' => 'الزبائن - الرئيسية',
                    'en' => 'Clients - Home',
                ],
                'name' => 'client-index',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //================VOICE_ACTORS====================================
            [
                'group_id' => PermissionGroup::VOICE_ACTORS,
                'show_name' => [
                    'ar' => 'المعلقيين الصوتيين - الرئيسية',
                    'en' => 'Voice Actors - Home',
                ],
                'name' => 'voice-actor-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICE_ACTORS,
                'show_name' => [
                    'ar' => 'اضافة معلق صوتي جديد',
                    'en' => 'Add a new Voice Actor',
                ],
                'name' => 'voice-actor-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICE_ACTORS,
                'show_name' => [
                    'ar' => 'تعديل معلق صوتي ',
                    'en' => 'Edit Voice Actor',
                ],
                'name' => 'voice-actor-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICE_ACTORS,
                'show_name' => [
                    'ar' => 'تخزين معلق صوتي ',
                    'en' => 'Store Voice Actor',
                ],
                'name' => 'voice-actor-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICE_ACTORS,
                'show_name' => [
                    'ar' => 'حذف المعلق صوتي ',
                    'en' => 'Delete Voice Actor',
                ],
                'name' => 'voice-actor-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //================VOICE_ACTOR_SAMPLES====================================
            [
                'group_id' => PermissionGroup::VOICE_ACTOR_SAMPLES,
                'show_name' => [
                    'ar' => 'العينات - الرئيسية',
                    'en' => 'Samples - Home',
                ],
                'name' => 'sample-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICE_ACTOR_SAMPLES,
                'show_name' => [
                    'ar' => 'اضافة عينة صوتية جديدة',
                    'en' => 'Add a new sample',
                ],
                'name' => 'sample-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICE_ACTOR_SAMPLES,
                'show_name' => [
                    'ar' => 'تعديل العينة ',
                    'en' => 'Edit Sample',
                ],
                'name' => 'sample-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICE_ACTOR_SAMPLES,
                'show_name' => [
                    'ar' => 'تخزين العينة ',
                    'en' => 'Store Sample',
                ],
                'name' => 'sample-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICE_ACTOR_SAMPLES,
                'show_name' => [
                    'ar' => 'حذف العينة الصوتية ',
                    'en' => 'Delete sample',
                ],
                'name' => 'sample-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],

//            //================MAIL_MESSAGES====================================
            [
                'group_id' => PermissionGroup::MAIL_MESSAGES,
                'show_name' => [
                    'ar' => 'الرسائل البريدية - الرئيسية',
                    'en' => 'Mail Messages - Home',
                ],
                'name' => 'mail-message-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::MAIL_MESSAGES,
                'show_name' => [
                    'ar' => 'وضع علامة هام للرسالة ',
                    'en' => 'Make as important',
                ],
                'name' => 'mail-message-make-as-important',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::MAIL_MESSAGES,
                'show_name' => [
                    'ar' => 'حذف الرسالة ',
                    'en' => 'Delete Message',
                ],
                'name' => 'mail-message-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //================MAILING_LISTS====================================
            [
                'group_id' => PermissionGroup::MAILING_LISTS,
                'show_name' => [
                    'ar' => 'القائمة البريدية - الرئيسية',
                    'en' => 'Mailing Lists - Home',
                ],
                'name' => 'mailing-list-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //================CAREERS====================================
            [
                'group_id' => PermissionGroup::CAREERS,
                'show_name' => [
                    'ar' => 'الوظائف - الرئيسية',
                    'en' => 'Careers - Home',
                ],
                'name' => 'career-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::CAREERS,
                'show_name' => [
                    'ar' => 'اضافة وظيفة جديدة',
                    'en' => 'Add a New Career',
                ],
                'name' => 'career-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::CAREERS,
                'show_name' => [
                    'ar' => 'تعديل بيانات المشرف',
                    'en' => 'Edit Career',
                ],
                'name' => 'career-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::CAREERS,
                'show_name' => [
                    'ar' => 'تخزين معلق صوتي ',
                    'en' => 'Store Career',
                ],
                'name' => 'career-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::CAREERS,
                'show_name' => [
                    'ar' => 'حذف وظيفة',
                    'en' => 'Delete career',
                ],
                'name' => 'career-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //================ARTICLES====================================
            [
                'group_id' => PermissionGroup::ARTICLES,
                'show_name' => [
                    'ar' => 'المقالات - الرئيسية',
                    'en' => 'Articles - Home',
                ],
                'name' => 'article-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ARTICLES,
                'show_name' => [
                    'ar' => 'اضافة مقال جديد',
                    'en' => 'Add a New article',
                ],
                'name' => 'article-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ARTICLES,
                'show_name' => [
                    'ar' => 'تعديل بيانات المقال',
                    'en' => 'Edit article',
                ],
                'name' => 'article-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ARTICLES,
                'show_name' => [
                    'ar' => 'تخزين المقال ',
                    'en' => 'Store Career',
                ],
                'name' => 'article-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ARTICLES,
                'show_name' => [
                    'ar' => 'حذف المقال',
                    'en' => 'Delete article',
                ],
                'name' => 'article-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //================FAQS====================================
            [
                'group_id' => PermissionGroup::FAQS,
                'show_name' => [
                    'ar' => 'الأسئلة الشائعة - الرئيسية',
                    'en' => 'FAQs - Home',
                ],
                'name' => 'faq-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::FAQS,
                'show_name' => [
                    'ar' => 'اضافة سؤال جديد',
                    'en' => 'Add a New faq',
                ],
                'name' => 'faq-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::FAQS,
                'show_name' => [
                    'ar' => 'تعديل بيانات المقال',
                    'en' => 'Edit faq',
                ],
                'name' => 'faq-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::FAQS,
                'show_name' => [
                    'ar' => 'تخزين سؤال شائع ',
                    'en' => 'Store faq',
                ],
                'name' => 'faq-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::FAQS,
                'show_name' => [
                    'ar' => 'حذف سؤال شائع',
                    'en' => 'Delete faq',
                ],
                'name' => 'faq-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //================GUIDES====================================
            [
                'group_id' => PermissionGroup::GUIDES,
                'show_name' => [
                    'ar' => 'الأدلة - الرئيسية',
                    'en' => 'Guides - Home',
                ],
                'name' => 'guide-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::GUIDES,
                'show_name' => [
                    'ar' => 'اضافة دليل جديد',
                    'en' => 'Add a New guide',
                ],
                'name' => 'guide-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::GUIDES,
                'show_name' => [
                    'ar' => 'تعديل بيانات الدليل',
                    'en' => 'Edit guide',
                ],
                'name' => 'guide-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::GUIDES,
                'show_name' => [
                    'ar' => 'تخزين الدليل',
                    'en' => 'Store guide',
                ],
                'name' => 'guide-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::GUIDES,
                'show_name' => [
                    'ar' => 'حذف الدليل',
                    'en' => 'Delete guide',
                ],
                'name' => 'guide-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //================PAGES====================================
            [
                'group_id' => PermissionGroup::PAGES,
                'show_name' => [
                    'ar' => 'سياسة الخصوصية- العرض ',
                    'en' => 'Privacy Policy - show',
                ],
                'name' => 'page-privacy-policy-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::PAGES,
                'show_name' => [
                    'ar' => 'سياسة الخصوصية - التخزين',
                    'en' => 'Privacy Policy - Store',
                ],
                'name' => 'page-privacy-policy-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::PAGES,
                'show_name' => [
                    'ar' => 'شروط الاستخدام - العرض ',
                    'en' => 'Terms of Use - show',
                ],
                'name' => 'page-terms-of-use-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::PAGES,
                'show_name' => [
                    'ar' => 'شروط الاستخدام - التخزين',
                    'en' => 'Terms of Use - Store',
                ],
                'name' => 'page-terms-of-use-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::PAGES,
                'show_name' => [
                    'ar' => 'عن الموقع - العرض ',
                    'en' => 'About Us - show',
                ],
                'name' => 'page-about-us-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::PAGES,
                'show_name' => [
                    'ar' => 'عن الموقع - التخزين',
                    'en' => 'About Us - Store',
                ],
                'name' => 'page-about-us-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::PAGES,
                'show_name' => [
                    'ar' => 'التدريب - العرض ',
                    'en' => 'Training - show',
                ],
                'name' => 'page-training-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::PAGES,
                'show_name' => [
                    'ar' => 'التدريب - التخزين',
                    'en' => 'Training - Store',
                ],
                'name' => 'page-training-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

//            //================VOICES====================================
            [
                'group_id' => PermissionGroup::VOICES,
                'show_name' => [
                    'ar' => 'الأصوات - الرئيسية',
                    'en' => 'Voices - Home',
                ],
                'name' => 'voice-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICES,
                'show_name' => [
                    'ar' => 'اضافة صوت جديد',
                    'en' => 'Add a New voice',
                ],
                'name' => 'voice-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICES,
                'show_name' => [
                    'ar' => 'تعديل بيانات الصوت',
                    'en' => 'Edit voice',
                ],
                'name' => 'voice-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICES,
                'show_name' => [
                    'ar' => 'تخزين الصوت',
                    'en' => 'Store voice',
                ],
                'name' => 'voice-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::VOICES,
                'show_name' => [
                    'ar' => 'حذف الصوت',
                    'en' => 'Delete voice',
                ],
                'name' => 'voice-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //====================Coupons===========================
            [
                'group_id' => PermissionGroup::COUPONS,
                'show_name' => [
                    'ar' => 'القسائم - الرئيسية',
                    'en' => 'Coupons - Home',
                ],
                'name' => 'coupon-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::COUPONS,
                'show_name' => [
                    'ar' => 'اضافة قسيمة',
                    'en' => 'Add a new Coupon',
                ],
                'name' => 'coupon-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::COUPONS,
                'show_name' => [
                    'ar' => 'تعديل بيانات القسيمة',
                    'en' => 'Edit Coupon',
                ],
                'name' => 'coupon-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::COUPONS,
                'show_name' => [
                    'ar' => 'حذف القسيمة',
                    'en' => 'Delete Coupon',
                ],
                'name' => 'coupon-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //================BANNERS====================================
            [
                'group_id' => PermissionGroup::BANNERS,
                'show_name' => [
                    'ar' => 'الاعلانات - الرئيسية',
                    'en' => 'Banners - Home',
                ],
                'name' => 'banner-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::BANNERS,
                'show_name' => [
                    'ar' => 'اضافة اعلان جديد',
                    'en' => 'Add a New banner',
                ],
                'name' => 'banner-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::BANNERS,
                'show_name' => [
                    'ar' => 'تعديل بيانات الاعلان',
                    'en' => 'Edit banner',
                ],
                'name' => 'banner-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::BANNERS,
                'show_name' => [
                    'ar' => 'تخزين الاعلان',
                    'en' => 'Store banner',
                ],
                'name' => 'banner-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::BANNERS,
                'show_name' => [
                    'ar' => 'حذف الاعلان',
                    'en' => 'Delete banner',
                ],
                'name' => 'banner-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //================SERVICES====================================
            [
                'group_id' => PermissionGroup::SERVICES,
                'show_name' => [
                    'ar' => 'الخدمات - الرئيسية',
                    'en' => 'Services - Home',
                ],
                'name' => 'service-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::SERVICES,
                'show_name' => [
                    'ar' => 'اضافة خدمة جديدة',
                    'en' => 'Add a New service',
                ],
                'name' => 'service-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::SERVICES,
                'show_name' => [
                    'ar' => 'تعديل بيانات الخدمة',
                    'en' => 'Edit service',
                ],
                'name' => 'service-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::SERVICES,
                'show_name' => [
                    'ar' => 'تخزين الخدمة',
                    'en' => 'Store service',
                ],
                'name' => 'service-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::SERVICES,
                'show_name' => [
                    'ar' => 'حذف الخدمة',
                    'en' => 'Delete service',
                ],
                'name' => 'service-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //================LANGUAGES====================================
            [
                'group_id' => PermissionGroup::LANGUAGES,
                'show_name' => [
                    'ar' => 'اللغات - الرئيسية',
                    'en' => 'Languages - Home',
                ],
                'name' => 'language-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::LANGUAGES,
                'show_name' => [
                    'ar' => 'اضافة لغة جديدة',
                    'en' => 'Add a new language',
                ],
                'name' => 'language-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::LANGUAGES,
                'show_name' => [
                    'ar' => 'تعديل بيانات اللغة',
                    'en' => 'Edit language',
                ],
                'name' => 'language-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::LANGUAGES,
                'show_name' => [
                    'ar' => 'تخزين اللغة',
                    'en' => 'Store language',
                ],
                'name' => 'language-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::LANGUAGES,
                'show_name' => [
                    'ar' => 'حذف اللغة',
                    'en' => 'Delete language',
                ],
                'name' => 'language-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //================DIALECTS====================================
            [
                'group_id' => PermissionGroup::DIALECTS,
                'show_name' => [
                    'ar' => 'اللهجات - الرئيسية',
                    'en' => 'Dialects - Home',
                ],
                'name' => 'dialect-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::DIALECTS,
                'show_name' => [
                    'ar' => 'اضافة لهجة جديدة',
                    'en' => 'Add a New dialect',
                ],
                'name' => 'dialect-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::DIALECTS,
                'show_name' => [
                    'ar' => 'تعديل بيانات اللهجة',
                    'en' => 'Edit dialect',
                ],
                'name' => 'dialect-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::DIALECTS,
                'show_name' => [
                    'ar' => 'تخزين اللهجة',
                    'en' => 'Store dialect',
                ],
                'name' => 'dialect-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::DIALECTS,
                'show_name' => [
                    'ar' => 'حذف اللهجة',
                    'en' => 'Delete dialect',
                ],
                'name' => 'dialect-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //================CATEGORIES====================================
            [
                'group_id' => PermissionGroup::CATEGORIES,
                'show_name' => [
                    'ar' => 'التصنيفات - الرئيسية',
                    'en' => 'Categories - Home',
                ],
                'name' => 'category-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::CATEGORIES,
                'show_name' => [
                    'ar' => 'اضافة تصنيف ',
                    'en' => 'Add a New category',
                ],
                'name' => 'category-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::CATEGORIES,
                'show_name' => [
                    'ar' => 'تعديل بيانات التصنيف',
                    'en' => 'Edit category',
                ],
                'name' => 'category-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::CATEGORIES,
                'show_name' => [
                    'ar' => 'تخزين التصنيف',
                    'en' => 'Store category',
                ],
                'name' => 'category-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::CATEGORIES,
                'show_name' => [
                    'ar' => 'حذف التصنيف',
                    'en' => 'Delete category',
                ],
                'name' => 'category-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],
            //================WORKS====================================
            [
                'group_id' => PermissionGroup::WORKS,
                'show_name' => [
                    'ar' => 'الموشن جرافيك - الرئيسية',
                    'en' => 'Motion graphics - Home',
                ],
                'name' => 'work-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::WORKS,
                'show_name' => [
                    'ar' => 'اضافة عمل  ',
                    'en' => 'Add a New Work',
                ],
                'name' => 'work-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::WORKS,
                'show_name' => [
                    'ar' => 'تعديل بيانات العمل',
                    'en' => 'Edit work',
                ],
                'name' => 'work-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::WORKS,
                'show_name' => [
                    'ar' => 'تخزين العمل',
                    'en' => 'Store work',
                ],
                'name' => 'work-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::WORKS,
                'show_name' => [
                    'ar' => 'حذف العمل',
                    'en' => 'Delete work',
                ],
                'name' => 'work-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //================FORMS====================================
            [
                'group_id' => PermissionGroup::FORMS,
                'show_name' => [
                    'ar' => 'النماذج - الرئيسية',
                    'en' => 'Forms - Home',
                ],
                'name' => 'form-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::FORMS,
                'show_name' => [
                    'ar' => 'اضافة نموذج  ',
                    'en' => 'Add a New form',
                ],
                'name' => 'form-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::FORMS,
                'show_name' => [
                    'ar' => 'تعديل بيانات النموذج',
                    'en' => 'Edit form',
                ],
                'name' => 'form-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::FORMS,
                'show_name' => [
                    'ar' => 'تخزين النموذج',
                    'en' => 'Store form',
                ],
                'name' => 'form-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::FORMS,
                'show_name' => [
                    'ar' => 'حذف النموذج',
                    'en' => 'Delete form',
                ],
                'name' => 'form-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],


//            //================Admins====================================
            [
                'group_id' => PermissionGroup::ADMINS,
                'show_name' => [
                    'ar' => 'المشرفين - الرئيسية',
                    'en' => 'Admins - Home',
                ],
                'name' => 'admin-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ADMINS,
                'show_name' => [
                    'ar' => 'اضافة مشرف جديد',
                    'en' => 'Add a New Admin',
                ],
                'name' => 'admin-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ADMINS,
                'show_name' => [
                    'ar' => 'تعديل بيانات المشرف',
                    'en' => 'Edit Admin',
                ],
                'name' => 'admin-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::COUPONS,
                'show_name' => [
                    'ar' => 'تخزين القسيمة',
                    'en' => 'Store coupon',
                ],
                'name' => 'coupon-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ADMINS,
                'show_name' => [
                    'ar' => 'حذف المشرف',
                    'en' => 'Delete Admin',
                ],
                'name' => 'admin-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],


            //====================Roles===========================
            [
                'group_id' => PermissionGroup::ROLES,
                'show_name' => [
                    'ar' => 'الأدوار - الرئيسية',
                    'en' => 'Roles - Home',
                ],
                'name' => 'role-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ROLES,
                'show_name' => [
                    'ar' => 'اضافة دور جديد',
                    'en' => 'Add a New Role',
                ],
                'name' => 'role-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ROLES,
                'show_name' => [
                    'ar' => 'تعديل بيانات الدور',
                    'en' => 'Edit Role',
                ],
                'name' => 'role-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ROLES,
                'show_name' => [
                    'ar' => 'تخزين الدور',
                    'en' => 'Store role',
                ],
                'name' => 'role-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::ROLES,
                'show_name' => [
                    'ar' => 'حذف الدور',
                    'en' => 'Delete Role',
                ],
                'name' => 'role-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //====================PERMISSIONS===========================
            [
                'group_id' => PermissionGroup::PERMISSIONS,
                'show_name' => [
                    'ar' => 'الصلاحيات - الرئيسية',
                    'en' => 'Permissions - Home',
                ],
                'name' => 'permission-index',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::PERMISSIONS,
                'show_name' => [
                    'ar' => 'اضافة صلاحية جديدة',
                    'en' => 'Add a New permission',
                ],
                'name' => 'permission-create',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::PERMISSIONS,
                'show_name' => [
                    'ar' => 'تعديل بيانات الصلاحية',
                    'en' => 'Edit permission',
                ],
                'name' => 'permission-edit',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::PERMISSIONS,
                'show_name' => [
                    'ar' => 'تخزين الصلاحية',
                    'en' => 'Store permission',
                ],
                'name' => 'permission-store',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::PERMISSIONS,
                'show_name' => [
                    'ar' => 'حذف الصلاحية',
                    'en' => 'Delete Permission',
                ],
                'name' => 'permission-delete',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //====================SETTINGS===========================
            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم عام - عرض',
                    'en' => 'General Section - Show',
                ],
                'name' => 'appearance-general-tab-show',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم عام - تخزين',
                    'en' => 'General Section - Store',
                ],
                'name' => 'appearance-general-tab-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم الشعار - عرض',
                    'en' => 'Logo Section - Show',
                ],
                'name' => 'appearance-logo-tab-show',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم الشعار - تخزين',
                    'en' => 'Logo Section - Store',
                ],
                'name' => 'appearance-logo-tab-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم روابط التواصل الاجتماعي - عرض',
                    'en' => 'Social media links Section - Show',
                ],
                'name' => 'appearance-social-media-link-tab-show',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم روابط التواصل الاجتماعي - تخزين',
                    'en' => 'Social media links Section Section - Store',
                ],
                'name' => 'appearance-social-media-link-tab-store',
                'guard_name' => config('auth.defaults.guard'),
            ],


            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم اتصل بنا - عرض',
                    'en' => 'Contact Us Section - Show',
                ],
                'name' => 'appearance-contact-us-tab-show',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم اتصل بنا - تخزين',
                    'en' => 'Contact Us Section - Store',
                ],
                'name' => 'appearance-contact-us-tab-store',
                'guard_name' => config('auth.defaults.guard'),
            ],


            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم الفوتر - عرض',
                    'en' => 'Footer Section - Show',
                ],
                'name' => 'appearance-footer-tab-show',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم الفوتر - تخزين',
                    'en' => 'Footer Section - Store',
                ],
                'name' => 'appearance-footer-tab-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم الوسم الوصفي - عرض',
                    'en' => 'Meta Section - Show',
                ],
                'name' => 'appearance-meta-tab-show',
                'guard_name' => config('auth.defaults.guard'),
            ],
            [
                'group_id' => PermissionGroup::APPEARANCE,
                'show_name' => [
                    'ar' => 'قسم الوسم الوصفي - تخزين',
                    'en' => 'Meta Section - Store',
                ],
                'name' => 'appearance-meta-tab-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            //====================SETTINGS===========================
            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'العملات - الرئيسية',
                    'en' => 'Currencies - Home',
                ],
                'name' => 'currency-index',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'العملات - التخزين',
                    'en' => 'Currencies - Store',
                ],
                'name' => 'currency-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'العُمولات - الرئيسية',
                    'en' => 'Commissions - Home',
                ],
                'name' => 'commission-index',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'العُمولات - التخزين',
                    'en' => 'Commissions - Store',
                ],
                'name' => 'commission-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'طرق الدفع - الرئيسية',
                    'en' => 'Payment Methods - Home',
                ],
                'name' => 'payment-method-index',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'طرق الدفع - التخزين',
                    'en' => 'Payment Methods - Store',
                ],
                'name' => 'payment-method-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'اعدادات SMTP - الرئيسية',
                    'en' => 'SMTP Settings - Home',
                ],
                'name' => 'smtp-setting-index',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'اعدادات SMTP - التخزين',
                    'en' => 'SMTP Settings - Store',
                ],
                'name' => 'smtp-setting-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'الصيانة - الرئيسية',
                    'en' => 'Maintenances - Home',
                ],
                'name' => 'maintenance-index',
                'guard_name' => config('auth.defaults.guard'),
            ],

            [
                'group_id' => PermissionGroup::SETTINGS,
                'show_name' => [
                    'ar' => 'الصيانة - التخزين',
                    'en' => 'Maintenances - Store',
                ],
                'name' => 'maintenance-store',
                'guard_name' => config('auth.defaults.guard'),
            ],

        ];
    }

}
