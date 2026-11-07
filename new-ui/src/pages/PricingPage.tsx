import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  Calculator, 
  HelpCircle, 
  Clock, 
  Layers, 
  Zap, 
  CreditCard,
  Building2,
  ChevronDown,
  CornerLeftDown,
  Gift,
  AudioLines,
  Mic2,
  Headphones,
  CalendarCheck,
  FileAudio,
  History,
  Percent,
  Fingerprint,
  Code2
} from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PLANS, PlanFeatureIcon } from '../../shared/plans';
import { finalPrice, fmtUsd } from '../../shared/pricing';
import { VOICE_CATEGORY_FILTERS, type UnifiedVoiceItem } from '../data/humanVoices';
import { useHumanVoices } from '../lib/humanVoices';
import { useSiteLists } from '../lib/siteLists';
import { usePageText } from '../lib/pageTexts';

const CHARS_PER_MINUTE = 100;

/** Final per-minute prices (narrator price + platform commission) of narrators in this category; falls back to all narrators. */
const estimateProjectCost = (samples: UnifiedVoiceItem[], category: string, minutes: number) => {
  const priced = samples.filter(v => v.narratorPriceUsd);
  const inCat = priced.filter(v => category === 'all' || v.category.includes(category) || category.includes(v.category) ||
    (v.tags || []).some(t => t.includes(category) || category.includes(t)));
  const rates = (inCat.length ? inCat : priced).map(v => (v as any).finalPriceUsd ?? finalPrice(v.narratorPriceUsd!));
  const avg = rates.reduce((a, r) => a + r, 0) / rates.length;
  return { avg: Math.round(avg * minutes), min: Math.min(...rates) * minutes, max: Math.max(...rates) * minutes };
};

