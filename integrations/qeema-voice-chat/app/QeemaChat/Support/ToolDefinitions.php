<?php

namespace App\QeemaChat\Support;

/**
 * تعريف الأدوات بصيغة محايدة (JSON Schema) — كل مزود يحوّلها لصيغته.
 */
class ToolDefinitions
{
    public const DIALECTS = ['sa_najdi', 'sa_hijazi', 'ae', 'kw', 'qa', 'eg', 'levant', 'jo_ps', 'iq', 'ma', 'msa'];
    public const USE_CASES = ['ad', 'corporate', 'elearning', 'ivr', 'podcast', 'dubbing', 'audiobook', 'other'];
    public const TONES = ['حماسي', 'دافئ', 'رسمي', 'ودود', 'إخباري', 'درامي', 'طفولي', 'هادئ', 'واثق', 'فخم'];

    public static function all(): array
    {
        return [
            [
                'name' => 'set_user_type',
                'description' => 'يسجّل نوع المستخدم بمجرد أن يتضح: عميل يبحث عن صوت، أو معلق صوتي.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'user_type' => ['type' => 'string', 'enum' => ['client', 'artist']],
                    ],
                    'required' => ['user_type'],
                ],
            ],
            [
                'name' => 'show_artist_join',
                'description' => 'يعرض للمعلق الجديد بطاقة فيها زر إنشاء حساب معلق، ورابط مقال «كيف أنضم إلى منصة قيمة فويس؟»، ورابط شروط قبول العينات.',
                'parameters' => ['type' => 'object', 'properties' => new \stdClass()],
            ],
            [
                'name' => 'show_artist_help',
                'description' => 'يعرض للمعلق رابط مدونة الموقع ورابط الشروط وسياسة الاستخدام، حيث توجد إجابات أسئلته.',
                'parameters' => ['type' => 'object', 'properties' => new \stdClass()],
            ],
            [
                'name' => 'artist_support_request',
                'description' => 'يرسل طلب دعم فني لمعلق يواجه مشكلة. يرد الفريق خلال 48 ساعة. يحتاج رقم واتساب موثّقًا.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'category' => ['type' => 'string', 'enum' => ['earnings_payment', 'account', 'samples_upload', 'order', 'other']],
                        'summary' => ['type' => 'string', 'description' => 'وصف المشكلة في سطرين بالفصحى'],
                    ],
                    'required' => ['category', 'summary'],
                ],
            ],
            [
                'name' => 'search_talents',
                'description' => 'يبحث في قاعدة معلقي قيمة فويس ويرجع أنسب المعلقين للطلب. تظهر النتائج للعميل كبطاقات تلقائيًا.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'use_case' => ['type' => 'string', 'enum' => self::USE_CASES],
                        'dialect' => ['type' => 'string', 'enum' => self::DIALECTS],
                        'gender' => ['type' => 'string', 'enum' => ['male', 'female', 'any']],
                        'tone' => ['type' => 'array', 'items' => ['type' => 'string', 'enum' => self::TONES]],
                        'age_range' => ['type' => 'string', 'enum' => ['young', 'middle', 'mature', 'any']],
                        'duration_minutes' => ['type' => 'number', 'description' => 'المدة التقريبية للتسجيل بالدقائق'],
                        'budget_usd' => ['type' => 'number', 'description' => 'الميزانية الكلية بالدولار'],
                        'deadline' => ['type' => 'string', 'description' => 'موعد التسليم YYYY-MM-DD'],
                    ],
                    'required' => ['use_case', 'dialect', 'gender', 'tone'],
                ],
            ],
            [
                'name' => 'generate_preview',
                'description' => 'يولّد معاينة صوتية قصيرة (نحو 30 ثانية) بصوت المعلق المستنسخ على أول جزء من سيناريو العميل المحفوظ. فقط لمعلق has_clone = true.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'talent_code' => ['type' => 'string', 'description' => 'رمز المعلق مثل QV-0142 كما رجع من search_talents'],
                        'text' => ['type' => 'string', 'description' => 'اختياري: جملة محددة طلبها العميل، أو نص قصير إذا لم يصلنا سيناريو'],
                    ],
                    'required' => ['talent_code'],
                ],
            ],
            [
                'name' => 'create_order',
                'description' => 'ينشئ طلبًا لتسجيل بشري أو لنسخة AI للنص كاملًا. البيانات والسيناريو المحفوظان يُرفقان تلقائيًا.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'talent_code' => ['type' => 'string'],
                        'order_type' => ['type' => 'string', 'enum' => ['human', 'ai_clone']],
                        'notes' => ['type' => 'string', 'description' => 'ملاحظات العميل الإضافية للمعلق، إن وجدت'],
                    ],
                    'required' => ['talent_code', 'order_type'],
                ],
            ],
            [
                'name' => 'handoff_to_team',
                'description' => 'يعطي المستخدم زر واتساب يفتح محادثة مع موظف الدعم الفني للمنصة، ومعه ملخص الطلب. يُستخدم فقط في حالات التحويل المحددة في التعليمات.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'reason' => [
                            'type' => 'string',
                            'enum' => ['asked_for_human', 'complaint_or_payment', 'enterprise_contract', 'large_dubbing', 'content_review', 'tool_failure'],
                        ],
                        'summary' => ['type' => 'string', 'description' => 'ملخص الطلب في سطرين بالفصحى، يُرسل مع رسالة الواتساب للموظف'],
                    ],
                    'required' => ['reason', 'summary'],
                ],
            ],
        ];
    }
}
