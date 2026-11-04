/**
 * In-memory content/settings collections managed from the admin panel
 * (articles, FAQs, guides, pages, services, dialects, categories, jobs, mailbox...).
 * Replace with real DB tables when the database plan is implemented.
 */
import { GUIDES } from '../../src/data/guides';

export type CollectionName =
  | 'articles' | 'faqs' | 'guides' | 'pages'
  | 'services' | 'dialects' | 'categories'
  | 'messages' | 'newsletter' | 'jobs'
  | 'admins';

export type CollectionItem = { id: string; [k: string]: any };


const seed: Record<CollectionName, Record<string, any>[]> = {
  articles: [
    { title: 'كيف تُدير جلسة تعليق صوتي احترافية؟ أهم النصائح والأخطاء الواجب تجنبها', status: 'published', views: 0, date: '2026-08-02', category: 'الاستوديو والتسجيل', audience: 'معلق', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'لماذا يبقى الصوت البشري خيارك الأول في التعليق الصوتي؟', status: 'published', views: 0, date: '2026-08-02', category: 'الذكاء الاصطناعي', audience: 'عميل', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'الهوية الصوتية العربية: دليل قيمة فويس 2026 لبناء صوت علامتك التجارية', status: 'draft', views: 0, date: '2026-04-26', category: 'الهوية الصوتية', audience: 'عميل', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'الهوية الصوتية للعلامات التجارية: كيف تجعل صوتك مسموعاً قبل أن تتكلم؟', status: 'published', views: 1774, date: '2025-09-26', category: 'الهوية الصوتية', audience: 'عميل', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'تصميم الهوية الصوتية للعلامات التجارية: عندما يصبح الصوت هو البصمة', status: 'published', views: 2788, date: '2025-05-24', category: 'الهوية الصوتية', audience: 'عميل', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'أفضل مايكات بودكاست لعام 2025: مقارنة بين أكثر المايكات بحثًا وجودةً', status: 'published', views: 4628, date: '2025-05-05', category: 'أدوات وأجهزة', audience: 'معلق', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' }
  ],
  faqs: [
    { question: 'كيف يتم حجز معلق صوتي في قيمة فويس؟', answer: 'اختر العينة المناسبة، أدخل السيناريو، ثم ادفع لتأكيد الحجز.', status: 'published' },
    { question: 'ما هي مدة تسليم التسجيل الصوتي النهائي؟', answer: 'من 24 إلى 48 ساعة حسب توفر المعلق.', status: 'published' },
    { question: 'هل يمكن طلب تعديل على التسجيل؟', answer: 'نعم، وفق سياسة التعديلات المعلنة في الموقع.', status: 'published' },
    { question: 'ما هي التراخيص وحقوق الاستخدام التجاري الممنوحة؟', answer: 'ترخيص تجاري كامل للمحتوى المسجل.', status: 'published' },
    { question: 'هل أصوات الذكاء الاصطناعي في المنصة مرخصة؟', answer: 'نعم، مرخصة للاستخدام التجاري ضمن شروط الباقة.', status: 'published' }
  ],
  guides: GUIDES.map(g => ({
    title: g.title,
    slug: g.slug,
    price: g.priceUsd === null ? 0 : g.priceUsd,
    cover: g.cover,
    status: 'published'
  })),
  pages: [
    { title: 'من نحن', slug: '/ar/p/about-us', status: 'published' },
    { title: 'الشروط والأحكام', slug: '/ar/p/terms-of-use', status: 'published' },
    { title: 'سياسة التعديلات', slug: '/ar/p/revisions-policy', status: 'published' },
    { title: 'كيف نعمل', slug: '/ar/booking-steps', status: 'published' },
    { title: 'الأسعار', slug: '/ar/pricing', status: 'published' },
    { title: 'تواصل معنا', slug: '/ar/contact-us', status: 'published' }
  ],
  services: [
    { title: 'إعلانات تجارية وتسويقية', slug: '/ar/services/commercial', status: 'active' },
    { title: 'الرد الآلي IVR', slug: '/ar/services/ivr', status: 'active' },
    { title: 'الدوبلاج', slug: '/ar/services/dubbing', status: 'active' },
    { title: 'البودكاست', slug: '/ar/services/podcast', status: 'active' },
    { title: 'الكتب الصوتية', slug: '/ar/services/audiobooks', status: 'active' }
  ],
  dialects: [
    { name: 'سعودي', flag: '🇸🇦', type: 'لهجة' },
    { name: 'إماراتي', flag: '🇦🇪', type: 'لهجة' },
    { name: 'خليجي', flag: '🇸🇦', type: 'لهجة' },
    { name: 'كويتي', flag: '🇰🇼', type: 'لهجة' },
    { name: 'مصري', flag: '🇪🇬', type: 'لهجة' },
    { name: 'شامي', flag: '🇸🇾', type: 'لهجة' },
    { name: 'لبناني', flag: '🇱🇧', type: 'لهجة' },
    { name: 'مغاربي', flag: '🇲🇦', type: 'لهجة' },
    { name: 'فصحى', flag: '🌍', type: 'لهجة' },
    { name: 'عربي', flag: '🇸🇦', type: 'لغة' },
    { name: 'إنجليزي', flag: '🇬🇧', type: 'لغة' }
  ],
  categories: ['إعلانات', 'وثائقيات', 'دراما', 'رد آلي', 'دوبلاج كرتوني', 'دوبلاج وثائقي', 'تقارير وأخبار', 'شعر وخواطر', 'قصص', 'تعليمي', 'برومو', 'بودكاست', 'كتب وروايات', 'ديني']
    .map(name => ({ name, status: 'active' })),
  messages: [
    { name: 'سلمى الحربي', email: 'salma@example.com', subject: 'استفسار عن أسعار الإعلانات', message: 'أرغب بمعرفة أسعار تعليق إعلان مدته دقيقة.', date: '2026-10-25', status: 'unread' },
    { name: 'خالد المنصوري', email: 'khaled@example.com', subject: 'باقة الشركات', message: 'نحتاج عرضاً لباقة الشركات لفريق من عشرة أعضاء.', date: '2026-10-24', status: 'read' }
  ],
  newsletter: [
    { email: 'subscriber1@example.com', date: '2026-10-16' },
    { email: 'subscriber2@example.com', date: '2026-10-07' },
    { email: 'subscriber3@example.com', date: '2026-10-05' }
  ],
  jobs: [
    { name: 'متقدم تجريبي ١', email: 'applicant1@example.com', country: 'مصر', dialect: 'مصري', status: 'new', date: '2026-10-20' },
    { name: 'متقدمة تجريبية ٢', email: 'applicant2@example.com', country: 'السعودية', dialect: 'سعودي', status: 'reviewing', date: '2026-10-18' }
  ],
  admins: [
    { name: 'نور', email: 'nourahel101@gmail.com', role: 'مدير عام', status: 'active' }
  ]
};

const store = new Map<CollectionName, CollectionItem[]>();
let counter = 1000;

(Object.keys(seed) as CollectionName[]).forEach(name => {
  store.set(name, seed[name].map((row, i) => ({ id: `${name}-${i + 1}`, ...row })));
});

export const collections = {
  names: () => Array.from(store.keys()),
  has: (name: string): name is CollectionName => store.has(name as CollectionName),
  list: (name: CollectionName) => store.get(name) || [],
  create: (name: CollectionName, data: Record<string, any>) => {
    const item: CollectionItem = { ...data, id: `${name}-${++counter}` };
    store.get(name)!.unshift(item);
    return item;
  },
  update: (name: CollectionName, id: string, data: Record<string, any>) => {
    const list = store.get(name)!;
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, id };
    return list[idx];
  },
  remove: (name: CollectionName, id: string) => {
    const list = store.get(name)!;
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
};
