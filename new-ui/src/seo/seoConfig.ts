import { TTS_FAQS } from '../data/ttsFaqs';
export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface SeoConfigItem {
  path: string;
  title: string;
  h1: string;
  description: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  noindex?: boolean;
  /** Comma-separated; emitted as <meta name="keywords"> only when present */
  keywords?: string;
  jsonLdType?: 'Organization' | 'WebSite' | 'Service' | 'FAQPage' | 'Article' | 'AudioObject' | 'BreadcrumbList';
  serviceType?: string;
  faqs?: { question: string; answer: string }[];
  breadcrumbs?: BreadcrumbItem[];
}

export const BASE_SITE_URL = 'https://qeemavoice.com';
export const DEFAULT_OG_IMAGE = 'https://qeemavoice.com/assets/og-image-qeema.jpg';

export const STATIC_SEO_ROUTES: Record<string, SeoConfigItem> = {
  '/ar': {
    path: '/ar',
    title: 'فويس اوفر عربي وتعليق صوتي احترافي بكل اللهجات | قيمة فويس',
    h1: 'فويس اوفر عربي بأصوات بشرية حقيقية',
    description: 'أكثر من 1000 معلق صوتي عربي محترف بكل اللهجات للإعلانات والوثائقيات والبودكاست والرد الآلي. استمع للعينات واحجز معلقك اليوم.',
    ogType: 'website',
    jsonLdType: 'Organization'
  },
  '/ar/voices': {
    path: '/ar/voices',
    title: 'مكتبة الأصوات: عينات تعليق صوتي رجالي ونسائي | قيمة فويس',
    h1: 'مكتبة أصوات المعلقين العرب',
    description: 'استمع لعينات أكثر من 1000 معلق صوتي عربي، رجالي ونسائي، بالفصحى والسعودية والإماراتية والمصرية وكل اللهجات، واختر الصوت المناسب لمشروعك.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'مكتبة الأصوات', item: '/ar/voices' }
    ]
  },
  '/ar/voice-models': {
    path: '/ar/voice-models',
    title: 'نماذج الإنتاج الصوتي: إعلانات وبودكاست ورد آلي | قيمة فويس',
    h1: 'نماذج الإنتاج الصوتي',
    description: 'ابدأ مشروعك الصوتي بسرعة بنماذج جاهزة للإعلانات والبودكاست والرد الآلي والفيديو الشارح مع أصوات قيمة فويس.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'مكتبة الأصوات', item: '/ar/voices' },
      { name: 'نماذج الإنتاج الصوتي', item: '/ar/voice-models' }
    ]
  },
  '/ar/blogs': {
    path: '/ar/blogs',
    title: 'مدونة التعليق الصوتي والدوبلاج | قيمة فويس',
    h1: 'مدونة قيمة فويس',
    description: 'دروس ونصائح في التعليق الصوتي والدوبلاج والبودكاست والكتب الصوتية: سكربتات للتدريب، وبرامج تسجيل، ومعدات، وأسرار المحترفين.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'المدونة', item: '/ar/blogs' }
    ]
  },
  '/ar/jobs': {
    path: '/ar/jobs',
    title: 'وظائف تعليق صوتي أون لاين: انضم كمعلق | قيمة فويس',
    h1: 'انضم إلى قيمة فويس كمعلق صوتي',
    description: 'تبحث عن شغل فويس اوفر أون لاين من المنزل؟ أنشئ حسابك كمعلق صوتي، وأضف حتى 5 عينات، وابدأ باستقبال مشاريع من شركات عربية.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'انضم كمعلق صوتي', item: '/ar/jobs' }
    ]
  },
  '/ar/services/dubbing': {
    path: '/ar/services/dubbing',
    title: 'دوبلاج احترافي بأصوات عربية بشرية | قيمة فويس',
    h1: 'خدمة الدوبلاج العربي',
    description: 'دوبلاج للكرتون والأفلام والمسلسلات والإعلانات بأصوات معلقين عرب محترفين، بالفصحى واللهجات، مع إخراج صوتي ومزامنة دقيقة.',
    ogType: 'website',
    jsonLdType: 'Service',
    serviceType: 'Arabic Voice Dubbing',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'خدمة الدوبلاج', item: '/ar/services/dubbing' }
    ]
  },
  '/ar/voice-models/audiobooks': {
    path: '/ar/voice-models/audiobooks',
    title: 'تسجيل الكتب الصوتية بأصوات عربية محترفة | قيمة فويس',
    h1: 'تسجيل الكتب الصوتية',
    description: 'حوّل كتابك إلى كتاب صوتي بصوت معلق عربي محترف، بنطق سليم للفصحى وإيقاع مريح للاستماع الطويل، من التسجيل حتى التسليم الجاهز للنشر.',
    ogType: 'website',
    jsonLdType: 'Service',
    serviceType: 'Audiobook Production',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'تسجيل الكتب الصوتية', item: '/ar/voice-models/audiobooks' }
    ]
  },
  '/ar/voice-models/podcast': {
    path: '/ar/voice-models/podcast',
    title: 'إنتاج بودكاست عربي: مقدمات وتعليق صوتي | قيمة فويس',
    h1: 'خدمة إنتاج البودكاست',
    description: 'أصوات احترافية لمقدمات وخواتيم البودكاست والإعلانات داخل الحلقات، بالفصحى أو بلهجة جمهورك، مع تسليم سريع.',
    ogType: 'website',
    jsonLdType: 'Service',
    serviceType: 'Podcast Production & Voice-Over',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'إنتاج البودكاست', item: '/ar/voice-models/podcast' }
    ]
  },
  '/ar/voice-models/ivr': {
    path: '/ar/voice-models/ivr',
    title: 'تسجيلات الرد الآلي IVR لمراكز الاتصال | قيمة فويس',
    h1: 'تسجيلات الرد الآلي ومراكز الاتصال',
    description: 'رسائل ترحيب وقوائم رد آلي وانتظار بأصوات عربية واضحة ومهنية، بالفصحى واللهجات الخليجية، جاهزة لأنظمة مراكز الاتصال.',
    ogType: 'website',
    jsonLdType: 'Service',
    serviceType: 'IVR & Call Center Recordings',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'تسجيلات الرد الآلي', item: '/ar/voice-models/ivr' }
    ]
  },
  '/ar/text-to-speech': {
    path: '/ar/text-to-speech',
    title: 'تحويل النص إلى صوت عربي بأصوات مرخّصة | قيمة فويس',
    h1: 'تحويل النص إلى صوت عربي',
    description: 'استمع لنصك بأصوات AI مرخّصة من معلقين عرب حقيقيين وبتقاسم الأرباح معهم، ثم احجز المعلق البشري نفسه للنسخة النهائية.',
    ogType: 'website',
    jsonLdType: 'Service',
    serviceType: 'Arabic Text to Speech (Licensed AI Voice)',
    keywords: 'تحويل النص إلى صوت, تحويل النص لصوت عربي, text to speech عربي, قارئ نصوص عربي, صوت ذكاء اصطناعي عربي, تعليق صوتي بالذكاء الاصطناعي, لهجة سعودية, لهجة مصرية, لهجة خليجية',
    faqs: TTS_FAQS.map(f => ({ question: f.q, answer: f.a })),
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'تحويل النص إلى صوت', item: '/ar/text-to-speech' }
    ]
  },
  '/ar/reset-password': {
    path: '/ar/reset-password',
    title: 'تعيين كلمة مرور جديدة | قيمة فويس',
    h1: 'تعيين كلمة مرور جديدة',
    description: 'اختر كلمة مرور جديدة لحسابك في قيمة فويس.',
    noindex: true
  },
  // «روّاد قيمة»: never indexed (and not in the sitemap)
  '/ar/waitlist': {
    path: '/ar/waitlist',
    title: 'قائمة الانتظار | قيمة فويس',
    h1: 'قريباً للجميع',
    description: 'استوديو TTS والرصيد والباقات تفتح للجميع قريباً. سجّل ليصلك التنبيه أولاً.',
    noindex: true
  },
  '/ar/pricing': {
    path: '/ar/pricing',
    title: 'أسعار التعليق الصوتي والفويس اوفر | قيمة فويس',
    h1: 'أسعار مرنة تناسب مشاريعكم',
    description: 'تعرّف على أسعار التعليق الصوتي في قيمة فويس حسب نوع المشروع ومدته واللهجة وحقوق الاستخدام، واطلب عرض سعر لمشروعك.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'الأسعار', item: '/ar/pricing' }
    ]
  },
  '/ar/saudi-voice-over': {
    path: '/ar/saudi-voice-over',
    title: 'فويس اوفر سعودي: معلقون سعوديون محترفون | قيمة فويس',
    h1: 'فويس اوفر سعودي',
    description: 'معلقون صوتيون سعوديون محترفون للإعلانات والفيديوهات التعريفية والرد الآلي باللهجة النجدية والحجازية والفصحى. استمع واحجز الآن.',
    ogType: 'website',
    jsonLdType: 'Service',
    serviceType: 'Saudi Voice Over Services',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'فويس اوفر سعودي', item: '/ar/saudi-voice-over' }
    ]
  },
  '/ar/emirati-voice-over': {
    path: '/ar/emirati-voice-over',
    title: 'فويس اوفر إماراتي: معلقون إماراتيون محترفون | قيمة فويس',
    h1: 'فويس اوفر إماراتي',
    description: 'أصوات إماراتية وخليجية محترفة للإعلانات والجهات الحكومية والفعاليات ومراكز الاتصال في الإمارات. استمع للعينات واحجز معلقك.',
    ogType: 'website',
    jsonLdType: 'Service',
    serviceType: 'Emirati Voice Over Services',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'فويس اوفر إماراتي', item: '/ar/emirati-voice-over' }
    ]
  },
  '/ar/egyptian-voice-over': {
    path: '/ar/egyptian-voice-over',
    title: 'فويس اوفر مصري: معلقون مصريون محترفون | قيمة فويس',
    h1: 'فويس اوفر مصري',
    description: 'معلقون صوتيون مصريون للإعلانات والسوشيال ميديا والبودكاست والفيديوهات التعليمية، بنبرات متنوعة تناسب جمهورك.',
    ogType: 'website',
    jsonLdType: 'Service',
    serviceType: 'Egyptian Voice Over Services',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'فويس اوفر مصري', item: '/ar/egyptian-voice-over' }
    ]
  },
  '/ar/faqs': {
    path: '/ar/faqs',
    title: 'الأسئلة الشائعة | قيمة فويس',
    h1: 'الأسئلة الشائعة',
    description: 'إجابات عن أكثر الأسئلة حول طلب التعليق الصوتي في قيمة فويس: الحجز والدفع والتعديلات ومدة التسليم وحقوق الاستخدام.',
    ogType: 'website',
    jsonLdType: 'FAQPage',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'الأسئلة الشائعة', item: '/ar/faqs' }
    ]
  },
  '/ar/p/about-us': {
    path: '/ar/p/about-us',
    title: 'من نحن | قيمة فويس',
    h1: 'من نحن',
    description: 'قيمة فويس منصة عربية للتعليق الصوتي تجمع أكثر من 1000 معلق محترف بكل اللهجات، وخدمت أكثر من 5000 شركة عربية.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'من نحن', item: '/ar/p/about-us' }
    ]
  },
  '/ar/contact-us': {
    path: '/ar/contact-us',
    title: 'تواصل معنا | قيمة فويس',
    h1: 'تواصل معنا',
    description: 'تواصل مع فريق قيمة فويس لطلب عرض سعر أو استشارة حول مشروعك الصوتي.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'تواصل معنا', item: '/ar/contact-us' }
    ]
  },
  '/ar/p/terms-of-use': {
    path: '/ar/p/terms-of-use',
    title: 'شروط الاستخدام | قيمة فويس',
    h1: 'شروط الاستخدام',
    description: 'شروط استخدام منصة قيمة فويس للعملاء والمعلقين: الحجز والدفع والإلغاء والتعديلات والتراخيص وأستوديو تحويل النص إلى صوت.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'شروط الاستخدام', item: '/ar/p/terms-of-use' }
    ]
  },
  '/ar/p/privacy-policy': {
    path: '/ar/p/privacy-policy',
    title: 'سياسة الخصوصية | قيمة فويس',
    h1: 'سياسة الخصوصية',
    description: 'كيف تجمع منصة قيمة فويس بيانات العملاء والمعلقين وتستخدمها وتحميها، وحقوقك في الوصول إلى بياناتك وحذفها.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'سياسة الخصوصية', item: '/ar/p/privacy-policy' }
    ]
  },
  '/ar/p/revisions-policy': {
    path: '/ar/p/revisions-policy',
    title: 'سياسة التعديلات في التعليق الصوتي | قيمة فويس',
    h1: 'سياسة التعديلات: متى يكون التعديل مجانيًا؟',
    description: 'سياسة التعديلات في قيمة فويس: أخطاء المعلق تُصلح مجانًا، وجولة تعديل أداء مجانية خلال 14 يومًا، وتغيير النص بعد التسجيل له رسوم واضحة.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'سياسة التعديلات', item: '/ar/p/revisions-policy' }
    ]
  },
  '/ar/booking-steps': {
    path: '/ar/booking-steps',
    title: 'كيف نعمل | قيمة فويس',
    h1: 'كيف نعمل',
    description: 'خطوات حجز معلق صوتي في قيمة فويس: اختر الصوت، وأرسل النص، واستلم التسجيل النهائي بجودة احترافية.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'كيف نعمل', item: '/ar/booking-steps' }
    ]
  },
  '/ar/our-works': {
    path: '/ar/our-works',
    title: 'أعمالنا: نماذج تعليق صوتي | قيمة فويس',
    h1: 'أعمالنا',
    description: 'نماذج من مشاريع تعليق صوتي نفذتها قيمة فويس لشركات وجهات حكومية عربية في الإعلان والتعليم ومراكز الاتصال.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'أعمالنا', item: '/ar/our-works' }
    ]
  },
  '/ar/categories': {
    path: '/ar/categories',
    title: 'تصنيفات التعليق الصوتي والأصوات | قيمة فويس',
    h1: 'تصنيفات التعليق الصوتي',
    description: 'استكشف كافة مجالات وتصنيفات التعليق الصوتي: إعلانات تجارية، وثائقي، دوبلاج، كتب صوتية، بودكاست، ورد آلي.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'التصنيفات', item: '/ar/categories' }
    ]
  },
  '/ar/guides/join-qeema-voice': {
    path: '/ar/guides/join-qeema-voice',
    title: 'كيف أنضم إلى قيمة فويس كمعلق صوتي | قيمة فويس',
    h1: 'دليل: كيف أنضم إلى منصة قيمة فويس وأحقق دخلاً مستمراً؟',
    description: 'آلية الانضمام إلى قيمة فويس كمعلق صوتي خطوة بخطوة، وشروط قبول العينات الصوتية وكيف تبدأ باستقبال الحجوزات.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'الأدلة', item: '/ar/guides' },
      { name: 'كيف أنضم إلى قيمة فويس', item: '/ar/guides/join-qeema-voice' }
    ]
  },
  '/ar/guides': {
    path: '/ar/guides',
    title: 'أدلة التعليق الصوتي والإنتاج | قيمة فويس',
    h1: 'أدلة التعليق الصوتي والإنتاج',
    description: 'أدلة إرشادية وتدريبية متخصصة لشركات الإنتاج والمعلقين الصوتيين حول مواصفات الاستوديو وضبط الصوت.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'الأدلة', item: '/ar/guides' }
    ]
  }
};
