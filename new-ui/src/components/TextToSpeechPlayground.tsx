import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Volume2
} from 'lucide-react';

export interface TTSVoiceItem {
  id: string;
  name: string;
  role: string;
  dialect: string;
  flag: string;
  avatarGradient: string;
  sampleQuote: string;
  previewUrl: string;
}

const ALL_TTS_VOICES: TTSVoiceItem[] = [
  // Page 1
  {
    id: 'tariq',
    name: 'طارق AI',
    role: 'Husky Storyteller',
    dialect: 'سعودي وقور',
    flag: '🇸🇦',
    avatarGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #0284c7 100%)',
    sampleQuote: 'في كل زاوية من التاريخ حكاية تنتظر من يرويها بنبض حي وأصالة لا تنتهي.',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'
  },
  {
    id: 'sara',
    name: 'سارة AI',
    role: 'Crisp Podcaster',
    dialect: 'خليجي وحجازي',
    flag: '🇸🇦',
    avatarGradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)',
    sampleQuote: 'أهلاً بك! نسعد بمساعدتك في تقديم محتوى صوتي استثنائي يلهم جمهورك ومتابعيك.',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3'
  },
  {
    id: 'nour',
    name: 'نور AI',
    role: 'Social Media',
    dialect: 'مصري حيوي',
    flag: '🇪🇬',
    avatarGradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fde047 100%)',
    sampleQuote: 'معاك خطوة بخطوة عشان نوصل فكرتك لكل الناس بأسهل وأسرع طريقة وبأعلى تفاعل!',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
  },
  {
    id: 'karim',
    name: 'كريم AI',
    role: 'Suspenseful Storyteller',
    dialect: 'شامي فصيح',
    flag: '🇸🇾',
    avatarGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
    sampleQuote: 'في هدوء الليل، تنكشف أسرار الرواية وتكتمل ملامح المغامرة التي تأسر الخيال.',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3'
  },
  {
    id: 'zeyad',
    name: 'زياد الفصيح',
    role: 'Academic & Formal',
    dialect: 'فصحى مشكولة',
    flag: '🌍',
    avatarGradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    sampleQuote: 'إن اللغة وعاء الفكر، وبها ترتقي المعارف الإنسانية وتتوارثها الأجيال عبر العصور.',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'
  },

  // Page 2
  {
    id: 'sofia',
    name: 'صوفيا AI',
    role: 'Luxury & Lifestyle',
    dialect: 'مغاربي أنيق',
    flag: '🇲🇦',
    avatarGradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbcfe8 100%)',
    sampleQuote: 'حين تجتمع الحرفية الأصيلة مع أرقى معايير الابتكار، تولد تجربة استثنائية تأسر الحواس.',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
  },
  {
    id: 'sultan',
    name: 'سلطان AI',
    role: 'Deep Executive',
    dialect: 'سعودي رسمي',
    flag: '🇸🇦',
    avatarGradient: 'linear-gradient(135deg, #0f172a 0%, #334155 50%, #64748b 100%)',
    sampleQuote: 'في قلب الصحراء تزهر أفكار المستقبل، وترتسم ملامح الغد بهمة أبناء الوطن.',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'
  },
  {
    id: 'mariam',
    name: 'مريم AI',
    role: 'Commercial Voice',
    dialect: 'مصري أبيض',
    flag: '🇪🇬',
    avatarGradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fed7aa 100%)',
    sampleQuote: 'عروضنا دايمًا غير، جرب الآن واستمتع بأقوى المزايا الحصرية لعلامتك التجارية.',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3'
  },
  {
    id: 'haytham',
    name: 'هيثم الراوي',
    role: 'Documentary Master',
    dialect: 'فصحى سينمائية',
    flag: '🌍',
    avatarGradient: 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #94a3b8 100%)',
    sampleQuote: 'عبر مسارات التاريخ العريقة، كانت الكلمة الصادقة هي البوصلة الخالدة.',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3'
  },
  {
    id: 'rana',
    name: 'رنا الشامية',
    role: 'Audiobook & Calm',
    dialect: 'شامي ناعم',
    flag: '🇱🇧',
    avatarGradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #67e8f9 100%)',
    sampleQuote: 'جلسة هادئة مع كتاب مفضل، وصوت يرافقك عبر تفاصيل الحكاية بكل لطف وانسجام.',
    previewUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
  }
];

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  langCode: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'ar-sa', name: 'العربية (السعودية)', flag: '🇸🇦', langCode: 'ar-SA' },
  { code: 'ar-fusha', name: 'فصحى معيارية', flag: '🌍', langCode: 'ar' },
  { code: 'ar-eg', name: 'المصرية', flag: '🇪🇬', langCode: 'ar-EG' },
  { code: 'ar-sy', name: 'الشامية', flag: '🇸🇾', langCode: 'ar-SY' },
  { code: 'en-us', name: 'English (US)', flag: '🇺🇸', langCode: 'en-US' },
  { code: 'en-gb', name: 'English (UK)', flag: '🇬🇧', langCode: 'en-GB' },
];

interface TextToSpeechPlaygroundProps {
  onExploreVoices?: () => void;
  className?: string;
}

