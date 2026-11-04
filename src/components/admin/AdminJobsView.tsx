import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Pencil, Trash2, X, RefreshCw, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { exportToExcel } from '../../lib/exportExcel';
import { AdminApplicantsView } from './AdminApplicantsView';
import { ExcelButton } from './adminUi';
import { UploadField } from './UploadField';

const WORK_TYPES = ['دوام كامل', 'دوام جزئي', 'عمل حر'];
const WORK_MODES = ['أونلاين', 'من المكتب', 'هجين'];
const input = 'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-hidden focus:border-brand';

interface JobPosting {
  id: string; title: string; jobTitle: string; workType: string; workMode: string;
  salaryFrom: number; salaryTo: number; coverImage?: string; innerImage?: string;
  experience: string; responsibilities: string; tasks: string; createdAt?: string;
}

/** "الوظائف": job postings (right tab) and the people who applied (left tab). */
export const AdminJobsView: React.FC = () => {
  const [tab, setTab] = useState<'postings' | 'applicants'>('postings');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<JobPosting> | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [j, a] = await Promise.all([api.listCollection('jobPostings'), api.listCollection('jobs')]);
      setJobs(j); setApplicants(a);
    } catch { setJobs([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const applicantsOf = (job: JobPosting) => applicants.filter(a => a.jobId === job.id || a.jobTitle === job.title).length;
  const remove = async (job: JobPosting) => {
    if (!window.confirm(`حذف الوظيفة «${job.title}»؟`)) return;
    await api.deleteCollectionItem('jobPostings', job.id); load();
  };

  const exportExcel = () => exportToExcel<JobPosting>('job-postings', 'الوظائف', [
    { header: 'العنوان', value: 'title', width: 30 },
    { header: 'المسمى الوظيفي', value: 'jobTitle', width: 24 },
    { header: 'طبيعة العمل', value: 'workType' },
    { header: 'طبيعة الدوام', value: 'workMode' },
    { header: 'الأجر من ($)', value: 'salaryFrom', width: 12 },
    { header: 'الأجر إلى ($)', value: 'salaryTo', width: 12 },
    { header: 'الخبرات', value: 'experience', width: 50 },
    { header: 'المسؤوليات', value: 'responsibilities', width: 50 },
    { header: 'المهام', value: 'tasks', width: 50 },
    { header: 'المتقدمون', value: j => applicantsOf(j), width: 10 }
  ], jobs);


  return (
    <div className="space-y-5" dir="rtl">
      {/* One switch: right = jobs, left = applicants */}
      <div role="tablist" className="inline-flex p-1 rounded-2xl bg-slate-200/70 border border-slate-200">
        {([['postings', 'الوظائف', jobs.length], ['applicants', 'المتقدمين', applicants.length]] as const).map(([id, label, count]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            {label} <span className="font-mono opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {tab === 'applicants' ? (
        <AdminApplicantsView jobs={jobs} onChanged={load} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setEditing({ workType: WORK_TYPES[1], workMode: WORK_MODES[0] })}
              className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />أضف وظيفة
            </button>
            <ExcelButton onClick={exportExcel} disabled={jobs.length === 0} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400">
                  {['#', 'العنوان', 'المسمى الوظيفي', 'الخبرات', 'المسؤوليات', 'المهام', 'طبيعة الدوام', 'نظام العمل', 'الأجر', 'الصورة الداخلية', 'الصورة الخارجية', 'المتقدمين للوظيفة', 'الإجراءات'].map(h => (
                    <th key={h} className="p-3 font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={13} className="p-10 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>}
                {!loading && jobs.length === 0 && <tr><td colSpan={13} className="p-10 text-center text-slate-400">لا توجد وظائف بعد. اضغط «أضف وظيفة» لنشر أول وظيفة.</td></tr>}
                {jobs.map((j, i) => (
                  <tr key={j.id} className="border-t border-slate-100 hover:bg-slate-50/60 align-top">
                    <td className="p-3 text-slate-500">{i + 1}</td>
                    <td className="p-3 font-bold text-slate-900 min-w-[140px]">{j.title}</td>
                    <td className="p-3 font-semibold">{j.jobTitle}</td>
                    <td className="p-3 max-w-[180px]"><p className="line-clamp-2 text-slate-600">{j.experience}</p></td>
                    <td className="p-3 max-w-[180px]"><p className="line-clamp-2 text-slate-600">{j.responsibilities}</p></td>
                    <td className="p-3 max-w-[180px]"><p className="line-clamp-2 text-slate-600">{j.tasks}</p></td>
                    <td className="p-3 whitespace-nowrap">{j.workMode}</td>
                    <td className="p-3 whitespace-nowrap">{j.workType}</td>
                    <td className="p-3 font-mono whitespace-nowrap">${j.salaryFrom} - ${j.salaryTo}</td>
                    <td className="p-3">{j.innerImage ? <img src={j.innerImage} alt="" className="w-14 h-10 rounded-md object-cover" /> : '-'}</td>
                    <td className="p-3">{j.coverImage ? <img src={j.coverImage} alt="" className="w-14 h-10 rounded-md object-cover" /> : '-'}</td>
                    <td className="p-3">
                      <button onClick={() => setTab('applicants')} className="inline-flex items-center gap-1 font-mono font-bold text-brand-text hover:underline cursor-pointer">
                        <Users className="w-3.5 h-3.5" />{applicantsOf(j)}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditing(j)} title="تعديل" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(j)} title="حذف" className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && <JobForm job={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
};

const JobForm: React.FC<{ job: Partial<JobPosting>; onClose: () => void; onSaved: () => void }> = ({ job, onClose, onSaved }) => {
  const [form, setForm] = useState<Partial<JobPosting>>(job);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof JobPosting, v: any) => setForm(f => ({ ...f, [k]: v }));
  const isNew = !job.id;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coverImage || !form.innerImage) return setError('يرجى رفع الصورة الخارجية والداخلية');
    if (Number(form.salaryTo) < Number(form.salaryFrom)) return setError('«الأجر إلى» يجب أن يكون أكبر من «الأجر من»');
    setSaving(true);
    try {
      const data = { ...form, salaryFrom: Number(form.salaryFrom), salaryTo: Number(form.salaryTo) };
      if (isNew) await api.createCollectionItem('jobPostings', { createdAt: new Date().toISOString(), ...data });
      else await api.updateCollectionItem('jobPostings', job.id!, data);
      onSaved();
    } catch (err: any) { setError(err.message || 'تعذر الحفظ'); } finally { setSaving(false); }
  };

  const label = (text: string) => <span className="block text-xs font-bold text-slate-700 mb-1.5">{text} <span className="text-rose-500">*</span></span>;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto" dir="rtl" onClick={onClose}>
      <form onSubmit={save} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-3xl my-6 shadow-2xl text-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900">{isNew ? 'إضافة وظيفة' : 'تعديل الوظيفة'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">{label('العنوان')}<input required value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="مطلوب مصمم جرافيك" className={input} /></label>
            <label className="block">{label('المسمى الوظيفي')}<input required value={form.jobTitle || ''} onChange={e => set('jobTitle', e.target.value)} placeholder="مصمم جرافيك" className={input} /></label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="block">{label('طبيعة العمل')}
              <select value={form.workType} onChange={e => set('workType', e.target.value)} className={`${input} cursor-pointer`}>{WORK_TYPES.map(t => <option key={t}>{t}</option>)}</select>
            </label>
            <label className="block">{label('طبيعة الدوام')}
              <select value={form.workMode} onChange={e => set('workMode', e.target.value)} className={`${input} cursor-pointer`}>{WORK_MODES.map(t => <option key={t}>{t}</option>)}</select>
            </label>
            <label className="block">{label('الأجر من ($)')}<input required type="number" min={0} value={form.salaryFrom ?? ''} onChange={e => set('salaryFrom', e.target.value)} className={`${input} font-mono`} /></label>
            <label className="block">{label('الأجر إلى ($)')}<input required type="number" min={0} value={form.salaryTo ?? ''} onChange={e => set('salaryTo', e.target.value)} className={`${input} font-mono`} /></label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <UploadField label="الصورة الخارجية (375×200)" required kind="image" accept="image/*" maxMb={3} value={form.coverImage || ''} onChange={v => set('coverImage', v)} />
            <UploadField label="الصورة الداخلية (650×450)" required kind="image" accept="image/*" maxMb={3} value={form.innerImage || ''} onChange={v => set('innerImage', v)} />
          </div>
          <label className="block">{label('الخبرات')}<textarea required rows={4} value={form.experience || ''} onChange={e => set('experience', e.target.value)} className={input} /></label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">{label('المسؤوليات')}<textarea required rows={4} value={form.responsibilities || ''} onChange={e => set('responsibilities', e.target.value)} className={input} /></label>
            <label className="block">{label('المهام')}<textarea required rows={4} value={form.tasks || ''} onChange={e => set('tasks', e.target.value)} className={input} /></label>
          </div>
          {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">إلغاء</button>
          <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold cursor-pointer disabled:opacity-50">{saving ? 'جارٍ الحفظ...' : 'حفظ'}</button>
        </div>
      </form>
    </div>,
    document.body
  );
};
