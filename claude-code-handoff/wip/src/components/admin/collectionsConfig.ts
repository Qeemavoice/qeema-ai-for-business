import { ARTICLE_CATEGORIES, ARTICLE_AUDIENCES } from '../../../shared/articleOptions';

export type FieldType = 'text' | 'textarea' | 'select' | 'number';

export interface CollectionField {
  key: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
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
  canExport?: boolean;
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

export const COLLECTIONS: Record<string, CollectionConfig> = {
  articles: {
    title: 'المقالات', desc: 'إدارة مقالات المدونة وحالة النشر والقراءات',
    addLabel: 'إضافة مقال', searchKeys: ['title', 'category', 'audience'], canEdit: true, canExport: true, editor: 'article',
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
  guides: {
    title: 'الأدلة', desc: 'الأدلة الإرشادية: مجانية أو مدفوعة مع صورة الغلاف',
    addLabel: 'إضافة دليل', searchKeys: ['title'], canEdit: true,
    columns: [
      { key: 'title', label: 'العنوان' },
      { key: 'price', label: 'السعر ($) - صفر = مجاني', mono: true },
      { key: 'status', label: 'الحالة', badge: true }
    ],
    fields: [
      { key: 'title', label: 'عنوان الدليل', required: true },
      { key: 'slug', label: 'المعرّف في الرابط (slug)' },
      { key: 'price', label: 'السعر بالدولار (0 = مجاني)', type: 'number' },
      { key: 'cover', label: 'مسار صورة الغلاف' },
      { key: 'status', label: 'الحالة', type: 'select', options: PUBLISH }
    ]
  },
  pages: {
    title: 'الصفحات', desc: 'صفحات الموقع الثابتة وروابطها',
    addLabel: 'إضافة صفحة', searchKeys: ['title', 'slug'], canEdit: true,
    columns: [
      { key: 'title', label: 'العنوان' },
      { key: 'slug', label: 'الرابط', mono: true },
      { key: 'status', label: 'الحالة', badge: true }
    ],
    fields: [
      { key: 'title', label: 'عنوان الصفحة', required: true },
      { key: 'slug', label: 'الرابط', required: true },
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
  newsletter: {
    title: 'القائمة البريدية', desc: 'المشتركون في النشرة البريدية',
    searchKeys: ['email'], canExport: true,
    columns: [
      { key: 'email', label: 'البريد الإلكتروني', mono: true },
      { key: 'date', label: 'تاريخ الاشتراك', mono: true }
    ],
    fields: []
  },
  jobs: {
    title: 'الوظائف', desc: 'طلبات الانضمام كمعلق صوتي',
    searchKeys: ['name', 'email', 'country', 'dialect'], canExport: true,
    columns: [
      { key: 'name', label: 'الاسم' },
      { key: 'email', label: 'البريد الإلكتروني', mono: true },
      { key: 'country', label: 'الدولة' },
      { key: 'dialect', label: 'اللهجة' },
      { key: 'status', label: 'الحالة', badge: true },
      { key: 'date', label: 'التاريخ', mono: true }
    ],
    fields: [],
    quickActions: [
      { label: 'قيد المراجعة', set: { status: 'reviewing' }, when: r => r.status === 'new', tone: 'slate' },
      { label: 'قبول', set: { status: 'accepted' }, when: r => r.status === 'new' || r.status === 'reviewing', tone: 'green' },
      { label: 'رفض', set: { status: 'rejected' }, when: r => r.status === 'new' || r.status === 'reviewing', tone: 'red' }
    ]
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