export const TextToSpeechPlayground: React.FC<TextToSpeechPlaygroundProps> = ({
  onExploreVoices,
  className = ''
}) => {
  const [selectedVoice, setSelectedVoice] = useState<TTSVoiceItem>(ALL_TTS_VOICES[0]);
  const [page, setPage] = useState<number>(0);
  const pageSize = 5;
  const totalPages = Math.ceil(ALL_TTS_VOICES.length / pageSize);

  const [text, setText] = useState<string>(
    'تقنية تحويل النص إلى صوت تتيح لعلامتك التجارية إنتاج محتوى صوتي فائق الواقعية بدقة استوديو 48kHz وبنبرة تلامس مشاعر الجمهور العربي.'
  );

  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop playback on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentPageVoices = ALL_TTS_VOICES.slice(page * pageSize, (page + 1) * pageSize);

  // When changing voice, update quote if textarea was set to default
  const handleSelectVoice = (voice: TTSVoiceItem) => {
    setSelectedVoice(voice);
    if (isPlaying) {
      handleStop();
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handleStop();
      return;
    }

    setIsPlaying(true);

    const textToSpeak = text.trim() || selectedVoice.sampleQuote;

    // First try Web Speech API if supported
    if ('speechSynthesis' in window && textToSpeak) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = selectedLang.langCode;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        // Fallback to audio element sample
        playFallbackAudio();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        playFallbackAudio();
      }
    } else {
      playFallbackAudio();
    }
  };

  const playFallbackAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(selectedVoice.previewUrl);
    } else {
      audioRef.current.src = selectedVoice.previewUrl;
    }

    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onerror = () => setIsPlaying(false);

    audioRef.current.play().catch(() => {
      setIsPlaying(false);
    });
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      {/* The Two-Column Playground Console (Exact ElevenLabs style) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/[0.04] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[390px]">

          {/* ========================================================================= */}
          {/* LEFT PANEL: VOICES LIST (Right in RTL, or LTR aligned with screenshot)    */}
          {/* ========================================================================= */}
          <div className="md:col-span-5 p-5 sm:p-6 border-b md:border-b-0 md:border-l border-slate-100 flex flex-col justify-between bg-slate-50/40">

            {/* Voices List */}
            <div className="space-y-1.5">
              {currentPageVoices.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;

                if (isSelected) {
                  return (
                    <div
                      key={voice.id}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white shadow-xs border border-slate-200/80 transition-all cursor-pointer"
                      onClick={() => handleSelectVoice(voice)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar with black checkmark badge */}
                        <div className="relative shrink-0">
                          <div
                            className="w-10 h-10 rounded-full shadow-inner border border-white"
                            style={{ background: voice.avatarGradient }}
                          />
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-950 text-white flex items-center justify-center text-[9px] border border-white font-bold">
                            ✓
                          </span>
                        </div>

                        {/* Name & Subtitle */}
                        <div className="min-w-0 text-right">
                          <div className="font-bold text-sm text-slate-900 truncate">
                            {voice.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {voice.role} • {voice.dialect}
                          </div>
                        </div>
                      </div>

                      {/* Play Button Icon on Selected Row */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePlay();
                        }}
                        className="w-9 h-9 rounded-full bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm cursor-pointer mr-2"
                        title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  );
                }

                // Inactive Voice Row
                return (
                  <div
                    key={voice.id}
                    onClick={() => handleSelectVoice(voice)}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-white/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                        style={{ background: voice.avatarGradient }}
                      />

                      {/* Name */}
                      <span className="font-semibold text-sm text-slate-800 group-hover:text-slate-950 transition-colors truncate">
                        {voice.name}
                      </span>
                    </div>

                    {/* Role Label */}
                    <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors shrink-0 mr-2 text-left">
                      {voice.role}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Controls of Voices Panel */}
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {/* Explore 1,000+ Voices Pill Button */}
              <button
                onClick={onExploreVoices}
                className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>استكشف +1,000 صوت</span>
                <span className="text-slate-400 text-[11px]">(Explore voices)</span>
              </button>

              {/* Pagination Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-slate-500 transition-colors ${
                    page === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:text-slate-900 cursor-pointer shadow-2xs border border-slate-200'
                  }`}
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-slate-500 transition-colors ${
                    page >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:text-slate-900 cursor-pointer shadow-2xs border border-slate-200'
                  }`}
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: TEXT AREA & CONTROLS (Left in RTL)                           */}
          {/* ========================================================================= */}
          <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between bg-white relative">

            {/* Textarea Input Area */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your own text... اكتب نصك هنا لتجربة الصوت العربي فوراً"
                rows={5}
                className="w-full h-full min-h-[190px] text-slate-800 text-base sm:text-lg leading-relaxed resize-none border-none focus:outline-none focus:ring-0 bg-transparent placeholder:text-slate-300 placeholder:font-light"
                dir="auto"
              />

              {/* Subtle Voice & Live Audio Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>الصوت المختار: <strong className="text-slate-700 font-semibold">{selectedVoice.name}</strong> ({selectedVoice.dialect})</span>
                </div>
                <span className="text-[11px]">{text.length} حرف</span>
              </div>
            </div>

            {/* Bottom Bar: Language Selector & Play Button */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3 relative">

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors cursor-pointer"
                >
                  <span className="text-sm leading-none">{selectedLang.flag}</span>
                  <span>{selectedLang.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showLangMenu && (
                  <div className="absolute bottom-full mb-2 right-0 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-right transition-colors cursor-pointer ${
                          selectedLang.code === lang.code
                            ? 'bg-slate-100 font-bold text-slate-900'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {selectedLang.code === lang.code && (
                          <Check className="w-3.5 h-3.5 text-slate-900" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Play Button */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-8 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 active:scale-95 text-white text-sm font-bold shadow-md shadow-slate-950/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>إيقاف</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play / تشغيل</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
