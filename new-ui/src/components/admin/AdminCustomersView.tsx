import React, { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, Mail, Phone, Eye, Ban, RotateCcw, Plus, StickyNote } from 'lucide-react';
import { api } from '../../lib/api';
import { PLANS, findPlan } from '../../../shared/plans';
import { fmtDate, fmtDateTime, fmtMoney, fmtNum } from '../../lib/format';
import { exportToExcel } from '../../lib/exportExcel';
import { Badge, Drawer, ExcelButton, Field, FilterChip, Pager, StatCard, Tabs, Tone } from './adminUi';

const PAGE_SIZE = 10;
const LOW_BALANCE = 2000;
const INACTIVE_DAYS = 30;

interface Customer {
  id: string; name: string; industry: string; country: string; createdAt: string; planId: string;
  status: 'active' | 'suspended'; contactEmail: string; phone?: string; ownerName: string;
  balance: number; membersCount: number; generationsCount: number; charsUsed: number;
  bookingsCount: number; activeBookingsCount: number; bookingsSpentUsd: number; purchasedCredits: number;
  lastActivityAt: string;
}

const STATUS: Record<Customer['status'], { label: string; tone: Tone }> = {
  active: { label: 'نشط', tone: 'green' },
  suspended: { label: 'موقوف', tone: 'red' }
};
const BOOKING_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'بانتظار المراجعة', tone: 'amber' },
  in_studio: { label: 'استوديو التسجيل', tone: 'blue' },
  delivered: { label: 'تم التسليم', tone: 'orange' },
  approved: { label: 'معتمد ومكتمل', tone: 'green' }
};
const TX_REASON: Record<string, string> = {
  signup_bonus: 'رصيد ترحيبي', generation: 'استهلاك توليد', admin_grant: 'منحة إدارية', refund: 'استرداد', purchase: 'شراء'
};
const ROLE: Record<string, string> = { admin: 'مدير الحساب', member: 'عضو', viewer: 'مشاهد' };

const planName = (id: string) => findPlan(id)?.nameAr || id;
const daysSince = (d: string) => (Date.now() - new Date(d).getTime()) / 86400000;

type Segment = 'all' | 'active' | 'suspended' | 'low' | 'inactive' | 'new';

