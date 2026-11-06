import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Volume2, Download, RefreshCw, Loader2, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import type { Generation, Voice } from '../types';
import { api } from '../lib/api';
import { arLabel, useMunsitVoices } from '../lib/studioVoices';

/**
 * Signed-in TTS studio: our voices plus the Munsit catalogue (the other developer's work),
 * with his controls (dialect filter and steering, diacritics, emotion, speed). Generation goes
 * through /api/v1/generations, so credits, history and narrator earnings stay on our ledger.
 * Layout: text, voice dropdown and controls on the right, the audio preview on the left.
 */
interface StudioVoice { id: string; name: string; dialect: string; gender: string; style: string; description: string; previewUrl: string; munsit: boolean }

const ar = arLabel;

const EMOTIONS = [['none', 'النبرة الطبيعية'], ['happy', 'سعيد'], ['excited', 'حماسي'], ['calm', 'هادئ'], ['serious', 'جاد'], ['sad', 'حزين'], ['fearful', 'خائف'], ['angry', 'غاضب']];

export const TtsStudioPanel: React.FC<{ voices: Voice[]; onGenerated?: (newBalance: number) => void }> = ({ voices, onGenerated }) => {
  const munsit: StudioVoice[] = useMunsitVoices().map(v => ({ ...v, munsit: true }));
  const all: StudioVoice[] = useMemo(() => [
    ...voices.filter(v => v.type === 'ai' && v.isActive !== false).map(v => ({
      id: v.id, name: v.name.replace(/\s*AI\b/g, '').trim(), dialect: v.dialectLabel || '', gender: v.gender, style: v.styleLabel || '',
      description: '', previewUrl: `/api/v1/voices/${v.id}/preview`, munsit: false,
    })),
    ...munsit,
  ], [voices, munsit]);

  const [dialectFilter, setDialectFilter] = useState('all');
  const dialects = useMemo(() => [...new Set(all.map(v => v.dialect).filter(Boolean))], [all]);
  const shown = dialectFilter === 'all' ? all : all.filter(v => v.dialect === dialectFilter);
  const [voiceId, setVoiceId] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!pickerOpen) return;
    const close = (e: MouseEvent) => { if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPickerOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [pickerOpen]);
  const voice = all.find(v => v.id === voiceId) || all[0];

  const [text, setText] = useState('مرحباً بك في قيمة فويس، حيث يتحول النص العربي إلى صوت واضح وطبيعي.');
  // Munsit picks the dialect through the voice; «emirati» and «fusha» are also sent as a hint
  const steering = ['emirati', 'fusha'].includes(dialectFilter) ? dialectFilter : 'auto';
  const pickDialect = (d: string) => {
    setDialectFilter(d === 'auto' ? 'all' : d);
    if (d !== 'auto' && voice?.dialect !== d) {
      const first = all.find(v => v.dialect === d);
      if (first) setVoiceId(first.id);
    }
  };
  // «شكّل النص»: the box shows the diacritized text, with undo
  const [diacritizing, setDiacritizing] = useState(false);
  const [undoText, setUndoText] = useState<string | null>(null);
  const diacritizeNow = async () => {
    setDiacritizing(true); setError('');
    try {
      const out = await api.diacritize(text);
      setUndoText(text); setText(out);
    } catch (e: any) {
      setError(e?.message || 'تعذر تشكيل النص الآن');
    } finally {
      setDiacritizing(false);
    }
  };
  const [emotion, setEmotion] = useState('none');
  const [speed, setSpeed] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Generation | null>(null);
  const [notice, setNotice] = useState('');
  // ElevenLabs answers MP3; Munsit and the internal engine answer WAV
  const format = result?.provider === 'elevenlabs' ? 'MP3' : 'WAV';
  const [history, setHistory] = useState<Generation[]>([]);
  const loadHistory = () => api.getGenerations().then(d => setHistory(d.generations.slice(0, 6))).catch(() => {});
  useEffect(() => { loadHistory(); }, []);

  // one audio element for the voice previews
  const preview = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  useEffect(() => () => preview.current?.pause(), []);
  const togglePreview = (v: StudioVoice) => {
    if (!preview.current) { preview.current = new Audio(); preview.current.onended = () => setPlayingId(null); }
    if (playingId === v.id) { preview.current.pause(); setPlayingId(null); return; }
    if (!v.previewUrl) return;
    preview.current.src = v.previewUrl;
    preview.current.play().then(() => setPlayingId(v.id)).catch(() => { setPlayingId(null); setError('تعذر تشغيل عينة الصوت. حاول مرة أخرى.'); });
  };

  const generate = async () => {
    const t = text.trim();
    if (!t) { setError('اكتب النص المراد تحويله إلى صوت أولاً.'); return; }
    if (!voice) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const res = await api.createGeneration({ voiceId: voice.id, text: t, settings: { emotion, dialect: steering, speed } });
      setResult(res.generation);
      setNotice(res.message || 'تم توليد الصوت بنجاح.');
      onGenerated?.(res.newBalanceCredits);
      loadHistory();
    } catch (e: any) {
      setError(e?.message || 'تعذر توليد الصوت الآن. حاول مرة أخرى بعد قليل.');
    } finally {
      setBusy(false);
    }
  };

  const select = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Text, voice and controls: right */}
        <div className="order-1 md:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !busy) { e.preventDefault(); generate(); } }}
              aria-label="النص المراد تحويله إلى صوت"
              placeholder="اكتب نصك هنا"
              maxLength={5000}
              className="w-full min-h-[170px] resize-y border-none bg-transparent text-base leading-relaxed text-slate-800 focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
              <span>الحد الأقصى 5,000 حرف</span>
              <span>{text.length} حرف<span className="hidden sm:inline text-slate-300"> · Ctrl + Enter للتوليد</span></span>
            </div>
          </div>

          {/* Voices: a dropdown under the text box */}
          <div ref={pickerRef} className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen(o => !o)}
              aria-expanded={pickerOpen}
              className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-right hover:border-slate-300 transition"
            >
              <span className="w-10 h-10 shrink-0 rounded-xl bg-slate-900 text-brand font-black flex items-center justify-center">{voice?.name.charAt(0).toUpperCase() || '?'}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-slate-500">الصوت · {all.length} صوت متاح</span>
                <span className="block text-sm font-bold text-slate-900 truncate">{voice?.name || 'اختر صوتاً'}</span>
                {voice && <span className="block text-[11px] text-slate-500 truncate">{[ar(voice.dialect), voice.gender === 'female' ? 'نسائي' : 'رجالي', ar(voice.style)].filter(Boolean).join(' · ')}</span>}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
            </button>
            {voice?.description && <p className="mt-1.5 px-1 text-[11px] text-slate-500 leading-relaxed line-clamp-2" dir="auto">{voice.description}</p>}
            {pickerOpen && (
              <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-2 space-y-2">
                <select value={dialectFilter} onChange={e => setDialectFilter(e.target.value)} className={select} aria-label="تصفية حسب اللهجة المسجلة للصوت">
                  <option value="all">كل اللهجات</option>
                  {dialects.map(d => <option key={d} value={d}>{ar(d)}</option>)}
                </select>
                <div className="max-h-72 overflow-y-auto overscroll-contain space-y-1.5">
            {shown.map(v => (
              <div
                key={v.id}
                onClick={() => { setVoiceId(v.id); setPickerOpen(false); }}
                className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer border transition ${voice?.id === v.id ? 'border-brand bg-white shadow-sm' : 'border-transparent bg-white/70 hover:bg-white'}`}
              >
                <span className="w-10 h-10 shrink-0 rounded-xl bg-slate-900 text-brand font-black flex items-center justify-center">{v.name.charAt(0).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900 truncate">{v.name}</span>
                  <span className="block text-[11px] text-slate-500 truncate">{[ar(v.dialect), v.gender === 'female' ? 'نسائي' : 'رجالي', ar(v.style)].filter(Boolean).join(' · ')}</span>
                </span>
                {v.previewUrl && (
                  <button type="button" onClick={e => { e.stopPropagation(); togglePreview(v); }} className="w-9 h-9 shrink-0 rounded-full bg-slate-950 text-white flex items-center justify-center" aria-label={playingId === v.id ? `إيقاف عينة ${v.name}` : `تشغيل عينة ${v.name}`}>
                    {playingId === v.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                )}
              </div>
            ))}
            {!shown.length && <p className="p-4 text-center text-xs text-slate-500">لا توجد أصوات بهذه اللهجة.</p>}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="block text-sm font-bold text-slate-900">اللهجة</span>
              <select value={dialectFilter === 'all' ? 'auto' : dialectFilter} onChange={e => pickDialect(e.target.value)} className={select}>
                <option value="auto">تلقائي حسب النص والصوت</option>
                {dialects.map(d => <option key={d} value={d}>{ar(d)} ({all.filter(v => v.dialect === d).length})</option>)}
              </select>
              <span className="block text-[11px] text-slate-500">اختيار اللهجة يعرض أصواتها في القائمة ويختار صوتاً منها.</span>
            </label>
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <span className="block text-sm font-bold text-slate-900">تشكيل النص قبل النطق</span>
              <span className="block text-[11px] text-slate-500">يضيف الحركات إلى نصك لتراجعه قبل التوليد. مناسب للفصحى.</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={diacritizeNow} disabled={diacritizing || !text.trim()} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5">
                  {diacritizing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {diacritizing ? 'جارٍ التشكيل...' : 'شكّل النص'}
                </button>
                {undoText !== null && <button type="button" onClick={() => { setText(undoText); setUndoText(null); }} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold">تراجع</button>}
              </div>
            </div>
            <label className="space-y-1.5">
              <span className="block text-sm font-bold text-slate-900">المشاعر والأداء</span>
              <select value={emotion} onChange={e => setEmotion(e.target.value)} className={select}>
                {EMOTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="flex items-center justify-between text-sm font-bold text-slate-900">السرعة <span className="font-mono text-xs text-slate-500">×{speed.toFixed(2)}</span></span>
              <input type="range" min={0.7} max={1.2} step={0.05} value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full accent-brand" />
            </label>
            {voice && !voice.munsit && <p className="sm:col-span-2 text-[11px] text-slate-500">المشاعر تعمل مع أصوات منصّت؛ السرعة والتشكيل تعمل مع كل الأصوات.</p>}
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={busy || !voice}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand hover:bg-brand-orange disabled:opacity-60 py-3.5 text-white font-bold shadow-md shadow-brand/25 transition"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
            {busy ? 'جارٍ التوليد...' : 'توليد الصوت'}
          </button>
        </div>

        {/* Audio preview: left */}
        <div className="order-2 md:col-span-5">
          <div className="md:sticky md:top-24">
          <div className="rounded-3xl bg-slate-950 text-white overflow-hidden">
            <div className="p-5 space-y-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-2xl bg-brand flex items-center justify-center"><Volume2 className="w-5 h-5" /></span>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">{format} بجودة كاملة</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">المعاينة الصوتية</h3>
                <p className="text-xs text-slate-400 mt-1">استمع للنتيجة ونزّل الملف أو أعد التوليد بالإعدادات نفسها.</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {result ? (
                <audio key={result.id} src={result.audioUrl} controls autoPlay className="w-full" />
              ) : (
                <p className="rounded-xl bg-white/5 px-4 py-3 text-xs text-slate-400 text-center">اكتب النص واختر الصوت ثم اضغط «توليد الصوت» لتظهر المعاينة هنا.</p>
              )}
              <a
                href={result?.audioUrl || undefined}
                download={result ? `qeema-voice-${result.id}.${format.toLowerCase()}` : undefined}
                aria-disabled={!result}
                className={`flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-950 py-3 text-sm font-bold ${result ? '' : 'opacity-40 pointer-events-none'}`}
              >
                <Download className="w-4 h-4" /> تنزيل {format}
              </a>
              <button type="button" onClick={generate} disabled={busy || !result} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-600 py-3 text-sm font-bold disabled:opacity-40">
                <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} /> توليد نسخة جديدة
              </button>
              {(error || notice) && (
                <p className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs ${error ? 'bg-red-500/10 text-red-300' : 'bg-emerald-400/10 text-emerald-300'}`} role="status">
                  {error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {error || notice}
                </p>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>


      {/* My recordings */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-black text-slate-950">تسجيلاتي</h2>
            <p className="text-xs text-slate-500">آخر التسجيلات التي ولّدتها، جاهزة للاستماع والتنزيل.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {history.map(g => (
              <div key={g.id} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <strong className="text-slate-900 truncate">{g.voiceName}</strong>
                  <a href={g.audioUrl} download={`qeema-voice-${g.id}`} className="text-brand-text font-bold flex items-center gap-1 shrink-0"><Download className="w-3.5 h-3.5" /> تنزيل</a>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{g.text}</p>
                <audio src={g.audioUrl} controls preload="none" className="w-full h-9" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
