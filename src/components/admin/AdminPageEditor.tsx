import React, { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { RichTextEditor } from './RichTextEditor';
import { defaultSitePage, type SitePageKey } from '../../data/sitePages';

const input = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-brand';

/** Edits one CMS page (privacy / terms / about): title, intro and rich content. */
export const AdminPageEditor: React.FC<{ pageKey: SitePageKey }> = ({ pageKey }) => {
  const [page, setPage] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(null);
    api.listCollection('pages')
      .then(items => setPage(items.find(p => p.id === pageKey) || { id: pageKey, ...defaultSitePage(pageKey) }))
      .catch(() => setPage({ id: pageKey, ...defaultSitePage(pageKey) }));
  }, [pageKey]);

  if (!page) return <div className="p-10 text-center"><RefreshCw className="w-5 h-5 animate-spin inline text-slate-400" /></div>;
  const set = (k: string, v: any) => setPage(p => ({ ...p!, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { title: page.title, intro: page.intro, content: page.content, status: page.status || 'published', updatedAt: new Date().toISOString().slice(0, 10) };
      await api.updateCollectionItem('pages', pageKey, data);
      set('updatedAt', data.updatedAt);
      setToast('تم حفظ الصفحة ونشرها على الموقع');
      setTimeout(() => setToast(null), 3000);
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-base font-black text-slate-900">{page.title}</h3>
        <a href={page.slug} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-text hover:underline inline-flex items-center gap-1">
          عرض الصفحة في الموقع <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <label className="block">
        <span className="block text-xs font-bold text-slate-700 mb-1.5">العنوان (باللغة العربية)</span>
        <input required value={page.title} onChange={e => set('title', e.target.value)} className={input} />
      </label>
      <label className="block">
        <span className="block text-xs font-bold text-slate-700 mb-1.5">وصف مختصر يظهر أسفل العنوان</span>
        <input value={page.intro || ''} onChange={e => set('intro', e.target.value)} className={input} />
      </label>
      <div>
        <span className="block text-xs font-bold text-slate-700 mb-1.5">المحتوى (ar) <span className="text-rose-500">*</span></span>
        <RichTextEditor key={pageKey} initialHtml={page.content || ''} onChange={v => set('content', v)} minHeight={480} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400 font-mono">آخر تحديث: {page.updatedAt || '-'}</span>
        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold cursor-pointer disabled:opacity-50">
          {saving ? 'جارٍ الحفظ...' : 'حفظ'}
        </button>
      </div>
      {toast && <div className="fixed bottom-6 left-6 z-[60] px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl">{toast}</div>}
    </form>
  );
};