export const AdminCustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<Segment>('all');
  const [plan, setPlan] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  const load = async () => {
    setLoading(true);
    try { setCustomers(await api.getAdminCustomers()); } catch { setCustomers([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const inSegment = (c: Customer, s: Segment) =>
    s === 'all' ? true
    : s === 'active' || s === 'suspended' ? c.status === s
    : s === 'low' ? c.balance < LOW_BALANCE
    : s === 'inactive' ? daysSince(c.lastActivityAt) > INACTIVE_DAYS
    : daysSince(c.createdAt) <= 30;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter(c =>
      inSegment(c, segment) &&
      (plan === 'all' || c.planId === plan) &&
      (!q || [c.name, c.contactEmail, c.ownerName, c.country, c.industry, c.phone].some(v => String(v || '').toLowerCase().includes(q)))
    );
  }, [customers, segment, plan, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const kpi = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    paying: customers.filter(c => (findPlan(c.planId)?.priceUsd ?? 1) !== 0).length,
    spent: customers.reduce((a, c) => a + c.bookingsSpentUsd, 0),
    low: customers.filter(c => c.balance < LOW_BALANCE).length
  };

  const exportExcel = () => exportToExcel<Customer>('customers', 'العملاء', [
    { header: 'المعرّف', value: 'id', width: 18 },
    { header: 'العميل', value: 'name', width: 34 },
    { header: 'المسؤول', value: 'ownerName' },
    { header: 'البريد الإلكتروني', value: 'contactEmail', width: 28 },
    { header: 'الهاتف', value: c => c.phone || '' },
    { header: 'الدولة', value: 'country' },
    { header: 'القطاع', value: 'industry', width: 24 },
    { header: 'الباقة', value: c => planName(c.planId) },
    { header: 'الحالة', value: c => STATUS[c.status].label },
    { header: 'الرصيد (حرف)', value: 'balance', width: 14 },
    { header: 'الحروف المستهلكة', value: 'charsUsed', width: 14 },
    { header: 'عدد التوليدات', value: 'generationsCount', width: 12 },
    { header: 'عدد الحجوزات', value: 'bookingsCount', width: 12 },
    { header: 'إنفاق الحجوزات ($)', value: 'bookingsSpentUsd', width: 14 },
    { header: 'عدد الأعضاء', value: 'membersCount', width: 10 },
    { header: 'تاريخ التسجيل', value: c => fmtDate(c.createdAt) },
    { header: 'آخر نشاط', value: c => fmtDate(c.lastActivityAt) }
  ], filtered);

  const onChanged = (u: Partial<Customer> & { id: string }) => setCustomers(p => p.map(c => c.id === u.id ? { ...c, ...u } : c));

  const segments: { id: Segment; label: string }[] = [
    { id: 'all', label: 'الكل' }, { id: 'active', label: 'نشط' }, { id: 'suspended', label: 'موقوف' },
    { id: 'low', label: 'رصيد منخفض' }, { id: 'inactive', label: `غير نشط +${INACTIVE_DAYS} يوم` }, { id: 'new', label: 'جدد هذا الشهر' }
  ];

  return (
    <div className="space-y-5" dir="rtl">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="إجمالي العملاء" value={fmtNum(kpi.total)} />
        <StatCard label="حسابات نشطة" value={fmtNum(kpi.active)} tone="green" />
        <StatCard label="باقات مدفوعة" value={fmtNum(kpi.paying)} tone="orange" />
        <StatCard label="إنفاق الحجوزات" value={fmtMoney(kpi.spent)} hint="إجمالي حجوزات المعلقين" />
        <StatCard label="رصيد منخفض" value={fmtNum(kpi.low)} hint={`أقل من ${fmtNum(LOW_BALANCE)} حرف`} tone="amber" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="ابحث بالاسم أو البريد أو الدولة"
              className="w-full pr-10 pl-3 py-2.5 bg-slate-50 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 border border-transparent focus:border-slate-300 outline-hidden" />
          </div>
          <select value={plan} onChange={e => { setPlan(e.target.value); setPage(1); }} className="px-3 py-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 outline-hidden cursor-pointer">
            <option value="all">كل الباقات</option>
            {PLANS.map(p => <option key={p.id} value={p.id}>{p.nameAr}</option>)}
          </select>
          <button onClick={load} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer" title="تحديث"><RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} /></button>
          <ExcelButton onClick={exportExcel} disabled={filtered.length === 0} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {segments.map(s => (
            <FilterChip key={s.id} active={segment === s.id} onClick={() => { setSegment(s.id); setPage(1); }}>
              {s.label} <span className="font-mono opacity-60">({customers.filter(c => inSegment(c, s.id)).length})</span>
            </FilterChip>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400">
                <th className="p-3 font-bold">العميل</th>
                <th className="p-3 font-bold">الباقة</th>
                <th className="p-3 font-bold">الرصيد</th>
                <th className="p-3 font-bold">الاستهلاك</th>
                <th className="p-3 font-bold">الحجوزات</th>
                <th className="p-3 font-bold">آخر نشاط</th>
                <th className="p-3 font-bold">الحالة</th>
                <th className="p-3 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="p-10 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>}
              {!loading && pageItems.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-slate-400">لا يوجد عملاء مطابقون</td></tr>}
              {!loading && pageItems.map(c => (
                <tr key={c.id} onClick={() => setSelectedId(c.id)} className="border-t border-slate-100 hover:bg-slate-50/60 cursor-pointer">
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono" dir="ltr">{c.contactEmail}</p>
                    <p className="text-[10px] text-slate-400">{c.country} · {c.industry}</p>
                  </td>
                  <td className="p-3"><Badge tone="orange">{planName(c.planId)}</Badge></td>
                  <td className={`p-3 font-mono font-bold ${c.balance < LOW_BALANCE ? 'text-amber-600' : 'text-slate-900'}`}>{fmtNum(c.balance)}<span className="text-[10px] text-slate-400 font-sans"> حرف</span></td>
                  <td className="p-3 font-mono text-slate-700">{fmtNum(c.charsUsed)}<span className="block text-[10px] text-slate-400 font-sans">{fmtNum(c.generationsCount)} توليد</span></td>
                  <td className="p-3 font-mono text-slate-700">{fmtNum(c.bookingsCount)}<span className="block text-[10px] text-slate-400 font-sans">{fmtMoney(c.bookingsSpentUsd)}</span></td>
                  <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{fmtDate(c.lastActivityAt)}</td>
                  <td className="p-3"><Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge></td>
                  <td className="p-3"><button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer" title="عرض الحساب"><Eye className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} total={filtered.length} onPage={setPage} />
      </div>

      {selectedId && <CustomerDrawer id={selectedId} onClose={() => setSelectedId(null)} onChanged={onChanged} flash={flash} />}
      {toast && <div className="fixed bottom-6 left-6 z-[60] px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl">{toast}</div>}
    </div>
  );
};

/* ---------------- customer drawer ---------------- */

const CustomerDrawer: React.FC<{ id: string; onClose: () => void; onChanged: (c: Partial<Customer> & { id: string }) => void; flash: (m: string) => void }> = ({ id, onClose, onChanged, flash }) => {
  const [data, setData] = useState<any | null>(null);
  const [tab, setTab] = useState('overview');
  const [grant, setGrant] = useState('10000');
  const [grantReason, setGrantReason] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => { try { setData(await api.getAdminCustomer(id)); } catch (e: any) { flash(e.message); onClose(); } };
  useEffect(() => { load(); }, [id]);

  const run = async (fn: () => Promise<any>, msg: string) => {
    setBusy(true);
    try { await fn(); await load(); flash(msg); } catch (e: any) { flash(e.message || 'حدث خطأ'); } finally { setBusy(false); }
  };
  useEffect(() => { if (data?.customer) onChanged(data.customer); }, [data]);

  if (!data) return <Drawer title="جارٍ التحميل..." onClose={onClose}><div className="p-10 text-center"><RefreshCw className="w-5 h-5 animate-spin inline text-slate-400" /></div></Drawer>;
  const c: Customer = data.customer;
  const suspended = c.status === 'suspended';

  const header = (
    <span className="flex items-center gap-2 flex-wrap">
      <Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge>
      <span>{planName(c.planId)} · منذ {fmtDate(c.createdAt)}</span>
    </span>
  );

  return (
    <Drawer title={c.name} subtitle={header} onClose={onClose}>
      <Tabs active={tab} onChange={setTab} tabs={[
        { id: 'overview', label: 'نظرة عامة' },
        { id: 'bookings', label: 'الحجوزات', count: data.bookings.length },
        { id: 'credits', label: 'الرصيد والحركات', count: data.transactions.length },
        { id: 'members', label: 'الأعضاء', count: data.members.length },
        { id: 'notes', label: 'الملاحظات', count: data.notes.length }
      ]} />
      <div className="p-6 space-y-5">
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="الرصيد الحالي" value={fmtNum(c.balance)} hint="حرف" tone={c.balance < LOW_BALANCE ? 'amber' : 'slate'} />
              <StatCard label="الحروف المستهلكة" value={fmtNum(c.charsUsed)} hint={`${fmtNum(c.generationsCount)} توليد`} />
              <StatCard label="الحجوزات" value={fmtNum(c.bookingsCount)} hint={`${fmtNum(c.activeBookingsCount)} قيد التنفيذ`} />
              <StatCard label="إنفاق الحجوزات" value={fmtMoney(c.bookingsSpentUsd)} tone="orange" />
            </div>
            <div className="rounded-2xl border border-slate-200 px-4">
              <Field label="المسؤول">{c.ownerName || '-'}</Field>
              <Field label="البريد الإلكتروني">{c.contactEmail ? <a href={`mailto:${c.contactEmail}`} dir="ltr" className="inline-flex items-center gap-1 text-brand-text hover:underline"><Mail className="w-3 h-3" />{c.contactEmail}</a> : '-'}</Field>
              <Field label="الهاتف">{c.phone ? <a href={`tel:${c.phone}`} dir="ltr" className="inline-flex items-center gap-1 hover:underline"><Phone className="w-3 h-3" />{c.phone}</a> : '-'}</Field>
              <Field label="الدولة">{c.country}</Field>
              <Field label="القطاع">{c.industry}</Field>
              <Field label="آخر نشاط">{fmtDateTime(c.lastActivityAt)}</Field>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-900">تغيير الباقة</h4>
              <select value={c.planId} disabled={busy} onChange={e => run(() => api.updateAdminCompanyPlan(c.id, e.target.value), 'تم تغيير الباقة')}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-hidden cursor-pointer">
                {PLANS.map(p => <option key={p.id} value={p.id}>{p.nameAr}{p.priceUsd ? ` ($${p.priceUsd} / شهر)` : ''}</option>)}
              </select>
            </div>

            <form className="rounded-2xl border border-slate-200 p-4 space-y-3" onSubmit={e => { e.preventDefault(); run(() => api.grantCredits({ companyId: c.id, amountCredits: Number(grant), reason: grantReason || undefined }), `تمت إضافة ${fmtNum(Number(grant))} حرف للرصيد`); setGrantReason(''); }}>
              <h4 className="text-xs font-black text-slate-900">منح رصيد</h4>
              <div className="flex gap-2">
                <input type="number" min={1} required value={grant} onChange={e => setGrant(e.target.value)} className="w-32 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-hidden focus:border-brand" />
                <input value={grantReason} onChange={e => setGrantReason(e.target.value)} placeholder="السبب (اختياري)" className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand" />
                <button disabled={busy} className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"><Plus className="w-3.5 h-3.5" />منح</button>
              </div>
            </form>

            <button disabled={busy} onClick={() => {
              if (!suspended && !window.confirm(`إيقاف حساب ${c.name}؟`)) return;
              run(() => api.setAdminCustomerStatus(c.id, suspended ? 'active' : 'suspended'), suspended ? 'تمت إعادة تفعيل الحساب' : 'تم إيقاف الحساب');
            }} className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer disabled:opacity-50 ${suspended ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}>
              {suspended ? <><RotateCcw className="w-3.5 h-3.5" />إعادة تفعيل الحساب</> : <><Ban className="w-3.5 h-3.5" />إيقاف الحساب</>}
            </button>
          </>
        )}

        {tab === 'bookings' && (
          data.bookings.length === 0 ? <p className="text-center text-xs text-slate-400 py-10">لا توجد حجوزات لهذا العميل</p> :
          <div className="space-y-3">
            {data.bookings.map((b: any) => (
              <div key={b.id} className="rounded-2xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{b.id}</span>
                  <Badge tone={BOOKING_STATUS[b.status]?.tone}>{BOOKING_STATUS[b.status]?.label || b.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{b.scriptText}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>المعلق: <b className="text-slate-800">{b.talentName}</b></span>
                  <span className="font-mono">{fmtMoney(b.priceUsd)} · {fmtDate(b.createdAt)}</span>
                </div>
                {b.deliverableAudioUrl && <audio controls preload="none" src={b.deliverableAudioUrl} className="w-full h-9" />}
              </div>
            ))}
          </div>
        )}

        {tab === 'credits' && (
          <table className="w-full text-right text-xs">
            <thead><tr className="text-slate-400"><th className="p-2 font-bold">التاريخ</th><th className="p-2 font-bold">النوع</th><th className="p-2 font-bold">الوصف</th><th className="p-2 font-bold">الحركة</th><th className="p-2 font-bold">الرصيد بعدها</th></tr></thead>
            <tbody>
              {data.transactions.map((t: any) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="p-2 font-mono text-slate-500 whitespace-nowrap">{fmtDate(t.createdAt)}</td>
                  <td className="p-2">{TX_REASON[t.reason] || t.reason}</td>
                  <td className="p-2 text-slate-600">{t.description}</td>
                  <td className={`p-2 font-mono font-bold ${t.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} dir="ltr">{t.delta >= 0 ? '+' : ''}{fmtNum(t.delta)}</td>
                  <td className="p-2 font-mono">{fmtNum(t.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'members' && (
          <div className="space-y-2">
            {data.members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                {m.avatar ? <img src={m.avatar} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-orange-50 text-brand-text flex items-center justify-center font-black">{m.name?.[0]}</div>}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">{m.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono" dir="ltr">{m.email}</p>
                </div>
                <Badge>{ROLE[m.role] || m.role}</Badge>
                <span className="text-[10px] text-slate-400 font-mono">{fmtDate(m.createdAt)}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'notes' && (
          <>
            <form className="space-y-2" onSubmit={e => { e.preventDefault(); if (!note.trim()) return; run(() => api.addAdminCustomerNote(c.id, note), 'تم حفظ الملاحظة'); setNote(''); }}>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="ملاحظة داخلية عن الحساب (لا تظهر للعميل)" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand" />
              <button disabled={busy || !note.trim()} className="px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"><StickyNote className="w-3.5 h-3.5" />إضافة ملاحظة</button>
            </form>
            {data.notes.length === 0 ? <p className="text-center text-xs text-slate-400 py-6">لا توجد ملاحظات بعد</p> : data.notes.map((n: any) => (
              <div key={n.id} className="rounded-2xl bg-amber-50/60 border border-amber-100 p-3">
                <p className="text-xs text-slate-800 whitespace-pre-wrap">{n.text}</p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-mono">{fmtDateTime(n.createdAt)}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </Drawer>
  );
};
