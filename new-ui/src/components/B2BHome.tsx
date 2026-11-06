import React, { useState, useRef, useEffect } from 'react';
import {
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
import { OrbMode } from './VoiceOrb';
import { HeroAudioPlayer } from './HeroAudioPlayer';
import { HeroVoiceCarousel } from './HeroVoiceCarousel';
import { HumanVoicesSection } from './HumanVoicesSection';
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
  voiceName: string;
  dialect: string;
  gender: string;
  category: string;
  audioUrl: string;
}

const HUMAN_PRESET: HeroPreset = {
  voiceName: 'لا توجد عينة منشورة',
  dialect: '',
  gender: 'male',
  category: 'معلّق صوتي بشري',
  audioUrl: '',
};

export const B2BHome: React.FC<B2BHomeProps> = ({
  onNavigate,
  onOpenDemo,
  onOpenSignup,
  voices,
  onSelectForBooking
}) => {
  // Active category / product navigation state
  const activeTab: OrbMode = 'human';

  // Audio preview state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previewVoiceId, setPreviewVoiceId] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Hidden audio element for real audio and Web Audio API node binding
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const playableHomepageVoices = voices.filter(voice => voice.type === 'human' && voice.isActive && Boolean(voice.previewUrl));
  const previewVoice = activeTab === 'human'
    ? playableHomepageVoices.find(voice => voice.id === previewVoiceId) || playableHomepageVoices[0]
    : undefined;
  const activePreset = previewVoice
    ? {
        ...HUMAN_PRESET,
        voiceName: previewVoice.name,
        dialect: previewVoice.dialectLabel || previewVoice.dialect,
        gender: previewVoice.gender,
        category: previewVoice.styleLabel || HUMAN_PRESET.category,
        audioUrl: previewVoice.previewUrl
      }
    : HUMAN_PRESET;

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
      if (activePreset.audioUrl) {
        audioElementRef.current.src = activePreset.audioUrl;
      } else {
        audioElementRef.current.removeAttribute('src');
        audioElementRef.current.load();
      }
      setCurrentTime(0);
      setDuration(activePreset.audioUrl ? 12 : 0);

      if (wasPlaying && activePreset.audioUrl) {
        audioElementRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    }
  }, [activeTab, activePreset.audioUrl]);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioElementRef.current || !activePreset.audioUrl) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.src = activePreset.audioUrl;
      audioElementRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-slate-900 pb-28 selection:bg-[#FF5500] selection:text-white" dir="rtl">

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
            تصفّح ملفات معلّقين عرب واستمع إلى عيناتهم المنشورة، ثم أرسل طلب الحجز من المنصة.
          </p>

          {/* Fixed CTA Buttons Row */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            {/* 1. استكشف الأصوات البشرية */}
            <button
              onClick={() => onNavigate('voice-library', { tab: 'human' })}
              className="px-7 py-3.5 rounded-full bg-[#FF5500] hover:bg-[#E04800] text-white text-sm font-bold shadow-lg shadow-[#FF5500]/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2 border border-[#FF5500]"
            >
              <span>استكشف الأصوات البشرية</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* إنشاء حساب */}
            <button
              onClick={onOpenSignup || onOpenDemo}
              className="px-7 py-3.5 rounded-full bg-orange-50/80 hover:bg-orange-100/90 text-[#FF5500] text-sm font-bold border border-orange-200/80 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#FF5500]" />
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500]"></span>
                </span>
                <span>معاينة صوت المعلّق</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-normal">{previewVoice ? 'عينة صوتية منشورة من ملف المعلّق' : 'لا توجد عينة منشورة للمعاينة حاليًا'}</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-100/70 px-3 py-1 rounded-full border border-slate-200/60">
                <span>تفاعل صوتي نقي</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-semibold">عينات منشورة من مكتبة المعلّقين</span>
              </div>
            </div>

            <>
                {/* Interactive human voice carousel */}
                <div className="relative flex flex-col items-center justify-center py-2 mb-3">
                  <div className="w-full">
                  <HeroVoiceCarousel
                    voices={playableHomepageVoices}
                    selectedVoiceId={previewVoice?.id}
                    isPlaying={isPlaying}
                    onSelect={(voice) => setPreviewVoiceId(voice.id)}
                    onTogglePlay={togglePlay}
                  />
                  </div>

                  {/* Quote Pill */}
                  <div className="max-w-lg mx-auto mt-3 px-4 py-2 rounded-2xl bg-slate-50/90 border border-slate-200/70 text-xs text-slate-600 italic">
                    {previewVoice ? 'استمع إلى العينة المنشورة من ملف هذا المعلّق.' : 'ستظهر العينة هنا بعد نشرها في ملف المعلّق.'}
                  </div>
                </div>

                {/* Minimalist Hero Audio Player */}
                <div className="mb-6">
                  <HeroAudioPlayer
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlay}
                    voiceName={activePreset.voiceName}
                    dialect={activePreset.dialect}
                    gender={activePreset.gender}
                    category={activePreset.category}
                    mode={activeTab}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={(pct) => {
                      if (audioElementRef.current && duration > 0) {
                        audioElementRef.current.currentTime = pct * duration;
                        setCurrentTime(pct * duration);
                      }
                    }}
                    hasAudio={Boolean(previewVoice?.previewUrl)}
                    isMuted={isMuted}
                    onToggleMute={() => {
                      const nextMuted = !isMuted;
                      setIsMuted(nextMuted);
                      if (audioElementRef.current) audioElementRef.current.muted = nextMuted;
                    }}
                  />
                </div>
            </>

            {/* ========================================================================= */}
            {/* INTEGRATED SUITE TABS (العناوين التابعة للقسم المتكامل)                    */}
            {/* ========================================================================= */}
            <div className="pt-4 border-t border-slate-100/90">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-500">التقنية المتاحة حالياً</span>
              </div>

              <div className="mx-auto w-full max-w-sm rounded-2xl border border-orange-200 bg-orange-50/70 px-5 py-3 flex items-center justify-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-xl bg-[#FF5500] text-white flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-black">الصوت البشري</div>
                  <div className="text-[11px] text-slate-500">عينة المعلّقين المنشورة في المنصة</div>
                </div>
              </div>

              {/* Contextual Descriptor Row directly tied to the active tab */}
              <div className="mt-4 pt-3 border-t border-slate-100/70 flex flex-col sm:flex-row items-center justify-between gap-2.5 px-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] shrink-0" />
                  <span className="font-medium text-slate-700">
                    تتوفر اللهجات بحسب ملفات المعلّقين المنشورة في المكتبة.
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
                  className="px-6 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
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
      <TrustedEnterpriseBrands onExplore={() => onNavigate('customer-stories')} />

      {/* ========================================================================= */}
      {/* 2. SECTION: HUMAN VOICES MARKETPLACE                                      */}
      {/* ========================================================================= */}
      <div id="section-human-voices">
        <HumanVoicesSection
          voices={voices}
          onSelectVoice={(voice) => {
            if (onSelectForBooking) {
              onSelectForBooking(voice);
            } else {
              onNavigate('voice-library', { tab: 'human', voiceId: voice.id });
            }
          }}
          onExploreLibrary={() => onNavigate('voice-library', { tab: 'human' })}
        />
      </div>

      {/* ========================================================================= */}
      {/* 4. SECTION: VOICE TWINS (Preserving vocal identity for enterprise scale)  */}
      {/* ========================================================================= */}

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
              استمع إلى العينات المتاحة، وأرسل تفاصيل مشروعك لمعرفة خيارات التسجيل وحقوق الاستخدام.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0 relative z-10">
            <button
              onClick={() => onNavigate('voice-library', { tab: 'human' })}
              className="px-7 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white font-bold text-sm transition-all shadow-lg shadow-[#FF5500]/25 hover:shadow-[#FF5500]/35 cursor-pointer flex items-center gap-2"
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
