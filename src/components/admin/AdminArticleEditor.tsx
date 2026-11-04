import React, { useState } from 'react';
import { ChevronLeft, ImagePlus, X } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { ARTICLE_CATEGORIES, ARTICLE_AUDIENCES, ARTICLE_STATUSES } from '../../../shared/articleOptions';

interface Props {
  item: Record<string, any>;           // {} for a new article
  saving: boolean;
  onSave: (data: Record<string, any>) => void;
  onCancel: () => void;
}

const MAX_IMAGE_MB = 3;
const input = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
    <h3 className="text-sm font-black text-slate-900">{title}</h3>
    {children}
  </section>
);

const Label: React.FC<{ text: string; required?: boolean; children: React.ReactNode }> = ({ text, required, children }) => (
  <label className="block">
    <span className="block text-xs font-bold text-slate-700 mb-1.5">{text}{required && <span className="text-rose-500"> *</span>}</span>
    {children}
  </label>
);

const ImageUpload: React.FC<{ label: string; hint: string; value: string; onChange: (v: string) => void }> = ({ label, hint, value, onChange }) => {
  const [err, setErr] = useState('');
  const pick = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setErr('الملف يجب أن يكون صورة');
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setErr(`الحد الأقصى لحجم الصورة ${MAX_IMAGE_MB}MB`);
    setErr('');
    const r = new FileReader();
    r.onload = () => onChange(String(r.result));
    r.readAsDataURL(file);
  };
  return (
    <div>
      <span className="block text-xs font-bold text-slate-700 mb-1.5">{label}</span>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
          <img src={value} alt={label} className="w-full h-44 object-cover" />
          <button type="button" onClick={() => onChange('')} className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 cursor-pointer" title="إزالة الصورة"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 h-44 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand bg-slate-50 cursor-pointer text-slate-400 text-xs">
          <ImagePlus className="w-6 h-6" />
          <span className="font-bold text-slate-600">اضغط لرفع صورة</span>
          <span>{hint}</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => pick(e.target.files?.[0])} />
        </label>
      )}
      {err && <p className="text-[11px] text-rose-600 mt-1">{err}</p>}
    </div>
  );
};

export const AdminArticleEditor: React.FC<Props> = ({ item, saving, onSave, onCancel }) => {
  const isNew = !item.id;
  const [form, setForm] = useState<Record<string, any>>(() => ({
    title: '', shortDescription: '', content: '', coverImage: '', innerImage: '',
    status: 'draft', videoUrl: '', keywords: '', metaDescription: '',
    category: ARTICLE_CATEGORIES[0], audience: ARTICLE_AUDIENCES[1],
    ...item
  }));
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={submit} className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <nav className="flex items-center gap-1.5 text-xs font-bold">
          <button type="button" onClick={onCancel} className="text-slate-500 hover:text-brand-text cursor-pointer">المقالات</button>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900">{isNew ? 'اضافة مقال' : 'تعديل مقال'}</span>
        </nav>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer">إلغاء</button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold cursor-pointer disabled:opacity-50">{saving ? 'جارٍ الحفظ...' : 'حفظ'}</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Section title="عام">
            <Label text="العنوان" required>
              <input required value={form.title} onChange={e => set('title', e.target.value)} className={input} placeholder="عنوان المقال" />
            </Label>
            <Label text="وصف قصير">
              <textarea rows={3} value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className={input} placeholder="ملخص يظهر في بطاقة المقال" />
            </Label>
          </Section>

          <Section title="المحتوى">
            <RichTextEditor initialHtml={item.content || ''} onChange={v => set('content', v)} />
          </Section>

          <Section title="الصور">
            <div className="grid sm:grid-cols-2 gap-4">
              <ImageUpload label="الصورة الخارجية" hint="تظهر في بطاقة المقال وقائمة المدونة. أبعاد الصورة: 1200 × 675 بكسل (نسبة 16:9)" value={form.coverImage} onChange={v => set('coverImage', v)} />
              <ImageUpload label="الصورة الداخلية" hint="تظهر أعلى صفحة المقال. أبعاد الصورة: 1600 × 900 بكسل (نسبة 16:9)" value={form.innerImage} onChange={v => set('innerImage', v)} />
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="الحالة والتصنيف">
            <Label text="الحالة">
              <select value={form.status} onChange={e => set('status', e.target.value)} className={input}>
                {ARTICLE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Label>
            <Label text="المجال">
              <select value={form.category} onChange={e => set('category', e.target.value)} className={input}>
                {ARTICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Label>
            <Label text="الجمهور">
              <select value={form.audience} onChange={e => set('audience', e.target.value)} className={input}>
                {ARTICLE_AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Label>
          </Section>

          <Section title="رابط الفيديو">
            <Label text="رابط يوتيوب أو فيميو (اختياري)">
              <input dir="ltr" type="url" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} className={`${input} text-left`} placeholder="https://youtube.com/watch?v=..." />
            </Label>
          </Section>

          <Section title="الوسم الوصفي">
            <Label text="الكلمات الدلالية">
              <input value={form.keywords} onChange={e => set('keywords', e.target.value)} className={input} placeholder="افصل بين الكلمات بفاصلة" />
            </Label>
            <Label text="الوصف">
              <textarea rows={3} maxLength={160} value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} className={input} placeholder="وصف محركات البحث" />
              <span className="block text-[10px] text-slate-400 mt-1 text-left">{(form.metaDescription || '').length} / 160</span>
            </Label>
          </Section>
        </div>
      </div>
    </form>
  );
};
