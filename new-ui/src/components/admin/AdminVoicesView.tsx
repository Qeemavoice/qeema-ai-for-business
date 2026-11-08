import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, RefreshCw, ChevronLeft, Eye, EyeOff, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { narratorService } from '../../services/narratorService';
import { fmtDateTime } from '../../lib/format';
import { exportToExcel } from '../../lib/exportExcel';
import { finalPrice, fmtUsd, commissionPercent } from '../../../shared/pricing';
import { VOICE_CATEGORY_FILTERS } from '../../data/humanVoices';
import { getShortDialect } from '../VoiceLibraryView';
import { Badge, ExcelButton, Pager } from './adminUi';
import { UploadField } from './UploadField';

const PAGE_SIZE = 10;
const LANGUAGES = ['العربية', 'الإنجليزية', 'الفرنسية', 'التركية', 'الأوردو'];
const CATEGORIES = VOICE_CATEGORY_FILTERS.filter(c => c.key !== 'all').map(c => c.key);
const input = 'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-hidden focus:border-brand';

interface VoiceSampleRow {
  id: string; sampleName: string; talentName: string; narratorId?: string; gender: 'male' | 'female' | 'child'; subtitle?: string;
  categories: string[]; languages: string[]; dialect: string; accent?: string; flag?: string;
  narratorPriceUsd: number; previewUrl: string; fileName?: string;
  metaTitle?: string; metaDescription?: string; status: 'active' | 'hidden'; createdAt: string;
}

const numId = (id: string) => id.replace(/^\D+/, '') || id;
const GENDER = { male: 'رجل', female: 'امرأة' } as const;

