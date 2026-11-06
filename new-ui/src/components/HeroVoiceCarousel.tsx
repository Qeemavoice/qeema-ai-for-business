import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { Voice } from '../types';

interface HeroVoiceCarouselProps {
  voices: Voice[];
  selectedVoiceId?: string;
  isPlaying: boolean;
  onSelect: (voice: Voice) => void;
  onTogglePlay: () => void;
}

const visuals = [
  { video: '/new-ui/voice-visuals/logo_liquid_lilac.mp4', label: 'سرد قصصي' },
  { video: '/new-ui/voice-visuals/logo_liquid_ember.mp4', label: 'إعلانات' },
  { video: '/new-ui/voice-visuals/logo_liquid_grove.mp4', label: 'تعليمي' },
  { video: '/new-ui/voice-visuals/logo_liquid_garnet.mp4', label: 'شخصيات' },
] as const;

export const HeroVoiceCarousel: React.FC<HeroVoiceCarouselProps> = ({
  voices,
  selectedVoiceId,
  isPlaying,
  onSelect,
  onTogglePlay,
}) => {
  const available = useMemo(() => voices.filter((voice) => voice.previewUrl).slice(0, 8), [voices]);
  const activeIndex = Math.max(0, available.findIndex((voice) => voice.id === selectedVoiceId));

  if (!available.length) {
    return (
      <div className="grid min-h-72 place-items-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
        ستظهر هنا الأصوات بعد نشر عيناتها من لوحة الإدارة.
      </div>
    );
  }

  const selectAt = (index: number) => onSelect(available[(index + available.length) % available.length]);
  const visible = [-1, 0, 1].map((offset) => {
    const index = (activeIndex + offset + available.length) % available.length;
    return { voice: available[index], index, offset, visual: visuals[index % visuals.length] };
  });
  const activeVoice = available[activeIndex];

  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-[#f7f7f5] shadow-sm" aria-label="معاينة أنواع الأصوات البشرية">
      <div className="flex gap-1 border-b border-slate-200 bg-white/70 p-1.5">
        {available.slice(0, 4).map((voice, index) => (
          <button
            key={voice.id}
            type="button"
            onClick={() => onSelect(voice)}
            className={`min-w-0 flex-1 rounded-2xl px-3 py-2.5 text-xs font-bold transition ${voice.id === activeVoice.id ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'}`}
          >
            <span className="flex items-center justify-center gap-2 truncate">
              <span className={`h-2 w-2 shrink-0 rounded-full ${['bg-violet-500', 'bg-orange-500', 'bg-emerald-500', 'bg-rose-500'][index]}`} />
              <span className="truncate">{voice.name}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 px-2 py-6 sm:px-4">
        <button type="button" onClick={() => selectAt(activeIndex - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-[#FF5500]" aria-label="الصوت السابق">
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="grid min-w-0 grid-cols-1 items-center gap-3 md:grid-cols-[.76fr_1.35fr_.76fr]">
          {visible.map(({ voice, index, offset, visual }) => {
            const active = offset === 0;
            return (
              <article key={`${voice.id}-${offset}`} className={`${active ? 'block' : 'hidden md:block'} min-w-0 text-center transition-all duration-500 ${active ? '-translate-y-1 opacity-100' : 'scale-90 opacity-55 hover:opacity-80'}`}>
                <button
                  type="button"
                  onClick={() => active ? onTogglePlay() : onSelect(voice)}
                  className={`group relative mx-auto block w-full overflow-hidden rounded-[28px] border bg-black shadow-xl transition ${active ? 'aspect-[4/3] max-w-[390px] border-slate-300 shadow-slate-900/15' : 'aspect-square max-w-[230px] border-slate-200 shadow-slate-900/5'}`}
                  aria-label={active && isPlaying ? `إيقاف عينة ${voice.name}` : `تشغيل عينة ${voice.name}`}
                >
                  <video src={visual.video} muted autoPlay loop playsInline preload={active ? 'auto' : 'metadata'} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" aria-hidden="true" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/5" />
                  {active && (
                    <span className={`absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/60 shadow-2xl backdrop-blur-md transition group-hover:scale-105 ${isPlaying ? 'bg-[#FF5500] text-white' : 'bg-white/90 text-slate-950'}`}>
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 p-4 text-right text-white">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] font-bold backdrop-blur-md"><Sparkles className="h-3 w-3 text-orange-300" /> {voice.styleLabel || visual.label}</span>
                  </span>
                </button>
                <button type="button" onClick={() => onSelect(voice)} className="mt-3 max-w-full text-center">
                  <strong className={`block truncate font-black text-slate-900 ${active ? 'text-base' : 'text-sm'}`}>{voice.name}</strong>
                  <span className="mt-1 block truncate text-xs text-slate-500">{voice.dialectLabel} · {voice.gender === 'female' ? 'صوت نسائي' : 'صوت رجالي'}</span>
                </button>
              </article>
            );
          })}
        </div>

        <button type="button" onClick={() => selectAt(activeIndex + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-[#FF5500]" aria-label="الصوت التالي">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-slate-200 bg-white/50 px-4 py-3">
        {available.map((voice, index) => (
          <button key={voice.id} type="button" onClick={() => onSelect(voice)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-7 bg-[#FF5500]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'}`} aria-label={`اختيار ${voice.name}`} />
        ))}
      </div>
    </section>
  );
};

