import React, { useState, useRef, useEffect } from 'react';
import { openAssistant, ASSISTANT_ON } from '../lib/assistantEvents';
import { MessageCircle, 
  Sparkles, 
  Building2, 
  Mic2, 
  Layers, 
  Play, 
  Pause, 
  CheckCircle2, 
  ArrowLeft, 
  Volume2, 
  Zap, 
  ShieldCheck, 
  Radio, 
  Globe2, 
  Film, 
  BookOpen, 
  ShoppingBag,
  Coins,
  ChevronRight,
  User,
  Copy,
  Sliders,
  ExternalLink,
  Lock
} from 'lucide-react';
import { ActiveView, Voice } from '../types';
import type { OrbMode, OrbState } from './VoiceOrb';
import { VoiceStyleCarousel, buildVoiceStyleItems, playerSampleItems } from './VoiceStyleCarousel';
import { PRODUCT_TABS } from './ProductSwitcher';
import { useSiteLists } from '../lib/siteLists';
import { useNavigate } from 'react-router-dom';
import { TtsStudioPanel } from './TtsStudioPanel';
import { useRowad } from '../lib/rowad';
import { ACCOUNT_CHANGED_EVENT } from '../lib/api';
import { HumanVoicesSection } from './HumanVoicesSection';
import { AIVoicesSection } from './AIVoicesSection';
import { AI_VOICES_ENABLED } from '../../shared/features';
import { VoiceTwinsSection } from './VoiceTwinsSection';
import { EnterpriseCapabilitiesSection } from './EnterpriseCapabilitiesSection';
import { TrustedEnterpriseBrands } from './TrustedEnterpriseBrands';

interface B2BHomeProps {
  onNavigate: (view: ActiveView, extra?: { voiceId?: string; text?: string; tab?: 'human' | 'ai' | 'my-voices' }) => void;
  onOpenDemo: () => void;
  onOpenSignup?: () => void;
  onOpenLogin?: () => void;
  isLoggedIn?: boolean;
  onOpenTopUp: () => void;
  voices: Voice[];
  onSelectForBooking?: (voice: Voice) => void;
}

interface HeroPreset {
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  voiceName: string;
  dialect: string;
  gender: string;
  category: string;
  audioUrl: string;
  sampleQuote: string;
}

const HERO_PRESETS: Record<OrbMode, HeroPreset> = {
  ai: {
    title: 'مستقبل الصوت العربي، مصمم للتوسع.',
    subtitle: 'أصوات بشرية، أصوات AI، وتوائم صوتية، في منصة واحدة.',
    primaryCta: 'جرّب الصوت الذكي الآن',
    secondaryCta: 'اكتشف الأصوات',
    voiceName: 'سارة الذكية',
    dialect: 'فصحى معيارية معاصرة',
    gender: 'female',
    category: 'ذكاء اصطناعي فوري',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
    sampleQuote: 'مرحبًا بك في قيمة فويس. اكتشف مستقبل الصوت العربي بتقنيات الذكاء الاصطناعي التوليدي.'
  },
  human: {
    title: 'أصوات بشرية حقيقية.',
    subtitle: 'اكتشف أصواتًا عربية احترافية تناسب علامتك ومحتواك من نخبة المعلقين المعتمدين في الوطن العربي.',
    primaryCta: 'استكشف الأصوات',
    secondaryCta: 'حجز جلسة تسجيل',
    voiceName: 'عينة وثائقية ومؤسسية فخمة',
    dialect: 'سعودي وقور',
    gender: 'male',
    category: 'عينة صوت بشري بجودة استوديو',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3',
    sampleQuote: 'في كل كلمة ننطقها، نزرع الثقة ونصنع أثراً يدوم في ذاكرة المستمعين.'
  },
  twins: {
    title: 'صوتك، بنسخة ذكية.',
    subtitle: 'أنشئ توأمًا صوتيًا يحافظ على هويتك ونبرتك لإنتاج المحتوى على نطاق واسع دون إعادة التسجيل.',
    primaryCta: 'أنشئ توأمك الصوتي',
    secondaryCta: 'استكشف التوائم الرقمية',
    voiceName: 'توأم نور الصوتي',
    dialect: 'إماراتي / خليجي',
    gender: 'female',
    category: 'توأم رقمي مرخص',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3',
    sampleQuote: 'هذا صوتي الذكي المعتمد، ينتج مئات الساعات بجودة مطابقة لتسجيلي الحقيقي.'
  },
  tts: {
    title: 'تحويل النص إلى صوت فائق الدقة.',
    subtitle: 'محرك نطق ذكي يضبط التشكيل ومخارج الحروف العربية بدقة استثنائية للمقالات، الكتب، والأنظمة التفاعلية.',
    primaryCta: 'تجربة استوديو TTS',
    secondaryCta: 'الشات بوت الذكي',
    voiceName: 'محرك النطق العصبي',
    dialect: 'فصحى معيارية مشكولة',
    gender: 'male',
    category: 'تحويل النص إلى صوت',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
    sampleQuote: 'يسرنا تمكين الشركات من تحويل ملايين الكلمات إلى صوت عربي سليم خلال دقائق.'
  },
  cloning: {
    title: 'استنساخ صوتي رقمي آمن.',
    subtitle: 'استنسخ صوت المتحدث في دقائق معدودة مع حماية كاملة لحقوق الملكية والتراخيص التجارية.',
    primaryCta: 'بدء استنساخ الصوت',
    secondaryCta: 'شروط التراخيص والأمان',
    voiceName: 'نموذج استنساخ تجاري',
    dialect: 'مصري معاصر',
    gender: 'male',
    category: 'استنساخ صوتي فوري',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    sampleQuote: 'تقنية الاستنساخ الصوتي تتيح لك الحفاظ على حضورك الصوتي الدائم في كل حملاتك.'
  }
};