/** Human voice samples (library + booking pages): narrator price, final price, shareable link. */
export const AdminVoicesView: React.FC = () => {
  const [rows, setRows] = useState<VoiceSampleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Partial<VoiceSampleRow> | null>(null);
  const [commission, setCommission] = useState(commissionPercent());
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setRows(await api.listCollection('humanVoices')); } catch { setRows([]); } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    api.getAdminSettings().then(s => setCommission(s.platformCommissionPercent)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...rows].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return q ? sorted.filter(r => [r.sampleName, r.talentName, r.dialect, ...(r.categories || [])].some(v => String(v || '').toLowerCase().includes(q))) : sorted;
  }, [rows, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const shareLink = (r: VoiceSampleRow) => `${window.location.origin}/ar/voices/${r.id}`;
  const copy = async (r: VoiceSampleRow) => {
    try { await navigator.clipboard.writeText(shareLink(r)); } catch { window.prompt('انسخ الرابط', shareLink(r)); }
    setCopied(r.id); setTimeout(() => setCopied(null), 2000);
  };
  const toggle = async (r: VoiceSampleRow) => { await api.updateCollectionItem('humanVoices', r.id, { status: r.status === 'active' ? 'hidden' : 'active' }); load(); };
  const remove = async (r: VoiceSampleRow) => {
    if (!window.confirm(`إخفاء الصوت «${r.sampleName}» من المكتبة؟ يبقى محفوظاً ويمكن إظهاره مجدداً.`)) return;
    await api.deleteCollectionItem('humanVoices', r.id); load();
  };

  const exportExcel = () => exportToExcel<VoiceSampleRow>('voices', 'الأصوات', [
    { header: 'معرف', value: r => numId(r.id), width: 8 },
    { header: 'العنوان', value: 'sampleName', width: 36 },
    { header: 'النوع', value: r => GENDER[r.gender] },
    { header: 'سعر الدقيقة ($)', value: 'narratorPriceUsd', width: 14 },
    { header: 'إجمالي سعر الدقيقة ($)', value: r => finalPrice(r.narratorPriceUsd, commission), width: 18 },
    { header: 'المعلق الصوتي', value: 'talentName' },
    { header: 'اللهجة', value: r => getShortDialect(r.dialect) || r.dialect },
    { header: 'التصنيف', value: r => (r.categories || []).join('، '), width: 30 },
    { header: 'الرابط', value: r => shareLink(r), width: 50 },
    { header: 'الحالة', value: r => r.status === 'active' ? 'ظاهر' : 'مخفي' },
    { header: 'تاريخ الانشاء', value: r => fmtDateTime(r.createdAt), width: 20 }
  ], filtered);

  if (editing) return <VoiceEditor voice={editing} commission={commission} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4" dir="rtl">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="البحث"
            className="w-full pr-10 pl-3 py-2.5 bg-slate-50 rounded-xl text-xs placeholder:text-slate-400 border border-transparent focus:border-slate-300 outline-hidden" />
        </div>
        <button onClick={() => setEditing({ gender: 'male', categories: [], languages: ['العربية'], status: 'active' })} className="mr-auto px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" />اضف جديد
        </button>
        <ExcelButton onClick={exportExcel} disabled={filtered.length === 0} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="text-slate-400">
              {['#', 'معرف', 'العنوان', 'التصنيف', 'النوع', 'سعر الدقيقة', 'إجمالي سعر الدقيقة', 'المعلق الصوتي', 'اللهجة', 'الملف الصوتي', 'تاريخ الانشاء', 'الإجراءات'].map(h => <th key={h} className="p-3 font-bold whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={12} className="p-10 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>}
            {!loading && pageItems.length === 0 && <tr><td colSpan={12} className="p-10 text-center text-slate-400">لا توجد أصوات</td></tr>}
            {!loading && pageItems.map((r, i) => (
              <tr key={r.id} className={`border-t border-slate-100 hover:bg-slate-50/60 ${r.status !== 'active' ? 'opacity-60' : ''}`}>
                <td className="p-3 text-slate-500">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="p-3 font-mono text-slate-500">{numId(r.id)}</td>
                <td className="p-3 font-bold text-slate-900 min-w-[180px]">{r.sampleName}{r.status !== 'active' && <Badge className="mr-2">مخفي</Badge>}</td>
                <td className="p-3 min-w-[140px] font-semibold text-slate-700">{(r.categories || []).join('، ') || '-'}</td>
                <td className="p-3 font-semibold">{GENDER[r.gender]}</td>
                <td className="p-3 font-mono font-bold">${fmtUsd(r.narratorPriceUsd)}</td>
                <td className="p-3 font-mono font-bold text-brand-text">${fmtUsd(finalPrice(r.narratorPriceUsd, commission))}</td>
                <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{r.talentName}</td>
                <td className="p-3 font-semibold whitespace-nowrap">{getShortDialect(r.dialect) || r.dialect}</td>
                <td className="p-3">
                  <button onClick={() => copy(r)} title={shareLink(r)} className="text-sky-600 hover:underline font-bold cursor-pointer inline-flex items-center gap-1">
                    {copied === r.id ? <><Check className="w-3.5 h-3.5" />تم النسخ</> : 'نسخ'}
                  </button>
                </td>
                <td className="p-3 font-mono whitespace-nowrap">{fmtDateTime(r.createdAt)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggle(r)} title={r.status === 'active' ? 'إخفاء من المكتبة' : 'إظهار في المكتبة'} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">{r.status === 'active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                    <button onClick={() => setEditing(r)} title="تعديل" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(r)} title="حذف" className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} total={filtered.length} onPage={setPage} />
    </div>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs">
    <h3 className="px-6 py-5 border-b border-slate-100 text-base font-black text-slate-900">{title}</h3>
    <div className="p-6 space-y-5">{children}</div>
  </section>
);
const Label: React.FC<{ text: string; required?: boolean; children: React.ReactNode; hint?: string }> = ({ text, required, children, hint }) => (
  <label className="block">
    <span className="block text-xs font-bold text-slate-700 mb-1.5">{text}{required && <span className="text-rose-500"> *</span>}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
  </label>
);

const VoiceEditor: React.FC<{ voice: Partial<VoiceSampleRow>; commission: number; onCancel: () => void; onSaved: () => void }> = ({ voice, commission, onCancel, onSaved }) => {
  const [form, setForm] = useState<Partial<VoiceSampleRow>>(voice);
  // narrators with an account on the site: a library voice is linked to the narrator's account
  const [narrators, setNarrators] = useState<{ id: string; name: string }[]>([]);
  const [narratorId, setNarratorId] = useState(voice.narratorId || '');
  // the voice's current narrator stays selectable even when the list has not loaded it
  const narratorOptions = narratorId && !narrators.some(n => n.id === narratorId) ? [{ id: narratorId, name: voice.talentName?.trim() || `حساب رقم ${narratorId.replace('narrator_u', '')}` }, ...narrators] : narrators;
  const [dialects, setDialects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof VoiceSampleRow, v: any) => setForm(f => ({ ...f, [k]: v }));
  const isNew = !voice.id;

  useEffect(() => {
    narratorService.getAllNarrators().then(n => setNarrators(n.filter(x => /^narrator_u\d+$/.test(x.id)).map(x => ({ id: x.id, name: x.displayName?.trim() || `حساب بدون اسم (رقم ${x.id.replace('narrator_u', '')})` })).sort((a, b) => a.name.localeCompare(b.name, 'ar')))).catch(() => {});
    api.listCollection('dialects').then(d => setDialects(d.map((x: any) => x.name))).catch(() => {});
  }, []);

  const toggleCat = (c: string) => set('categories', (form.categories || []).includes(c) ? form.categories!.filter(x => x !== c) : [...(form.categories || []), c]);
  const price = Number(form.narratorPriceUsd) || 0;
  const dialectOptions = Array.from(new Set([...(form.dialect ? [form.dialect] : []), ...dialects]));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narratorId) return setError('اختر المعلق الصوتي');
    if (!form.previewUrl) return setError('يرجى رفع الملف الصوتي (MP3)');
    if (!(price > 0)) return setError('يرجى إدخال سعر الدقيقة');
    if (!form.categories?.length) return setError('اختر تصنيفاً واحداً على الأقل');
    setSaving(true);
    try {
      const data = {
        ...form, narratorPriceUsd: price,
        name: form.talentName, accent: form.dialect, category: form.categories[0], tags: form.categories
      };
      if (isNew) await api.createCollectionItem('humanVoices', { createdAt: new Date().toISOString(), ...data, narratorId, status: 'active' });
      else await api.updateCollectionItem('humanVoices', voice.id!, narratorId !== (voice.narratorId || '') ? { ...data, narratorId } : data);
      onSaved();
    } catch (err: any) { setError(err.message || 'تعذر الحفظ'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="space-y-5" dir="rtl">
      <nav className="flex items-center gap-1.5 text-xs font-bold">
        <button type="button" onClick={onCancel} className="text-slate-500 hover:text-brand-text cursor-pointer">الأصوات</button>
        <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900">{isNew ? 'إضافة صوت' : 'تعديل الصوت'}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Card title="عام">
            <Label text="العنوان (باللغة العربية)" required>
              <input required value={form.sampleName || ''} onChange={e => set('sampleName', e.target.value)} className={input} />
            </Label>
            <div className="grid sm:grid-cols-2 gap-4">
              <Label text="النوع">
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className={`${input} cursor-pointer`}>
                  <option value="male">رجل</option>
                  <option value="female">امرأة</option>
                  <option value="child">طفل</option>
                </select>
              </Label>
              <Label text="المعلق صوتي" required hint={isNew ? 'يظهر الصوت في لوحة هذا المعلق ضمن «أصواتي في مكتبة الأصوات»' : 'تغيير المعلق ينقل الصوت إلى لوحة المعلق الجديد، والصفحة ورابطها تبقى كما هي'}>
                <select required value={narratorId} onChange={e => { setNarratorId(e.target.value); set('talentName', narrators.find(n => n.id === e.target.value)?.name || ''); }} className={`${input} cursor-pointer`}>
                  <option value="" disabled>{isNew ? 'اختر المعلق' : 'غير مرتبط بحساب معلق: اختر المعلق'}</option>
                  {narratorOptions.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </Label>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-700 mb-1.5">التصنيفات <span className="text-rose-500">*</span></span>
              <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-xl">
                {CATEGORIES.map(c => {
                  const on = (form.categories || []).includes(c);
                  return (
                    <button key={c} type="button" onClick={() => toggleCat(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${on ? 'bg-brand text-white border-brand' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}>{c}</button>
                  );
                })}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Label text="اللغات">
                <select value={form.languages?.[0] || 'العربية'} onChange={e => set('languages', [e.target.value])} className={`${input} cursor-pointer`}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l === 'العربية' ? 'اللغة العربية' : l}</option>)}
                </select>
              </Label>
              <Label text="اللهجات" required>
                <select required value={form.dialect || ''} onChange={e => set('dialect', e.target.value)} className={`${input} cursor-pointer`}>
                  <option value="" disabled>اختر اللهجة</option>
                  {dialectOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Label>
            </div>
          </Card>

          <Card title="التسعير">
            <div className="grid sm:grid-cols-2 gap-4">
              <Label text="سعر الدقيقة" required hint="سعر المعلق الخاص بالدولار">
                <input type="number" min={1} step={0.5} required value={form.narratorPriceUsd ?? ''} onChange={e => set('narratorPriceUsd', e.target.value)} className={`${input} font-mono`} />
              </Label>
              <Label text="السعر الإجمالي" hint={`يتم احتساب السعر الإجمالي من خلال إضافة عمولة المنصة ${commission}%`}>
                <input readOnly value={price ? fmtUsd(finalPrice(price, commission)) : ''} className={`${input} font-mono bg-slate-100 text-slate-700`} />
              </Label>
            </div>
          </Card>

          <Card title="خيارات الوسم الوصفي">
            <Label text="العنوان الوصفي (باللغة العربية)" hint="عنوان تبويب صفحة الصوت ونتائج جوجل. اتركه فارغاً ليُولَّد تلقائياً: «اسم العينة - عينة تعليق صوتي + اللهجة | قيمة فويس»">
              <input value={form.metaTitle || ''} onChange={e => set('metaTitle', e.target.value)} className={input} />
            </Label>
            <Label text="وصف (باللغة العربية)" hint="وصف صفحة الصوت في نتائج محركات البحث. إن تُرك فارغاً يُستخدم نص «عن هذا المقطع»">
              <textarea rows={3} maxLength={160} value={form.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} className={input} />
            </Label>
          </Card>
        </div>

        <Card title="الملف الصوتي">
          <UploadField label="الملف الصوتي" required kind="audio" accept=".mp3,audio/mpeg" maxMb={5}
            value={form.previewUrl || ''} fileName={form.fileName}
            hint={isNew ? 'يتم قبول ملفات الصوت mp3 فقط' : 'لتغيير المقطع اضغط «استبدال» واختر ملف MP3 جديداً ثم احفظ: تبقى صفحة الصوت ورابطها وعنوانها ووصفها وعدد الحجوزات كما هي'}
            onChange={(v, name) => {
              if (name && !/\.mp3$/i.test(name)) return setError('يتم قبول ملفات الصوت mp3 فقط');
              setError(''); set('previewUrl', v); set('fileName', name);
            }} />
        </Card>
      </div>

      {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold cursor-pointer disabled:opacity-50">{saving ? 'جارٍ الحفظ...' : 'حفظ'}</button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">إلغاء</button>
      </div>
    </form>
  );
};
