import React, { useState, useRef } from 'react';
import { Play, Pause, Heart, Sparkles, User, ArrowLeft, Check, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { GlassyVoiceOrb } from './GlassyVoiceOrb';
import { useNavigate } from 'react-router-dom';
import { dialectOf } from '../data/dialects';
import { useSiteLists } from '../lib/siteLists';
import type { UnifiedVoiceItem } from '../data/humanVoices';
import { useHumanVoices, realSampleUrl } from '../lib/humanVoices';
import { buildSampleSlug } from './VoiceLibraryView';

interface HumanVoiceDemoItem {
  id: string;
  name: string;
  talentName: string;
  sampleName: string;
  voiceDescription: string;
  gender: 'male' | 'female' | 'child';
  ageRange: 'شبابي' | 'متوسط' | 'ناضج وقور';
  dialect: string;
  flag: string;
  style: string;
  glassGradient: string;
  sampleQuote: string;
  subtitle: string;
  previewUrl: string;
  avatar: string;
  hasAiTwin?: boolean;
  trustYears?: string;
}

const AGE_FROM_RANGE: Record<string, HumanVoiceDemoItem['ageRange']> = {
  '20-30 سنة': 'شبابي', '30-40 سنة': 'متوسط', '40-50 سنة': 'ناضج وقور', 'شبابي': 'شبابي', 'متوسط': 'متوسط', 'ناضج وقور': 'ناضج وقور'
};

/** Library sample -> home card (same voices and booking pages as the voice library). */
const toCard = (v: UnifiedVoiceItem): HumanVoiceDemoItem & { sample: UnifiedVoiceItem } => ({
  id: v.id,
  name: v.sampleName || v.name,   // clip name like the voice library; narrator names are never shown
  talentName: '',
  sampleName: v.sampleName || v.name,
  voiceDescription: v.subtitle,
  gender: v.gender,
  ageRange: AGE_FROM_RANGE[v.ageRange || ''] || 'متوسط',
  dialect: v.accent,
  flag: v.flag,
  style: v.category,
  glassGradient: v.glassGradient,
  sampleQuote: v.quote || v.subtitle,
  subtitle: v.subtitle,
  previewUrl: v.previewUrl,
  avatar: '',
  trustYears: v.trustYears ? `${parseInt(v.trustYears, 10)} سنوات` : undefined,
  sample: v
});

const HOME_CARDS = 8;

// Same dialects as the human voices library page
// Same age labels as the library filters
const AGE_LABELS: Record<string, string> = { 'شبابي': 'شاب', 'متوسط': 'متوسط العمر', 'ناضج وقور': 'كبير السن' };


interface HumanVoicesSectionProps {
  onExploreLibrary: () => void;
}

export const HumanVoicesSection: React.FC<HumanVoicesSectionProps> = ({
  onExploreLibrary
}) => {
  const navigate = useNavigate();
  const allVoices = useHumanVoices().map(toCard);
  // Dialects from the dashboard (اللهجات واللغات)
  const DIALECT_FILTERS = [{ key: 'all', label: 'الكل (1,000+)' }, ...useSiteLists().dialects.map(d => ({ key: d.key, label: `${d.flag} ${d.key}` }))];
  const [selectedDialect, setSelectedDialect] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePlayVoice = (voice: HumanVoiceDemoItem) => {
    if (playingId === voice.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setPlayingId(voice.id);

    const file = realSampleUrl(voice.previewUrl);
    if (file) {
      const audio = new Audio(file);
      audioRef.current = audio;
      audio.play().catch(() => setPlayingId(null));
      audio.onended = () => setPlayingId(null);
    } else if ('speechSynthesis' in window) {   // no sample uploaded yet in the dashboard
      const utterance = new SpeechSynthesisUtterance(voice.sampleQuote);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      const audio = new Audio(voice.previewUrl);
      audioRef.current = audio;
      audio.play().catch(() => setPlayingId(null));
      audio.onended = () => setPlayingId(null);
    }
  };

  const filteredVoices = selectedDialect === 'all'
    ? allVoices.slice(0, HOME_CARDS)
    : allVoices.filter(v => dialectOf(v.dialect, v.flag) === selectedDialect).slice(0, HOME_CARDS);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" dir="rtl">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            أصوات حقيقية تمنح علامتك المصداقية.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            استكشف نخبة المعلقين الصوتيين العرب المحترفين المعتمدين، واستمع لنماذج استوديو بدقة احترافية مع إمكانية الحجز المباشر أو الاستماع لتجربة AI قبل الحجز
          </p>
        </div>

        <button
          onClick={onExploreLibrary}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-brand-text group transition-colors self-start md:self-auto cursor-pointer"
        >
          <span>تصفح الأصوات البشرية</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>

      {/* Dialect Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 pl-2 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>تصفية باللهجة:</span>
        </div>
        {DIALECT_FILTERS.map(filter => (
          <button
            key={filter.key}
            onClick={() => setSelectedDialect(filter.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDialect === filter.key
                ? 'bg-brand-ink text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredVoices.length === 0 && (
        <div className="text-center text-sm text-slate-500 py-10 border border-dashed border-slate-200 rounded-2xl">
          لا توجد عينات بهذه اللهجة هنا، تصفّح المكتبة الكاملة لمزيد من الأصوات.
        </div>
      )}

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredVoices.map(voice => {
          const isPlaying = playingId === voice.id;
          const isFav = !!favorites[voice.id];

          return (
            <div
              key={voice.id}
              className={`group bg-white rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-900/5 ${
                isPlaying ? 'border-brand ring-1 ring-brand/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Top: Avatar & Info */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {/* Voice Glassy Orb Avatar (Matching Voices Page) */}
                    <GlassyVoiceOrb
                      gradient={voice.glassGradient}
                      voiceId={voice.id}
                      isPlaying={isPlaying}
                      isVerified={true}
                      onTogglePlay={(e) => {
                        e.stopPropagation();
                        handlePlayVoice(voice);
                      }}
                      size="lg"
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-text transition-colors">
                          {voice.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>{voice.flag}</span>
                        <span className="font-medium text-slate-700">{dialectOf(voice.dialect, voice.flag)}</span>
                        <span>•</span>
                        <span>{voice.gender === 'female' ? 'نسائي' : voice.gender === 'child' ? 'طفل' : 'رجالي'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Favorite Toggle */}
                  <button
                    onClick={() => toggleFavorite(voice.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>موثوق منذ {voice.trustYears || '6 سنوات'}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    {AGE_LABELS[voice.ageRange]}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/50 font-medium">
                    {voice.style}
                  </span>
                </div>

              </div>

              {/* Card Bottom: book button only */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/ar/voices/${buildSampleSlug(voice.sample)}`)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                >
                  احجز الصوت
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
