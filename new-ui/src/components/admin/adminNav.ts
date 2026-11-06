import {
  LayoutDashboard, ShoppingBag, Wallet, Users, FileAudio, Mail, AtSign, Briefcase,
  FileText, HelpCircle, BookOpen, Files, Mic2, CreditCard, Wrench, Languages, Tags,
  ShieldCheck, ScrollText, Settings, AudioLines, Trophy, MessageSquareHeart, Star, Heading1, LayoutTemplate, type LucideIcon
} from 'lucide-react';

export type AdminTab =
  | 'overview' | 'bookings' | 'financials' | 'transactions' | 'tts' | 'ttsVoices' | 'stories'
  | 'companies' | 'narrators' | 'samples' | 'reviews' | 'rowad'
  | 'messages' | 'feedback' | 'newsletter' | 'jobs'
  | 'articles' | 'faqs' | 'guides' | 'pages' | 'pageTexts' | 'voiceTemplates'
  | 'voices' | 'plans' | 'services' | 'dialects' | 'categories'
  | 'admins' | 'audit' | 'settings'
  | 'page-privacy' | 'page-terms' | 'page-about'
  | 'settings-currency' | 'settings-commission' | 'settings-payments' | 'settings-smtp' | 'settings-tts' | 'settings-maintenance';

export interface AdminNavItem {
  id?: AdminTab;
  label: string;
  icon: LucideIcon;
  desc?: string;
  children?: { id: AdminTab; label: string; desc: string }[];
}

export interface AdminNavGroup { title?: string; items: AdminNavItem[]; }

