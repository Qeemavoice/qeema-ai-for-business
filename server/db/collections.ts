/**
 * In-memory content/settings collections managed from the admin panel
 * (articles, FAQs, guides, pages, services, dialects, categories, jobs, mailbox...).
 * Replace with real DB tables when the database plan is implemented.
 */
import { GUIDES } from '../../src/data/guides';
import { STORIES, storyToRecord } from '../../src/data/stories';
import { SITE_PAGES } from '../../src/data/sitePages';
import { HUMAN_VOICE_SAMPLES, VOICE_CATEGORY_FILTERS } from '../../src/data/humanVoices';
import { DIALECTS, dialectOf } from '../../src/data/dialects';
import { PAGE_TEXTS } from '../../src/data/pageTexts';
import { VOICE_TEMPLATES } from '../../src/data/voiceTemplates';
import { FAQS_DATA } from '../../src/data/faqs';
import { STORY_WEBSITES } from './storyWebsites';

/** Library filter categories a sample belongs to (same loose matching as the library filter). */
const sampleCategories = (v: { category: string; tags?: string[] }) => VOICE_CATEGORY_FILTERS
  .filter(c => c.key !== 'all' && (v.category.includes(c.key) || c.key.includes(v.category) || (v.tags || []).some(t => t.includes(c.key) || c.key.includes(t))))
  .map(c => c.key);

export type CollectionName =
  | 'articles' | 'faqs' | 'guides' | 'pages'
  | 'services' | 'dialects' | 'categories'
  | 'messages' | 'newsletter' | 'jobs'
  | 'admins' | 'stories' | 'humanVoices' | 'feedback' | 'jobPostings' | 'pageTexts' | 'voiceTemplates';

export type CollectionItem = { id: string; [k: string]: any };


