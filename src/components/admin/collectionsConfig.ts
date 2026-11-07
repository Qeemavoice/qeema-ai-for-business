import { ARTICLE_CATEGORIES, ARTICLE_AUDIENCES } from '../../../shared/articleOptions';
import { STORY_VOICE_CATEGORIES, STORY_INDUSTRIES } from '../../data/stories';
import { VOICE_CATEGORY_FILTERS } from '../../data/humanVoices';

export type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'audio' | 'image' | 'richtext' | 'clips';

export interface CollectionField {
  key: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  /** Shown but not editable */
  readOnly?: boolean;
  /** Help text under an image/audio upload (replaces the default) */
  hint?: string;
}

export interface CollectionConfig {
  title: string;
  desc: string;
  addLabel?: string;           // undefined = no "add" button
  searchKeys: string[];
  columns: { key: string; label: string; badge?: boolean; mono?: boolean; /** inline dropdown to change the value from the table */ options?: string[] }[];
  /** Use the full-page editor instead of the modal */
  editor?: 'article';
  fields: CollectionField[];
  canEdit?: boolean;
  /** Fixed set of rows (one per page): no delete button */
  noDelete?: boolean;
  /** Extra per-row quick actions that set field values */
  quickActions?: { label: string; set: Record<string, any>; when?: (row: any) => boolean; tone?: 'green' | 'red' | 'slate' }[];
}

const PUBLISH = [
  { value: 'published', label: 'منشور' },
  { value: 'draft', label: 'مسودة' }
];
const ACTIVE = [
  { value: 'active', label: 'مفعّل' },
  { value: 'inactive', label: 'معطّل' }
];

const STORY_CATS = STORY_VOICE_CATEGORIES.filter(c => c !== 'الكل');
const STORY_INDS = STORY_INDUSTRIES.filter(c => c !== 'الكل');

