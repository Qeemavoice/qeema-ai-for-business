import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Cpu, 
  Megaphone, 
  Tv, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  Pause, 
  ArrowLeft,
  Headphones,
  Lock
} from 'lucide-react';
import { IndustryKey, ActiveView } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface IndustriesViewProps {
  initialIndustry?: IndustryKey;
  onNavigate: (view: ActiveView) => void;
}

export const IndustriesView: React.FC<IndustriesViewProps> = ({ initialIndustry = 'banking', onNavigate }) => {
  const [activeIndustry, setActiveIndustry] = useState<IndustryKey>(initialIndustry);
  const [playingSample, setPlayingSample] = useState(false);

  useEffect(() => {
    if (initialIndustry) {
      setActiveIndustry(initialIndustry);
    }
  }, [initialIndustry]);

  const industriesData = {
    banking: {
      id: 'banking',
      title: 'بنوك ومصارف ومؤسسات مالية',
      icon: Building2,
      subtitle: 'نبرات وقورة ورزينة تعزز ثقة العميل وتحمي حساسية المعاملات المصرفية',
      benefits: [
        'نظام رد آلي IVR ذكي يتفاعل بسرعة استجابة فائقة (أقل من 150ms).',
        'نطق أرقام الحسابات، الأرصدة، والمبالغ المالية باللغة العربية الفصحى السليمة بدون أي تشويه.',
        'تشفير بنكي عالي المستوى متوافق مع معايير الأمن السيبراني المصرفي.',
        'توفير حتى 70% من تكاليف مراكز الاتصال مع رفع رضا العملاء.'
      ],
      sampleText: 'عزيزي العميل، تم تأكيد عملية التحويل بقيمة ألفين وخمسمائة ريال بنجاح. شكراً لثقتكم بمصرفنا.',
      useCases: ['أنظمة الرد التفاعلي IVR', 'المساعد المصرفي الصوتي داخل التطبيق', 'إشعارات التحويل والمصادقة']
    },
    tech: {
      id: 'tech',
      title: 'شركات التقنية وحلول الـ SaaS',
      icon: Cpu,
      subtitle: 'أصوات ديناميكية شابة وذكية تمنح منتجك البرمجي صوتاً إنسانياً محبباً',
      benefits: [
        'تكامل فوري عبر REST API وWebSockets يدعم Node.js وPython وPHP.',
        'توليد لحظي للرسائل الترحيبية وتوجيه المستخدمين داخل التطبيقات (App Onboarding).',
        'مساعدات ذكاء اصطناعي صوتية (AI Voice Agents) تتحدث بلهجة محلية مألوفة.',
        'دعم التوليد المتزامن لآلاف المستخدمين في نفس اللحظة.'
      ],
      sampleText: 'مرحباً بك في لوحة التحكم، تم ربط حسابك السحابي بنجاح، وجاهزون لتحليل بيانات مشروعك اليوم.',
      useCases: ['وكلاء الذكاء الاصطناعي Voice Agents', 'التدريب التفاعلي داخل التطبيقات', 'أدوات الإنتاجية الذكية']
    },
    agencies: {
      id: 'agencies',
      title: 'وكالات الدعاية والإعلان والتسويق',
      icon: Megaphone,
      subtitle: 'تسجيل إعلانات سريعة بمختلف اللهجات وتعديل السكريبتات دون إعادة حجز الاستوديو',
      benefits: [
        'توليد 10 صيغ إعلانية بلهجات مختلفة (سعودية، كويتية، مصرية، شامية) في دقيقة واحدة.',
        'تخفيض ميزانيات التجارب واختبار A/B Testing للحملات الرقمية.',
        'ترخيص إعلاني تجاري شامل لكل المنصات (يوتيوب، تيك توك، سناب شات، راديو).',
        'إمكانية تصدير الصوت بصيغ Master WAV عالية النقاء.'
      ],
      sampleText: 'الفرصة دي متتفوتش! اشتري قطعة والتانية مجاناً، والتوصيل واصل لحد باب بيتك في نفس اليوم.',
      useCases: ['إعلانات السوشيال ميديا والتيك توك', 'حملات الراديو والبودكاست الإعلاني', 'فيديوهات الموشن جرافيك السريعة']
    },
    media: {
      id: 'media',
      title: 'الإعلام، البودكاست، والكتب المسموعة',
      icon: Tv,
      subtitle: 'خامات روائية مخملية وأصوات إخبارية فصيحة تروي القصص وتجذب المستمعين',
      benefits: [
        'سرد كتب مسموعة وروايات كاملة بتشكيل لغوي دقيق وتناغم عاطفي.',
        'نشرات إخبارية يومية مؤتمتة تسحب الأخبار المكتوبة وتحولها لبودكاست يومي في دقائق.',
        'تلوين صوتي سينمائي يميز الحوارات بين الشخصيات.',
        'حفظ حقوق المؤلف والمؤسسة الإعلامية بشهادة ملكية رقمية.'
      ],
      sampleText: 'في عام ألفٍ وتسعمائةٍ وخمسين، بدأت أولى ملامح النهضة الصناعية، لترسم خريطة جديدة للعالم العربي.',
      useCases: ['إنتاج الكتب المسموعة Audiobooks', 'البودكاست الإخباري الآلي اليومي', 'التعليق على الأفلام الوثائقية']
    }
  };

  const current = industriesData[activeIndustry];
  const CurrentIcon = current.icon;

  const toggleSample = () => {
    if (playingSample) {
      audioSynth.stopAll();
      setPlayingSample(false);
    } else {
      setPlayingSample(true);
      audioSynth.speakText(current.sampleText, 1, 1, () => {
        setPlayingSample(false);
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold text-blue-700">
          <span>حلول مخصصة حسب طبيعة عملك</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          الهندسة الصوتية حسب القطاع
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          لكل قطاع احتياجاته الصوتية الخاصة؛ اكتشف كيف تصمم قيمة فويس حلولاً مصممة خصيصاً لمجال أعمالك.
        </p>
      </div>

      {/* 4 Industry Tabs */}
      <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto">
        {(Object.keys(industriesData) as IndustryKey[]).map(key => {
          const item = industriesData[key];
          const IconComp = item.icon;
          const isActive = activeIndustry === key;
          return (
            <button
              key={key}
              id={`tab-industry-${key}`}
              onClick={() => {
                setActiveIndustry(key);
                audioSynth.stopAll();
                setPlayingSample(false);
              }}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-brand-ink text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-brand-text' : 'text-slate-400'}`} />
              <span>{item.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Industry Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-text flex items-center justify-center">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{current.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">أهم الميزات لقطاعكم:</h4>
            <div className="space-y-2.5">
              {current.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-text shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">أبرز حالات الاستخدام:</h4>
            <div className="flex flex-wrap gap-2">
              {current.useCases.map((uc, i) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-medium">
                  {uc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Audio Demo & Action Card */}
        <div className="lg:col-span-5 bg-[#18110B] text-white rounded-2xl p-6 border border-orange-500/20 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-yellow">عينة صوتية تحاكي القطاع</span>
            <span className="text-[10px] bg-white/10 text-amber-200 px-2 py-0.5 rounded font-mono">48kHz</span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-amber-100/90 leading-relaxed font-sans">
            «{current.sampleText}»
          </div>

          <button
            onClick={toggleSample}
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-orange text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {playingSample ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{playingSample ? 'إيقاف الاستماع' : 'استمع للعينة الموجهة للقطاع'}</span>
          </button>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-amber-200/60">
            <span>جاهز للتكامل البرمجي؟</span>
            <button
              onClick={() => onNavigate('branded-voice')}
              className="text-xs font-bold text-brand-text hover:underline"
            >
              طلب استشارة قطاعية ←
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