const seed: Record<CollectionName, Record<string, any>[]> = {
  voiceTemplates: VOICE_TEMPLATES.map(t => ({ ...t, status: 'published' })),
  pageTexts: PAGE_TEXTS.map(t => ({ id: `pageTexts-${t.key}`, ...t })),
  stories: STORIES.map(s => ({ ...storyToRecord(s), website: STORY_WEBSITES[s.id] || '' })),
  humanVoices: HUMAN_VOICE_SAMPLES.map(({ pricing, ...v }, i) => ({
    ...v,
    categories: sampleCategories(v),
    languages: ['العربية'],
    dialect: dialectOf(v.accent, v.flag) || v.accent,
    seoText: v.subtitle,
    status: 'active',
    createdAt: new Date(Date.UTC(2026, 7, 19, 0, 10) - i * 3 * 60000).toISOString()
  })),
  articles: [
    { title: 'كيف تُدير جلسة تعليق صوتي احترافية؟ أهم النصائح والأخطاء الواجب تجنبها', status: 'published', views: 0, date: '2026-08-02', category: 'الاستوديو والتسجيل', audience: 'معلق', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'لماذا يبقى الصوت البشري خيارك الأول في التعليق الصوتي؟', status: 'published', views: 0, date: '2026-08-02', category: 'الذكاء الاصطناعي', audience: 'عميل', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'الهوية الصوتية العربية: دليل قيمة فويس 2026 لبناء صوت علامتك التجارية', status: 'draft', views: 0, date: '2026-04-26', category: 'الهوية الصوتية', audience: 'عميل', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'الهوية الصوتية للعلامات التجارية: كيف تجعل صوتك مسموعاً قبل أن تتكلم؟', status: 'published', views: 1774, date: '2025-09-26', category: 'الهوية الصوتية', audience: 'عميل', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'تصميم الهوية الصوتية للعلامات التجارية: عندما يصبح الصوت هو البصمة', status: 'published', views: 2788, date: '2025-05-24', category: 'الهوية الصوتية', audience: 'عميل', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' },
    { title: 'أفضل مايكات بودكاست لعام 2025: مقارنة بين أكثر المايكات بحثًا وجودةً', status: 'published', views: 4628, date: '2025-05-05', category: 'أدوات وأجهزة', audience: 'معلق', slug: '', shortDescription: '', keywords: '', metaDescription: '', videoUrl: '' }
  ],
  faqs: FAQS_DATA.map(f => ({ ...f, status: 'published' })),

  guides: GUIDES.map((g, i) => ({
    title: g.title,
    slug: g.slug,
    description: g.desc,
    type: g.priceUsd === null ? 'free' : 'paid',
    price: g.priceUsd ?? 0,
    cover: g.cover,
    file: '',
    fileName: '',
    link: g.link,
    gradient: g.gradient,
    likes: [42, 31, 18, 25, 12][i] ?? 0,
    comments: [7, 4, 2, 3, 1][i] ?? 0,
    downloads: [318, 204, 96, 150, 61][i] ?? 0,
    createdAt: new Date(Date.UTC(2026, 1, 8 + i * 4, 11, 5, 48)).toISOString(),
    status: 'published'
  })),
  pages: SITE_PAGES.map(p => ({ id: p.key, ...p, status: 'published' })),
  services: [
    { title: 'إعلانات تجارية وتسويقية', slug: '/ar/voice-models/ads', status: 'active' },
    { title: 'الرد الآلي IVR', slug: '/ar/voice-models/ivr', status: 'active' },
    { title: 'الدوبلاج', slug: '/ar/services/dubbing', status: 'active' },
    { title: 'البودكاست', slug: '/ar/voice-models/podcast', status: 'active' },
    { title: 'الكتب الصوتية', slug: '/ar/voice-models/audiobooks', status: 'active' }
  ],
  dialects: DIALECTS.map(d => ({ name: d.key, flag: d.flag, type: d.key.startsWith('إنجليزي') ? 'لغة' : 'لهجة' })),
  categories: ['إعلانات', 'وثائقيات', 'دراما', 'رد آلي', 'دوبلاج كرتوني', 'دوبلاج وثائقي', 'تقارير وأخبار', 'شعر وخواطر', 'قصص', 'تعليمي', 'برومو', 'بودكاست', 'كتب وروايات', 'ديني']
    .map(name => ({ name, status: 'active' })),
  feedback: [],
  jobPostings: [],
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
    { name: 'محمود السيد', email: 'applicant1@example.com', phone: '+20 100 555 0123', country: 'مصر', jobTitle: 'طلب عام', experienceYears: 3,
      coverLetter: 'مهندس صوت بخبرة 3 سنوات في المكساج والماسترينغ للإعلانات والبودكاست، أعمل على Pro Tools وiZotope RX.',
      portfolio: 'https://soundcloud.com/example', cvName: '', cvUrl: '', status: 'new', date: '2026-10-20' },
    { name: 'ريم العتيبي', email: 'applicant2@example.com', phone: '+966 55 555 0199', country: 'السعودية', jobTitle: 'طلب عام', experienceYears: 6,
      coverLetter: 'منسقة إنتاج صوتي لمشاريع حكومية وتعليمية، أدرت فرق معلقين وتسليم أكثر من 200 مشروع.',
      portfolio: '', cvName: '', cvUrl: '', status: 'reviewing', date: '2026-10-18' }
  ],
  admins: [
    { name: 'نور', email: 'nourahel101@gmail.com', role: 'مدير عام', status: 'active' }
  ]
};

const store = new Map<CollectionName, CollectionItem[]>();
let counter = 1000;
/** Ids removed from the dashboard, so seed rows added later in code don't bring them back */
const deleted: Partial<Record<CollectionName, string[]>> = {};

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
    (deleted[name] ||= []).push(id);
    return true;
  },
  snapshot: () => ({ collections: Object.fromEntries(store), deleted }),
  /**
   * Saved data wins; seed rows with their own id (e.g. stories added in code) that were never saved or deleted are kept,
   * and fields added in code later (e.g. a new story field) fill in where the saved row has no such key.
   */
  restore: (saved: Record<string, CollectionItem[]>, savedDeleted: Record<string, string[]>) => {
    Object.assign(deleted, savedDeleted);
    for (const [name, rows] of Object.entries(saved) as [CollectionName, CollectionItem[]][]) {
      if (!store.has(name)) continue;
      const known = new Set([...rows.map(r => r.id), ...(deleted[name] || [])]);
      const seedRows = store.get(name)!;
      const seedById = new Map(seedRows.map(r => [r.id, r]));
      const fresh = seedRows.filter(r => !known.has(r.id) && !new RegExp(`^${name}-\\d+$`).test(r.id));
      store.set(name, [...fresh, ...rows.map(r => (seedById.has(r.id) ? { ...seedById.get(r.id), ...r } : r))]);
      rows.forEach(r => { const n = Number(r.id.split('-').pop()); if (n > counter) counter = n; });
    }
  }
};
