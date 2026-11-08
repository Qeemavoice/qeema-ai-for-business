import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Mic2, 
  Layers, 
  ShieldCheck, 
  ArrowLeft, 
  Volume2, 
  Film, 
  BookOpen, 
  Radio, 
  Phone, 
  Coins, 
  Users, 
  CheckCircle2,
  Globe2
} from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Voice } from '../types';
import { B2BHome } from '../components/B2BHome';
import { STORIES } from '../data/stories';

interface HomePageProps {
  voices: Voice[];
  onOpenDemo: () => void;
  onOpenSignup: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
  onOpenTopUp: () => void;
  onSelectForBooking: (voice: Voice) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  voices,
  onOpenDemo,
  onOpenSignup,
  onOpenLogin,
  isLoggedIn,
  onOpenTopUp,
  onSelectForBooking
}) => {
  const navigate = useNavigate();

  // 1. Centralized SEO
  useSeo(STATIC_SEO_ROUTES['/ar']);

  const handleB2BNavigate = (view: any, extra?: any) => {
    if (view === 'voice-library' || view === 'human-voices' || view === 'ai-voices') {
      navigate('/ar/voices');
    } else if (view === 'generate' || view === 'instant-studio' || view === 'tts') {
      navigate('/ar/text-to-speech');
    } else if (view === 'pricing' || view === 'billing') {
      navigate('/ar/pricing');
    } else if (view === 'our-works' || view === 'customer-stories') {
      // Open the client's story when one exists, otherwise the stories list
      navigate(STORIES.some(st => st.id === extra?.voiceId) ? `/ar/our-works/${extra.voiceId}` : '/ar/our-works');
    } else if (view === 'contact-us' || view === 'about-us') {
      navigate('/ar/contact-us');
    } else {
      navigate('/ar/voices');
    }
  };

  return (
    <div className="space-y-0" dir="rtl">
      {/* Visual B2B Living Audio Home */}
      <B2BHome
        onNavigate={handleB2BNavigate}
        onOpenDemo={onOpenDemo}
        onOpenSignup={onOpenSignup}
        onOpenLogin={onOpenLogin}
        isLoggedIn={isLoggedIn}
        onOpenTopUp={onOpenTopUp}
        voices={voices}
        onSelectForBooking={onSelectForBooking}
      />

      {/* SEO Key Section 1: خدمات الفويس اوفر */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              خدمات الفويس اوفر والإنتاج الصوتي المؤسسي
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              سواء كنت تبحث عن فويس اوفر عربي لإعلانك، دبلجة كرتون بأصوات بشرية، تسجيل كتاب صوتي كامل، أو رسائل رد آلي لشركتك؛ نوفر لك معلقين محترفين مع جودة استوديو موحدة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/ar/services/dubbing"
              className="group p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-brand hover:shadow-xl hover:bg-white transition-all block space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand-text flex items-center justify-center group-hover:scale-110 transition-transform">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-text transition-colors">
                خدمة الدوبلاج العربي
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                دوبلاج كرتون ومسلسلات وأفلام بأصوات ممثلين عرب حقيقيين مع مزامنة شفاه كاملة وإشراف إخراجي متقن.
              </p>
            </Link>

            <Link
              to="/ar/voice-models/audiobooks"
              className="group p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-brand hover:shadow-xl hover:bg-white transition-all block space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-text transition-colors">
                تسجيل الكتب الصوتية
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                قراءة فصيحة متقنة مع هندسة صوتية مطابقة لمعايير الكتب الصوتية العالمية لدور النشر والمؤلفين.
              </p>
            </Link>

            <Link
              to="/ar/voice-models/podcast"
              className="group p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-brand hover:shadow-xl hover:bg-white transition-all block space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-text transition-colors">
                إنتاج مقدمات البودكاست
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                فويس اوفر إذاعي لمقدمات وخواتيم البودكاست وفواصل الرعاية مع موسيقى مرخصة تجارياً.
              </p>
            </Link>

            <Link
              to="/ar/voice-models/ivr"
              className="group p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-brand hover:shadow-xl hover:bg-white transition-all block space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-text transition-colors">
                تسجيلات الرد الآلي
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                رسائل ترحيب وقوائم سنترال احترافية بصيغ مخصصة لمختلف أنظمة السنترال.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Key Section 2: معلقون صوتيون بكل اللهجات */}
      <section className="py-20 bg-[#FFFFFF] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
                معلقون صوتيون بكل اللهجات العربية
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                لكل جمهور نبرته ولهجته الأقرب إلى قلبه. استكشف صفحات اللهجات المخصصة واستمع لعينات المعلقين المحليين المعتمدين في السعودية والإمارات ومصر وكافة الدول العربية.
              </p>
            </div>

            <Link
              to="/ar/voices"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:border-brand text-xs font-bold text-slate-800 shadow-xs transition"
            >
              <span>تصفح الأصوات البشرية</span>
              <ArrowLeft className="w-4 h-4 text-brand-text" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/ar/saudi-voice-over"
              className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🇸🇦</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  +400 معلق معتمد
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                فويس اوفر سعودي
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                أصوات سعودية رجالية ونسائية لحملات اليوم الوطني، إعلانات موسم الرياض، والبيانات المؤسسية الكبرى.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span>استكشف المعلقين السعوديين</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/ar/emirati-voice-over"
              className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🇦🇪</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  +150 معلق معتمد
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-2">
                فويس اوفر إماراتي
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                أصوات إماراتية وخليجية فخمة لمشاريع دبي وأبوظبي العقارية والدوائر الحكومية والفعاليات العالمية.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <span>استكشف المعلقين الإماراتيين</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/ar/egyptian-voice-over"
              className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-red-500 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🇪🇬</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  +300 معلق معتمد
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors mb-2">
                فويس اوفر مصري
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                أداء عفوي ومؤثر للإعلانات الاستهلاكية، الكوميدية، السوشيال ميديا، والفيديوهات التعليمية الواسعة الانتشار.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                <span>استكشف المعلقين المصريين</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Key Section 3: لماذا تختار قيمة فويس؟ */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              لماذا تختار قيمة فويس للتعليق الصوتي؟
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              نجمع بين أفضل ما في العالمين: أصالة وإحساس الصوت البشري، مع مرونة وسرعة الذكاء الاصطناعي المرخص لحماية حقوق علامتك التجارية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand/20 text-brand-text flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">بشرية أولاً وأخلاقية</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                أكثر من 1000 معلق صوتي حقيقي، ونماذج ذكاء اصطناعي مرخصة بموافقة أصحابها وتقاسم الأرباح معهم.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">تراخيص تجارية كاملة</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                حماية قانونية كاملة وفواتير ضريبية نظامية معتمدة، بدون أي نزاعات على الملكية.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">جودة استوديو</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                استوديوهات تسجيل معزولة وخالية تماماً من الصدى والضوضاء، مع إشراف صوتي وتدقيق لغوي قبل التسليم.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">أسعار شفافة وباقات مرنة</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                احتساب دقيق بعدد الكلمات بدون تكاليف خفية، مع إمكانية تجربة النصوص في استوديو TTS قبل الحجز النهائي.
              </p>
            </div>
          </div>

          <div className="pt-6 text-center">
            <Link
              to="/ar/pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand hover:bg-brand-orange text-white font-bold text-xs shadow-lg shadow-brand/25 transition"
            >
              <span>تعرف على أسعار وباقات التعليق الصوتي</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
