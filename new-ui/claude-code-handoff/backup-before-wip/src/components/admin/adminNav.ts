import {
  LayoutDashboard, ShoppingBag, Wallet, Users, FileAudio, Mail, AtSign, Briefcase,
  FileText, HelpCircle, BookOpen, Files, Mic2, CreditCard, Wrench, Languages, Tags,
  ShieldCheck, ScrollText, Settings, type LucideIcon
} from 'lucide-react';

export type AdminTab =
  | 'overview' | 'bookings' | 'cancellations' | 'financials'
  | 'companies' | 'narrators' | 'samples'
  | 'messages' | 'newsletter' | 'jobs'
  | 'articles' | 'faqs' | 'guides' | 'pages'
  | 'voices' | 'plans' | 'services' | 'dialects' | 'categories'
  | 'admins' | 'audit' | 'settings';

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
          { id: 'bookings', label: 'الحجوزات', desc: 'طلبات الاستوديو البشري: خط التسجيل والتسليم' },
          { id: 'cancellations', label: 'طلبات إلغاء الحجوزات', desc: 'معالجة طلبات إلغاء الحجوزات' }
        ]
      },
      { id: 'financials', label: 'المعاملات المالية', icon: Wallet, desc: 'مستحقات المعلقين وعمولات المنصة' },
      {
        label: 'المستخدمين', icon: Users,
        children: [
          { id: 'companies', label: 'العملاء', desc: 'حسابات العملاء والباقات والأرصدة' },
          { id: 'narrators', label: 'معلقين صوتيين', desc: 'دعوات المعلقين وتفعيل الحسابات' }
        ]
      },
      { id: 'samples', label: 'العينات', icon: FileAudio, desc: 'مراجعة العينات الصوتية المرفوعة وقبولها' },
      { id: 'messages', label: 'الرسائل البريدية', icon: Mail, desc: 'رسائل نموذج تواصل معنا' },
      { id: 'newsletter', label: 'القائمة البريدية', icon: AtSign, desc: 'المشتركون في النشرة البريدية' },
      { id: 'jobs', label: 'الوظائف', icon: Briefcase, desc: 'طلبات الانضمام كمعلق صوتي' }
    ]
  },
  {
    title: 'المحتوى',
    items: [
      { id: 'articles', label: 'المقالات', icon: FileText, desc: 'مقالات المدونة' },
      { id: 'faqs', label: 'الأسئلة الشائعة', icon: HelpCircle, desc: 'الأسئلة والأجوبة' },
      { id: 'guides', label: 'الأدلة', icon: BookOpen, desc: 'الأدلة المجانية والمدفوعة' },
      { id: 'pages', label: 'الصفحات', icon: Files, desc: 'صفحات الموقع الثابتة' }
    ]
  },
  {
    title: 'الثوابت',
    items: [
      { id: 'voices', label: 'الأصوات', icon: Mic2, desc: 'كتالوج الأصوات البشرية وأصوات الذكاء الاصطناعي' },
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
      { id: 'settings', label: 'الإعدادات', icon: Settings, desc: 'التسعير والعمولات ونقاط الربط' }
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
