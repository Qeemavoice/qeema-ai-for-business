import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowUpLeft } from 'lucide-react';
import { LiquidLogo } from './LiquidLogo';

export interface VoiceStyleItem {
  key: string;
  title: string;
  desc: string;
  audioUrl: string;
  quote: string;
  variant: number;
}

/** Production styles shown in the home player; samples are real client works from public/stories. */
export const VOICE_STYLE_ITEMS: VoiceStyleItem[] = [
  { key: 'ads', title: 'إعلانات تجارية', desc: 'أصوات مقنعة تحرّك الجمهور وترسّخ العلامة في الذاكرة.', audioUrl: '/stories/food-mcdonalds-saudi.mp3', quote: 'إعلان تجاري سعودي', variant: 1 },
  { key: 'documentary', title: 'وثائقي', desc: 'سرد رصين يمنح القصة عمقها وهيبتها.', audioUrl: '/stories/documentary-king-khalid-airport.m4a', quote: 'فيلم وثائقي', variant: 2 },
  { key: 'education', title: 'تعليمي وشرح', desc: 'نبرة واضحة تبسّط المعلومة للطلاب والمتدربين.', audioUrl: '/stories/education-alfajr-albasim.mp3', quote: 'محتوى تعليمي', variant: 3 },
  { key: 'ivr', title: 'رد آلي IVR', desc: 'ترحيب احترافي يرافق عملاءك في كل اتصال.', audioUrl: '/stories/aviation-salamair-ivr.m4a', quote: 'رد آلي لشركة طيران', variant: 0 },
  { key: 'corporate', title: 'مؤسسي وتعريفي', desc: 'صوت موثوق يعكس هوية الجهة ورسالتها.', audioUrl: '/stories/banking-palestine-islamic-bank.m4a', quote: 'فيديو تعريفي لبنك', variant: 2 },
  { key: 'media', title: 'إعلامي وإذاعي', desc: 'حضور إذاعي دافئ للبرامج والبودكاست.', audioUrl: '/stories/media-makkah-sajaya.mp3', quote: 'برنامج إعلامي', variant: 3 },
];

interface Props {
  items: VoiceStyleItem[];
  index: number;
  onSelect: (i: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  audio: HTMLAudioElement | null;
  currentTime: number;
  duration: number;
  onSeek: (pct: number) => void;
  onOpen: (item: VoiceStyleItem) => void;
}

const useNarrow = () => {
  const q = '(max-width: 640px)';
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return narrow;
};

export const VoiceStyleCarousel: React.FC<Props> = ({ items, index, onSelect, isPlaying, onTogglePlay, audio, currentTime, duration, onSeek, onOpen }) => {
  const narrow = useNarrow();
  const n = items.length;
  const go = (step: number) => onSelect((index + step + n) % n);
  const sizes = narrow ? [190, 104, 70] : [250, 170, 120];
  const gap = narrow ? 36 : 27;        // % of width between neighbours
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="relative rounded-3xl bg-[#f5f3f1] border border-slate-200/70 overflow-hidden select-none" dir="rtl">
      {/* Stage */}
      <div className="relative h-[300px] sm:h-[330px]">
        {items.map((item, i) => {
          let off = i - index;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          if (abs > 2) return null;
          const size = sizes[abs];
          const center = off === 0;
          return (
            <div
              key={item.key}
              className="absolute top-[42%] transition-all duration-500 ease-out"
              style={{
                right: `calc(50% + ${off * gap}%)`,
                transform: `translate(50%, -50%)`,
                opacity: abs === 2 ? .45 : 1,
                zIndex: 10 - abs,
                filter: abs === 2 ? 'blur(1.5px)' : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => (center ? onTogglePlay() : onSelect(i))}
                className="relative block cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-slate-900"
                aria-label={center ? (isPlaying ? 'إيقاف العينة' : `تشغيل عينة ${item.title}`) : `اختيار ${item.title}`}
              >
                <LiquidLogo variant={item.variant} size={size} live={center} playing={center && isPlaying} audio={center ? audio : null} spray={center} />
                {center && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-white shadow-lg shadow-slate-900/15 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
                      {isPlaying ? <Pause className="w-5 h-5 fill-slate-950 text-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 text-slate-950 ml-0.5" />}
                    </span>
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Labels row: previous / centre / next, like the reference */}
      <div className="relative grid grid-cols-[1fr_auto_minmax(0,1.3fr)_auto_1fr] items-start gap-2 px-4 sm:px-8 -mt-10 pb-6 text-center">
        <Label item={items[(index - 1 + n) % n]} muted hidden={narrow} onClick={() => go(-1)} />
        <button type="button" onClick={() => go(-1)} className="mt-1 p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white/70 cursor-pointer" aria-label="السابق">
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <button type="button" onClick={() => onOpen(items[index])} className="inline-flex items-center gap-1 text-sm sm:text-base font-bold text-slate-950 hover:text-brand-text cursor-pointer">
            {items[index].title}
            <ArrowUpLeft className="w-3.5 h-3.5" />
          </button>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{items[index].desc}</p>
          <div
            className={`mt-3 mx-auto max-w-[220px] h-1 rounded-full bg-slate-200 overflow-hidden cursor-pointer transition-opacity ${isPlaying || currentTime > 0 ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              onSeek(Math.max(0, Math.min(1, (r.right - e.clientX) / r.width)));
            }}
          >
            <div className="h-full bg-slate-900 rounded-full mr-0 ml-auto transition-[width] duration-150" style={{ width: `${pct}%`, marginRight: 0 }} />
          </div>
        </div>
        <button type="button" onClick={() => go(1)} className="mt-1 p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white/70 cursor-pointer" aria-label="التالي">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <Label item={items[(index + 1) % n]} muted hidden={narrow} onClick={() => go(1)} />
      </div>
    </div>
  );
};

const Label: React.FC<{ item: VoiceStyleItem; muted?: boolean; hidden?: boolean; onClick: () => void }> = ({ item, hidden, onClick }) =>
  hidden ? <span /> : (
    <button type="button" onClick={onClick} className="min-w-0 text-center cursor-pointer group">
      <span className="block text-sm font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">{item.title}</span>
      <span className="block text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{item.desc}</span>
    </button>
  );
