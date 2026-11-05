import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, X, Play, Pause } from 'lucide-react';
import { fmtDuration } from '../../lib/format';

export const TONES = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  orange: 'bg-orange-50 text-[#FF5500] border-orange-200'
} as const;
export type Tone = keyof typeof TONES;

export const Badge: React.FC<{ tone?: Tone; children: React.ReactNode; className?: string }> = ({ tone = 'slate', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${TONES[tone]} ${className}`}>{children}</span>
);

export const StatCard: React.FC<{ label: string; value: React.ReactNode; hint?: string; tone?: Tone }> = ({ label, value, hint, tone = 'slate' }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
    <p className="text-[11px] font-semibold text-slate-500">{label}</p>
    <p className={`mt-1 text-2xl font-black font-mono ${tone === 'green' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : tone === 'red' ? 'text-rose-600' : tone === 'orange' ? 'text-[#FF5500]' : 'text-slate-900'}`}>{value}</p>
    {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
  </div>
);

export const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{children}</button>
);

export const ExcelButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40" title="تصدير البيانات الظاهرة إلى ملف Excel">
    <Download className="w-4 h-4" /><span>تصدير Excel</span>
  </button>
);

export const Pager: React.FC<{ page: number; pages: number; total: number; onPage: (p: number) => void }> = ({ page, pages, total, onPage }) => (
  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
    <span>المجموع ({total})</span>
    <div className="flex items-center gap-1.5">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
      <span className="px-3 py-1 rounded-lg bg-[#FF5500] text-white font-bold">{page}</span>
      <span className="text-slate-400">/ {pages}</span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
    </div>
  </div>
);

/** Side drawer that opens from the left edge (the admin UI is RTL, the sidebar is on the right). */
export const Drawer: React.FC<{ title: React.ReactNode; subtitle?: React.ReactNode; onClose: () => void; children: React.ReactNode; width?: string }> = ({ title, subtitle, onClose, children, width = 'max-w-2xl' }) => (
  <div className="fixed inset-0 z-50 flex justify-start" dir="rtl">
    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
    <aside className={`relative w-full ${width} bg-white h-full shadow-2xl flex flex-col mr-auto`} style={{ marginRight: 'auto', marginLeft: 0 }}>
      <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h3 className="text-base font-black text-slate-900 truncate">{title}</h3>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  </div>
);

export const Tabs: React.FC<{ tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }> = ({ tabs, active, onChange }) => (
  <div className="flex items-center gap-1 border-b border-slate-200 px-6 overflow-x-auto shrink-0 bg-white sticky top-0 z-10">
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} className={`px-3.5 py-3 text-xs font-bold border-b-2 -mb-px whitespace-nowrap cursor-pointer ${active === t.id ? 'border-[#FF5500] text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
        {t.label}{t.count !== undefined && <span className="mr-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono">{t.count}</span>}
      </button>
    ))}
  </div>
);

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0 text-xs">
    <span className="text-slate-500 font-semibold shrink-0">{label}</span>
    <span className="text-slate-900 font-semibold text-left min-w-0 break-words">{children}</span>
  </div>
);

/* ---------------- audio sample player (one sample plays at a time) ---------------- */
let currentAudio: HTMLAudioElement | null = null;

export const SamplePlayer: React.FC<{ url: string; durationSec?: number; compact?: boolean }> = ({ url, durationSec, compact }) => {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => () => { ref.current?.pause(); if (currentAudio === ref.current) currentAudio = null; }, []);

  const toggle = () => {
    if (!ref.current) {
      const a = new Audio(url);
      a.ontimeupdate = () => { setCurrent(a.currentTime); setProgress(a.duration ? a.currentTime / a.duration : 0); };
      a.onended = () => { setPlaying(false); setProgress(0); setCurrent(0); };
      a.onerror = () => { setPlaying(false); setError(true); };
      ref.current = a;
    }
    const a = ref.current;
    if (playing) { a.pause(); setPlaying(false); return; }
    if (currentAudio && currentAudio !== a) currentAudio.pause();
    currentAudio = a;
    setError(false);
    a.play().then(() => setPlaying(true)).catch(() => setError(true));
    a.onpause = () => setPlaying(false);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // RTL: the bar fills from the right
    const ratio = Math.min(1, Math.max(0, (rect.right - e.clientX) / rect.width));
    a.currentTime = ratio * a.duration;
  };

  return (
    <div className={`flex items-center gap-2.5 ${compact ? 'min-w-[150px]' : 'w-full'}`}>
      <button onClick={toggle} className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${playing ? 'bg-[#FF5500] text-white' : 'bg-slate-100 hover:bg-[#FF5500] hover:text-white text-slate-700'}`} title={playing ? 'إيقاف' : 'استماع'}>
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden cursor-pointer" onClick={seek} dir="rtl">
          <div className="h-full bg-[#FF5500] rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono" dir="ltr">
          <span>{fmtDuration(Math.floor(current))}</span>
          <span>{error ? 'تعذر تشغيل الملف' : fmtDuration(durationSec)}</span>
        </div>
      </div>
    </div>
  );
};
