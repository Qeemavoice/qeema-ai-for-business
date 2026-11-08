import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Play, Pause, Check, Search } from 'lucide-react';
import { useHumanVoices } from '../../lib/humanVoices';

const norm = (s: string) => s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/\s+/g, '').trim();

/**
 * «اختر من مكتبة الأصوات»: suggests library samples whose category matches the player item's title (e.g. «إعلانات»),
 * most used first; picking one fills the clip (audioUrl) instead of uploading a file. A search box widens the list.
 */
export const LibrarySamplePicker: React.FC<{ category: string; selectedId?: string; onPick: (v: { id: string; previewUrl: string; name: string }) => void }> = ({ category, selectedId, onPick }) => {
  const voices = useHumanVoices();
  const [q, setQ] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { audio.current?.pause(); }, []);

  const list = useMemo(() => {
    const cat = norm(category || '');
    const term = norm(q);
    const tagsOf = (v: any): string[] => [v.category, ...(Array.isArray(v.tags) ? v.tags : [])].filter(Boolean).map((t: string) => norm(String(t)));
    return voices
      .filter(v => v.previewUrl)
      .filter(v => term ? norm(`${v.name} ${v.accent} ${tagsOf(v).join(' ')}`).includes(term)
        : cat ? tagsOf(v).some(t => t.includes(cat) || cat.includes(t)) : true)
      .sort((a, b) => (Number(b.usageCount) || 0) - (Number(a.usageCount) || 0))
      .slice(0, 12);
  }, [voices, category, q]);

  const toggle = (id: string, url: string) => {
    if (playing === id) { audio.current?.pause(); setPlaying(null); return; }
    audio.current?.pause();
    audio.current = new Audio(url);
    audio.current.onended = () => setPlaying(null);
    audio.current.play().catch(() => setPlaying(null));
    setPlaying(id);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700">اختر من مكتبة الأصوات {category ? `(مقترحة لتصنيف «${category}»)` : ''}</span>
        <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث في المكتبة" className="bg-transparent outline-hidden w-32" />
        </label>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
        {list.length === 0 && <p className="p-4 text-center text-xs text-slate-400">لا توجد أصوات مطابقة. اكتب التصنيف في العنوان (مثل: إعلانات) أو ابحث بالاسم.</p>}
        {list.map(v => {
          const on = v.id === selectedId;
          return (
            <div key={v.id} className={`flex items-center gap-3 px-3 py-2 text-xs ${on ? 'bg-orange-50' : ''}`}>
              <button type="button" onClick={() => toggle(v.id, v.previewUrl)} aria-label={playing === v.id ? 'إيقاف' : 'استماع'}
                className="w-8 h-8 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer">
                {playing === v.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 truncate">{v.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{[v.accent, ...(Array.isArray(v.tags) ? v.tags : [])].filter(Boolean).join(' · ')}</div>
              </div>
              <button type="button" onClick={() => onPick({ id: v.id, previewUrl: v.previewUrl, name: v.name })}
                className={`shrink-0 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${on ? 'bg-brand text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                {on ? <><Check className="w-3.5 h-3.5" />مختار</> : 'اختيار'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
