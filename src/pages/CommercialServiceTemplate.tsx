import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  Play, 
  Pause, 
  Volume2, 
  BookOpen, 
  Mic2, 
  Film, 
  Tv, 
  Gamepad2, 
  Phone, 
  ShieldCheck, 
  Heart, 
  Package, 
  Coins, 
  Building2, 
  Award, 
  Layers, 
  FileText, 
  UserCheck, 
  GraduationCap 
} from 'lucide-react';
import { CommercialServiceData } from '../data/commercialServicesData';
import { useDashboardPosts, rankRelated } from '../lib/dashboardArticles';
import { useSeo } from '../seo/useSeo';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useHumanVoices } from '../lib/humanVoices';
import { buildSampleSlug } from '../components/VoiceLibraryView';

const MAX_SAMPLES = 4;

/** Plays one library sample; only one plays at a time. */
let currentAudio: HTMLAudioElement | null = null;
const SamplePlayer: React.FC<{ url: string; big?: boolean }> = ({ url, big }) => {
  const [playing, setPlaying] = useState(false);
  const ref = React.useRef<HTMLAudioElement | null>(null);
  const toggle = () => {
    if (!ref.current) {
      ref.current = new Audio(url);
      ref.current.onended = () => setPlaying(false);
      ref.current.onpause = () => setPlaying(false);
    }
    if (playing) { ref.current.pause(); return; }
    if (currentAudio && currentAudio !== ref.current) currentAudio.pause();
    currentAudio = ref.current;
    ref.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  return (
    <button type="button" onClick={toggle} aria-label={playing ? 'إيقاف' : 'تشغيل'}
      className={`${big ? 'w-14 h-14' : 'w-10 h-10'} rounded-full bg-brand-ink hover:bg-brand-ink/90 text-white flex items-center justify-center shrink-0 transition-colors`}>
      {playing ? <Pause className={big ? 'w-6 h-6' : 'w-4 h-4'} /> : <Play className={`${big ? 'w-6 h-6' : 'w-4 h-4'} -scale-x-100`} />}
    </button>
  );
};

/** Samples linked to the voice library: the first voice of the category is the featured one, the rest are optional extras. */
const ServiceSamples: React.FC<{ category?: string }> = ({ category }) => {
  const voices = useHumanVoices().filter(v => v.isHuman && v.previewUrl);
  const matched = category ? voices.filter(v => v.tags?.includes(category) || v.category === category) : voices;
  const [main, ...rest] = (matched.length ? matched : voices).slice(0, MAX_SAMPLES);
  if (!main) return null;
  const caption = (v: typeof main) => [v.category, v.accent].filter(Boolean).join(' · ');
  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-text uppercase tracking-wider">عينات صوتية</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">استمع لعينات هذا المجال</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">عينات من مكتبة الأصوات، مع التصنيف واللهجة بجانب كل مشغل.</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-5">
          <SamplePlayer url={main.previewUrl} big />
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-base sm:text-lg text-slate-900 truncate">{main.sampleName || main.name}</h3>
            <p className="text-xs text-slate-500 truncate">{caption(main)}</p>
          </div>
          <Link to={`/ar/booking/${buildSampleSlug(main)}`} className="px-4 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs whitespace-nowrap transition-colors">احجز هذا الصوت</Link>
        </div>
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rest.map(v => (
              <div key={v.id} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
                <SamplePlayer url={v.previewUrl} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{v.sampleName || v.name}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{caption(v)}</p>
                </div>
                <Link to={`/ar/booking/${buildSampleSlug(v)}`} className="text-[11px] font-bold text-brand-text hover:underline whitespace-nowrap">احجز</Link>
              </div>
            ))}
          </div>
        )}
        <Link to="/ar/voices" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text hover:underline">
          <span>تصفح مكتبة الأصوات كاملة</span><ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};

interface CommercialServiceTemplateProps {
  data: CommercialServiceData;
  onOpenBookingModal?: () => void;
}

// Icon resolver helper
const renderIcon = (name: string) => {
  switch (name) {
    case 'Film': return <Film className="w-5 h-5 text-brand-text" />;
    case 'Tv': return <Tv className="w-5 h-5 text-brand-text" />;
    case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-brand-text" />;
    case 'Phone': return <Phone className="w-5 h-5 text-brand-text" />;
    case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
    case 'Heart': return <Heart className="w-5 h-5 text-rose-500" />;
    case 'Package': return <Package className="w-5 h-5 text-amber-500" />;
    case 'Coins': return <Coins className="w-5 h-5 text-amber-500" />;
    case 'Building2': return <Building2 className="w-5 h-5 text-blue-500" />;
    case 'Award': return <Award className="w-5 h-5 text-amber-500" />;
    case 'Layers': return <Layers className="w-5 h-5 text-purple-500" />;
    case 'FileText': return <FileText className="w-5 h-5 text-slate-500" />;
    case 'UserCheck': return <UserCheck className="w-5 h-5 text-emerald-500" />;
    case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-purple-500" />;
    case 'BookOpen': return <BookOpen className="w-5 h-5 text-blue-500" />;
    case 'Mic2': return <Mic2 className="w-5 h-5 text-brand-text" />;
    default: return <Sparkles className="w-5 h-5 text-brand-text" />;
  }
};