export const B2BHome: React.FC<B2BHomeProps> = ({ 
  onNavigate, 
  onOpenDemo, 
  onOpenSignup, 
  onOpenLogin,
  isLoggedIn = false,
  voices,
  onSelectForBooking
}) => {
  // Active category / product navigation state - يبدأ بالأصوات البشرية
  const [activeTab, setActiveTab] = useState<OrbMode>('human');
  // «استوديو TTS» tab: the same studio as /ar/text-to-speech (free trial for visitors), up to the audio preview
  const navigate = useNavigate();
  const { canUse } = useRowad();
  const studio = isLoggedIn && canUse;

  // Audio & Orb States
  const [isPlaying, setIsPlaying] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(12);

  // Hidden audio element for real audio and Web Audio API node binding
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const activePreset = HERO_PRESETS[activeTab] || HERO_PRESETS.ai;
  const siteCategories = useSiteLists().categories;
  // samples from «أصوات المشغّل» in the admin dashboard; the built-in list until any is published there
  const [playerRows, setPlayerRows] = useState<any[]>([]);
  useEffect(() => { fetch('/api/v1/player-samples').then(r => r.ok ? r.json() : { items: [] }).then(d => setPlayerRows(d.items || [])).catch(() => {}); }, []);
  const styleItems = React.useMemo(() => playerRows.length ? playerSampleItems(playerRows) : buildVoiceStyleItems(siteCategories), [playerRows, siteCategories]);
  const [styleIndex, setStyleIndex] = useState(0);
  const sampleUrl = activeTab === 'tts' || !styleItems.length ? activePreset.audioUrl : styleItems[styleIndex % styleItems.length].audioUrl;

  // Initialize and handle audio playback
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioElementRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setOrbState('completed');
      setTimeout(() => setOrbState('idle'), 1500);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Update audio source when preset changes
  useEffect(() => {
    if (audioElementRef.current) {
      const wasPlaying = isPlaying;
      audioElementRef.current.pause();
      audioElementRef.current.src = sampleUrl;
      setCurrentTime(0);
      setDuration(12);

      if (wasPlaying) {
        audioElementRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
        setIsPlaying(true);
        setOrbState('playing');
      } else {
        setIsPlaying(false);
        setOrbState('idle');
      }
    }
  }, [activeTab, styleIndex]);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setOrbState('idle');
    } else {
      audioElementRef.current.src = sampleUrl;
      audioElementRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setOrbState('playing');
        })
        .catch(err => {
          console.debug('Playing synthetic voice via SpeechSynthesis fallback:', err);
          // Fallback to speech synthesis
          if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(activePreset.sampleQuote);
            utter.lang = 'ar-SA';
            utter.onend = () => {
              setIsPlaying(false);
              setOrbState('completed');
              setTimeout(() => setOrbState('idle'), 1200);
            };
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
            setIsPlaying(true);
            setOrbState('playing');
          }
        });
    }
  };

  // Primary CTA handler based on current active tab
  const handlePrimaryCta = () => {
    if (activeTab === 'human') {
      onNavigate('voice-library', { tab: 'human' });
    } else if (activeTab === 'twins' || activeTab === 'cloning') {
      onNavigate('voice-clone');
    } else {
      onNavigate('generate');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-28 selection:bg-brand selection:text-white" dir="rtl">
      
      {/* ========================================================================= */}
      {/* 1. THE HERO SECTION: 3D LIVING VOICE ORB + DYNAMIC INTERACTION            */}
      {/* ========================================================================= */}
      <section className="relative pt-16 pb-16 sm:pt-20 sm:pb-20 md:pt-24 md:pb-24 overflow-hidden border-b border-slate-200/70">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-blue-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.25] max-w-4xl mx-auto mb-6 py-1">
            مستقبل الصوت العربي يبدأ بصوتٍ بشري.
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8 font-normal">
            أكبر منصة عربية للتعليق الصوتي في الوطن العربي، تجمع أكثر من 1,000 معلق محترف بكل اللهجات العربية، مدعومة بأدوات الذكاء الاصطناعي فائقة الدقة للإنتاج والتوسع.
          </p>

          {/* Fixed CTA Buttons Row */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            {/* 1. استكشف الأصوات البشرية */}
            <button
              onClick={() => onNavigate('voice-library', { tab: 'human' })}
              className="px-7 py-3.5 rounded-full bg-brand hover:bg-brand-orange text-white text-sm font-bold shadow-lg shadow-brand/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2 border border-brand"
            >
              <span>استكشف الأصوات البشرية</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* 2. جرب صوت AI */}
            <button
              onClick={() => onNavigate('generate')}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-sm font-bold border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>جرّب أستوديو TTS</span>
            </button>

            {/* 3. إنشاء حساب */}
            <button
              onClick={onOpenSignup || onOpenDemo}
              className="px-7 py-3.5 rounded-full bg-orange-50/80 hover:bg-orange-100/90 text-brand-text text-sm font-bold border border-orange-200/80 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-brand-text" />
              <span>إنشاء حساب</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* THE INTEGRATED LIVE VOICE SHOWCASE CONSOLE (قسم المشغل التفاعلي المتكامل)  */}
          {/* ========================================================================= */}
          <div className="relative max-w-5xl mx-auto rounded-3xl bg-[#f5f3f1] border border-slate-200/80 overflow-hidden" aria-labelledby="home-player-title">
            <div className="px-5 sm:px-8 pt-6 text-center">
              <h2 id="home-player-title" className="text-lg sm:text-xl font-bold text-slate-950">
                {activeTab === 'tts' ? 'تحويل النص إلى صوت عربي' : 'استمع لعينات تعليق صوتي عربي احترافي'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                {activeTab === 'human' && 'فويس اوفر بشري بأكثر من 20 لهجة عربية من معلقين صوتيين محترفين، اختر نوع المحتوى واستمع.'}
                {activeTab === 'ai' && 'أصوات ذكاء اصطناعي عربية واقعية بنطق وتشكيل مضبوط.'}
                {activeTab === 'tts' && 'حوّل النص إلى صوت عربي طبيعي بالتشكيل الصحيح للمقالات والكتب الصوتية والفيديو.'}
              </p>
            </div>

            {activeTab === 'tts' ? (
              <div className="p-4 sm:p-6 animate-in fade-in duration-300 text-right">
                <TtsStudioPanel
                  voices={voices}
                  showHistory={false}
                  onGenerated={() => window.dispatchEvent(new Event(ACCOUNT_CHANGED_EVENT))}
                  trial={studio ? undefined : { onSignup: isLoggedIn ? () => navigate('/ar/waitlist') : (onOpenSignup || onOpenLogin || (() => navigate('/ar/text-to-speech'))) }}
                />
              </div>
            ) : styleItems.length > 0 && (
              <VoiceStyleCarousel
                items={styleItems}
                index={styleIndex % styleItems.length}
                onSelect={setStyleIndex}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                audio={audioElementRef.current}
                currentTime={currentTime}
                duration={duration}
                onSeek={(pct) => {
                  if (audioElementRef.current && duration > 0) {
                    audioElementRef.current.currentTime = pct * duration;
                    setCurrentTime(pct * duration);
                  }
                }}
              />
            )}

            {/* Product pills + sign-up, inside the same panel */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 pb-5">
              <div className="flex items-center gap-1 overflow-x-auto max-w-full" role="tablist">
                {PRODUCT_TABS.filter(t => t.id !== 'ai' || AI_VOICES_ENABLED).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === t.id ? 'bg-white text-slate-950 border border-slate-200 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onOpenSignup || onOpenDemo}
                className="px-6 py-2.5 rounded-full bg-brand-ink hover:bg-brand-ink/90 text-white text-sm font-bold shadow-md transition-colors cursor-pointer shrink-0"
              >
                إنشاء حساب مجاناً
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* ENTERPRISE TRUSTED BRANDS SHOWCASE (Section based on Reference Image)      */}
      {/* ========================================================================= */}
      <TrustedEnterpriseBrands />

      {/* ========================================================================= */}
      {/* 2. SECTION: HUMAN VOICES MARKETPLACE (1,000+ Real Voices)                 */}
      {/* ========================================================================= */}
      <div id="section-human-voices">
        <HumanVoicesSection
          onExploreLibrary={() => onNavigate('voice-library', { tab: 'human' })}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. SECTION: AI VOICES INTERACTIVE GENERATION DEMO (Text to Speech Studio) */}
      {/* ========================================================================= */}
      {AI_VOICES_ENABLED && <AIVoicesSection
        isLoggedIn={isLoggedIn}
        onOpenLogin={onOpenLogin}
        onOpenSignup={onOpenSignup}
        onOpenStudio={(params) => {
          onNavigate('generate', { text: params?.text, voiceId: params?.voiceId });
        }}
      />}

      {/* ========================================================================= */}
      {/* 4. SECTION: CHATBOT (voice recommendation assistant)                     */}
      {/* ========================================================================= */}
      {ASSISTANT_ON && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
        <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">لا تعرف أي صوت يناسب مشروعك؟</h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              أخبر مساعد قيمة بنوع مشروعك واللهجة التي تريدها، ويرشّح لك أنسب المعلقين من المكتبة.
            </p>
          </div>
          <button
            onClick={() => openAssistant()}
            className="shrink-0 px-6 py-3 rounded-xl bg-brand hover:bg-brand-orange text-white font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>اسأل مساعد قيمة</span>
          </button>
        </div>
      </section>
      )}

      {/* ========================================================================= */}
      {/* 5. SECTION: ENTERPRISE & B2B INFRASTRUCTURE                               */}
      {/* ========================================================================= */}
      <EnterpriseCapabilitiesSection
        onContactSales={onOpenDemo}
        onExploreSolutions={() => onNavigate('industries')}
      />

      {/* ========================================================================= */}
      {/* 6. FINAL BOTTOM CONVERSION CTA BANNER                                     */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6" dir="rtl">
        <div className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-orange-50/50 text-slate-900 p-8 sm:p-14 border border-slate-200/90 shadow-xl shadow-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          
          <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 text-right max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#ea580c] text-xs font-bold border border-orange-200/70 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>جاهز لصوتٍ يعبّر عن علامتك؟</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              ابدأ الآن بصوتٍ بشري احترافي لعلامتك
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              اختر من أصوات معلّقين عرب محترفين وموثّقين، واحصل على أداء صوتي حقيقي مصمم لمشروعك — مع أدوات AI تساعدك على التجربة والتوسع.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0 relative z-10">
            <button
              onClick={() => onNavigate('voice-library', { tab: 'human' })}
              className="px-7 py-3.5 rounded-xl bg-brand hover:bg-brand-orange text-white font-bold text-sm transition-all shadow-lg shadow-brand/25 hover:shadow-brand/35 cursor-pointer flex items-center gap-2"
            >
              <span>استكشف الأصوات البشرية</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenDemo}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all border border-slate-300 shadow-xs hover:border-slate-400 cursor-pointer"
            >
              تحدث مع فريقنا
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
