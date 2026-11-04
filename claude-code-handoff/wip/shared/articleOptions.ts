/** Article taxonomy used by the admin articles table + editor. */
export const ARTICLE_CATEGORIES = [
  'كتب صوتية', 'بودكاست', 'رد آلي (IVR)', 'أدوات وأجهزة', 'تكنيكات صوتية', 'تعليم',
  'إعلانات تجارية', 'دوبلاج', 'وثائقيات', 'الهوية الصوتية', 'الذكاء الاصطناعي', 'التسويق الصوتي',
  'نصائح للمبتدئين', 'الاستوديو والتسجيل', 'قصص نجاح', 'السوق والصناعة', 'أخبار المنصة', 'أخرى'
] as const;

export const ARTICLE_AUDIENCES = ['معلق', 'عميل', 'معلق وعميل'] as const;

export const ARTICLE_STATUSES = [
  { value: 'published', label: 'منشور' },
  { value: 'draft', label: 'مسودة' }
];
