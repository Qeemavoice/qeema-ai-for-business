import React, { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, Check, X, AlertTriangle, Info } from 'lucide-react';
import { narratorService } from '../../services/narratorService';
import { Narrator, VoiceSample, VoiceSampleStatus } from '../../types';
import { finalPrice, fmtUsd, commissionPercent } from '../../../shared/pricing';
import { REJECTION_REASONS, SAMPLE_RULES, reasonByCode } from '../../../shared/sampleRules';
import { fmtDate, fmtNum } from '../../lib/format';
import { exportToExcel } from '../../lib/exportExcel';
import { Badge, ExcelButton, FilterChip, Pager, SamplePlayer, StatCard, Tone } from './adminUi';

const PAGE_SIZE = 10;
const STATUS: Record<VoiceSampleStatus, { label: string; tone: Tone }> = {
  pending_review: { label: 'قيد المراجعة', tone: 'amber' },
  published: { label: 'معتمدة', tone: 'green' },
  rejected: { label: 'مرفوضة', tone: 'red' },
  hidden: { label: 'مخفية', tone: 'slate' }
};

export const AdminSamplesView: React.FC = () => {
  const [narrators, setNarrators] = useState<Narrator[]>([]);
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | VoiceSampleStatus>('pending_review');
  const [narratorFilter, setNarratorFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [rejecting, setRejecting] = useState<VoiceSample | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const [n, s] = await Promise.all([narratorService.getAllNarrators(), narratorService.getAllVoiceSamples()]);
      setNarrators(n); setSamples(s);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const narratorOf = (id: string) => narrators.find(n => n.id === id);
  const autoCodesOf = (s: VoiceSample) => narratorService.getAutoRejectionCodes(s);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return samples.filter(s =>
      (filter === 'all' || s.status === filter) &&
      (narratorFilter === 'all' || s.narratorId === narratorFilter) &&
      (!q || s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.dialect.toLowerCase().includes(q) || (narratorOf(s.narratorId)?.displayName || '').toLowerCase().includes(q))
    );
  }, [samples, narrators, filter, narratorFilter, query]);

  useEffect(() => { setPage(1); }, [filter, narratorFilter, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const count = (st: VoiceSampleStatus) => samples.filter(s => s.status === st).length;

  const approve = async (s: VoiceSample) => {
    setBusyId(s.id);
    try {
      const u = await narratorService.adminApproveSample(s.id);
      setSamples(p => p.map(x => x.id === u.id ? u : x));
      flash('تم اعتماد العينة ونشرها، وأُرسل إشعار للمعلق');
    } catch (e: any) { flash(e.message || 'تعذر الاعتماد'); } finally { setBusyId(null); }
  };

  const openReject = (s: VoiceSample) => { setRejecting(s); setCodes(autoCodesOf(s)); setNote(''); };
  const toggleCode = (c: string) => setCodes(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const previewTexts = rejecting ? [
    ...codes.map(c => c === 'duration' ? `مدة العينة ${rejecting.durationSec} ثانية وتتجاوز الحد الأقصى المسموح (${SAMPLE_RULES.maxDurationSec} ثانية).`
      : c === 'format' ? `صيغة الملف (${(rejecting.format || '').toUpperCase()}) غير مقبولة، المقبول هو MP3 فقط.` : (reasonByCode(c)?.message || c)),
    ...(note.trim() ? [note.trim()] : [])
  ] : [];

  const confirmReject = async () => {
    if (!rejecting || previewTexts.length === 0) return;
    setSaving(true);
    try {
      const u = await narratorService.adminRejectSample(rejecting.id, codes, note);
      setSamples(p => p.map(x => x.id === u.id ? u : x));
      flash('تم رفض العينة وأُرسل إشعار للمعلق يتضمن أسباب الرفض');
      setRejecting(null);
    } catch (e: any) { flash(e.message || 'تعذر الرفض'); } finally { setSaving(false); }
  };

  const exportExcel = () => exportToExcel<VoiceSample>('samples', 'العينات', [
    { header: 'المعرّف', value: 'id', width: 22 },
    { header: 'عنوان العينة', value: 'title', width: 34 },
    { header: 'المعلق', value: s => narratorOf(s.narratorId)?.displayName || s.narratorId },
    { header: 'التصنيف', value: 'category' },
    { header: 'اللهجة', value: 'dialect' },
    { header: 'المدة (ثانية)', value: 'durationSec', width: 14 },
    { header: 'الصيغة', value: s => (s.format || 'mp3').toUpperCase(), width: 10 },
    { header: 'سعر المعلق / دقيقة ($)', value: s => narratorOf(s.narratorId)?.rates?.perMinuteUsd ?? '' },
    { header: 'السعر النهائي / دقيقة ($)', value: s => { const p = narratorOf(s.narratorId)?.rates?.perMinuteUsd; return p ? finalPrice(p) : ''; } },
    { header: 'الحالة', value: s => STATUS[s.status].label },
    { header: 'رفض تلقائي', value: s => s.autoRejected ? 'نعم' : '' },
    { header: 'سبب الرفض', value: s => s.rejectionReason || '', width: 50 },
    { header: 'تاريخ الرفع', value: s => fmtDate(s.createdAt) },
    { header: 'تاريخ المراجعة', value: s => fmtDate(s.reviewedAt) }
  ], filtered);

  return (
    <div className="space-y-4" dir="rtl">
      {toast && <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">{toast}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="بانتظار المراجعة" value={fmtNum(count('pending_review'))} tone="amber" />
        <StatCard label="معتمدة ومنشورة" value={fmtNum(count('published'))} tone="green" />
        <StatCard label="مرفوضة" value={fmtNum(count('rejected'))} tone="red" />
        <StatCard label="رفض تلقائي من النظام" value={fmtNum(samples.filter(s => s.autoRejected).length)} hint="مخالفة المدة أو الصيغة" />
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs text-sky-900 leading-relaxed">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p><strong>شروط العينة:</strong> صيغة MP3 فقط، ومدة لا تتجاوز {SAMPLE_RULES.maxDurationSec} ثانية. أي عينة تخالف ذلك <strong>تُرفض تلقائياً</strong> ويصل المعلق إشعار في حسابه بسبب الرفض. عند الرفض اليدوي اختر الأسباب من القائمة وسيصله نصها كاملاً.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="بحث بالعنوان أو المعلق أو التصنيف"
              className="w-full pr-10 pl-3 py-2.5 bg-slate-50 rounded-xl text-xs border border-transparent focus:border-slate-300 outline-hidden" />
          </div>
          <select value={narratorFilter} onChange={e => setNarratorFilter(e.target.value)} className="px-3 py-2.5 bg-slate-50 rounded-xl text-xs font-semibold outline-hidden cursor-pointer">
            <option value="all">كل المعلقين</option>
            {narrators.map(n => <option key={n.id} value={n.id}>{n.displayName}</option>)}
          </select>
          <ExcelButton onClick={exportExcel} disabled={filtered.length === 0} />
          <button onClick={load} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer" title="تحديث"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <FilterChip active={filter === 'pending_review'} onClick={() => setFilter('pending_review')}>قيد المراجعة ({count('pending_review')})</FilterChip>
          <FilterChip active={filter === 'published'} onClick={() => setFilter('published')}>معتمدة ({count('published')})</FilterChip>
          <FilterChip active={filter === 'rejected'} onClick={() => setFilter('rejected')}>مرفوضة ({count('rejected')})</FilterChip>
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>الكل ({samples.length})</FilterChip>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400">
                <th className="p-3 font-bold min-w-[190px]">الاستماع</th>
                <th className="p-3 font-bold">العينة</th>
                <th className="p-3 font-bold">المعلق</th>
                <th className="p-3 font-bold">المدة / الصيغة</th>
                <th className="p-3 font-bold">السعر / د</th>
                <th className="p-3 font-bold">الحالة</th>
                <th className="p-3 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {!loading && pageItems.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-slate-400">لا توجد عينات مطابقة</td></tr>}
              {pageItems.map(s => {
                const n = narratorOf(s.narratorId);
                const violations = autoCodesOf(s);
                const price = n?.rates?.perMinuteUsd;
                return (
                  <tr key={s.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="p-3"><SamplePlayer url={s.audioUrl} durationSec={s.durationSec} compact /></td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900 max-w-[220px]">{s.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.category} • {s.dialect}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{fmtDate(s.createdAt)}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={n?.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-200" />
                        <span className="font-semibold text-slate-800">{n?.displayName || s.narratorId}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono">
                      <span className={`block ${s.durationSec > SAMPLE_RULES.maxDurationSec ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{s.durationSec} ث {s.durationSec > SAMPLE_RULES.maxDurationSec && <AlertTriangle className="w-3 h-3 inline" />}</span>
                      <span className={`block ${(s.format || 'mp3') !== 'mp3' ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>{(s.format || 'mp3').toUpperCase()} {(s.format || 'mp3') !== 'mp3' && <AlertTriangle className="w-3 h-3 inline" />}</span>
                    </td>
                    <td className="p-3 font-mono">
                      {price ? (<><span className="block font-bold text-brand-text">${fmtUsd(finalPrice(price))}</span><span className="block text-[10px] text-slate-400">للمعلق ${fmtUsd(price)} + {commissionPercent()}%</span></>) : '-'}
                    </td>
                    <td className="p-3 max-w-[260px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
                        {s.autoRejected && <Badge tone="red">رفض تلقائي</Badge>}
                      </div>
                      {s.status === 'pending_review' && violations.length > 0 && <p className="text-[10px] text-rose-600 mt-1">تخالف الشروط وسيتم رفضها</p>}
                      {s.status === 'rejected' && (
                        <ul className="mt-1.5 text-[10px] text-rose-700 space-y-0.5">
                          {(s.rejectionCodes || []).map(c => <li key={c}>• {reasonByCode(c)?.label || c}</li>)}
                          {(!s.rejectionCodes || s.rejectionCodes.length === 0) && s.rejectionReason && <li className="line-clamp-2">• {s.rejectionReason}</li>}
                        </ul>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.status !== 'published' && (
                          <button onClick={() => approve(s)} disabled={busyId === s.id || violations.length > 0} title={violations.length ? 'لا يمكن اعتماد عينة تخالف الشروط' : 'اعتماد ونشر'}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"><Check className="w-3.5 h-3.5" />اعتماد</button>
                        )}
                        {s.status !== 'rejected' && (
                          <button onClick={() => openReject(s)} className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"><X className="w-3.5 h-3.5" />رفض</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} total={filtered.length} onPage={setPage} />
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setRejecting(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 space-y-4 text-right" dir="rtl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">رفض العينة «{rejecting.title}»</h3>
              <button onClick={() => setRejecting(null)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500">اختر سبب الرفض (يمكن اختيار أكثر من سبب). سيصل المعلق إشعار في حسابه بنص الأسباب ليصحح عينته.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REJECTION_REASONS.map(r => {
                const on = codes.includes(r.code);
                const detected = autoCodesOf(rejecting).includes(r.code);
                return (
                  <label key={r.code} className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${on ? 'border-rose-300 bg-rose-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={on} onChange={() => toggleCode(r.code)} className="mt-0.5 accent-rose-600" />
                    <span className="font-semibold text-slate-800">{r.label}{detected && <span className="mr-1.5 text-[10px] text-rose-600">(مكتشف)</span>}</span>
                  </label>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">ملاحظة إضافية للمعلق (اختياري)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="مثال: أعد تسجيل الجملة الأخيرة بنبرة أهدأ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand resize-none" />
            </div>

            {previewTexts.length > 0 && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5">
                <p className="text-[11px] font-bold text-slate-500 mb-1.5">هذا ما سيصل إلى المعلق:</p>
                <ul className="text-xs text-slate-800 space-y-1 list-disc pr-5 leading-relaxed">{previewTexts.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setRejecting(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">إلغاء</button>
              <button onClick={confirmReject} disabled={saving || previewTexts.length === 0} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-40">{saving ? 'جارٍ الحفظ...' : 'تأكيد الرفض وإشعار المعلق'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
