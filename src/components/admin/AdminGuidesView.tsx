import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, Paperclip, RefreshCw, ToggleLeft, ToggleRight, ChevronLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { fmtDateTime, fmtNum } from '../../lib/format';
import { exportToExcel } from '../../lib/exportExcel';
import { Badge, ExcelButton, Pager } from './adminUi';
import { UploadField } from './UploadField';

const PAGE_SIZE = 10;
const input = 'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-hidden focus:border-brand';

interface Guide {
  id: string; title: string; slug?: string; description?: string; type: 'free' | 'paid'; price: number;
  cover?: string; file?: string; fileName?: string; likes?: number; comments?: number; downloads?: number;
  createdAt?: string; status: 'published' | 'draft';
}

const numId = (id: string) => id.replace(/^\D+-?/, '');
const priceLabel = (g: Guide) => (g.type === 'free' ? '0.00' : Number(g.price || 0).toFixed(2));

/** Guides dashboard: table like the old panel + full-page add / edit form. */
export const AdminGuidesView: React.FC = () => {
  const [items, setItems] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Partial<Guide> | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.listCollection('guides')); } catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...items].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return q ? sorted.filter(g => [g.title, g.description].some(v => String(v || '').toLowerCase().includes(q))) : sorted;
  }, [items, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = async (g: Guide) => { await api.updateCollectionItem('guides', g.id, { status: g.status === 'published' ? 'draft' : 'published' }); load(); };
  const remove = async (g: Guide) => {
    if (!window.confirm(`حذف الدليل «${g.title}»؟`)) return;
    await api.deleteCollectionItem('guides', g.id); load();
  };

  const exportExcel = () => exportToExcel<Guide>('guides', 'الأدلة', [
    { header: 'المعرف', value: g => numId(g.id), width: 8 },
    { header: 'الاسم', value: 'title', width: 50 },
    { header: 'النوع', value: g => g.type === 'free' ? 'مجاني' : 'مدفوع' },
    { header: 'السعر ($)', value: g => priceLabel(g) },
    { header: 'عدد المعجبين', value: g => g.likes ?? 0 },
    { header: 'عدد التعليقات', value: g => g.comments ?? 0 },
    { header: 'عدد التنزيلات', value: g => g.downloads ?? 0 },
    { header: 'الحالة', value: g => g.status === 'published' ? 'منشور' : 'مخفي' },
    { header: 'تاريخ الإنشاء', value: g => fmtDateTime(g.createdAt), width: 20 }
  ], filtered);

  if (editing) return <GuideEditor guide={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4" dir="rtl">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="البحث"
            className="w-full pr-10 pl-3 py-2.5 bg-slate-50 rounded-xl text-xs placeholder:text-slate-400 border border-transparent focus:border-slate-300 outline-hidden" />
        </div>
        <button onClick={() => setEditing({ type: 'free', price: 0, status: 'published' })} className="mr-auto px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" />اضف جديد
        </button>
        <ExcelButton onClick={exportExcel} disabled={filtered.length === 0} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="text-slate-400">
              {['معرف', 'الصورة', 'الاسم', 'الملف', 'سعر', 'عدد المعجبين', 'عدد التعليقات', 'عدد التنزيلات', 'تاريخ الانشاء', 'الإجراءات'].map(h => <th key={h} className="p-3 font-bold whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={10} className="p-10 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>}
            {!loading && pageItems.length === 0 && <tr><td colSpan={10} className="p-10 text-center text-slate-400">لا توجد أدلة</td></tr>}
            {!loading && pageItems.map(g => (
              <tr key={g.id} className={`border-t border-slate-100 hover:bg-slate-50/60 ${g.status !== 'published' ? 'opacity-60' : ''}`}>
                <td className="p-3 font-mono font-bold text-slate-700">{numId(g.id)}</td>
                <td className="p-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden" style={{ background: (g as any).gradient || 'linear-gradient(135deg,#FFA513 0%,#B83A00 100%)' }}>
                    {g.cover && <img src={g.cover} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                  </div>
                </td>
                <td className="p-3 font-bold text-slate-900 min-w-[220px]">
                  {g.title}
                  {g.status !== 'published' && <Badge className="mr-2">مخفي</Badge>}
                </td>
                <td className="p-3">
                  {g.file ? <a href={g.file} download={g.fileName || 'guide'} title={g.fileName} className="text-slate-500 hover:text-brand-text"><Paperclip className="w-4 h-4" /></a> : <Paperclip className="w-4 h-4 text-slate-300" />}
                </td>
                <td className="p-3 font-mono font-bold">{priceLabel(g)}</td>
                <td className="p-3 font-mono">{fmtNum(g.likes ?? 0)}</td>
                <td className="p-3 font-mono">{fmtNum(g.comments ?? 0)}</td>
                <td className="p-3 font-mono">{fmtNum(g.downloads ?? 0)}</td>
                <td className="p-3 font-mono whitespace-nowrap">{fmtDateTime(g.createdAt)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggle(g)} title={g.status === 'published' ? 'إخفاء من الموقع' : 'نشر في الموقع'} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">
                      {g.status === 'published' ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditing(g)} title="تعديل" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(g)} title="حذف" className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
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

const GuideEditor: React.FC<{ guide: Partial<Guide>; onCancel: () => void; onSaved: () => void }> = ({ guide, onCancel, onSaved }) => {
  const [form, setForm] = useState<Partial<Guide>>(guide);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof Guide, v: any) => setForm(f => ({ ...f, [k]: v }));
  const isNew = !guide.id;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cover) return setError('يرجى رفع صورة الدليل');
    if (!form.file && !form.link) return setError('يرجى رفع ملف الدليل');
    if (form.type === 'paid' && !(Number(form.price) > 0)) return setError('يرجى إدخال سعر الدليل المدفوع');
    setSaving(true);
    try {
      const data = { ...form, price: form.type === 'free' ? 0 : Number(form.price) };
      if (isNew) await api.createCollectionItem('guides', { likes: 0, comments: 0, downloads: 0, createdAt: new Date().toISOString(), ...data });
      else await api.updateCollectionItem('guides', guide.id!, data);
      onSaved();
    } catch (err: any) { setError(err.message || 'تعذر الحفظ'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="space-y-5" dir="rtl">
      <nav className="flex items-center gap-1.5 text-xs font-bold">
        <button type="button" onClick={onCancel} className="text-slate-500 hover:text-brand-text cursor-pointer">الأدلة</button>
        <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900">{isNew ? 'إضافة دليل' : 'تعديل الدليل'}</span>
      </nav>
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="px-6 py-5 border-b border-slate-100 text-base font-black text-slate-900">{isNew ? 'إضافة دليل' : 'تعديل الدليل'}</h3>
        <div className="p-6 space-y-5">
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">الاسم (باللغة العربية) <span className="text-rose-500">*</span></span>
            <input required value={form.title || ''} onChange={e => set('title', e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">تفاصيل (باللغة العربية)</span>
            <textarea rows={4} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="تفاصيل(AR)" className={input} />
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 mb-1.5">الأنواع</span>
              <select value={form.type} onChange={e => set('type', e.target.value)} className={`${input} cursor-pointer`}>
                <option value="free">مجاناً</option>
                <option value="paid">مدفوع</option>
              </select>
            </label>
            {form.type === 'paid' && (
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 mb-1.5">السعر بالدولار <span className="text-rose-500">*</span></span>
                <input type="number" min={0.5} step={0.5} value={form.price || ''} onChange={e => set('price', e.target.value)} className={`${input} font-mono`} />
              </label>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <UploadField label="الصورة" required accept="image/*" maxMb={3} kind="image" value={form.cover || ''} onChange={(v) => set('cover', v)} />
            <UploadField label="الملف" required accept=".pdf,application/pdf" maxMb={8} kind="file" value={form.file || ''} fileName={form.fileName} onChange={(v, name) => { set('file', v); set('fileName', name); }} />
          </div>
          {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold cursor-pointer disabled:opacity-50">{saving ? 'جارٍ الحفظ...' : 'حفظ'}</button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">إلغاء</button>
      </div>
    </form>
  );
};
