import { VoiceArtist, DialectStat, ChangelogItem, AuditReport } from '../types';

export const VOICE_ARTISTS: VoiceArtist[] = [
  {
    id: '1',
    name: 'طارق الشمري',
    code: 'QV-1042',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    gender: 'male',
    dialect: 'سعودي - نجدي / فصحى رنانة',
    dialectKey: 'gulf',
    region: 'الرياض، المملكة العربية السعودية',
    role: 'معلق وثائقي وإعلانات مصرفية معتمد',
    bio: 'صوت جهوري وقور معتمد من كبرى البنوك والمؤسسات الحكومية، خبرة 9 سنوات في النبرة المؤسسية والإعلانات الوطنية.',
    verified: true,
    sampleFrequency: '48kHz FLAC 24-bit',
    tone: 'وقور، واثق، دافئ، وطني',
    sampleQuote: 'نبتكر حلول الغد بثقة اليوم، لأن طموحنا لا يعرف المستحيل في أرض العطاء.'
  },
  {
    id: '2',
    name: 'سارة الدوسري',
    code: 'QV-1088',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    gender: 'female',
    dialect: 'خليجي معاصر / حجازي ناعم',
    dialectKey: 'gulf',
    region: 'جدة، المملكة العربية السعودية',
    role: 'سفيرة صوتية لتطبيقات التكنولوجيا وSaaS',
    bio: 'نبرة تفاعلية شابة مفعمة بالحيوية والألفة، الصوت المعتمد لمساعدين شخصيين ومراكز اتصال ذكية.',
    verified: true,
    sampleFrequency: '48kHz FLAC 24-bit',
    tone: 'مرح، تفاعلي، دقيق، مرحب',
    sampleQuote: 'أهلاً بك في منصتك، كيف يمكنني مساعدتك في تسهيل أعمالك اليوم؟'
  },
  {
    id: '3',
    name: 'كريم المنصور',
    code: 'QV-2045',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    gender: 'male',
    dialect: 'شامي سوري / فصحى إخبارية',
    dialectKey: 'levantine',
    region: 'دمشق / دبي',
    role: 'خبير السرد القصصي والكتب المسموعة والبودكاست',
    bio: 'نبرة مخملية آسرة تتقن مخارج الحروف الشامية والفصحى السينمائية، خامة مثالية للروايات والإنتاج الإعلامي الضخم.',
    verified: true,
    sampleFrequency: '48kHz FLAC 24-bit',
    tone: 'سينمائي، مخملي، روائي، مؤثر',
    sampleQuote: 'في كل زاوية من دمشق العتيقة، كان ينساب عبير الياسمين ليروي سيرة لا تنتهي.'
  },
  {
    id: '4',
    name: 'نور الهدى إبراهيم',
    code: 'QV-3112',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    gender: 'female',
    dialect: 'مصري أبيض / إعلاني وتجاري',
    dialectKey: 'egyptian',
    region: 'القاهرة، مصر',
    role: 'صوت إعلانات السوشيال ميديا وحملات التوعية',
    bio: 'إيقاع مصري عفوي محبب للمتلقي العربي، قدرة استثنائية على الإقناع ورفع معدلات التحويل في الحملات الرقمية.',
    verified: true,
    sampleFrequency: '48kHz FLAC 24-bit',
    tone: 'عفوي، مقنع، سريع البديهة، حيوي',
    sampleQuote: 'جاهز تبدأ مشوارك الصح؟ مع خدمتنا الجديدة هتوفر وقتك وفلوسك بضغطة زر واحدة!'
  },
  {
    id: '5',
    name: 'أمين الفاسي',
    code: 'QV-4209',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    gender: 'male',
    dialect: 'مغاربي مهذب / فرنسي عربي مشترك',
    dialectKey: 'maghrebi',
    region: 'الدار البيضاء، المغرب',
    role: 'خبير التعليق الصوتي للأسواق الشمال إفريقية والفرنكوفونية',
    bio: 'صوت ناضج يجمع بين الأناقة المغاربية والدقة الصوتية العالمية، متخصص في إعلانات السيارات والمنتجات الفاخرة.',
    verified: true,
    sampleFrequency: '48kHz FLAC 24-bit',
    tone: 'أنيق، فخم، عميق، متعدد اللغات',
    sampleQuote: 'حين تجتمع الحرفية مع التكنولوجيا، تولد تجربة استثنائية لا تُنسى.'
  }
];