export const CommercialServiceTemplate: React.FC<CommercialServiceTemplateProps> = ({ 
  data,
  onOpenBookingModal 
}) => {
  // Production models live under /ar/voice-models/: the models page is their parent in the breadcrumb
  const isModel = data.route.startsWith('/ar/voice-models/');
  const crumbs = [
    { name: 'الرئيسية', item: '/ar' },
    ...(isModel ? [{ name: 'نماذج الإنتاج الصوتي', item: '/ar/voice-models' }] : []),
    { name: data.h1, item: data.route }
  ];
  // 1. Centralized SEO
  useSeo({
    path: data.route,
    title: data.title,
    h1: data.h1,
    description: data.description,
    ogType: 'website',
    jsonLdType: 'Service',
    serviceType: data.h1,
    faqs: data.faqs,
    breadcrumbs: crumbs
  });

  // State for FAQs accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // related articles: the real ones (written in the dashboard), most related to this page first
  const { posts: dashPosts } = useDashboardPosts();
  const relatedBlogs = rankRelated(dashPosts, `${data.title} ${data.h1} ${data.voiceCategory || ''} ${data.badge} ${data.description}`, 3);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={crumbs} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {data.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand-text border border-brand/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{data.badge}</span>
              </div>
            )}

            {/* Strict Single H1 */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              {data.h1}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {data.heroSubheadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/ar/contact-us"
                className="px-8 py-3.5 rounded-2xl bg-brand hover:bg-brand-orange text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              >
                <span>طلب عرض سعر أو حجز معلق</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <Link
                to="/ar/voices"
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all"
              >
                <span>الاستماع لعينات المعلقين</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="py-8 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {data.stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-brand-text font-mono">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-text uppercase tracking-wider">الفئات المستهدفة</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              لمن صُممت هذه الخدمة؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              نلبي احتياجات مختلف القطاعات والمؤسسات الإعلانية والإنتاجية بأعلى معايير الدقة الهندسية والاحترافية الصوتية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.targetAudience.map((audience, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                  {renderIcon(audience.icon)}
                </div>
                <h3 className="font-bold text-base text-slate-900">{audience.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-text uppercase tracking-wider">الاستخدامات والتطبيقات</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              أبرز مجالات واستخدامات العمل
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              تطبيقات عملية نضمن من خلالها تطابق الأداء الصوتي مع الهدف التسويقي أو الفني لعملك.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.useCases.map((useCase, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2 flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1">{useCase.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Production Steps Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-text uppercase tracking-wider">مراحل التنفيذ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              كيف ننفذ مشروعك من البداية حتى التسليم؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              منهجية واضحة ومجربة تضمن سلامة النصوص، جودة التسجيل، والالتزام الصارم بمواعيد التسليم.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.steps.map((step, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
                <div className="text-3xl font-black text-brand-text/20 font-mono">{step.number}</div>
                <h3 className="font-bold text-base text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceSamples category={data.voiceCategory} />

      {/* Frequently Asked Questions (FAQ Section with In-DOM Accordion) */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-brand-text uppercase tracking-wider">إجابات الخبراء</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              الأسئلة الشائعة حول {data.h1}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              كل ما تود معرفته حول المدة، التكاليف، اللهجات، وحقوق الملكية الفكرية.
            </p>
          </div>

          <div className="space-y-3">
            {data.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-text transition cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-brand-text' : ''}`} />
                  </button>

                  {/* Kept in DOM for SEO crawlers even if hidden */}
                  <div 
                    className={`px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 ${
                      isOpen ? 'block' : 'hidden'
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: اقرأ أيضًا (Reverse Internal Linking to Related Blog Articles) */}
      {relatedBlogs.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-text uppercase tracking-wider">من مدونة قيمة فويس</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  اقرأ أيضًا: مقالات ودراسات متعلقة بهذا المجال
                </h2>
              </div>

              <Link
                to="/ar/blogs"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-text hover:underline"
              >
                <span>تصفح كافة المقالات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map(blog => (
                <Link
                  key={blog.id}
                  to={`/ar/blogs/details/${blog.slug}`}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-100">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      loading="lazy" 
                      width="600" 
                      height="338" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-brand-text bg-orange-50 px-2.5 py-1 rounded-full">
                        {blog.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-text transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {blog.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{blog.date}</span>
                      <span className="text-brand-text font-bold group-hover:underline">اقرأ المقال الكامل ←</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom Conversion CTA */}
      <section className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              جاهز لبدء مشروعك في {data.h1}؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              تواصل مع فريق الأعمال للحصول على استشارة صوتية مجانية، تحديد ميزانية المشروع، وترشيح الأصوات الأكثر مطابقة لعلامتك التجارية.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/ar/contact-us"
                className="px-8 py-3.5 rounded-2xl bg-brand hover:bg-brand-orange text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>طلب تسعير لمشروعك الآن</span>
              </Link>
              <Link
                to="/ar/pricing"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/10 transition-all"
              >
                <span>جدول الأسعار والتراخيص</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
