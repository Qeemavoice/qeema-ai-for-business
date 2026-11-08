import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Check, X, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { fmtDateTime } from '../../lib/format';
import { exportToExcel } from '../../lib/exportExcel';
import { Badge, ExcelButton, FilterChip, StatCard, Tone } from './adminUi';

interface Review {
  bookingId: string; sampleId?: string; sampleName: string; talentName: string; companyName: string;
  rating: number; text: string; author: string; createdAt: string; status: 'pending' | 'approved' | 'rejected';
}

const STATUS: Record<Review['status'], { label: string; tone: Tone }> = {
  pending: { label: 'بانتظار المراجعة', tone: 'amber' },
  approved: { label: 'منشور', tone: 'green' },
  rejected: { label: 'مرفوض', tone: 'red' }
};
const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

/** Client ratings of booked voices. Nothing is public until an admin approves it. */
export const AdminReviewsView: React.FC = () => {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Review['status']>('pending');

  const load = async () => {
    setLoading(true);
    try { setRows(await api.getAdminReviews()); } catch { setRows([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (r: Review, status: Review['status']) => {
    await api.setReviewStatus(r.bookingId, status);
    setRows(list => list.map(x => x.bookingId === r.bookingId ? { ...x, status } : x));
  };

  const filtered = useMemo(() => rows.filter(r => filter === 'all' || r.status === filter), [rows, filter]);
  const avg = rows.length ? (rows.reduce((a, r) => a + r.rating, 0) / rows.length).toFixed(1) : '-';

  const exportExcel = () => exportToExcel<Review>('voice-reviews', 'تقييمات الأصوات', [
    { header: 'الحجز', value: 'bookingId', width: 12 },
    { header: 'الصوت', value: 'sampleName', width: 32 },
    { header: 'المعلق', value: 'talentName' },
    { header: 'العميل', value: 'companyName', width: 30 },
    { header: 'المقيّم', value: 'author' },
    { header: 'النجوم', value: 'rating', width: 8 },
    { header: 'التقييم', value: 'text', width: 60 },
    { header: 'الحالة', value: r => STATUS[r.status].label },
    { header: 'التاريخ', value: r => fmtDateTime(r.createdAt), width: 18 }
  ], filtered);

  const count = (s: Review['status']) => rows.filter(r => r.status === s).length;

  return (
    <div className="space-y-5" dir="rtl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="بانتظار المراجعة" value={count('pending')} tone="amber" />
        <StatCard label="منشورة" value={count('approved')} tone="green" />
        <StatCard label="مرفوضة" value={count('rejected')} tone="red" />
        <StatCard label="متوسط التقييم" value={avg} hint="من 5 نجوم" tone="orange" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? `الكل (${rows.length})` : `${STATUS[f].label} (${count(f)})`}
            </FilterChip>
          ))}
          <button onClick={load} className="mr-auto p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer" title="تحديث">
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <ExcelButton onClick={exportExcel} disabled={filtered.length === 0} />
        </div>

        {!loading && filtered.length === 0 && <p className="text-center text-xs text-slate-400 py-10">لا توجد تقييمات هنا</p>}
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.bookingId} className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-amber-500 text-base tracking-tight">{stars(r.rating)}</span>
                  <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                  <span className="text-[11px] text-slate-400 font-mono">{r.bookingId} · {fmtDateTime(r.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{r.text || <span className="text-slate-400">بدون تعليق نصي</span>}</p>
                <p className="text-[11px] text-slate-500">
                  {r.author} · {r.companyName} — الصوت: <b className="text-slate-700">{r.sampleName}</b> ({r.talentName})
                  {r.sampleId && <a href={`/ar/voices/${r.sampleId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 mr-2 text-brand-text hover:underline">صفحة الصوت <ExternalLink className="w-3 h-3" /></a>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.status !== 'approved' && (
                  <button onClick={() => setStatus(r, 'approved')} className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Check className="w-3.5 h-3.5" />نشر
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => setStatus(r, 'rejected')} className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <X className="w-3.5 h-3.5" />{r.status === 'approved' ? 'إلغاء النشر' : 'رفض'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
