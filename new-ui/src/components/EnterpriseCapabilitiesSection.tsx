import React from 'react';
import { Link } from 'react-router-dom';
import { VoiceTemplatesGrid } from './VoiceTemplatesGrid';
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
    description: 'إنتاج حملات إعلانية متعددة اللهجات، اختبار عشرات النسخ الإبداعية، وتوفير 80% من ميزانيات الاستوديو مع تسليم فوري.'
  },
  {
    icon: BookOpen,
    title: 'منصات التعليم وتطوير الكفاءات',
    description: 'تحويل الكتب والمناهج والمقررات التدريبية إلى صوت عربي تفاعلي بمخارج حروف دقيقة وتشكيل سليم لكافة المراحل.'
  },
  {
    icon: Headphones,
    title: 'مراكز الاتصال والرد التفاعلي',
    description: 'هوية صوتية متسقة وموثوقة للبنوك والاتصالات، مع تحديث فوري للرسائل الإجرائية والأنظمة الآلية على مدار الساعة.'
  },
  {
    icon: ShoppingBag,
    title: 'التجارة الإلكترونية والتطبيقات الذكية',
    description: 'توليد صوتي ديناميكي لآلاف المنتجات ومراجعات الفيديو القصيرة باللهجات المحلية لدول الخليج، مصر، والشام.'
  }
];

const HOME_MODELS = 6;

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
          تعتمد عليها كبرى وكالات التسويق، استوديوهات الإنتاج الصوتي، ومؤسسات التعليم والمحتوى في المنطقة لتسريع الإنتاج وتخفيض التكاليف.
        </p>
      </div>

      {/* Target Sectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {SECTORS.map((sector, index) => {
          const Icon = sector.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-brand/50 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300 space-y-3 text-right group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-brand-text group-hover:border-orange-200 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{sector.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{sector.description}</p>
            </div>
          );
        })}
      </div>

      {/* Voice production models */}
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">نماذج الإنتاج الصوتي</h2>
            <p className="text-xs sm:text-sm text-slate-600">اختر نوع مشروعك واستمع لأصوات مناسبة له واطلبه مباشرة.</p>
          </div>
          <Link to="/ar/voice-models" className="text-xs font-bold text-brand-text hover:underline whitespace-nowrap">عرض كل النماذج ←</Link>
        </div>
        <VoiceTemplatesGrid limit={HOME_MODELS} />
      </div>

    </section>
  );
};
