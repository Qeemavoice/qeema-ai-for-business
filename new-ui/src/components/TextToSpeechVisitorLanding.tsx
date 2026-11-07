import React, { useState, useRef, useEffect } from 'react';
import { TTS_FAQS } from '../data/ttsFaqs';
import { Link } from 'react-router-dom';
import { useVoiceTemplates } from '../lib/voiceTemplates';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Volume2, 
  Sliders, 
  Globe2, 
  Zap, 
  ShieldCheck, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Terminal,
  Smartphone,
  Laptop,
  Layers,
  MessageSquare,
  BookOpen,
  Headphones,
  Film,
  Gamepad2,
  Accessibility,
  Radio,
  Building2,
  Users,
  CheckCircle2,
  Star,
  Quote
} from 'lucide-react';
import { GlassyVoiceOrb } from './GlassyVoiceOrb';
import { arLabel, useMunsitVoices } from '../lib/studioVoices';
import { PLANS, SIGNUP_BONUS_CREDITS } from '../../shared/plans';

interface TextToSpeechVisitorLandingProps {
  onOpenLogin: () => void;
  onGoogle: () => void;
  onOpenSignup: () => void;
  onTryStudio: () => void;
  /** 'extras': only the sections shown under the studio on the TTS page (direction control, dialects, FAQ) */
  variant?: 'full' | 'extras';
}

