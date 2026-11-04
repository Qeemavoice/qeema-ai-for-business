import React, { useState, useRef, useEffect } from 'react';
import { openAssistant } from '../lib/assistantEvents';
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
import { VoiceStyleCarousel, VOICE_STYLE_ITEMS } from './VoiceStyleCarousel';
import { ProductSwitcher } from './ProductSwitcher';
import { TextToSpeechPlayground } from './TextToSpeechPlayground';
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

  // Audio & Orb States
  const [isPlaying, setIsPlaying] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(12);

  // Hidden audio element for real audio and Web Audio API node binding
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const activePreset = HERO_PRESETS[activeTab] || HERO_PRESETS.ai;
  const [styleIndex, setStyleIndex] = useState(1);
  const sampleUrl = activeTab === 'tts' ? activePreset.audioUrl : VOICE_STYLE_ITEMS[styleIndex].audioUrl;

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
          <div className="relative max-w-5xl mx-auto rounded-3xl bg-white/80 border border-slate-200/90 shadow-xl shadow-slate-900/[0.04] backdrop-blur-md p-5 sm:p-7 md:p-9">
            
            {/* Top Bar of the Showcase */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                <span>المشغل الصوتي التفاعلي الحي</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-normal">استمع لنماذج الصوت المباشرة لكل تقنية</span>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-100/70 px-3 py-1 rounded-full border border-slate-200/60">
                <span>تفاعل صوتي نقي</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-semibold">جودة استوديو فائقة</span>
              </div>
            </div>

            {/* If activeTab === 'tts' (نص إلى صوت), render the ElevenLabs-style Text-to-Speech Playground */}
            {activeTab === 'tts' ? (
              <div className="mb-6 animate-in fade-in duration-300">
                <TextToSpeechPlayground
                  onRequireAuth={isLoggedIn ? undefined : (onOpenSignup || onOpenLogin)}
                  onExploreVoices={() => onNavigate('voice-library', { tab: 'ai' })}
                />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <VoiceStyleCarousel
                    items={VOICE_STYLE_ITEMS}
                    index={styleIndex}
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
                    onOpen={() => onNavigate('voice-library', { tab: 'human' })}
                  />
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* INTEGRATED SUITE TABS (العناوين التابعة للقسم المتكامل)                    */}
            {/* ========================================================================= */}
            <div className="pt-4 border-t border-slate-100/90">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-500">
                  اختر التقنية الصوتية للاستماع المباشر وتجربة النبرات:
                </span>
              </div>

              {/* Product Switcher Tabs (5 Tabs without dubbing) */}
              <ProductSwitcher
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                }}
              />

              {/* Contextual Descriptor Row directly tied to the active tab */}
              <div className="mt-4 pt-3 border-t border-slate-100/70 flex flex-col sm:flex-row items-center justify-between gap-2.5 px-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                  <span className="font-medium text-slate-700">
                    {activeTab === 'human' && 'معلقون وممثلون صوتيون محترفون بأكثر من 20 لهجة عربية للمشاريع الإعلانية والرسمية.'}
                    {activeTab === 'ai' && 'نماذج ذكاء اصطناعي صوتية فائقة الواقعية بنبرات ومخارج حروف عربية مضبوطة التشكيل بالكامل.'}
                    {activeTab === 'tts' && 'أستوديو تحويل النص إلى صوت (TTS) عالي الأداء للمقالات، الكتب الصوتية، والأنظمة التفاعلية.'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (onOpenSignup) {
                      onOpenSignup();
                    } else if (onOpenDemo) {
                      onOpenDemo();
                    }
                  }}
                  className="px-6 py-2 rounded-full bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
                >
                  إنشاء حساب
                </button>
              </div>

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
