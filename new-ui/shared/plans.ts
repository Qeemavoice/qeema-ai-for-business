/**
 * Single source of truth for subscription plans.
 * Used by the server (billing API), the public pricing page, the dashboard
 * billing view and the admin panel — edit plans here only.
 */

export type PlanFeatureIcon =
  | 'gift' | 'audio' | 'headphones' | 'calendar' | 'file' | 'mic' | 'shield'
  | 'history' | 'percent' | 'fingerprint' | 'zap' | 'sparkles' | 'code' | 'building' | 'clock';

export interface PlanFeature {
  icon: PlanFeatureIcon;
  text: string;
}

export interface PlanDefinition {
  id: string;
  name: string;
  nameAr: string;
  tagline: string;
  /** Credits granted every month (1 credit = 1 character). 0 for free / custom plans. */
  monthlyCredits: number;
  /** Monthly price in USD; null when the price is custom (sales-led). */
  priceUsd: number | null;
  /** Monthly-equivalent price when billed annually (20% off). */
  annualPriceUsd: number | null;
  /** Discount on human voice bookings, in percent. */
  bookingDiscountPct: number;
  badge?: string;
  featured?: boolean;
  /** Plan whose features are included ("كل ما في ... بالإضافة إلى"). */
  inheritsFrom?: string;
  /** Custom plans are sold by the sales team, not self-serve. */
  isCustom?: boolean;
  features: PlanFeature[];
}

/** Welcome credits every new account receives once at signup. */
export const SIGNUP_BONUS_CREDITS = 5000;

export const DEFAULT_PLAN_ID = 'plan-free';

export const PLANS: PlanDefinition[] = [
  {
    id: 'plan-free',
    name: 'Free',
    nameAr: 'مجاني',
    tagline: 'ابدأ وجرّب الأصوات واستوديو التوليد بدون أي تكلفة.',
    monthlyCredits: 0,
    priceUsd: 0,
    annualPriceUsd: 0,
    bookingDiscountPct: 0,
    badge: 'رصيد مجاني عند التسجيل',
    features: [
      { icon: 'gift', text: '5,000 حرف رصيد ترحيبي مجاني' },
      { icon: 'audio', text: 'تحويل النص إلى صوت بأصوات AI' },
      { icon: 'headphones', text: 'الاستماع لعينات المعلقين البشريين' },
      { icon: 'calendar', text: 'حجز معلق بشري لأي مشروع بتكلفة منفصلة' },
      { icon: 'file', text: 'تنزيل بصيغة MP3' }
    ]
  },
  {
    id: 'plan-starter',
    name: 'Starter',
    nameAr: 'مبتدئ',
    tagline: 'لمن يبدأ إنتاج محتواه الصوتي بانتظام.',
    monthlyCredits: 25000,
    priceUsd: 20,
    annualPriceUsd: 16,
    bookingDiscountPct: 0,
    inheritsFrom: 'المجانية',
    features: [
      { icon: 'audio', text: '25,000 حرف شهرياً' },
      { icon: 'calendar', text: 'حجز معلق بشري لأي مشروع بتكلفة منفصلة' },
      { icon: 'mic', text: 'أستوديو TTS لتحويل النص إلى صوت' },
      { icon: 'shield', text: 'ترخيص تجاري كامل للمحتوى' },
      { icon: 'file', text: 'تنزيل WAV 48kHz بجودة استوديو' },
      { icon: 'history', text: 'سجل توليد غير محدود' }
    ]
  },
  {
    id: 'plan-creator',
    name: 'Content Creator',
    nameAr: 'صانع محتوى',
    tagline: 'لصناع المحتوى والمسوّقين والوكالات الصغيرة.',
    monthlyCredits: 50000,
    priceUsd: 30,
    annualPriceUsd: 24,
    bookingDiscountPct: 15,
    badge: 'الأكثر طلباً',
    featured: true,
    inheritsFrom: 'مبتدئ',
    features: [
      { icon: 'audio', text: '50,000 حرف شهرياً' },
      { icon: 'percent', text: 'خصم 15% على حجوزات المعلقين' },
      { icon: 'zap', text: 'أولوية في التوليد والمعالجة' },
      { icon: 'sparkles', text: 'الوصول المبكر للميزات الجديدة' },
      { icon: 'headphones', text: 'دعم مخصص من فريق الهندسة الصوتية' }
    ]
  },
  {
    id: 'plan-enterprise',
    name: 'Business',
    nameAr: 'الشركات',
    tagline: 'للشركات والمؤسسات والإنتاج الضخم.',
    monthlyCredits: 0,
    priceUsd: null,
    annualPriceUsd: null,
    bookingDiscountPct: 0,
    inheritsFrom: 'صانع محتوى',
    isCustom: true,
    features: [
      { icon: 'audio', text: 'رصيد حروف حسب احتياج منشأتك' },
      { icon: 'mic', text: 'صوت AI حصري لعلامتك التجارية' },
      { icon: 'percent', text: 'خصم مخصص على حجوزات المعلقين' },
      { icon: 'building', text: 'حسابات فريق متعددة وفواتير نظامية' },
      { icon: 'clock', text: 'مدير حساب واتفاقية مستوى خدمة SLA' }
    ]
  }
];

export const findPlan = (id: string | undefined) => PLANS.find(p => p.id === id);