export const TextToSpeechVisitorLanding: React.FC<TextToSpeechVisitorLandingProps> = ({
  variant = 'full',
  onOpenLogin,
  onGoogle,
  onOpenSignup,
  onTryStudio
}) => {
  // Audio preview state in live console
  const [activeCategory, setActiveCategory] = useState<string>('الأكثر طلباً');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Billing toggle (monthly / annual)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Dialects tab state
  const [dialectTab, setDialectTab] = useState<'dialects' | 'accents'>('dialects');

  // Categories for the live preview console
  const consoleCategories = [
    { id: 'الأكثر طلباً', label: 'الأكثر طلباً', icon: Sparkles },
    { id: 'سرد وروايات', label: 'سرد وروايات', icon: BookOpen },
    { id: 'شخصيات ودراما', label: 'شخصيات ودراما', icon: Users },
    { id: 'محادثة وتفاعل', label: 'محادثة وبودكاست', icon: MessageSquare },
    { id: 'سوشيال ميديا', label: 'سوشيال ميديا', icon: Headphones },
    { id: 'تعليم وتدريب', label: 'تعليم وتدريب', icon: Layers },
    { id: 'إعلانات وترويج', label: 'إعلانات وترويج', icon: Volume2 },
  ];

  // Voices list for console
  // Studio voices from the dashboard, else the Munsit catalogue
  const [serverVoices, setServerVoices] = useState<{ id: string; name: string; flag: string; dialectLabel: string; previewUrl: string }[] | null>(null);
  useEffect(() => {
    fetch('/api/v1/voices?type=ai').then(r => (r.ok ? r.json() : null)).then(d => {
      if (d?.voices?.length) setServerVoices(d.voices.map((v: any) => ({ id: v.id, name: v.name, flag: v.flag || '', dialectLabel: v.dialectLabel || '', previewUrl: `/api/v1/voices/${v.id}/preview` })));
    }).catch(() => {});
  }, []);
  const munsit = useMunsitVoices();
  const previewVoices = serverVoices || munsit.slice(0, 12).map(v => ({ id: v.id, name: v.name, flag: '', dialectLabel: arLabel(v.dialect), previewUrl: v.previewUrl }));

  const handleTogglePlayVoice = (voiceId: string, previewUrl: string) => {
    if (playingVoiceId === voiceId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingVoiceId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => setPlayingVoiceId(null);
      setPlayingVoiceId(voiceId);
    }
  };

  const useCases = [
    {
      title: 'الرد الآلي ومراكز الاتصال',
      desc: 'رسائل ترحيب وقوائم رد آلي IVR وانتظار بصوت عربي واضح ومهني، مع إمكانية تحديث الرسائل متى شئت.',
      icon: MessageSquare,
      badge: 'رسائل جاهزة بسرعة',
      demoText: '«أهلاً بك يا فيصل، تم تأكيد طلبك بنجاح وسيتواصل معك مندوب التوصيل خلال 20 دقيقة.»',
      tag: 'خدمة العملاء'
    },
    {
      title: 'الألعاب والترفيه التفاعلي',
      desc: 'توليد أداء صوتي درامي لشخصيات الألعاب والواقع المعزز، مع إمكانية التعبير عن الغضب، الهمس، الحماس، ونبرات المعارك الحية.',
      icon: Gamepad2,
      badge: 'أداء مسرحي',
      demoText: '«اكتملت ترقية الدروع! البوابة الجنوبية تحت الحصار، في انتظار أمرك يا قائد.»',
      tag: 'ألعاب وترفيه'
    },
    {
      title: 'الكتب الصوتية والروايات',
      desc: 'سرد نصوص الروايات والكتب الطويلة بإيقاع مريح للأذن، مع احترام الفواصل، وتغيير النبرات بتناغم تام يشد المستمع لساعات متواصلة.',
      icon: BookOpen,
      badge: 'سرد متواصل',
      demoText: '«في تلك الليلة العاصفة على مشارف وادي حنيفة، لم يكن هناك صوت يعلو فوق هدير الرياح...»',
      tag: 'سرد فصيح مشكول'
    },
    {
      title: 'التعليق الصوتي للفيديو والموشن',
      desc: 'إنتاج تعليق صوتي سينمائي لمقاطع يوتيوب، الإعلانات التلفزيونية، فيديوهات الموشن جرافيك والريلز في ثوانٍ معدودة وبجودة استوديو 48kHz.',
      icon: Film,
      badge: 'جودة استوديو',
      demoText: '«قصة بدأت برؤية طموحة، واليوم نرسم ملامح مستقبل تشرق فيه إنجازات لا تنتهي.»',
      tag: 'فيديو وإعلانات'
    },
    {
      title: 'البودكاست والبرامج الإذاعية',
      desc: 'إنشاء حلقات بودكاست كاملة، مقدمات وفواصل إذاعية فخمة بأصوات جهورية رخيمة، دون الحاجة لحجز استوديوهات تسجيل باهظة التكلفة.',
      icon: Radio,
      badge: 'نبرات إذاعية وقورة',
      demoText: '«أهلاً بكم في حلقة جديدة من بودكاست "أفق"، حيث نغوص معاً في أعماق الذكاء الاصطناعي...»',
      tag: 'بودكاست وإذاعة'
    },
    {
      title: 'إمكانية الوصول وقراءة الشاشة',
      desc: 'تحويل المقالات، المواقع الإخبارية، والوثائق الرسمية إلى صوت مسموع واضح لتمكين ضعاف البصر وكبار السن من الوصول السهل للمعلومة.',
      icon: Accessibility,
      badge: 'للمواقع والتطبيقات',
      demoText: '«لقراءة هذا التقرير صوتياً، اضغط زر الاستماع لتجربة مريحة وسريعة النطق.»',
      tag: 'سهولة الوصول'
    }
  ];

  const arabicDialects = [
    { name: 'اللهجة السعودية (نجدي، حجازي، شرقي)', flag: '🇸🇦', active: true },
    { name: 'اللغة العربية الفصحى المعيارية المشكولة', flag: '🌍', active: true },
    { name: 'اللهجة الإماراتية والخليجية المعاصرة', flag: '🇦🇪', active: true },
    { name: 'اللهجة المصرية الحوارية والإعلانية', flag: '🇪🇬', active: true },
    { name: 'اللهجة الشامية (سوري، لبناني، أردني)', flag: '🇸🇾', active: true },
    { name: 'اللهجة المغربية والجزائرية والتونسية', flag: '🇲🇦', active: true },
    { name: 'اللهجة الكويتية والبحرينية', flag: '🇰🇼', active: true },
    { name: 'اللهجة العمانية واليمنية', flag: '🇴🇲', active: true }
  ];

  const globalLanguages = [
    { name: 'الإنجليزية الأمريكية', flag: '🇺🇸', active: true },
    { name: 'الإنجليزية البريطانية', flag: '🇬🇧', active: true },
    { name: 'الفرنسية', flag: '🇫🇷', active: true }
  ];

  const testimonials = [
    {
      quote: 'باستخدام أصوات قيمة فويس، أنتجنا أكثر من 40 كتاباً صوتياً باللغة العربية الفصحى المشكولة. الوقفات والأنفاس لا يمكن تمييزها إطلاقاً عن المعلق البشري المحترف.',
      author: 'سعد القحطاني',
      role: 'مدير النشر الصوتي، دار أفق للنشر والترجمة',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      quote: 'انخفض وقت إنتاج مقاطع اليوتيوب والريلز لدينا بنسبة 80%. ميزة التحكم بنبرة الصوت وتغيير السرعة تمنحنا نتائج استوديو فخمة في دقائق معدودة.',
      author: 'مروة ناصر',
      role: 'مؤسسة قناة "تقنية بالعربي" (1.8M مشترك)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      quote: 'ربطنا واجهة برمجة تطبيقات قيمة فلاش الفورية مع بوت خدمة العملاء في مصرفنا، واستقبلنا إشادات هائلة من العملاء لدفء الصوت ولهجته السعودية الأصيلة.',
      author: 'م. راكان التميمي',
      role: 'رئيس التحول الرقمي، تقنيات الدفع الذكي',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    {
      quote: 'أداء نموذج قيمة ستوديو v3 في المشاهد الدرامية للألعاب والوثائقيات غير مسبوق في المحتوى العربي. إنه القفزة الأكبر في الذكاء الاصطناعي الصوتي.',
      author: 'إلياس بدران',
      role: 'مخرج صوتي ومطور ألعاب مستقل',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
    },
    {
      quote: 'الدقة في قراءة الحركات والتشكيل هي ما جعلنا نعتمد قيمة فويس في جميع مناهجنا التعليمية الرقمية. لم نعد بحاجة للتصحيح اليدوي المتكرر.',
      author: 'د. ليلى الشافعي',
      role: 'مديرة المناهج في منصة "زاد المعرفة"',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      quote: 'توفير التوأم الصوتي الفوري وإمكانية التوليد بأكثر من لهجة عربية مكّن علامتنا التجارية من إطلاق حملات مخصصة لكل دولة خليجية في نفس اليوم.',
      author: 'عمر السعيد',
      role: 'مدير التسويق الإقليمي، وكالة إبداع الخليج',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    }
  ];

  // Same plans as /ar/pricing (shared/plans.ts); 1 credit = 1 character, ~1,000 characters ≈ 1 minute of audio
  const fmt = (n: number) => n.toLocaleString('en-US');
  const pricingPlans = PLANS.map(p => {
    const chars = p.monthlyCredits || (p.priceUsd === 0 ? SIGNUP_BONUS_CREDITS : 0);
    const free = p.priceUsd === 0;
    return {
      name: p.nameAr,
      nameEn: p.name,
      priceMonthly: p.priceUsd === null ? 'مخصص' : `$${p.priceUsd}`,
      priceAnnual: p.annualPriceUsd === null ? 'مخصص' : `$${p.annualPriceUsd}`,
      period: p.isCustom ? 'تسعير حسب الاحتياج' : free ? 'مجاناً للأبد' : 'شهرياً، إلغاء في أي وقت',
      credits: p.isCustom ? 'رصيد حسب احتياج منشأتك' : `${fmt(chars)} حرف`,
      creditsNote: p.isCustom ? 'عقد سنوي مع فواتير نظامية' : free ? `رصيد ترحيبي (~${Math.round(chars / 1000)} دقائق صوت)` : `شهرياً (~${Math.round(chars / 1000)} دقيقة صوت)`,
      ctaText: p.isCustom ? 'تواصل مع المبيعات' : free ? 'ابدأ مجاناً' : `اختر باقة ${p.nameAr}`,
      ctaStyle: p.featured ? 'bg-brand hover:bg-brand-orange text-white shadow-md shadow-brand/25' : free ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-brand-ink hover:bg-brand-ink/90 text-white',
      popular: Boolean(p.featured),
      popularLabel: p.badge,
      isCustom: Boolean(p.isCustom),
      features: [
        { label: 'الحروف الشهرية', val: p.isCustom ? 'غير محدود' : free ? `${fmt(chars)} مرة واحدة` : fmt(chars) },
        { label: 'الاستخدام التجاري', val: !free },
        { label: 'اللهجات واللغات', val: 'عربي + إنجليزي + فرنسي' },
        { label: 'تنزيل MP3', val: true },
        { label: 'تنزيل WAV 48kHz', val: !free },
        { label: 'حجز معلق بشري', val: true },
        { label: 'خصم حجوزات المعلقين', val: p.isCustom ? 'مخصص' : p.bookingDiscountPct ? `${p.bookingDiscountPct}%` : false },
        { label: 'أولوية في التوليد', val: Boolean(p.featured || p.isCustom) },
        { label: 'صوت AI حصري لعلامتك', val: Boolean(p.isCustom) },
        { label: 'حسابات فريق و SLA', val: Boolean(p.isCustom) },
      ]
    };
  });

  // Cards come from «نماذج الإنتاج الصوتي» (managed from the dashboard), each linking to its model page
  const voiceCategoryCards = useVoiceTemplates().slice(0, 6);

  const full = variant === 'full';
  const faqs = TTS_FAQS;
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white" dir="rtl">
      
      {full && (<>
      {/* 1. HERO SECTION (Image 2 - Top) */}
      <section className="relative pt-10 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-10">
            <div className="max-w-3xl mx-auto space-y-5 text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.25]">
                تحويل النص إلى صوت فائق الجودة بأصوات ذكاء اصطناعي عربية واقعية
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                حوّل أي نص عربي أو متعدد اللغات إلى تعليق صوتي احترافي بنبرة طبيعية تحاكي النطق البشري، بلهجات محلية دقيقة، ومشاعر متناغمة، وجودة استوديو 48kHz.
              </p>

            </div>

            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
                {/* Console Header */}
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-slate-900 font-extrabold">اكتب نصاً</span>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-700">اختر صوتاً</span>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-500">استمع للعينة الفورية</span>
                  </div>
                  <button 
                    onClick={onTryStudio}
                    className="text-xs font-bold text-orange-700 hover:text-orange-700 flex items-center gap-1 transition-colors"
                  >
                    <span>فتح الاستوديو الكامل</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Text box, part of the same card: any interaction opens login */}
                <div
                  onClick={onOpenLogin}
                  className="relative border-b border-slate-100 cursor-pointer ring-2 ring-inset ring-transparent hover:ring-orange-200 transition-colors"
                >
                  <textarea
                    readOnly
                    rows={6}
                    onFocus={(e) => { e.currentTarget.blur(); onOpenLogin(); }}
                    placeholder="اكتب نصك هنا بالعربية أو بلغة أجنبية، ثم اختر الصوت واللهجة لتوليده..."
                    className="w-full px-6 pt-5 pb-16 text-base sm:text-lg leading-relaxed text-slate-800 placeholder:text-slate-500 resize-none outline-none bg-white cursor-pointer"
                  />
                  <span className="absolute bottom-4 left-5 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold shadow-md shadow-brand/25 inline-flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    توليد الصوت
                  </span>
                </div>

                {/* Console Content: Categories + Voice List */}
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
                  
                  {/* Category filters */}
                  <div className="md:col-span-4 border-l border-slate-100 p-2.5 bg-slate-50/40 space-y-1">
                    <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">مُصنف حسب استخدامك</p>
                    {consoleCategories.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-right transition-all ${
                            isActive 
                              ? 'bg-brand-ink text-white shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Voices list */}
                  <div className="md:col-span-8 p-3 space-y-2 max-h-[400px] overflow-y-auto">
                    {previewVoices.map((voice) => {
                      const isPlayingThis = playingVoiceId === voice.id;
                      return (
                        <div
                          key={voice.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isPlayingThis 
                              ? 'bg-orange-50/70 border-orange-200 shadow-sm' 
                              : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                          }`}
                        >
                          {/* Play button + Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <GlassyVoiceOrb
                              gradient=""
                              voiceId={voice.id}
                              size="md"
                              isVerified={false}
                              isPlaying={isPlayingThis}
                              onTogglePlay={() => handleTogglePlayVoice(voice.id, voice.previewUrl)}
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 truncate">{voice.name}</span>
                                <span className="text-xs">{voice.flag}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">{voice.dialectLabel}</p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={onTryStudio}
                            className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors shadow-2xs"
                          >
                            استخدم الصوت
                          </button>
                        </div>
                      );
                    })}

                    <div className="pt-2 text-center">
                      <button
                        onClick={onTryStudio}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>استكشف مكتبة الأصوات الكاملة (500+ صوت عربي وعالمي)</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>


            <div className="max-w-3xl mx-auto space-y-4 text-center">
              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 flex-row-reverse">
                <button
                  onClick={onGoogle}
                  className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>تسجيل الدخول مع Google</span>
                </button>

                <button
                  onClick={onTryStudio}
                  className="px-7 py-3.5 rounded-xl bg-brand hover:bg-brand-orange text-white font-bold text-sm transition-all shadow-md shadow-brand/25 flex items-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  <span>جرّب استوديو التوليد الآن</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>أصوات ذكاء اصطناعي مرخصة مبنية من أصوات معلقين بشريين حقيقيين • ابدأ مجاناً بدون بطاقة</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      </>)}
      {/* 2. EMOTIONALLY & CONTEXTUALLY AWARE SECTION (Image 2 - Middle) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight">
            أصوات ذكاء اصطناعي تفهم المشاعر وسياق النص العربي
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            يستجيب الذكاء الاصطناعي الصوتي لدينا للإشارات العاطفية، وحركات الإعراب والتشكيل، وعلامات الترقيم، ليتكيف أسلوب الإلقاء والوقفات الطبيعية بما يناسب المعنى بدقة بالغة.
          </p>
        </div>

        {/* Big visual feature cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Card 1: Control emotion & direction (Left visual card in Image 2) */}
          <div className="lg:col-span-6 rounded-2xl bg-gradient-to-br from-amber-900/90 via-slate-900 to-slate-950 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono">
                <span>توجيه نبرة الإلقاء • Direction Control</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white">التحكم الدقيق بالانفعال، الوقفات، والأسلوب</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                حدد درجة الاستقرار، والسرعة، والمبالغة التعبيرية، أو ضع وسوم المشاعر لتوجيه الصوت نحو الجدية، البهجة، الحزن، أو الحماس.
              </p>

              {/* Slider Mockups */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/60 space-y-3 mt-4 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-mono">
                  <span>السرعة (Speed)</span>
                  <span className="text-amber-400">1.00x</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[50%]" />
                </div>

                <div className="flex items-center justify-between text-slate-300 font-mono pt-1">
                  <span>الاستقرار والتعبير (Stability)</span>
                  <span className="text-amber-400">75%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-l from-amber-400 to-orange-500 h-full w-[75%]" />
                </div>

                <div className="flex items-center justify-between text-slate-300 font-mono pt-1">
                  <span>المبالغة في الأداء (Style Exaggeration)</span>
                  <span className="text-amber-400">40%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[40%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Access library of human-like voices (Right visual card in Image 2) */}
          <div className="lg:col-span-6 rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">مكتبة أصوات غنية تغطي كل المجالات</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                استكشف تشكيلة متنامية من الأصوات البشرية التعبيرية؛ من السرد الروائي إلى تقارير الأعمال وشخصيات الألعاب والبودكاست.
              </p>

              {/* Category Pills Gallery */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <BookOpen className="w-5 h-5 mx-auto text-amber-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800">سرد وقصص</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <MessageSquare className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800">حوار تفاعلي</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <Volume2 className="w-5 h-5 mx-auto text-purple-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800">إعلانات تجارية</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <Radio className="w-5 h-5 mx-auto text-emerald-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800">بودكاست وإذاعة</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <Gamepad2 className="w-5 h-5 mx-auto text-rose-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800">ألعاب وترفيه</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <Layers className="w-5 h-5 mx-auto text-indigo-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800">شروحات ومناهج</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onTryStudio}
                className="text-xs font-bold text-orange-700 hover:text-orange-700 flex items-center gap-1.5 transition-colors"
              >
                <span>استكشف كافة الأصوات في الاستوديو</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* 3 Highlights Cards (Image 2 - Bottom 3 cards) */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900">دعم الحوار متعدد الشخصيات</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              أنشئ محادثات كاملة بين متحدثين متعددين يتشاركون السياق والانفعال دون انقطاع، مثالي للحوارات الإذاعية والمشاهد الدرامية.
            </p>
          </div>

        </div>
      </section>

      {full && (<>
      {/* 3. USE CASES SECTION (Image 2 bottom & Image 3 top) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight">
              مُصمم لتغطية طيف واسع من الاستخدامات؛ من الرد الآلي إلى الكتب الصوتية
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              حلول جاهزة لأصحاب الأعمال، الشركات، المؤسسات الإعلامية، وصناع المحتوى.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, idx) => {
              const Icon = uc.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {uc.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-950">{uc.title}</h3>
                                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {uc.desc}
                    </p>
                  </div>

                  {/* Sample Dialogue Bubble */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700 italic">
                    {uc.demoText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      </>)}
      {/* 4. MILLIONS OF WORDS COUNTER & DIALECTS (Image 3 middle) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-white text-center">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Big Number Counter */}
          <div className="space-y-2">
            <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight font-mono">
              +250,000
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-600">
              كلمة تم توليدها عبر الاستوديو منذ الإطلاق، والعدد يتزايد كل يوم
            </p>
          </div>

          {/* Multi-language / Dialects Showcase */}
          <div className="pt-10 border-t border-slate-100 space-y-8">
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                توليد الصوت بكل اللهجات العربية مع اللغات الأجنبية بتنوع نبرات فريد
              </h3>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                اختر بين اللهجات العربية المحلية الأصيلة، أو الأجنبية للتواصل مع جمهورك في كل مكان.
              </p>

              {/* Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  onClick={() => setDialectTab('dialects')}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    dialectTab === 'dialects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  اللهجات العربية
                </button>
                <button
                  onClick={() => setDialectTab('accents')}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    dialectTab === 'accents' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  اللغات الأجنبية
                </button>
              </div>
            </div>

            {/* Dialects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-right">
              {(dialectTab === 'dialects' ? arabicDialects : globalLanguages).map((item, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition-all flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.flag}</span>
                    <span className="text-xs font-bold text-slate-800">{item.name}</span>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {full && (<>
      {/* 6. TESTIMONIALS SECTION (Image 4 middle) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight">
              موثوق من رواد الإنتاج الإعلامي، وصناع المحتوى، والشركات الرائدة
            </h2>
            <p className="text-base text-slate-600 max-w-xl mx-auto">
              آراء حقيقية من شركائنا وعملائنا الذين يستخدمون أصواتنا يومياً في مشاريعهم الكبرى.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <Quote className="w-6 h-6 text-orange-400 rotate-180" />
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <img 
                    src={t.avatar} 
                    alt={t.author} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{t.author}</h4>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      </>)}
      {full && (<>
      {/* 7. PRICING TABLE SECTION (Image 5 top) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950">
                باقات وأسعار تحويل النص إلى صوت
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                اختر الباقة المناسبة لحجم أعمالك مع إمكانية الترقية أو الإلغاء في أي وقت.
              </p>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-brand-ink text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الدفع الشهري
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-brand-ink text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>الدفع السنوي</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">وفّر 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, idx) => {
              const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                    plan.popular ? 'border-orange-500 shadow-xl ring-2 ring-orange-500/20' : 'border-slate-200 shadow-xs'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold tracking-wide uppercase">
                      {plan.popularLabel}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{plan.nameEn}</p>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-950 font-mono">{price}</span>
                        {!plan.isCustom && <span className="text-xs text-slate-500">/ شهرياً</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{plan.period}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="font-extrabold text-xs text-slate-900 font-mono">{plan.credits}</div>
                      <div className="text-[10px] text-slate-500">{plan.creditsNote}</div>
                    </div>

                    {plan.isCustom ? (
                      <Link to="/ar/contact-us" className={`block text-center w-full py-2.5 rounded-xl font-bold text-xs transition-all ${plan.ctaStyle}`}>
                        {plan.ctaText}
                      </Link>
                    ) : (
                      <button
                        onClick={onOpenSignup}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${plan.ctaStyle}`}
                      >
                        {plan.ctaText}
                      </button>
                    )}

                    {/* Features list */}
                    <div className="border-t border-slate-100 pt-4 space-y-2.5">
                      {plan.features.map((feat, fi) => (
                        <div key={fi} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{feat.label}</span>
                          {typeof feat.val === 'boolean' ? (
                            feat.val ? (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="text-slate-300 font-mono text-sm">—</span>
                            )
                          ) : (
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{feat.val}</span>
                          )}
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-400">
            الأسعار لا تشمل ضريبة القيمة المضافة إن وجدت. يمكنك إلغاء الاشتراك في أي وقت بنقرة واحدة.
          </p>
        </div>
      </section>

      </>)}
      {full && (<>
      {/* 10. EXPLORE VOICE CATEGORIES (Image 6 middle) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                استكشف نماذج الإنتاج الصوتي
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                نماذج جاهزة لكل مشروع صوتي، مع عينات تسمعها قبل الطلب.
              </p>
            </div>
            <Link
              to="/ar/voice-models"
              className="text-xs font-bold text-orange-700 hover:text-orange-700 flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {voiceCategoryCards.map((card, idx) => (
              <Link
                key={card.id}
                to={card.link || '/ar/voice-models'}
                className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
              >
                {card.img ? (
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-slate-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-slate-900/30 group-hover:from-slate-950/90 transition-opacity" />
                <div className="absolute inset-0 p-3.5 flex flex-col justify-end text-white text-right">
                  <h4 className="font-bold text-xs sm:text-sm leading-tight">{card.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      </>)}
      {/* 11. FAQ ACCORDION (Image 6 bottom) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              الأسئلة الشائعة حول تحويل النص إلى صوت (FAQ)
            </h2>
            <p className="text-sm text-slate-600">
              كل ما تحتاج معرفته حول النطق، التراخيص، والأسعار.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-right text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-50/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-700' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {full && (<>
      {/* 12. BOTTOM CONVERSION BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            جاهز لتجربة أصوات ذكاء اصطناعي تفوق الخيال؟
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            ابدأ الآن مجاناً بـ 10,000 نقطة بدون بطاقة بنكية، وحوّل نصوصك إلى صوت بشري متكامل في ثوانٍ.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenSignup}
              className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all"
            >
              إنشاء حساب مجاني فوراً
            </button>
            <button
              onClick={onTryStudio}
              className="px-8 py-3.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-brand-ink text-slate-200 font-bold text-sm transition-all"
            >
              فتح استوديو التوليد المباشر
            </button>
          </div>
        </div>
      </section>

      </>)}
    </div>
  );
};
