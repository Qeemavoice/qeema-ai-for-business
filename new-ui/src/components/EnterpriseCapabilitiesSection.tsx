import React from 'react';
import {
  Building2,
  Film,
  BookOpen,
  Radio,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Layers,
  Lock,
  Headphones,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface EnterpriseCapabilitiesSectionProps {
  onContactSales: () => void;
  onExploreSolutions: () => void;
}

const SECTORS = [
  {
    icon: Film,
    title: 'وكالات الإعلان والإنتاج الإعلامي',
    description: 'اختيار وحجز أصوات بشرية متعددة اللهجات للحملات الإعلانية والإنتاج الإعلامي مع توجيه أداء احترافي.'
  },
  {
    icon: BookOpen,
    title: 'منصات التعليم وتطوير الكفاءات EdTech',
    description: 'تسجيل الكتب والمناهج والمقررات بأصوات عربية بشرية واضحة تناسب مختلف المراحل التعليمية.'
  },
  {
    icon: Headphones,
    title: 'مراكز الاتصال والرد التفاعلي IVR',
    description: 'تسجيل رسائل الرد الآلي للبنوك والاتصالات بصوت بشري ثابت وموثوق يناسب هوية المؤسسة.'
  },
  {
    icon: ShoppingBag,
    title: 'التجارة الإلكترونية والتطبيقات الذكية',
    description: 'تعليق صوتي احترافي لإعلانات المنتجات ومحتوى الفيديو باللهجات المحلية لدول الخليج ومصر والشام.'
  }
];

const INFRASTRUCTURE_PILLARS = [
  {
    title: 'عينات صوتية منشورة',
    desc: 'استمع إلى العينة المسجلة لكل معلّق قبل إرسال طلب الحجز.'
  },
  {
    title: 'اختيار المعلّق المناسب',
    desc: 'تصفّح الملفات الصوتية بحسب اللهجة ونوع الأداء المتاح في المكتبة.'
  },
  {
    title: 'اتفاق واضح لكل طلب',
    desc: 'تُحدد حقوق الاستخدام والتسليم مع فريق قيمة فويس بحسب تفاصيل المشروع.'
  },
  {
    title: 'طلب إنتاج صوتي',
    desc: 'أرسل تفاصيل مشروعك لفريقنا لمناقشة التسجيل والجدول والتكلفة.'
  }
];

export const EnterpriseCapabilitiesSection: React.FC<EnterpriseCapabilitiesSectionProps> = ({
  onContactSales,
  onExploreSolutions
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" dir="rtl">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          مصممة خصيصاً لاحتياجات الإنتاج المؤسسي الضخم
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          استكشف طرق استخدام التعليق الصوتي البشري في الإعلان والتعليم ومراكز الاتصال ومحتوى التجارة الإلكترونية.
        </p>
      </div>

      {/* Target Sectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {SECTORS.map((sector, index) => {
          const Icon = sector.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-[#FF5500]/50 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300 space-y-3 text-right group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-[#FF5500] group-hover:border-orange-200 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{sector.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{sector.description}</p>
            </div>
          );
        })}
      </div>

      {/* Infrastructure Specs Grid */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-800">
          {INFRASTRUCTURE_PILLARS.map((pillar, idx) => (
            <div key={idx} className={`${idx !== 0 ? 'pt-6 md:pt-0 md:pr-8' : ''} space-y-2 text-right`}>
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#FF5500] mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">{pillar.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Enterprise Callout Banner */}
        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-white">هل تبحث عن هوية صوتية بشرية ثابتة لعلامتك؟</h4>
            <p className="text-xs text-slate-400 mt-1">
              فريق قيمة يساعدك في اختيار المعلق المناسب وإدارة التسجيل والترخيص والتسليم باحترافية.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onContactSales}
              className="px-6 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5500]/20 cursor-pointer"
            >
              طلب استشارة مؤسسية
            </button>
            <button
              onClick={onExploreSolutions}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              تفاصيل باقات الأعمال
            </button>
          </div>
        </div>
      </div>

    </section>
  );
};
