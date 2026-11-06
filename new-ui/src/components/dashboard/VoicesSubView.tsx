import React, { useMemo, useState } from 'react';
import { Pause, Play, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Voice } from '../../types';

interface VoicesSubViewProps {
  voices: Voice[];
  playingVoiceId: string | null;
  onTogglePlayVoice: (voiceId: string) => void;
  onBookHumanVoice?: (voice: Voice) => void;
}

export const VoicesSubView: React.FC<VoicesSubViewProps> = ({
  voices,
  playingVoiceId,
  onTogglePlayVoice,
  onBookHumanVoice,
}) => {
  const [search, setSearch] = useState('');
  const [dialect, setDialect] = useState('all');
  const humanVoices = useMemo(() => voices.filter((voice) => voice.type === 'human' && voice.isActive), [voices]);
  const dialects = useMemo(() => Array.from(new Map(humanVoices.map((voice) => [voice.dialect, voice.dialectLabel])).entries()), [humanVoices]);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return humanVoices.filter((voice) => {
      const searchable = [voice.name, voice.dialectLabel, voice.styleLabel, voice.description].filter(Boolean).join(' ').toLocaleLowerCase();
      return (!term || searchable.includes(term)) && (dialect === 'all' || voice.dialect === dialect);
    });
  }, [humanVoices, search, dialect]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8" dir="rtl">
      <header>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800"><ShieldCheck className="h-3.5 w-3.5" /> أصوات بشرية معتمدة</span>
          <h1 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">اختر صوتك المناسب</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">استمع للعينات الأصلية، صفِّ الأصوات حسب اللهجة، ثم ابدأ التوليد أو أرسل طلب حجز.</p>
        </div>
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث باسم المعلق أو اللهجة أو الأسلوب" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-3 text-sm outline-none transition focus:border-[#FF5500] focus:bg-white focus:ring-4 focus:ring-orange-100" />
        </label>
        <label className="relative">
          <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select value={dialect} onChange={(event) => setDialect(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pr-10 pl-3 text-sm font-bold text-slate-700 outline-none focus:border-[#FF5500]">
            <option value="all">كل اللهجات</option>
            {dialects.map(([value, label]) => <option key={value} value={value || 'unknown'}>{label || 'غير محدد'}</option>)}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{filtered.length} صوت بشري</span>
        <span>المعاينة والحجز من داخل اللوحة</span>
      </div>

      {filtered.length ? <div className="space-y-3">
        {filtered.map((voice) => {
          const playing = playingVoiceId === voice.id;
          return <article key={voice.id} className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 transition sm:flex-row sm:items-center sm:px-5 ${playing ? 'border-[#FF5500] ring-2 ring-orange-100' : 'border-slate-200 hover:border-orange-200 hover:shadow-md'}`}>
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <img src={voice.avatar} alt={`صورة ${voice.name}`} className="h-16 w-16 shrink-0 rounded-2xl bg-slate-100 object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-black text-slate-950">{voice.name}</h2>
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-label="صوت بشري موثق" />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{voice.dialectLabel || 'لهجة عربية'} · {voice.styleLabel || 'تعليق صوتي'}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{voice.description || voice.subtitle || 'عينة صوتية أصلية لمعلق بشري.'}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2 sm:w-64">
              <button type="button" disabled={!voice.previewUrl} onClick={() => onTogglePlayVoice(voice.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:text-slate-400">
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {!voice.previewUrl ? 'لا توجد عينة' : playing ? 'إيقاف العينة' : 'استمع للعينة'}
              </button>
              <button type="button" onClick={() => onBookHumanVoice?.(voice)} className="flex-1 rounded-xl bg-[#FF5500] px-3 py-2.5 text-xs font-black text-white transition hover:bg-[#E34C00]">احجز هذا المعلق</button>
            </div>
          </article>;
        })}
      </div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">لا توجد أصوات بشرية مطابقة. جرّب البحث باسم مختلف أو اختر كل اللهجات.</div>}
    </div>
  );
};
