import React, { useEffect, useMemo, useState } from 'react';
import { Search, Eye, Trash2, RefreshCw, Mail, Phone, ExternalLink, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { fmtDate } from '../../lib/format';
import { exportToExcel } from '../../lib/exportExcel';
import { Badge, Drawer, ExcelButton, Field, FilterChip, Pager, Tone } from './adminUi';

const PAGE_SIZE = 10;
const GENERAL = 'طلب عام';

interface Applicant {
  id: string; name: string; email: string; phone?: string; country?: string; jobId?: string; jobTitle?: string;
  experienceYears?: number; coverLetter?: string; portfolio?: string; cvUrl?: string; cvName?: string;
  status: 'new' | 'reviewing' | 'accepted' | 'rejected'; date: string;
}

const STATUS: Record<Applicant['status'], { label: string; tone: Tone }> = {
  new: { label: 'جديد', tone: 'amber' },
  reviewing: { label: 'قيد المراجعة', tone: 'blue' },
  accepted: { label: 'مقبول', tone: 'green' },
  rejected: { label: 'مرفوض', tone: 'red' }
};
const EXPERIENCE = [
  { id: 'any', label: 'كل سنوات الخبرة', test: (_y: number) => true },
  { id: '0-2', label: 'أقل من 3 سنوات', test: (y: number) => y < 3 },
  { id: '3-5', label: '3 إلى 5 سنوات', test: (y: number) => y >= 3 && y <= 5 },
  { id: '6+', label: '6 سنوات فأكثر', test: (y: number) => y >= 6 }
];
const PERIODS = [
  { id: 'all', label: 'كل الفترات', days: Infinity },
  { id: '7', label: 'آخر 7 أيام', days: 7 },
  { id: '30', label: 'آخر 30 يوماً', days: 30 }
];
const select = 'px-3 py-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 outline-hidden cursor-pointer';
const jobOf = (a: Applicant) => a.jobTitle || GENERAL;

/** Applicants to posted jobs: filters, full application view, status actions. */
export const AdminApplicantsView: React.FC<{ jobs: { id: string; title: string }[]; onChanged?: () => void }> = ({ jobs, onChanged }) => {
  const [rows, setRows] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | Applicant['status']>('all');
  const [job, setJob] = useState('all');
  const [country, setCountry] = useState('all');
  const [experience, setExperience] = useState('any');
  const [period, setPeriod] = useState('all');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Applicant | null>(null);

  const load = async () => {
    setLoading(true);
    try { setRows(await api.listCollection('jobs')); } catch { setRows([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const jobOptions = useMemo(() => Array.from(new Set([GENERAL, ...jobs.map(j => j.title), ...rows.map(jobOf)])), [jobs, rows]);
  const countries = useMemo(() => Array.from(new Set(rows.map(r => r.country).filter(Boolean))) as string[], [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const exp = EXPERIENCE.find(e => e.id === experience)!;
    const since = Date.now() - (PERIODS.find(p => p.id === period)!.days * 86400000);
    return rows
      .filter(r =>
        (status === 'all' || r.status === status) &&
        (job === 'all' || jobOf(r) === job) &&
        (country === 'all' || r.country === country) &&
        exp.test(Number(r.experienceYears) || 0) &&
        new Date(r.date).getTime() >= since &&
        (!q || [r.name, r.email, r.phone, r.coverLetter].some(v => String(v || '').toLowerCase().includes(q))))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [rows, query, status, job, country, experience, period]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(1); };

  const setRowStatus = async (a: Applicant, s: Applicant['status']) => {
    await api.updateCollectionItem('jobs', a.id, { status: s });
    setRows(list => list.map(x => x.id === a.id ? { ...x, status: s } : x));
    setViewing(v => v && v.id === a.id ? { ...v, status: s } : v);
  };
  const remove = async (a: Applicant) => {
    if (!window.confirm(`حذف طلب ${a.name}؟`)) return;
    await api.deleteCollectionItem('jobs', a.id);
    setViewing(null); load(); onChanged?.();
  };

  const exportExcel = () => exportToExcel<Applicant>('applicants', 'المتقدمون', [
    { header: 'الاسم', value: 'name', width: 24 },
    { header: 'البريد الإلكتروني', value: 'email', width: 28 },
    { header: 'الهاتف', value: r => r.phone || '', width: 18 },
    { header: 'الوظيفة', value: r => jobOf(r), width: 24 },
    { header: 'الدولة', value: r => r.country || '' },
    { header: 'سنوات الخبرة', value: r => r.experienceYears ?? '', width: 12 },
    { header: 'الحالة', value: r => STATUS[r.status]?.label || r.status },
    { header: 'رسالة التقديم', value: r => r.coverLetter || '', width: 60 },
    { header: 'أعمال سابقة', value: r => r.portfolio || '', width: 30 },
    { header: 'التاريخ', value: r => fmtDate(r.date) }
  ], filtered);

  const count = (s: Applicant['status']) => rows.filter(r => r.status === s).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4" dir="rtl">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={query} onChange={e => resetPage(setQuery)(e.target.value)} placeholder="ابحث بالاسم أو البريد أو الهاتف"
            className="w-full pr-10 pl-3 py-2.5 bg-slate-50 rounded-xl text-xs placeholder:text-slate-400 border border-transparent focus:border-slate-300 outline-hidden" />
        </div>
        <select value={job} onChange={e => resetPage(setJob)(e.target.value)} className={select} aria-label="الوظيفة">
          <option value="all">كل الوظائف</option>
          {jobOptions.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
        <select value={country} onChange={e => resetPage(setCountry)(e.target.value)} className={select} aria-label="الدولة">
          <option value="all">كل الدول</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={experience} onChange={e => resetPage(setExperience)(e.target.value)} className={select} aria-label="سنوات الخبرة">
          {EXPERIENCE.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        <select value={period} onChange={e => resetPage(setPeriod)(e.target.value)} className={select} aria-label="الفترة">
          {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <button onClick={load} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer" title="تحديث"><RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} /></button>
        <ExcelButton onClick={exportExcel} disabled={filtered.length === 0} />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <FilterChip active={status === 'all'} onClick={() => resetPage(setStatus)('all')}>الكل ({rows.length})</FilterChip>
        {(Object.keys(STATUS) as Applicant['status'][]).map(s => (
          <FilterChip key={s} active={status === s} onClick={() => resetPage(setStatus)(s)}>{STATUS[s].label} ({count(s)})</FilterChip>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="text-slate-400">
              {['#', 'الاسم', 'البريد الإلكتروني', 'الوظيفة', 'الدولة', 'سنوات الخبرة', 'الحالة', 'التاريخ', 'الإجراءات'].map(h => <th key={h} className="p-3 font-bold whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="p-10 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>}
            {!loading && pageItems.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-slate-400">لا يوجد متقدمون مطابقون</td></tr>}
            {!loading && pageItems.map((a, i) => (
              <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/60 cursor-pointer" onClick={() => setViewing(a)}>
                <td className="p-3 text-slate-500">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{a.name}</td>
                <td className="p-3 font-mono text-slate-600" dir="ltr">{a.email}</td>
                <td className="p-3 font-semibold">{jobOf(a)}</td>
                <td className="p-3">{a.country || '-'}</td>
                <td className="p-3 font-mono font-bold">{a.experienceYears ?? '-'}</td>
                <td className="p-3"><Badge tone={STATUS[a.status]?.tone}>{STATUS[a.status]?.label || a.status}</Badge></td>
                <td className="p-3 font-mono whitespace-nowrap">{fmtDate(a.date)}</td>
                <td className="p-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setViewing(a)} className="px-2.5 py-1.5 rounded-lg bg-brand-ink text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"><Eye className="w-3.5 h-3.5" />عرض الطلب</button>
                    <button onClick={() => remove(a)} title="حذف" className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} total={filtered.length} onPage={setPage} />

      {viewing && (
        <Drawer title={viewing.name} subtitle={<span className="flex items-center gap-2"><Badge tone={STATUS[viewing.status]?.tone}>{STATUS[viewing.status]?.label}</Badge>{jobOf(viewing)} · {fmtDate(viewing.date)}</span>} onClose={() => setViewing(null)}>
          <div className="p-6 space-y-5">
            <div className="rounded-2xl border border-slate-200 px-4">
              <Field label="البريد الإلكتروني"><a href={`mailto:${viewing.email}`} dir="ltr" className="inline-flex items-center gap-1 text-brand-text hover:underline"><Mail className="w-3 h-3" />{viewing.email}</a></Field>
              <Field label="الهاتف">{viewing.phone ? <a href={`tel:${viewing.phone}`} dir="ltr" className="inline-flex items-center gap-1 hover:underline"><Phone className="w-3 h-3" />{viewing.phone}</a> : '-'}</Field>
              <Field label="الدولة">{viewing.country || '-'}</Field>
              <Field label="الوظيفة المتقدَّم لها">{jobOf(viewing)}</Field>
              <Field label="سنوات الخبرة">{viewing.experienceYears ?? '-'}</Field>
              <Field label="أعمال سابقة">{viewing.portfolio ? <a href={viewing.portfolio} target="_blank" rel="noreferrer" dir="ltr" className="inline-flex items-center gap-1 text-brand-text hover:underline">{viewing.portfolio}<ExternalLink className="w-3 h-3" /></a> : '-'}</Field>
              <Field label="السيرة الذاتية">{viewing.cvUrl ? <a href={viewing.cvUrl} download={viewing.cvName || 'cv'} className="inline-flex items-center gap-1 text-brand-text hover:underline"><FileText className="w-3 h-3" />{viewing.cvName || 'تنزيل'}</a> : 'لم تُرفق'}</Field>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-black text-slate-900">رسالة التقديم</h4>
              <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4">{viewing.coverLetter || 'لا توجد رسالة'}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setRowStatus(viewing, 'reviewing')} disabled={viewing.status === 'reviewing'} className="py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold cursor-pointer disabled:opacity-40">قيد المراجعة</button>
              <button onClick={() => setRowStatus(viewing, 'accepted')} disabled={viewing.status === 'accepted'} className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold cursor-pointer disabled:opacity-40">قبول</button>
              <button onClick={() => setRowStatus(viewing, 'rejected')} disabled={viewing.status === 'rejected'} className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer disabled:opacity-40">رفض</button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
