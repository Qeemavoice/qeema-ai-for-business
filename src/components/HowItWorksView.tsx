import React from 'react';
import { 
  Sparkles, 
  Mic2, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft, 
  Volume2, 
  Zap, 
  FileAudio, 
  Cpu, 
  Users 
} from 'lucide-react';
import { ActiveView } from '../types';

interface HowItWorksViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenDemo: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate, onOpenDemo }) => {
  const steps = [
    {
      number: '01',
      title: 'اختر بين الصوت البشري أو نموذج الذكاء الاصطناعي',
      description: 'توفر منصة قيمة ميزة فريدة تجمع بين قاعدة تزيد عن 1,000 معلق صوتي بشري موثق في الاستوديو، ونماذج ذكاء اصطناعي صوتية دقيقة ومولدة من أصواتهم الحقيقية وفق تراخيص نظامية.',
      tag: 'Human + AI Integration',
      icon: Users,
      actionText: 'استعرض مكتبة الأصوات',
      actionView: 'voice-library' as ActiveView
    },
    {
      number: '02',
      title: 'ضبط النص، اللهجة العربية والنبرة الوقفية',
      description: 'أدخل النص واضبط اللهجة بدقة (سعودي، مصري، شامي، خليجي، أو فصحى) مع تحديد سرعة القراءة وثبات الأداء (Stability). يدعم المحرك علامات التشكيل العربية لضبط مخارج الحروف.',
      tag: 'Acoustic Dialect Tuning',
      icon: Sliders,
      actionText: 'تجربة الاستوديو الصوتي',
      actionView: 'generate' as ActiveView
    },
    {
      number: '03',
      title: 'معالجة فورية بجودة بث استوديو 48kHz',
      description: 'يقوم المحرك الصوتي بمعالجة النص وتوليده في أقل من 3 ثوانٍ بصيغتي Studio WAV (48kHz Uncompressed) أو MP3، مع مطابقة لمعايير البث التلفزيوني والإذاعي والـ IVR.',
      tag: 'Studio Quality 48kHz',
      icon: Zap,
      actionText: 'سجل تسجيلاتي المكتملة',
      actionView: 'my-audio' as ActiveView
    },
    {
      number: '04',
      title: 'حقوق استخدام تجارية وترخيص مؤسسي كامل',
      description: 'جميع المقاطع والتسجيلات تأتي مع ترخيص استخدام تجاري دائم وغير مقيد لشركتك، مع توثيق استهلاك الحروف في سجل محاسبي مالي (Credit Ledger) غير قابل للتعديل.',
      tag: 'Commercial Licensing & Ledger',
      icon: ShieldCheck,
      actionText: 'استعراض الباقات والاشتراكات',
      actionView: 'billing' as ActiveView
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 text-brand-text border border-brand/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>منهجية العمل المتكاملة</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            كيف نعمل في قيمة للذكاء الصوتي؟
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            نجمع بين عمق الصوت البشري العربي وسرعة وقابلية التوسع للذكاء الاصطناعي. اكتشف كيف تمكن منصة قيمة المؤسسات والشركات من إنتاج محتوى صوتي احترافي بأعلى معايير الدقة واللهجات المتقنة.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('generate')}
              className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-orange transition-colors shadow-lg shadow-brand/20 flex items-center gap-2"
            >
              <span>جرب التوليد الآن</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenDemo}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700"
            >
              طلب استشارة وعرض تجريبي
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Process Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-200 font-mono">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-brand-text border border-orange-100 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-brand-text tracking-wide">
                    {step.tag}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => onNavigate(step.actionView)}
                  className="text-xs font-bold text-slate-900 hover:text-brand-text flex items-center gap-1.5 transition-colors"
                >
                  <span>{step.actionText}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison: Human vs AI */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            تكامل الصوتين البشري والذكاء الاصطناعي
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            لماذا لا نستغني عن الصوت البشري، وكيف يكمل كل منهما الآخر في بيئة العمل المؤسسي؟
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Mic2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm">المعلقون البشريون المعتمدون</h4>
                <p className="text-[11px] text-slate-400">للحملات الإعلانية الكبرى والوثائقيات الإبداعية</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>إحساس درامي عميق ومشاعر إنسانية عفوية لا مثيل لها</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>تسجيلات استوديو مخصصة وتوجيه مباشر في الجلسة</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>مناسب للإعلانات التلفزيونية وهوية البراند الحصرية</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-orange-50/60 border border-orange-200 text-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm">نماذج الذكاء الاصطناعي الصوتي</h4>
                <p className="text-[11px] text-brand-text font-semibold">للإنتاج اليومي الضخم وسرعة النشر</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-text shrink-0" />
                <span>توليد فوري خلال ثوانٍ معدودة بتكلفة منخفضة ومجدية</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-text shrink-0" />
                <span>تعديل غير محدود للنصوص وتحديث المحتوى في أي لحظة</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-text shrink-0" />
                <span>مثالي للرد الآلي IVR، مقاطع السوشيال ميديا اليومية، والتعليم الرقمي</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