export const PricingPage: React.FC = () => {
  const pageText = usePageText('pricing');
  const siteCategories = useSiteLists().categories;
  // 1. Centralized SEO matching requirements exactly
  useSeo(STATIC_SEO_ROUTES['/ar/pricing']);

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Project cost calculator: category + length in minutes -> average final price of our human narrators
  const [calcCategory, setCalcCategory] = useState('all');
  const [calcMinutes, setCalcMinutes] = useState(1);
  const estimate = estimateProjectCost(useHumanVoices(), calcCategory, calcMinutes);

  // Subscription plans come from shared/plans.ts (same data as the dashboard billing)
  const PLAN_ICONS: Record<PlanFeatureIcon, React.ElementType> = {
    gift: Gift, audio: AudioLines, headphones: Headphones, calendar: CalendarCheck, file: FileAudio,
    mic: Mic2, shield: ShieldCheck, history: History, percent: Percent, fingerprint: Fingerprint,
    zap: Zap, sparkles: Sparkles, code: Code2, building: Building2, clock: Clock
  };
  const plans = PLANS.map(p => ({
    id: p.id,
    name: p.nameAr,
    tagline: p.tagline,
    monthlyPrice: p.priceUsd,
    annualPrice: p.annualPriceUsd,
    badge: p.badge,
    featured: p.featured,
    inheritsFrom: p.inheritsFrom,
    cta: p.isCustom ? 'تواصل مع المبيعات' : p.priceUsd === 0 ? 'ابدأ مجاناً' : `اختر ${p.nameAr}`,
    ctaTo: p.isCustom ? '/ar/contact-us' : p.priceUsd === 0 ? '/ar/generate' : '/ar/account',
    features: p.features.map(f => ({ icon: PLAN_ICONS[f.icon], text: f.text }))
  }));

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const pricingFaqs = [
    {
      q: 'هل تشمل الأسعار التراخيص التجارية وحقوق البث؟',
      a: 'نعم، جميع أسعار التعليق الصوتي في قيمة فويس تتضمن ترخيصاً تجارياً موثقاً يتيح لك استخدام الصوت في الحملات الرقمية، السوشيال ميديا، والمنصات الترويجية بدون أي رسوم ملكية إضافية.'
    },
    {
      q: 'ما هي سياسة التعديلات وإعادة التسجيل؟',
      a: 'أي خطأ في نطق النص أو التشكيل المتفق عليه يُعاد تسجيله مجاناً بنسبة 100%. أما التعديلات الناتجة عن تغيير النص الأصلي بعد التسجيل فيتم احتسابها بخصم 50% من تكلفة المقطع المعدل.'
    },
    {
      q: 'كيف يتم احتساب الأسعار للمشاريع الكبيرة والكتب الصوتية؟',
      a: 'نقدم تسعيراً مخفضاً بالدقيقة أو بآلاف الكلمات للكتب الصوتية والدورات التدريبية وسلاسل البودكاست مع مهندس صوت مخصص يشرف على معايير ACX العالمية.'
    },
    {
      q: 'هل توفرون فواتير ضريبية معتمدة للشركات؟',
      a: 'نعم، نصدر فواتير ضريبية نظامية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) في السعودية، بالإضافة إلى خيارات الدفع عبر أوامر الشراء والتحويل البنكي المؤسسي.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs for SEO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'الأسعار', item: '/ar/pricing' }
        ]} />
      </div>

      {/* SEO Header Section with Single Strict H1 */}
      <header className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">

          {/* Strict Single H1 matching SEO spec */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            {pageText.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {pageText.intro}
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
              دفع شهري
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-7 rounded-full bg-brand-ink p-1 transition cursor-pointer"
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? '-translate-x-7 bg-brand' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
              <span>اشتراك سنوي</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                وفر 20%
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* 1. Subscription Plans (Column layout with feature lists) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-y-12">
            {plans.map((plan, idx) => {
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col px-0 md:px-4 ${idx > 0 ? 'xl:border-r xl:border-slate-200' : ''} ${idx % 2 === 1 ? 'md:border-r md:border-slate-200 xl:border-r' : ''}`}
                >
                  {/* Plan card */}
                  <div
                    className={`rounded-3xl border p-6 md:min-h-[260px] flex flex-col gap-5 justify-between ${
                      plan.featured
                        ? 'bg-brand-ink border-brand-ink text-white'
                        : 'bg-[#F2EFEA] border-[#E7E2DA] text-slate-950'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <h2 className="text-3xl font-black tracking-tight">{plan.name}</h2>
                      <p className={`text-xs leading-relaxed ${plan.featured ? 'text-slate-300' : 'text-slate-600'}`}>
                        {plan.tagline}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {plan.badge && (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                            plan.featured ? 'bg-brand text-white' : 'bg-brand-ink text-white'
                          }`}
                        >
                          {plan.badge}
                        </span>
                      )}
                      {billingCycle === 'annual' && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                        <div className={`text-xs ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span className="line-through font-mono">${plan.monthlyPrice}</span>
                          <span className="mr-1.5">وفّر 20% بالاشتراك السنوي</span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        {price === null ? (
                          <span className="text-3xl font-black">تسعير مخصص</span>
                        ) : (
                          <>
                            <span className="text-4xl font-black font-mono">${price}</span>
                            <span className={`text-sm ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>/ شهرياً</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={plan.ctaTo}
                    className={`mt-5 w-full py-3.5 rounded-full text-center text-sm font-bold transition ${
                      plan.featured
                        ? 'bg-brand hover:bg-brand-orange text-white shadow-lg shadow-brand/25'
                        : 'bg-brand-ink hover:bg-brand-ink/90 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Features */}
                  <div className="mt-7">
                    {plan.inheritsFrom && (
                      <div className="flex items-center gap-1.5 pb-3 border-b border-dotted border-slate-300 text-sm text-slate-500">
                        <span>كل ما في {plan.inheritsFrom}، بالإضافة إلى</span>
                        <CornerLeftDown className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    {plan.features.map(({ icon: Icon, text }) => (
                      <div
                        key={text}
                        className="flex items-center gap-3 py-3.5 border-b border-dotted border-slate-300 text-sm text-slate-800"
                      >
                        <Icon className="w-5 h-5 text-slate-700 shrink-0" strokeWidth={1.6} />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Interactive Project Cost Calculator */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text">
              <Calculator className="w-4 h-4" />
              <span>حاسبة تكلفة المشروع التقديرية</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              احسب تكلفة تسجيل مشروعك الصوتي في ثوانٍ
            </h2>
            <p className="text-xs text-slate-500">
              اختر نوع المشروع ومدته لتعرف متوسط التكلفة قبل بدء الحجز.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-8">
            <p className="text-center text-xl sm:text-2xl font-black text-slate-900 leading-[2.4] sm:leading-[2.2]">
              <span>أبحث عن معلق صوتي لـ </span>
              <select
                value={calcCategory}
                onChange={e => setCalcCategory(e.target.value)}
                aria-label="نوع المشروع"
                className="mx-1 px-3 py-1.5 bg-white border-b-2 border-brand rounded-t-xl text-brand-text font-black text-lg sm:text-xl outline-hidden cursor-pointer align-middle"
              >
                <option value="all">أي مشروع</option>
                {siteCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span> مدته </span>
              <span className="inline-flex items-center gap-2 mx-1 px-2 py-1 bg-white border-b-2 border-brand rounded-t-xl align-middle">
                <button type="button" onClick={() => setCalcMinutes(m => Math.max(1, m - 1))} aria-label="إنقاص دقيقة" className="w-8 h-8 rounded-lg hover:bg-orange-50 text-brand-text text-xl cursor-pointer">−</button>
                <input
                  type="number" min={1} max={120} value={calcMinutes}
                  onChange={e => setCalcMinutes(Math.min(120, Math.max(1, Number(e.target.value) || 1)))}
                  aria-label="عدد الدقائق"
                  className="w-12 text-center font-mono font-black text-brand-text text-lg sm:text-xl outline-hidden [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button type="button" onClick={() => setCalcMinutes(m => Math.min(120, m + 1))} aria-label="زيادة دقيقة" className="w-8 h-8 rounded-lg hover:bg-orange-50 text-brand-text text-xl cursor-pointer">+</button>
              </span>
              <span> {calcMinutes === 1 ? 'دقيقة' : 'دقائق'}</span>
            </p>

            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-200">
              <div className="p-6 text-center space-y-1">
                <div className="font-mono">
                  <span className="text-4xl font-black text-slate-900">${fmtUsd(estimate.avg)}</span>
                  <span className="text-sm text-slate-500 mr-1">USD</span>
                </div>
                <p className="text-xs font-bold text-slate-600">متوسط التكلفة</p>
                <p className="text-[11px] text-slate-400">يتراوح بين <bdi dir="ltr">${fmtUsd(estimate.min)}</bdi> و <bdi dir="ltr">${fmtUsd(estimate.max)}</bdi> حسب المعلق</p>
              </div>
              <div className="p-6 text-center space-y-3 flex flex-col items-center justify-center">
                <p className="text-sm font-bold text-slate-800">هل يناسب ميزانيتك؟</p>
                <Link to="/ar/voices" className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shadow-md transition">
                  اختر معلقك وابدأ المشروع
                </Link>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-500 leading-6">
              السعر النهائي شامل الهندسة الصوتية والترخيص التجاري، ومبني على أسعار المعلقين في المنصة.
              <br />
              الدقيقة تعادل نحو {CHARS_PER_MINUTE} حرف من النص (المسافات والتشكيل تُحسب).
            </p>
          </div>
        </div>
      </section>

      {/* 3. Pricing FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              الأسئلة الشائعة حول أسعار التعليق الصوتي
            </h2>
            <p className="text-xs text-slate-500">
              إجابات واضحة عن كل ما يخص تكلفة الحجز وطرق الدفع والضمانات.
            </p>
          </div>

          <div className="space-y-3">
            {pricingFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-text transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-6">
            <p className="text-xs text-slate-500 mb-3">هل لديك نص مخصص وتريد عرض سعر رسمي مختوم لشركتك؟</p>
            <Link
              to="/ar/contact-us"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition shadow-sm"
            >
              <span>طلب عرض سعر رسمي فوري</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