export const COLLECTIONS: Record<string, CollectionConfig> = {
  articles: {
    title: 'المقالات', desc: 'إدارة مقالات المدونة وحالة النشر والقراءات',
    addLabel: 'إضافة مقال', searchKeys: ['title', 'category', 'audience'], canEdit: true, editor: 'article',
    columns: [
      { key: 'title', label: 'العنوان' },
      { key: 'category', label: 'المجال', options: [...ARTICLE_CATEGORIES] },
      { key: 'audience', label: 'الجمهور', options: [...ARTICLE_AUDIENCES] },
      { key: 'views', label: 'عدد القراءات', mono: true },
      { key: 'status', label: 'الحالة', badge: true },
      { key: 'date', label: 'تاريخ الإنشاء', mono: true }
    ],
    fields: [
      { key: 'title', label: 'عنوان المقال', required: true },
      { key: 'status', label: 'الحالة', type: 'select', options: PUBLISH },
      { key: 'date', label: 'تاريخ النشر', type: 'text' }
    ]
  },
  stories: {
    title: 'قصص النجاح', desc: 'قصص العملاء المعروضة في صفحة أعمالنا',
    addLabel: 'إضافة قصة', searchKeys: ['brand', 'title', 'voiceCategory', 'industry'], canEdit: true,
    columns: [
      { key: 'brand', label: 'العميل' },
      { key: 'title', label: 'عنوان القصة' },
      { key: 'voiceCategory', label: 'تصنيف التعليق', options: STORY_CATS },
      { key: 'industry', label: 'المجال', options: STORY_INDS },
      { key: 'date', label: 'التاريخ', mono: true },
      { key: 'status', label: 'الحالة', badge: true }
    ],
    fields: [
      { key: 'brand', label: 'اسم العميل', required: true },
      { key: 'logoUrl', label: 'شعار العميل', type: 'image' },
      { key: 'website', label: 'رابط موقع الشركة (للإدارة فقط، لا يظهر للزوار)' },
      { key: 'about', label: 'نبذة عن العميل (معلومات موثّقة)', type: 'textarea' },
      { key: 'title', label: 'عنوان القصة', type: 'textarea', required: true },
      { key: 'heroSubtitle', label: 'الوصف المختصر', type: 'textarea' },
      { key: 'content', label: 'نص القصة', type: 'richtext' },
      { key: 'voiceCategory', label: 'تصنيف التعليق الصوتي', type: 'select', options: STORY_CATS.map(v => ({ value: v, label: v })) },
      { key: 'industry', label: 'مجال العميل', type: 'select', options: STORY_INDS.map(v => ({ value: v, label: v })) },
      { key: 'quoteText', label: 'اقتباس العميل', type: 'textarea' },
      { key: 'quoteAuthor', label: 'صاحب الاقتباس' },
      { key: 'quoteRole', label: 'منصبه' },
      { key: 'audioUrl', label: 'المقطع الصوتي لملخص القصة (MP3)', type: 'audio' },
      { key: 'clips', label: 'مقاطع صوتية أخرى للقصة (اختياري)', type: 'clips' },
      { key: 'voiceButtonText', label: 'نص زر الطلب (اختياري، الافتراضي: اطلب نفس الصوت)' },
      { key: 'voiceUrl', label: 'رابط صفحة صوت المعلق (زر "اطلب نفس الصوت")' },
      { key: 'date', label: 'التاريخ' },
      { key: 'status', label: 'الحالة', type: 'select', options: PUBLISH }
    ]
  },
  pageTexts: {
    title: 'نصوص الصفحات', desc: 'العنوان والفقرة التعريفية أعلى كل صفحة عامة (المدونة، قصص النجاح، الأدلة...). اضغط تعديل لتغيير النص.',
    searchKeys: ['page', 'title', 'intro'], canEdit: true, noDelete: true,
    columns: [
      { key: 'page', label: 'الصفحة' },
      { key: 'title', label: 'العنوان' },
      { key: 'intro', label: 'الفقرة التعريفية' }
    ],
    fields: [
      { key: 'page', label: 'الصفحة', readOnly: true },
      { key: 'title', label: 'العنوان الرئيسي', required: true },
      { key: 'intro', label: 'الفقرة التعريفية أسفل العنوان', type: 'textarea' }
    ]
  },
  voiceTemplates: {
    title: 'نماذج الإنتاج الصوتي', desc: 'النماذج الجاهزة في لوحة العميل وفي صفحة /ar/voice-templates. كل نموذج يفتح الرابط الذي تكتبه له.',
    addLabel: 'إضافة نموذج', searchKeys: ['title', 'tag', 'link'], canEdit: true,
    columns: [
      { key: 'title', label: 'النموذج' },
      { key: 'order', label: 'الترتيب', mono: true },
      { key: 'tag', label: 'التصنيف' },
      { key: 'link', label: 'الرابط', mono: true },
      { key: 'status', label: 'الحالة', badge: true }
    ],
    fields: [
      { key: 'title', label: 'عنوان النموذج', required: true },
      { key: 'desc', label: 'الوصف المختصر', type: 'textarea' },
      { key: 'order', label: 'الترتيب (الأصغر يظهر أولاً، 1 = الأهم)', type: 'number' },
      { key: 'tag', label: 'التصنيف (يظهر على الصورة، مثل: إعلانات)' },
      { key: 'category', label: 'تصنيف الأصوات المقترحة عند «اطلب هذا النموذج»', type: 'select', options: [{ value: '', label: 'كل الأصوات' }, ...VOICE_CATEGORY_FILTERS.filter(c => c.key !== 'all').map(c => ({ value: c.key, label: c.label }))] },
      { key: 'img', label: 'صورة النموذج', type: 'image', hint: 'أبعاد الصورة: 1000 × 400 بكسل (نسبة 5:2، عريضة). تُقصّ من الأطراف تلقائيًا فاجعل العنصر المهم في الوسط. JPG أو PNG أو WebP بحد أقصى 2MB' },
      { key: 'link', label: 'رابط النموذج (مسار داخلي مثل /ar/voices أو رابط كامل https://...)' },
      { key: 'status', label: 'الحالة', type: 'select', options: PUBLISH }
    ]
  },
  playerSamples: {
    title: 'أصوات المشغّل', desc: 'العينات التي تُسمع في المشغّل أعلى الصفحة الرئيسية. يظهر المنشور منها بالترتيب؛ إذا لم يُنشر أي صوت يعرض الموقع العينات الافتراضية.',
    addLabel: 'إضافة صوت', searchKeys: ['title', 'desc'], canEdit: true,
    columns: [
      { key: 'title', label: 'العنوان' },
      { key: 'order', label: 'الترتيب', mono: true },
      { key: 'desc', label: 'الوصف' },
      { key: 'status', label: 'الحالة', badge: true }
    ],
    fields: [
      { key: 'title', label: 'العنوان (يظهر تحت المشغّل، مثل: إعلانات)', required: true },
      { key: 'desc', label: 'الوصف المختصر', type: 'textarea' },
      { key: 'audioUrl', label: 'المقطع الصوتي', type: 'audio', required: true, hint: 'MP3 أو M4A أو WAV. يفضّل مقطع قصير بين 20 و60 ثانية.' },
      { key: 'order', label: 'الترتيب (الأصغر يظهر أولاً)', type: 'number' },
      { key: 'status', label: 'الحالة', type: 'select', options: PUBLISH }
    ]
  },
  faqs: {
    title: 'الأسئلة الشائعة', desc: 'الأسئلة والأجوبة المعروضة في صفحة الأسئلة الشائعة',
    addLabel: 'إضافة سؤال', searchKeys: ['question', 'answer'], canEdit: true,
    columns: [
      { key: 'question', label: 'السؤال' },
      { key: 'answer', label: 'الإجابة' },
      { key: 'status', label: 'الحالة', badge: true }
    ],
    fields: [
      { key: 'question', label: 'السؤال', required: true },
      { key: 'answer', label: 'الإجابة', type: 'textarea', required: true },
      { key: 'status', label: 'الحالة', type: 'select', options: PUBLISH }
    ]
  },
  services: {
    title: 'الخدمات', desc: 'خدمات التعليق الصوتي المعروضة في الموقع',
    addLabel: 'إضافة خدمة', searchKeys: ['title'], canEdit: true,
    columns: [
      { key: 'title', label: 'الخدمة' },
      { key: 'slug', label: 'الرابط', mono: true },
      { key: 'status', label: 'الحالة', badge: true }
    ],
    fields: [
      { key: 'title', label: 'اسم الخدمة', required: true },
      { key: 'slug', label: 'الرابط', required: true },
      { key: 'status', label: 'الحالة', type: 'select', options: ACTIVE }
    ]
  },
  dialects: {
    title: 'اللهجات واللغات', desc: 'اللهجات واللغات المعتمدة في فلاتر مكتبة الأصوات',
    addLabel: 'إضافة لهجة / لغة', searchKeys: ['name'], canEdit: true,
    columns: [
      { key: 'flag', label: 'العلم' },
      { key: 'name', label: 'الاسم' },
      { key: 'type', label: 'النوع' }
    ],
    fields: [
      { key: 'name', label: 'الاسم', required: true },
      { key: 'flag', label: 'العلم (إيموجي)' },
      { key: 'type', label: 'النوع', type: 'select', options: [{ value: 'لهجة', label: 'لهجة' }, { value: 'لغة', label: 'لغة' }] }
    ]
  },
  categories: {
    title: 'التصنيفات', desc: 'تصنيفات الأصوات والعينات',
    addLabel: 'إضافة تصنيف', searchKeys: ['name'], canEdit: true,
    columns: [
      { key: 'name', label: 'التصنيف' },
      { key: 'status', label: 'الحالة', badge: true }
    ],
    fields: [
      { key: 'name', label: 'اسم التصنيف', required: true },
      { key: 'status', label: 'الحالة', type: 'select', options: ACTIVE }
    ]
  },
  messages: {
    title: 'الرسائل البريدية', desc: 'رسائل نموذج تواصل معنا',
    searchKeys: ['name', 'email', 'subject', 'message'],
    columns: [
      { key: 'name', label: 'المرسل' },
      { key: 'email', label: 'البريد الإلكتروني', mono: true },
      { key: 'subject', label: 'الموضوع' },
      { key: 'message', label: 'الرسالة' },
      { key: 'status', label: 'الحالة', badge: true },
      { key: 'date', label: 'التاريخ', mono: true }
    ],
    fields: [],
    quickActions: [
      { label: 'تعليم كمقروءة', set: { status: 'read' }, when: r => r.status === 'unread', tone: 'green' }
    ]
  },
  feedback: {
    title: 'ملاحظات العملاء', desc: 'الملاحظات والتقييمات المرسلة من لوحة العميل (زر ملاحظات)',
    searchKeys: ['companyName', 'userName', 'topic', 'message'],
    columns: [
      { key: 'companyName', label: 'العميل' },
      { key: 'userName', label: 'المرسل' },
      { key: 'stars', label: 'التقييم', mono: true },
      { key: 'topic', label: 'النوع' },
      { key: 'message', label: 'الملاحظة' },
      { key: 'status', label: 'الحالة', badge: true },
      { key: 'date', label: 'التاريخ', mono: true }
    ],
    fields: [],
    quickActions: [
      { label: 'تعليم كمقروءة', set: { status: 'read' }, when: r => r.status === 'unread', tone: 'green' }
    ]
  },
  newsletter: {
    title: 'القائمة البريدية', desc: 'المشتركون في النشرة البريدية',
    searchKeys: ['email'],
    columns: [
      { key: 'email', label: 'البريد الإلكتروني', mono: true },
      { key: 'date', label: 'تاريخ الاشتراك', mono: true }
    ],
    fields: []
  },
  admins: {
    title: 'إدارة المشرفين', desc: 'حسابات المشرفين وصلاحياتهم',
    addLabel: 'إضافة مشرف', searchKeys: ['name', 'email'], canEdit: true,
    columns: [
      { key: 'name', label: 'الاسم' },
      { key: 'email', label: 'البريد الإلكتروني', mono: true },
      { key: 'role', label: 'الصلاحية' },
      { key: 'status', label: 'الحالة', badge: true }
    ],
    fields: [
      { key: 'name', label: 'الاسم', required: true },
      { key: 'email', label: 'البريد الإلكتروني', required: true },
      { key: 'role', label: 'الصلاحية', type: 'select', options: [
        { value: 'مدير عام', label: 'مدير عام' }, { value: 'مشرف محتوى', label: 'مشرف محتوى' },
        { value: 'مشرف حجوزات', label: 'مشرف حجوزات' }, { value: 'مشرف مالي', label: 'مشرف مالي' }
      ] },
      { key: 'status', label: 'الحالة', type: 'select', options: ACTIVE }
    ]
  }
};

export const STATUS_LABELS: Record<string, { label: string; tone: 'green' | 'amber' | 'red' | 'slate' }> = {
  published: { label: 'منشور', tone: 'green' },
  draft: { label: 'مسودة', tone: 'slate' },
  active: { label: 'مفعّل', tone: 'green' },
  inactive: { label: 'معطّل', tone: 'slate' },
  read: { label: 'مقروءة', tone: 'slate' },
  unread: { label: 'جديدة', tone: 'amber' },
  new: { label: 'جديد', tone: 'amber' },
  reviewing: { label: 'قيد المراجعة', tone: 'amber' },
  accepted: { label: 'مقبول', tone: 'green' },
  rejected: { label: 'مرفوض', tone: 'red' },
  pending: { label: 'قيد الانتظار', tone: 'amber' },
  approved: { label: 'تمت الموافقة', tone: 'green' }
};
