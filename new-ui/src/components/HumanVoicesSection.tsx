import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Heart, Pause, Play, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Voice } from '../types';
import { GlassyVoiceOrb } from './GlassyVoiceOrb';

const DIALECT_FILTERS = [
  { key: 'all', label: 'كل اللهجات' },
  { key: 'gulf', label: '🇸🇦 خليجي' },
  { key: 'egyptian', label: '🇪🇬 مصري' },
  { key: 'levantine', label: '🇸🇾 شامي' },
  { key: 'fusha', label: '🌍 فصحى' },
  { key: 'maghrebi', label: '🇲🇦 مغاربي' },
];

const VOICE_GRADIENTS = [
  'radial-gradient(circle at 30% 30%, #1e3a8a 0%, #172554 60%, #030712 100%)',
  'radial-gradient(circle at 30% 30%, #be123c 0%, #881337 60%, #4c0519 100%)',
  'radial-gradient(circle at 30% 30%, #065f46 0%, #064e3b 60%, #022c22 100%)',
  'radial-gradient(circle at 30% 30%, #6d28d9 0%, #4c1d95 60%, #2e1065 100%)',
];

interface HumanVoicesSectionProps {
  voices: Voice[];
  onSelectVoice: (voice: Voice) => void;
  onExploreLibrary: () => void;
}

export const HumanVoicesSection: React.FC<HumanVoicesSectionProps> = ({ voices, onSelectVoice, onExploreLibrary }) => {
  const [selectedDialect, setSelectedDialect] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const humanVoices = useMemo(
    () => voices.filter((voice) => voice.type === 'human' && voice.isActive),
    [voices]
  );

  const filteredVoices = useMemo(() => {
    const result = selectedDialect === 'all'
      ? humanVoices
      : humanVoices.filter((voice) => voice.dialect === selectedDialect);
    return result.slice(0, 8);
  }, [humanVoices, selectedDialect]);

  const handlePlayVoice = (voice: Voice) => {
    if (!voice.previewUrl) return;
    if (playingId === voice.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    audioRef.current?.pause();
    const audio = new Audio(voice.previewUrl);
    audioRef.current = audio;
    setPlayingId(voice.id);
    audio.play().catch(() => setPlayingId(null));
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            أصوات بشرية حقيقية تمنح علامتك المصداقية.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            هذه العينات لمعلقين صوتيين حقيقيين من مكتبة قيمة فويس، وليست أصواتاً مولدة بالذكاء الاصطناعي.
          </p>
        </div>

        <button onClick={onExploreLibrary} className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-[#FF5500] group transition-colors self-start md:self-auto cursor-pointer">
          <span>تصفح كافة الأصوات البشرية ({humanVoices.length})</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 pl-2 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>تصفية باللهجة:</span>
        </div>
        {DIALECT_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setSelectedDialect(filter.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedDialect === filter.key ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredVoices.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          لا توجد أصوات بشرية منشورة لهذه اللهجة حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredVoices.map((voice, index) => {
            const isPlaying = playingId === voice.id;
            const isFavorite = Boolean(favorites[voice.id]);
            const description = voice.description || voice.subtitle || voice.styleLabel || 'معلق صوتي بشري محترف';

            return (
              <article key={voice.id} className={`group bg-white rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-900/5 ${isPlaying ? 'border-[#FF5500] ring-1 ring-[#FF5500]/30' : 'border-slate-200 hover:border-slate-300'}`}>
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <GlassyVoiceOrb
                        gradient={voice.glassGradient || VOICE_GRADIENTS[index % VOICE_GRADIENTS.length]}
                        isPlaying={isPlaying}
                        isVerified={voice.isVerified !== false}
                        onTogglePlay={(event) => { event.stopPropagation(); handlePlayVoice(voice); }}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#FF5500] transition-colors truncate">{voice.name}</h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          {voice.flag && <span>{voice.flag}</span>}
                          <span className="font-medium text-slate-700 truncate">{voice.dialectLabel}</span>
                          <span>•</span>
                          <span>{voice.gender === 'female' ? 'أنثوي' : 'رجالي'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFavorites((current) => ({ ...current, [voice.id]: !current[voice.id] }))}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3" title={description}>{description}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> معلّق من مكتبة قيمة فويس
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/50 font-medium">{voice.styleLabel || 'تعليق صوتي'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handlePlayVoice(voice)}
                    disabled={!voice.previewUrl}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${!voice.previewUrl ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : isPlaying ? 'bg-slate-950 text-white cursor-pointer' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer'}`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{!voice.previewUrl ? 'لا توجد عينة' : isPlaying ? 'إيقاف' : 'استماع للنموذج'}</span>
                  </button>
                  <button onClick={() => onSelectVoice(voice)} className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95">
                    احجز الصوت
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
