import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { COLLECTIONS, STATUS_LABELS } from './collectionsConfig';
import { AdminArticleEditor } from './AdminArticleEditor';
import { ExcelButton } from './adminUi';
import { UploadField } from './UploadField';
import { exportToExcel } from '../../lib/exportExcel';
import { RichTextEditor } from './RichTextEditor';
import { isHtml } from '../../data/stories';

const PAGE_SIZE = 10;

const TONES = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200'
};

interface Props { name: string; }

export const AdminCollectionView: React.FC<Props> = ({ name }) => {
  const cfg = COLLECTIONS[name];
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);   // item or {} for new
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.listCollection(name)); } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { setQuery(''); setPage(1); setEditing(null); load(); }, [name]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(it => cfg.searchKeys.some(k => String(it[k] ?? '').toLowerCase().includes(q)));
  }, [items, query, cfg]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEditor = (item?: any) => {
    const base: Record<string, any> = {};
    cfg.fields.forEach(f => { base[f.key] = item?.[f.key] ?? (f.type === 'number' ? 0 : f.type === 'select' ? f.options?.[0].value : f.type === 'clips' ? [] : ''); });
    setForm(base);
    setEditing(item || {});
  };

  const persist = async (data: Record<string, any>) => {
    setSaving(true);
    try {
      if (editing?.id) await api.updateCollectionItem(name, editing.id, data);
      else await api.createCollectionItem(name, { views: 0, ...data, date: data.date || new Date().toISOString().slice(0, 10) });
      setEditing(null);
      await load();
    } finally { setSaving(false); }
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // Optional extra clips: drop rows without a file, name untitled ones
    const clean = { ...form };
    cfg.fields.filter(f => f.type === 'clips').forEach(f => {
      clean[f.key] = (form[f.key] || []).filter((c: any) => c.url).map((c: any, i: number) => ({ title: c.title?.trim() || `مقطع ${i + 1}`, url: c.url }));
    });
    persist(clean);
  };

  const remove = async (item: any) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
    await api.deleteCollectionItem(name, item.id);
    await load();
  };

  const quick = async (item: any, set: Record<string, any>) => {
    await api.updateCollectionItem(name, item.id, set);
    await load();
  };

  const exportExcel = () => exportToExcel(name, cfg.title, cfg.columns.map(c => ({
    header: c.label,
    value: (it: any) => c.badge ? (STATUS_LABELS[it[c.key]]?.label ?? it[c.key] ?? '') : (it[c.key] ?? ''),
    width: c.mono ? 16 : 30
  })), filtered);

  const openFullEditor = editing && cfg.editor === 'article';
  if (openFullEditor) return <AdminArticleEditor item={editing} saving={saving} onSave={persist} onCancel={() => setEditing(null)} />;

  const hasActions = !!cfg.canEdit || !!cfg.quickActions || true;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4" dir="rtl">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder="البحث"
            className="w-full pr-10 pl-3 py-2.5 bg-slate-50 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 border border-transparent focus:border-slate-300 outline-hidden"
          />
        </div>
        {cfg.addLabel && (
          <button onClick={() => openEditor()} className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" /><span>{cfg.addLabel}</span>
          </button>
        )}
        <ExcelButton onClick={exportExcel} disabled={filtered.length === 0} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="text-slate-400">
              <th className="p-3 font-bold w-10">#</th>
              {cfg.columns.map(c => <th key={c.key} className="p-3 font-bold">{c.label}</th>)}
              {hasActions && <th className="p-3 font-bold">الإجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={cfg.columns.length + 2} className="p-10 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>
            )}
            {!loading && pageItems.length === 0 && (
              <tr><td colSpan={cfg.columns.length + 2} className="p-10 text-center text-slate-400">لا توجد بيانات</td></tr>
            )}
            {!loading && pageItems.map((it, i) => (
              <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="p-3 text-slate-500">{(page - 1) * PAGE_SIZE + i + 1}</td>
                {cfg.columns.map(c => {
                  const v = it[c.key];
                  if (c.badge) {
                    const s = STATUS_LABELS[v] || { label: String(v ?? '-'), tone: 'slate' as const };
                    return <td key={c.key} className="p-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${TONES[s.tone]}`}>{s.label}</span></td>;
                  }
                  if (c.options) {
                    return (
                      <td key={c.key} className="p-3">
                        <select value={v ?? ''} onChange={e => quick(it, { [c.key]: e.target.value })}
                          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 outline-hidden focus:border-brand cursor-pointer">
                          {!c.options.includes(v) && <option value={v ?? ''}>{v || '-'}</option>}
                          {c.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </td>
                    );
                  }
                  return (
                    <td key={c.key} className={`p-3 text-slate-800 max-w-[340px] ${c.mono ? 'font-mono whitespace-nowrap' : 'font-semibold'}`}>
                      <span className="line-clamp-2">{v === 0 && c.key === 'price' ? 'مجاني' : (v ?? '-')}</span>
                    </td>
                  );
                })}
                <td className="p-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cfg.quickActions?.filter(a => !a.when || a.when(it)).map(a => (
                      <button key={a.label} onClick={() => quick(it, a.set)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${TONES[a.tone || 'slate']}`}>{a.label}</button>
                    ))}
                    {cfg.canEdit && (
                      <button onClick={() => openEditor(it)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer" title="تعديل"><Pencil className="w-3.5 h-3.5" /></button>
                    )}
                    {!cfg.noDelete && <button onClick={() => remove(it)} className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 cursor-pointer" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>المجموع ({filtered.length})</span>
        <div className="flex items-center gap-1.5">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          <span className="px-3 py-1 rounded-lg bg-brand text-white font-bold">{page}</span>
          <span className="text-slate-400">/ {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={e => e.stopPropagation()} className={`bg-white rounded-3xl w-full ${cfg.fields.some(f => f.type === 'richtext') ? 'max-w-3xl' : 'max-w-lg'} p-6 space-y-4 text-right max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">{editing.id ? 'تعديل' : cfg.addLabel}</h3>
              <button type="button" onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            {cfg.fields.map(f => (
              <div key={f.key}>
                {f.type !== 'audio' && f.type !== 'image' && <label className="block text-xs font-bold text-slate-800 mb-1">{f.label}</label>}
                {f.type === 'clips' ? (
                  <div className="space-y-2">
                    {(form[f.key] || []).map((c: { title: string; url: string }, i: number) => {
                      const setClip = (patch: Partial<{ title: string; url: string }>) =>
                        setForm({ ...form, [f.key]: form[f.key].map((x: any, j: number) => (j === i ? { ...x, ...patch } : x)) });
                      return (
                        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <input value={c.title} onChange={e => setClip({ title: e.target.value })} placeholder="عنوان المقطع، مثل: يا أهل مكة"
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-brand" />
                            <button type="button" title="حذف المقطع" onClick={() => setForm({ ...form, [f.key]: form[f.key].filter((_: any, j: number) => j !== i) })}
                              className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <UploadField label="المقطع الصوتي" kind="audio" accept=".mp3,.m4a,audio/mpeg,audio/mp4" maxMb={6} value={c.url || ''}
                            onChange={(v, name) => setClip({ url: v, ...(c.title ? {} : { title: name.replace(/\.[^.]+$/, '') }) })} />
                        </div>
                      );
                    })}
                    <button type="button" onClick={() => setForm({ ...form, [f.key]: [...(form[f.key] || []), { title: '', url: '' }] })}
                      className="px-3 py-2 rounded-lg border border-dashed border-slate-300 hover:border-brand text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />إضافة مقطع
                    </button>
                    <p className="text-[11px] text-slate-400">تظهر المقاطع كأزرار فوق مشغّل الصوت في صفحة القصة، مع المقطع الأساسي. MP3 أو M4A بحد أقصى 6MB للمقطع.</p>
                  </div>
                ) : f.type === 'image' ? (
                  <UploadField label={f.label} kind="image" accept="image/png,image/svg+xml,image/webp,image/jpeg" maxMb={2} value={form[f.key] || ''}
                    hint={f.hint || 'يظهر في شبكة شعارات صفحة قصص النجاح. يفضّل PNG أو SVG بخلفية شفافة، بحد أقصى 2MB'}
                    onChange={v => setForm({ ...form, [f.key]: v })} />
                ) : f.type === 'audio' ? (
                  <UploadField label={f.label} kind="audio" accept=".mp3,audio/mpeg" maxMb={8} value={form[f.key] || ''} fileName={form[`${f.key}Name`]}
                    hint="يظهر للزوار كمشغل صوتي في صفحة القصة. صيغة MP3 بحد أقصى 8MB"
                    onChange={(v, name) => setForm({ ...form, [f.key]: v, [`${f.key}Name`]: name })} />
                ) : f.type === 'textarea' ? (
                  <textarea rows={4} required={f.required} value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand" />
                ) : f.type === 'richtext' ? (
                  // Plain-text records (paragraphs split by a blank line) open as <p> paragraphs
                  <RichTextEditor key={editing.id || 'new'} minHeight={220}
                    initialHtml={isHtml(form[f.key] || '') ? form[f.key] : String(form[f.key] || '').split(/\n\s*\n/).filter(Boolean).map(p => `<p>${p.trim()}</p>`).join('')}
                    onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))} />
                ) : f.type === 'select' ? (
                  <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand">
                    {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input type={f.type === 'number' ? 'number' : 'text'} required={f.required} readOnly={f.readOnly} value={form[f.key] ?? ''}
                    onChange={e => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand" />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">إلغاء</button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold cursor-pointer disabled:opacity-50">حفظ</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
