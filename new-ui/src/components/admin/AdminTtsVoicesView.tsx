import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Pencil, X, Info } from 'lucide-react';
import { narratorService } from '../../services/narratorService';
import type { Narrator } from '../../types';
import { Badge, SamplePlayer } from './adminUi';
import { UploadField } from './UploadField';
import { DIALECT_AR } from './AdminTtsView';
import { arLabel, useMunsitVoices } from '../../lib/studioVoices';

interface TtsVoice {
  id: string; name: string; gender: 'male' | 'female'; dialect: string; dialectLabel: string; styleLabel: string;
  provider: 'elevenlabs' | 'qeema_acoustic'; providerVoiceId?: string; previewUrl: string; avatar?: string;
  isActive: boolean; narratorId?: string; narratorSharePercent?: number; createdAt: string;
}

const API = '/api/v1/admin/tts-voices';
// own voices: the uploaded sample + its narrator (no ElevenLabs id); voices added earlier keep their provider
const EMPTY: Partial<TtsVoice> = { gender: 'male', dialect: 'gulf', isActive: true, narratorSharePercent: 40 };
const input = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:border-brand';

const send = async (url: string, method: string, body: unknown) => {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'تعذر الحفظ');
  return data;
};

/** Voices of the TTS studio: our own voices uploaded by the admin team, each owned by a narrator (internal only) who earns a share of each use. */
export const AdminTtsVoicesView: React.FC = () => {
  const [voices, setVoices] = useState<TtsVoice[]>([]);
  const [narrators, setNarrators] = useState<Narrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<TtsVoice> | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const load = async () => {
    try { setVoices((await (await fetch(API)).json()).voices); } finally { setLoading(false); }
  };
  useEffect(() => { load(); narratorService.getAllNarrators().then(setNarrators); }, []);

  const narratorName = (id?: string) => narrators.find(n => n.id === id)?.displayName;
  const toggle = async (v: TtsVoice) => { await send(`${API}/${v.id}`, 'PUT', { isActive: !v.isActive }); load(); };

  const munsit = useMunsitVoices();
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">أصوات استوديو TTS</h3>
            <p className="text-xs text-slate-400 mt-0.5">الأصوات الفعّالة يراها العملاء في استوديو التوليد باسم المقطع فقط، ولا يظهر لهم اسم المعلق أبداً</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGuide(!showGuide)} className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Info className="w-4 h-4" />كيف أضيف صوتًا؟</button>
            <button onClick={() => setEditing({ ...EMPTY })} className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Plus className="w-4 h-4" />إضافة صوت</button>
          </div>
        </div>

        {showGuide && (
          <ol className="px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs text-slate-600 leading-loose list-decimal pr-9">
            <li>جهّز العينة الصوتية من تسجيل المعلق (بموافقته الكتابية) بصيغة MP3.</li>
            <li>اضغط «إضافة صوت»، اكتب اسم المقطع (مثل: إعلان تجاري حماسي) واختر اللهجة والأسلوب.</li>
            <li>ارفع العينة واختر المعلق صاحب الصوت ونسبة أرباحه (اسم المعلق داخلي فقط ولا يظهر للعميل).</li>
            <li>بعد الحفظ يظهر الصوت في استوديو العملاء باسم المقطع، ويظهر للمعلق في «أصواتي في الاستوديو».</li>
          </ol>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px]">
                <th className="py-3 px-4 font-bold">المقطع</th>
                <th className="py-3 px-4 font-bold">اللهجة</th>
                <th className="py-3 px-4 font-bold">المعلق (داخلي)</th>
                <th className="py-3 px-4 font-bold">العينة</th>
                <th className="py-3 px-4 font-bold">الحالة</th>
                <th className="py-3 px-4 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && voices.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-slate-400">لا توجد أصوات</td></tr>}
              {voices.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {v.avatar ? <img src={v.avatar} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-200" /> : <span className="w-9 h-9 rounded-xl bg-brand-ink text-white flex items-center justify-center font-black">{v.name.charAt(0)}</span>}
                      <span><span className="font-bold text-slate-900 block">{v.name}</span><span className="text-[10px] text-slate-400">{v.gender === 'male' ? 'رجالي' : 'نسائي'} • {v.styleLabel}</span></span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{v.dialectLabel || DIALECT_AR[v.dialect] || v.dialect}</td>
                  <td className="py-3 px-4">{v.narratorId ? <><span className="font-bold text-slate-800 block">{narratorName(v.narratorId) || v.narratorId}</span><span className="text-[10px] text-emerald-600 font-bold">حصته {v.narratorSharePercent}%</span></> : <span className="text-rose-600 font-bold">لم يُحدَّد: اختر المعلق</span>}</td>
                  <td className="py-3 px-4 min-w-[170px]"><SamplePlayer url={v.previewUrl} compact /></td>
                  <td className="py-3 px-4"><Badge tone={v.isActive ? 'green' : 'slate'}>{v.isActive ? 'فعّال' : 'متوقف'}</Badge></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditing(v)} title="تعديل" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggle(v)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer">{v.isActive ? 'إيقاف' : 'تفعيل'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Munsit catalogue: read-only here (managed at Munsit; switch it on/off in «الإعدادات ← مزوّدو تحويل النص إلى صوت») */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">أصوات منصّت <span className="text-slate-400 font-mono">({munsit.length})</span></h3>
          <p className="text-xs text-slate-400 mt-0.5">تظهر للعملاء في استوديو التوليد بعد أصوات الجدول أعلاه. تُدار من حساب منصّت، وتفعيلها أو إيقافها من «الإعدادات ← مزوّدو تحويل النص إلى صوت».</p>
        </div>
        {munsit.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">منصّت غير مفعّل أو مفتاحه غير مضبوط</p>
        ) : (
          <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px]">
                  <th className="py-3 px-4 font-bold">الصوت</th>
                  <th className="py-3 px-4 font-bold">اللهجة</th>
                  <th className="py-3 px-4 font-bold">الأسلوب</th>
                  <th className="py-3 px-4 font-bold">العينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {munsit.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4"><span className="font-bold text-slate-900 block">{v.name}</span><span className="text-[10px] text-slate-400">{v.gender === 'female' ? 'نسائي' : 'رجالي'}</span></td>
                    <td className="py-3 px-4 text-slate-600">{arLabel(v.dialect)}</td>
                    <td className="py-3 px-4 text-slate-600">{arLabel(v.style)}</td>
                    <td className="py-3 px-4 min-w-[170px]">{v.previewUrl ? <SamplePlayer url={v.previewUrl} compact /> : <span className="text-slate-300">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <VoiceForm voice={editing} narrators={narrators} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
};

const VoiceForm: React.FC<{ voice: Partial<TtsVoice>; narrators: Narrator[]; onClose: () => void; onSaved: () => void }> = ({ voice, narrators, onClose, onSaved }) => {
  const [f, setF] = useState<Partial<TtsVoice>>(voice);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k: keyof TtsVoice, v: any) => setF(p => ({ ...p, [k]: v }));
  const isNew = !voice.id;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (!f.narratorId) { setError('اختر المعلق صاحب الصوت'); setSaving(false); return; }
      // own voice: no provider id; the dialect shown to clients comes from «اللهجة»
      const { providerVoiceId, provider, dialectLabel, ...rest } = f;
      const body = { ...rest, ...(isNew ? { provider: 'qeema_acoustic' } : {}) };
      if (isNew) await send(API, 'POST', body); else await send(`${API}/${voice.id}`, 'PUT', body);
      onSaved();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };
  const label = (t: string, req = false) => <span className="block text-xs font-bold text-slate-700 mb-1.5">{t}{req && <span className="text-rose-500"> *</span>}</span>;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto" dir="rtl" onClick={onClose}>
      <form onSubmit={save} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-2xl my-6 shadow-2xl text-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900">{isNew ? 'إضافة صوت لاستوديو TTS' : 'تعديل الصوت'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label>{label('اسم المقطع', true)}<input required value={f.name || ''} onChange={e => set('name', e.target.value)} className={input} placeholder="مثال: إعلان تجاري حماسي" /></label>
            <label>{label('الجنس')}<select value={f.gender} onChange={e => set('gender', e.target.value)} className={input}><option value="male">رجالي</option><option value="female">نسائي</option></select></label>
            <label>{label('اللهجة')}<select value={f.dialect} onChange={e => set('dialect', e.target.value)} className={input}>{Object.entries(DIALECT_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label>{label('أسلوب الصوت')}<input value={f.styleLabel || ''} onChange={e => set('styleLabel', e.target.value)} className={input} placeholder="مثال: إعلاني ورنان" /></label>
          </div>
          <UploadField label="العينة الصوتية" kind="audio" accept=".mp3,audio/mpeg" maxMb={6} required value={f.previewUrl || ''} onChange={v => set('previewUrl', v)}
            hint="ملف MP3 بحد أقصى 6MB من تسجيل المعلق" />
          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label>{label('المعلق صاحب الصوت', true)}
              <select required value={f.narratorId || ''} onChange={e => set('narratorId', e.target.value)} className={input}>
                <option value="" disabled>اختر المعلق</option>
                {narrators.map(n => <option key={n.id} value={n.id}>{n.displayName}</option>)}
              </select>
            </label>
            <label>{label('نسبة أرباح المعلق من كل استخدام (%)')}
              <input type="number" min={0} max={100} value={f.narratorSharePercent ?? 40} onChange={e => set('narratorSharePercent', Number(e.target.value))} dir="ltr" className={`${input} disabled:opacity-50`} />
            </label>
            <p className="sm:col-span-2 text-[11px] text-slate-500 leading-relaxed">داخلي فقط: اسم المعلق لا يظهر للعميل أبداً، والعميل يرى اسم المقطع. المعلق يرى الصوت ونسبته للاستماع فقط. لا ترفع صوت معلق دون موافقته الكتابية.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700"><input type="checkbox" checked={f.isActive ?? true} onChange={e => set('isActive', e.target.checked)} />فعّال (يظهر في الاستوديو)</label>
          {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">إلغاء</button>
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-orange disabled:opacity-60 text-white text-xs font-bold cursor-pointer">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
        </div>
      </form>
    </div>,
    document.body
  );
};
