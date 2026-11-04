import React, { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { fmtDateTime, fmtDuration, fmtNum } from '../../lib/format';
import { exportToExcel } from '../../lib/exportExcel';
import { Badge, ExcelButton, FilterChip, Pager, SamplePlayer, StatCard, Tone } from './adminUi';

const PAGE_SIZE = 12;
const REFRESH_MS = 15000;

export const DIALECT_AR: Record<string, string> = {
  gulf: 'خليجي', egyptian: 'مصري', levantine: 'شامي', maghrebi: 'مغاربي', fusha: 'فصحى'
};
const STATUS: Record<string, { label: string; tone: Tone }> = {
  completed: { label: 'مكتمل', tone: 'green' },
  processing: { label: 'قيد المعالجة', tone: 'amber' },
  pending: { label: 'بالانتظار', tone: 'slate' },
  failed: { label: 'فشل', tone: 'red' }
};

interface GenRow {
  id: string; companyId: string; companyName: string; userName: string;
  voiceId: string; voiceName: string; dialect: string; text: string; textChars: number;
  durationSeconds: number; creditsConsumed: number; costUsd: number;
  provider: string; model: string; audioUrl: string; status: string; createdAt: string;
}

type Range = 'all' | 'today' | '7d' | '30d';
const RANGE_DAYS: Record<Range, number> = { all: Infinity, today: 1, '7d': 7, '30d': 30 };

/** Every TTS studio generation on the platform (refreshes automatically). */
export const AdminTtsView: React.FC = () => {
  const [rows, setRows] = useState<GenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [company, setCompany] = useState('all');
  const [voice, setVoice] = useState('all');
  const [range, setRange] = useState<Range>('all');
  const [page, setPage] = useState(1);

  const load = async () => {
    try { setRows(await api.getAdminGenerations()); } catch { /* keep last data */ } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  const companies = useMemo(() => Array.from(new Map(rows.map(r => [r.companyId, r.companyName]))), [rows]);
  const voices = useMemo(() => Array.from(new Map(rows.map(r => [r.voiceId, r.voiceName]))), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const since = Date.now() - RANGE_DAYS[range] * 86400000;
    return rows.filter(r =>
      (company === 'all' || r.companyId === company) &&
      (voice === 'all' || r.voiceId === voice) &&
      new Date(r.createdAt).getTime() >= since &&
      (!q || [r.text, r.companyName, r.userName, r.voiceName].some(v => String(v).toLowerCase().includes(q)))
    );
  }, [rows, query, company, voice, range]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = {
    count: filtered.length,
    chars: filtered.reduce((a, r) => a + (r.textChars || 0), 0),
    seconds: filtered.reduce((a, r) => a + (r.durationSeconds || 0), 0),
    cost: filtered.reduce((a, r) => a + (r.costUsd || 0), 0),
    customers: new Set(filtered.map(r => r.companyId)).size
  };

  const topVoices = useMemo(() => {
    const m = new Map<string, { name: string; count: number; chars: number }>();
    filtered.forEach(r => {
      const v = m.get(r.voiceId) || { name: r.voiceName, count: 0, chars: 0 };
      v.count++; v.chars += r.textChars || 0;
      m.set(r.voiceId, v);
    });
    return Array.from(m.values()).sort((a, b) => b.chars - a.chars).slice(0, 5);
  }, [filtered]);

  const exportExcel = () => exportToExcel<GenRow>('tts-generations', 'استوديو TTS', [
    { header: 'المعرّف', value: 'id', width: 30 },
    { header: 'التاريخ', value: r => fmtDateTime(r.createdAt), width: 18 },
    { header: 'العميل', value: 'companyName', width: 30 },
    { header: 'المستخدم', value: 'userName' },
    { header: 'الصوت', value: 'voiceName', width: 26 },
    { header: 'اللهجة', value: r => DIALECT_AR[r.dialect] || r.dialect },
    { header: 'النص', value: 'text', width: 60 },
    { header: 'عدد الحروف', value: 'textChars', width: 12 },
    { header: 'المدة (ثانية)', value: r => Math.round(r.durationSeconds * 10) / 10, width: 12 },
    { header: 'الرصيد المخصوم', value: 'creditsConsumed', width: 14 },
    { header: 'تكلفة المزوّد ($)', value: 'costUsd', width: 14 },
    { header: 'المزوّد', value: r => `${r.provider} / ${r.model}`, width: 30 },
    { header: 'الحالة', value: r => STATUS[r.status]?.label || r.status }
  ], filtered);

  const ranges: { id: Range; label: string }[] = [
    { id: 'all', label: 'كل الفترات' }, { id: 'today', label: 'آخر 24 ساعة' }, { id: '7d', label: 'آخر 7 أيام' }, { id: '30d', label: 'آخر 30 يوماً' }
  ];
  const select = 'px-3 py-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 outline-hidden cursor-pointer max-w-[220px]';

  return (
    <div className="space-y-5" dir="rtl">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="عمليات التوليد" value={fmtNum(totals.count)} />
        <StatCard label="الحروف المولّدة" value={fmtNum(totals.chars)} tone="orange" hint="1 حرف = 1 نقطة رصيد" />
        <StatCard label="مدة الصوت الناتج" value={fmtDuration(totals.seconds)} hint="دقائق:ثوانٍ" />
        <StatCard label="تكلفة المزوّدين" value={`$${totals.cost.toFixed(4)}`} tone="amber" />
        <StatCard label="عملاء استخدموا الاستوديو" value={fmtNum(totals.customers)} tone="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="ابحث في النص أو العميل أو الصوت"
                className="w-full pr-10 pl-3 py-2.5 bg-slate-50 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 border border-transparent focus:border-slate-300 outline-hidden" />
            </div>
            <select value={company} onChange={e => { setCompany(e.target.value); setPage(1); }} className={select}>
              <option value="all">كل العملاء</option>
              {companies.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            <select value={voice} onChange={e => { setVoice(e.target.value); setPage(1); }} className={select}>
              <option value="all">كل الأصوات</option>
              {voices.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            <button onClick={load} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer" title="تحديث"><RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} /></button>
            <ExcelButton onClick={exportExcel} disabled={filtered.length === 0} />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {ranges.map(r => <FilterChip key={r.id} active={range === r.id} onClick={() => { setRange(r.id); setPage(1); }}>{r.label}</FilterChip>)}
            <span className="text-[10px] text-slate-400 mr-auto whitespace-nowrap">تحديث تلقائي كل {REFRESH_MS / 1000} ثانية</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="p-3 font-bold">الاستماع</th>
                  <th className="p-3 font-bold">النص</th>
                  <th className="p-3 font-bold">العميل</th>
                  <th className="p-3 font-bold">الصوت</th>
                  <th className="p-3 font-bold">الحروف</th>
                  <th className="p-3 font-bold">التكلفة</th>
                  <th className="p-3 font-bold">التاريخ</th>
                  <th className="p-3 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>}
                {!loading && pageItems.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-slate-400">لا توجد عمليات توليد مطابقة</td></tr>}
                {pageItems.map(r => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60 align-top">
                    <td className="p-3 w-44"><SamplePlayer url={r.audioUrl} durationSec={Math.round(r.durationSeconds)} compact /></td>
                    <td className="p-3 min-w-[200px] max-w-[280px]"><p className="text-slate-800 line-clamp-2" title={r.text}>{r.text}</p></td>
                    <td className="p-3 min-w-[160px]"><p className="font-bold text-slate-900">{r.companyName}</p><p className="text-[10px] text-slate-400">{r.userName}</p></td>
                    <td className="p-3 min-w-[140px]"><p className="font-semibold text-slate-800">{r.voiceName}</p><Badge tone="orange" className="mt-1">{DIALECT_AR[r.dialect] || r.dialect}</Badge></td>
                    <td className="p-3 font-mono">{fmtNum(r.textChars)}<span className="block text-[10px] text-slate-400">{fmtDuration(Math.round(r.durationSeconds))}</span></td>
                    <td className="p-3 font-mono text-slate-600">${(r.costUsd || 0).toFixed(4)}</td>
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{fmtDateTime(r.createdAt)}</td>
                    <td className="p-3"><Badge tone={STATUS[r.status]?.tone}>{STATUS[r.status]?.label || r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={page} pages={pages} total={filtered.length} onPage={setPage} />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
          <h3 className="text-sm font-black text-slate-900">الأصوات الأكثر استخداماً</h3>
          {topVoices.length === 0 && <p className="text-xs text-slate-400">لا توجد بيانات</p>}
          {topVoices.map(v => (
            <div key={v.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate">{v.name}</span>
                <span className="font-mono text-slate-500">{fmtNum(v.chars)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-brand" style={{ width: `${(v.chars / (topVoices[0]?.chars || 1)) * 100}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">{fmtNum(v.count)} عملية</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
