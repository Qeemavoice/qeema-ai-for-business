<?php

/*
|--------------------------------------------------------------------------
| إعدادات مساعد قيمة (شات اختيار الصوت)
|--------------------------------------------------------------------------
| كل القيم تُقرأ من ملف .env — لا تضع أي مفتاح هنا مباشرة.
*/

return [

    // المزود: anthropic أو openai
    'provider' => env('QV_CHAT_PROVIDER', 'anthropic'),

    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
        'model' => env('QV_CHAT_ANTHROPIC_MODEL', 'claude-haiku-5-5'),
        'max_tokens' => 1024,
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('QV_CHAT_OPENAI_MODEL', 'gpt-4.1-mini'),
        'max_tokens' => 1024,
    ],

    'elevenlabs' => [
        'api_key' => env('ELEVENLABS_API_KEY'),
        // نموذج المعاينة (الأرخص) — جرّبيه على اللهجات قبل الإطلاق
        'preview_model' => env('QV_CHAT_PREVIEW_MODEL', 'eleven_flash_v2_5'),
        'output_format' => 'mp3_44100_128',
        // ملف mp3 قصير يُلصق في آخر كل معاينة: «معاينة من قيمة فويس» (اختياري)
        'watermark_path' => env('QV_CHAT_WATERMARK_PATH'),
    ],

    'limits' => [
        // طول المعاينة بالحروف (نحو 30 ثانية)
        'preview_max_chars' => (int) env('QV_CHAT_PREVIEW_MAX_CHARS', 450),
        // معاينات مجانية لكل رقم طوال عمر الحساب (لا تتجدد)
        'free_previews_per_lead' => (int) env('QV_CHAT_FREE_PREVIEWS', 3),
        // معاينة إضافية بعد أول حجز مدفوع
        'bonus_previews_after_order' => 1,
        // حد المعاينات لنفس الجهاز ونفس IP (يمنع التسجيل بأرقام متعددة)
        'previews_per_device' => 3,
        'previews_per_ip_per_day' => 6,
        // حد الرسائل لكل محادثة (حماية من الاستهلاك)
        'messages_per_conversation' => 40,
        // صلاحية رابط المعاينة بالساعات
        'preview_link_hours' => 24,
        'search_results' => 5,
    ],

    'otp' => [
        // إذا false يُقبل الرقم بدون رمز تحقق (للتجربة فقط)
        'enabled' => env('QV_CHAT_OTP_ENABLED', true),
        // log = يُكتب الرمز في سجل Laravel (للتجربة) | webhook = يُرسل لعنوان (وكيل واتساب، n8n، Zapier)
        'driver' => env('QV_CHAT_OTP_DRIVER', 'log'),
        'webhook_url' => env('QV_CHAT_OTP_WEBHOOK'),
        'ttl_minutes' => 10,
        'max_attempts' => 5,
    ],

    // رقم واتساب الدعم الفني (بصيغة دولية بدون +) — زر الواتساب في الشات والتحويل لموظف الدعم
    'support_whatsapp' => env('QV_CHAT_SUPPORT_WHATSAPP', ''),

    // روابط انضمام المعلقين (تظهر في بطاقة الانضمام داخل الشات)
    'artist' => [
        'signup_url' => env('QV_CHAT_ARTIST_SIGNUP_URL', ''),
        'guide_url' => env('QV_CHAT_ARTIST_GUIDE_URL', ''),
        'blog_url' => env('QV_CHAT_BLOG_URL', ''),
        'terms_url' => env('QV_CHAT_TERMS_URL', ''),
        'samples_rules_url' => env('QV_CHAT_ARTIST_SAMPLES_RULES_URL', 'https://qeemavoice.com/ar/blogs/details/7-%D8%B4%D8%B1%D9%88%D8%B7_%D9%82%D8%A8%D9%88%D9%84_%D8%A7%D9%84%D8%B9%D9%8A%D9%86%D8%A7%D8%AA_%D8%A7%D9%84%D8%B5%D9%88%D8%AA%D9%8A%D8%A9_%D9%81%D9%8A_%D9%85%D9%86%D8%B5%D8%A9_%D9%82%D9%8A%D9%85%D8%A9_%D9%81%D9%88%D9%8A%D8%B3'),
    ],

    'notify' => [
        // يستقبل الطلبات الجديدة وطلبات التحويل للفريق
        'team_email' => env('QV_CHAT_TEAM_EMAIL', 'info@qeemavoice.com'),
        'webhook_url' => env('QV_CHAT_NOTIFY_WEBHOOK'),
    ],

    // رسائل الخطوة التالية التي يقولها الشات بعد الطلب أو التحويل (عدّليها حسب سياسة العمل)
    'messages' => [
        'order_human' => 'وصل طلبك للمعلق :name، وسيؤكد السعر النهائي وموعد التسليم. بعد ذلك يتواصل معك فريقنا عبر الواتساب برابط الدفع خلال ساعات العمل.',
        'order_ai' => 'وصل طلبك. سيتواصل معك فريقنا عبر الواتساب برابط الدفع خلال ساعات العمل، ثم يصلك الملف الصوتي الكامل بعد الدفع.',
        'artist_support' => 'وصل طلبك إلى فريق الدعم الفني، وسنرد عليك خلال 48 ساعة.',
        'handoff' => 'اضغط زر الواتساب، وسيرد عليك موظف من الدعم الفني للمنصة. ملخص طلبك مكتوب في الرسالة، فلا حاجة لإعادة الشرح.',
    ],

    // كلمات تمنع توليد المعاينة إذا وُجدت في النص (أضيفي ما تريدين، كلمة في كل عنصر)
    'blocked_terms' => [],

    // مسار تخزين ملفات المعاينة (خاص، غير متاح للعامة)
    'storage_disk' => env('QV_CHAT_DISK', 'local'),
    'storage_dir' => 'qv-chat/previews',

    // النطاقات المسموح لها باستدعاء الشات
    'allowed_origins' => array_filter(explode(',', env('QV_CHAT_ALLOWED_ORIGINS', ''))),
];