export const DIALECT_STATS: DialectStat[] = [
  {
    key: 'gulf',
    name: 'اللهجة الخليجية',
    region: 'السعودية، الإمارات، الكويت، قطر، البحرين، عمان',
    estimatedCount: 380,
    confirmed: false,
    characteristics: ['مخارج حروف فخمة ورزينة', 'مثالية للقطاع المصرفي والحكومي', 'تناغم طبيعي بين النجدية والحجازية'],
    highlightArtists: ['طارق الشمري', 'سارة الدوسري', 'فهد العتيبي'],
    sampleAudioText: 'أهلاً بكم في مصرفنا.. نسعد بخدمتكم وتوفير أفضل الحلول المالية المصممة خصيصاً لتطلعاتكم.'
  },
  {
    key: 'levantine',
    name: 'اللهجة الشامية',
    region: 'سوريا، لبنان، الأردن، فلسطين',
    estimatedCount: 240,
    confirmed: false,
    characteristics: ['دفء نغمي وعاطفي استثنائي', 'الأنسب للبودكاست والدراما والقصص', 'وضوح لغوي وسلاسة تعبيرية'],
    highlightArtists: ['كريم المنصور', 'رنا السعدي', 'ياسين حداد'],
    sampleAudioText: 'مع كل خطوة جديدة، بنرسم حكاية نجاح حقيقية بتلهم العالم وتبني مستقبل واعد.'
  },
  {
    key: 'egyptian',
    name: 'اللهجة المصرية',
    region: 'القاهرة، الإسكندرية، محافظات مصر',
    estimatedCount: 260,
    confirmed: false,
    characteristics: ['الانتشار الجماهيري الأوسع عربياً', 'روح فكاهية وإقناع تسويقي عفوي', 'مثالية للإعلانات الرقمية والريلز'],
    highlightArtists: ['نور الهدى إبراهيم', 'أحمد كمال', 'مي عز الدين'],
    sampleAudioText: 'الفرصة مبترجعش مرتين! سجل دلوقتي وخلي مشروعك يوصل لكل بيت في أسرع وقت.'
  },
  {
    key: 'maghrebi',
    name: 'اللهجة المغاربية',
    region: 'المغرب، تونس، الجزائر',
    estimatedCount: 120,
    confirmed: false,
    characteristics: ['نبرات مميزة للأسواق المحلية', 'جاهزية الثنائية اللغوية (عربي / فرنسي)', 'فخامة خاصة للعلامات التجارية العالمية'],
    highlightArtists: ['أمين الفاسي', 'صوفيا المراكشي', 'يوسف قسنطيني'],
    sampleAudioText: 'ابتكار دائم، وجودة لا ترضى إلا بالأفضل في كل تفصيلة من تفاصيل عملك.'
  }
];