/**
 * Structure of the old admin panel (sales / users / content / constants / system),
 * with the new operations screens placed inside it.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    items: [
      { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard, desc: 'مؤشرات المنصة والعمليات' },
      {
        label: 'المبيعات', icon: ShoppingBag,
        children: [
          { id: 'bookings', label: 'الحجوزات', desc: 'طلبات الاستوديو البشري: خط التسجيل والتسليم' }
        ]
      },
      {
        label: 'المعاملات المالية', icon: Wallet,
        children: [
          { id: 'financials', label: 'الأرباح', desc: 'إيرادات المنصة وعمولاتها ومستحقات المعلقين وصرفها' },
          { id: 'transactions', label: 'المعاملات', desc: 'كل المبالغ المدفوعة من العملاء مقابل حجوزات الأصوات' }
        ]
      },
      {
        label: 'استوديو TTS', icon: AudioLines,
        children: [
          { id: 'tts', label: 'التوليدات', desc: 'كل عمليات التوليد الصوتي من استوديو العملاء: النصوص والأصوات والاستهلاك والتكلفة' },
          { id: 'ttsVoices', label: 'الأصوات', desc: 'أصوات الاستوديو التي ترفعها الإدارة: المعرّف عند المزوّد والعينة الصوتية والمعلق صاحب الصوت ونسبة أرباحه' }
        ]
      },
      {
        label: 'المستخدمين', icon: Users,
        children: [
          { id: 'companies', label: 'العملاء', desc: 'حسابات العملاء والباقات والأرصدة' },
          { id: 'rowad', label: 'دعوات روّاد قيمة', desc: 'دعوات الوصول المبكر لعملاء الحجز السابقين: الحالة والتفعيل والرصيد المجاني والمشتريات بسعر الروّاد' },
          { id: 'narrators', label: 'معلقين صوتيين', desc: 'دعوات المعلقين وتفعيل الحسابات' }
        ]
      },
      { id: 'samples', label: 'العينات', icon: FileAudio, desc: 'مراجعة العينات الصوتية المرفوعة وقبولها' },
      { id: 'reviews', label: 'تقييمات الأصوات', icon: Star, desc: 'تقييمات العملاء للأصوات المحجوزة. النشر يُظهر النجوم فقط في صفحة الصوت، والنص يبقى هنا' },
      { id: 'messages', label: 'الرسائل البريدية', icon: Mail, desc: 'رسائل نموذج تواصل معنا' },
      { id: 'feedback', label: 'ملاحظات العملاء', icon: MessageSquareHeart, desc: 'ملاحظات وتقييمات العملاء من لوحة العميل' },
      { id: 'newsletter', label: 'القائمة البريدية', icon: AtSign, desc: 'المشتركون في النشرة البريدية' },
      { id: 'jobs', label: 'الوظائف', icon: Briefcase, desc: 'الوظائف المنشورة والمتقدمون لها' }
    ]
  },
  {
    title: 'المحتوى',
    items: [
      { id: 'articles', label: 'المقالات', icon: FileText, desc: 'مقالات المدونة' },
      { id: 'faqs', label: 'الأسئلة الشائعة', icon: HelpCircle, desc: 'الأسئلة والأجوبة' },
      { id: 'guides', label: 'الأدلة', icon: BookOpen, desc: 'الأدلة المجانية والمدفوعة' },
      { id: 'stories', label: 'قصص النجاح', icon: Trophy, desc: 'قصص العملاء المعروضة في صفحة أعمالنا /ar/our-works' },
      { id: 'voiceTemplates', label: 'نماذج الإنتاج الصوتي', icon: LayoutTemplate, desc: 'النماذج الجاهزة وروابطها في لوحة العميل وصفحة النماذج' },
      { id: 'pageTexts', label: 'نصوص الصفحات', icon: Heading1, desc: 'العنوان والفقرة التعريفية أعلى الصفحات العامة' },
      {
        label: 'الصفحات', icon: Files,
        children: [
          { id: 'page-privacy', label: 'سياسة الخصوصية', desc: 'محتوى صفحة سياسة الخصوصية /ar/p/privacy-policy' },
          { id: 'page-terms', label: 'شروط الاستخدام', desc: 'محتوى صفحة شروط الاستخدام /ar/p/terms-of-use' },
          { id: 'page-about', label: 'من نحن', desc: 'محتوى صفحة من نحن /ar/p/about-us' }
        ]
      }
    ]
  },
  {
    title: 'الثوابت',
    items: [
      { id: 'voices', label: 'الأصوات', icon: Mic2, desc: 'أصوات المعلقين في مكتبة الأصوات: الأسعار والتصنيفات وروابط المشاركة' },
      { id: 'plans', label: 'الباقات', icon: CreditCard, desc: 'باقات الاشتراك والأسعار (مصدرها shared/plans.ts)' },
      { id: 'services', label: 'الخدمات', icon: Wrench, desc: 'خدمات التعليق الصوتي' },
      { id: 'dialects', label: 'اللهجات واللغات', icon: Languages, desc: 'اللهجات واللغات المعتمدة في الفلاتر' },
      { id: 'categories', label: 'التصنيفات', icon: Tags, desc: 'تصنيفات الأصوات والعينات' }
    ]
  },
  {
    title: 'النظام',
    items: [
      { id: 'admins', label: 'إدارة المشرفين', icon: ShieldCheck, desc: 'حسابات المشرفين وصلاحياتهم' },
      { id: 'audit', label: 'سجل التدقيق', icon: ScrollText, desc: 'متابعة الأنشطة والتعديلات' },
      {
        label: 'الإعدادات', icon: Settings,
        children: [
          { id: 'settings-currency', label: 'العملات', desc: 'العملة الافتراضية للأسعار والفواتير' },
          { id: 'settings-commission', label: 'العمولات', desc: 'رسوم المنصة ورسوم بوابة الدفع' },
          { id: 'settings-payments', label: 'طرق الدفع', desc: 'ربط بوابة Stripe ووضع الاختبار' },
          { id: 'settings-smtp', label: 'إعدادات SMTP', desc: 'خادم البريد الصادر للإشعارات' },
          { id: 'settings-tts', label: 'مزوّدو الصوت', desc: 'مفاتيح منصّت و ElevenLabs لاستوديو TTS' },
          { id: 'settings-maintenance', label: 'إعدادات الصيانة', desc: 'تشغيل الموقع في وضع الصيانة' }
        ]
      }
    ]
  }
];

export const findNavMeta = (tab: AdminTab) => {
  for (const g of ADMIN_NAV) {
    for (const it of g.items) {
      if (it.id === tab) return { label: it.label, desc: it.desc || '', parent: undefined as string | undefined };
      const child = it.children?.find(c => c.id === tab);
      if (child) return { label: child.label, desc: child.desc, parent: it.label };
    }
  }
  return { label: 'الرئيسية', desc: '', parent: undefined };
};