export const CHANGELOG_ITEMS: ChangelogItem[] = [
  {
    id: 'ch-01',
    category: 'core',
    title: 'التموضع الاستراتيجي الجديد (الإنسان أولاً)',
    status: 'completed_local',
    files: ['qv-dev/README.md', 'resources/views/app/home/includes/hero-section.blade.php'],
    description: 'إبراز الميزة التنافسية الأقوى لقيمة فويس: 1,000+ معلق صوتي عربي حقيقي وموثق مقابل منصات الذكاء الاصطناعي العامة، مع عمق لهجوي ودمج ثلاث خدمات AI مع السوق البشري.',
    impact: 'تحويل الخطاب التسويقي من مجرد أداة توليد إلى منظومة صوتية متكاملة تضمن الحقوق والأصالة.'
  },
  {
    id: 'ch-02',
    category: 'views',
    title: 'صفحة: صوت حصري لعلامتك (B2B Branded Voice)',
    route: '/branded-voice',
    status: 'completed_local',
    files: [
      'app/Http/Controllers/App/BrandedVoiceController.php',
      'resources/views/app/branded-voice/index.blade.php'
    ],
    description: 'صفحة متخصصة لبناء صوت AI مخصص وحصري للشركات الكبرى، تشمل مقارنة بين الصوت المشترك والصوت الحصري ونموذج طلب فصيح.',
    impact: 'استقطاب صفقات B2B عالية القيمة مع المؤسسات والبنوك وشركات الاتصالات.'
  },
  {
    id: 'ch-03',
    category: 'views',
    title: 'صفحة: حلول حسب القطاع (Industry Solutions)',
    route: '/industries',
    status: 'completed_local',
    files: [
      'app/Http/Controllers/App/IndustrySolutionController.php',
      'resources/views/app/industry-solutions/index.blade.php'
    ],
    description: 'استعراض مخصص لـ 4 قطاعات رئيسية (بنوك ومصارف، تقنية، وكالات إعلانية، إعلام) مع تبويبات وروابط مباشرة (#banking, #tech...).',
    impact: 'تخصيص رحلة المستخدم حسب مجال عمله وتوضيح حالات الاستخدام العملية لكل قطاع.'
  },
  {
    id: 'ch-04',
    category: 'views',
    title: 'صفحة: بيانات صوتية للتدريب (Voice Data)',
    route: '/voice-data',
    status: 'completed_local',
    files: [
      'app/Http/Controllers/App/VoiceDataController.php',
      'resources/views/app/voice-data/index.blade.php'
    ],
    description: 'محتوى مستلهم من معايير Voices.com العالمية: استوديوهات 48kHz، بيانات موسومة ومصنفة، وترخيص أخلاقي وقانوني 100%.',
    impact: 'فتح خط أعمال جديد مع شركات تدريب نماذج الذكاء الاصطناعي والباحثين.'
  },
  {
    id: 'ch-05',
    category: 'components',
    title: 'إعادة بناء استوديو الأصوات (Instant Voices)',
    route: '/instant-voices',
    status: 'completed_local',
    files: ['resources/views/app/instant-voices/index.blade.php'],
    description: 'استبدال البريف البسيط القديم باستوديو متكامل: شريط جانبي، لوحة توليد نص لصوت، سلايدرات السرعة والنبرة، مشغل تفاعلي، ومكتبة مفضلة.',
    impact: 'تجربة مستخدم حديثة تضاهي ElevenLabs مع خصوصية الهوية واللهجات العربية.'
  },
  {
    id: 'ch-06',
    category: 'components',
    title: 'الهيدر الموسع (Mega-Menu)',
    status: 'completed_local',
    files: ['resources/views/app/layouts/includes/nav.blade.php'],
    description: 'قوائم منسدلة عريضة بعمودين لأصوات AI وحلول القطاعات، مع أيقونات ووصف وبطاقة ترويجية داكنة، ودعم كامل للشاشات الذكية والموبايل.',
    impact: 'تنظيم شجرة الموقع وتسهيل وصول الزائر لكل المنتجات والخدمات بسلاسة.'
  },
  {
    id: 'ch-07',
    category: 'components',
    title: 'الصفحة الرئيسية: الهيرو وقسم Showcase المطور',
    route: '/',
    status: 'completed_local',
    files: [
      'resources/views/app/home/includes/hero-section.blade.php',
      'resources/views/app/home/includes/studio-showcase.blade.php',
      'resources/views/app/home/includes/redesign-styles.blade.php'
    ],
    description: 'عنوان رئيسي رنان "بيانات صوتية. أصوات بشرية. صوتٌ يصنع هويتك"، شريط ثقة بـ 6 أرقام، ودجت تجريبي ثلاثي، ومحاكاة داكنة بدون إيموجيات عشوائية بأيقونات SVG خطية راقية.',
    impact: 'رفع معدل التحويل والانطباع الأول للهيبة والاحترافية التقنية.'
  },
  {
    id: 'ch-08',
    category: 'components',
    title: 'الدمج النهائي لعناصر "الموجة العربية" بالهوية البرتقالية',
    status: 'completed_local',
    files: ['resources/views/app/home/includes/redesign-styles.blade.php'],
    description: 'تطبيق الشريط البصري التوقيعي (خط عربي -> موجة صوتية)، شريط الثقة الموسع، تبويبات (جواز الصوت + تدقيق الصوت + استوديو الأصوات)، وقسم شارة معلق موثق.',
    impact: 'الحفاظ التام على الهوية البرتقالية التاريخية مع اكتساب الابتكار البصري والهندسي الجديد.'
  },
  {
    id: 'ch-09',
    category: 'pending',
    title: 'الأرقام والبيانات المعلقة بانتظار التأكيد',
    status: 'needs_confirmation',
    files: ['تأكيد الإدارة / التغذية الراجعة'],
    description: '1) توزيع اللهجات التقديري (خليجي 380، شامي 240، مصري 260، مغاربي 120). 2) سنوات الخبرة الميدانية (6 سنوات). 3) شعارات العلامات الشريكة (حالياً مربعات مؤقتة).',
    impact: 'ضمان دقة وصحة المعلومات قبل النشر النهائي.'
  }
];

export const DEFAULT_AUDIT_REPORT: AuditReport = {
  overallScore: 99.4,
  dialectAccuracy: 99.2,
  acousticClarity: 99.8,
  emotionalMatch: 98.6,
  sampleFrequency: '48,000 Hz Studio Master (FLAC 24-Bit)',
  verificationHash: 'SHA256: 8f9b7c2a10d94e33910cbe882410a514',
  testedDuration: '02:45 دقيقة',
  date: '2026-09-08'
};
