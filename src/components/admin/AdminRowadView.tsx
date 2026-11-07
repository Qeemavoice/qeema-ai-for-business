import React, { useEffect, useState } from 'react';
import { Search, Send, CalendarPlus, Ban, Copy, AlertTriangle } from 'lucide-react';
import { Badge, StatCard, FilterChip, type Tone } from './adminUi';
import { fmtNum } from '../../lib/format';

/** «روّاد قيمة» invites (server: AdminController::rowadInvites / resend / extend / cancel) */
interface InviteRow {
  id: number; code: string; name: string | null; email: string | null; phone: string | null; status: string;
  emailMismatch: boolean; sentAt: string | null; openedAt: string | null; redeemedAt: string | null;
  redeemedBy: { id: number; email: string } | null; expiresAt: string | null; emailLink: string; whatsappLink: string;
}
interface Stats { total: number; sent: number; opened: number; redeemed: number; emailMismatch: number;
  freeCharsGranted: number; freeCharsUsed: number; rowadPurchases: number; rowadPurchasesUsd: number }

const STATUS: Record<string, { label: string; tone: Tone }> = {
  created: { label: 'جديدة', tone: 'slate' }, sent: { label: 'مُرسلة', tone: 'blue' }, opened: { label: 'مفتوحة', tone: 'amber' },
  redeemed: { label: 'مفعّلة', tone: 'green' }, expired: { label: 'منتهية', tone: 'red' }
};
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleString('ar', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions) : '—');

export const AdminRowadView: React.FC = () => {
  const [rows, setRows] = useState<InviteRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [extendId, setExtendId] = useState<number | null>(null);
  const [extendTo, setExtendTo] = useState('');

  const load = () => {
    const p = new URLSearchParams({ ...(status ? { status } : {}), ...(q.trim() ? { q: q.trim() } : {}) });
    fetch(`/api/v1/admin/rowad/invites?${p}`).then(r => r.json()).then(d => { setRows(d.invites || []); setStats(d.stats || null); }).catch(() => setMsg('تعذّر تحميل الدعوات'));
  };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [status, q]);

  const act = async (id: number, action: 'resend' | 'extend' | 'cancel', body?: object) => {
    if (action === 'cancel' && !confirm('إلغاء هذه الدعوة؟ لن يعمل رابطها بعد الآن.')) return;
    const r = await fetch(`/api/v1/admin/rowad/invites/${id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    const d = await r.json().catch(() => ({}));
    setMsg(r.ok ? ({ resend: 'أُعيد إرسال الدعوة', extend: 'تم تمديد الدعوة', cancel: 'أُلغيت الدعوة' }[action]) : d.error || 'تعذّر تنفيذ العملية');
    if (r.ok) { setExtendId(null); load(); }
  };
  const copy = (text: string) => { navigator.clipboard?.writeText(text); setMsg('تم نسخ الرابط'); };

  return (
    <div className="space-y-6" dir="rtl">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="مُرسلة / مفتوحة / مفعّلة" value={`${stats.sent} / ${stats.opened} / ${stats.redeemed}`} hint={`من ${stats.total} دعوة`} />
          <StatCard label="الأحرف المجانية المستهلكة" value={fmtNum(stats.freeCharsUsed)} hint={`من ${fmtNum(stats.freeCharsGranted)} حرف ممنوح`} tone="orange" />
          <StatCard label="اشتراك أو شحن بسعر الروّاد" value={stats.rowadPurchases} hint={`القيمة: $${fmtNum(stats.rowadPurchasesUsd)}`} tone="green" />
          <StatCard label="إيميل مختلف عند التفعيل" value={stats.emailMismatch} tone={stats.emailMismatch ? 'amber' : 'slate'} />
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <FilterChip active={status === ''} onClick={() => setStatus('')}>الكل</FilterChip>
            {Object.entries(STATUS).map(([k, v]) => <FilterChip key={k} active={status === k} onClick={() => setStatus(k)}>{v.label}</FilterChip>)}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث بالإيميل أو الكود أو الاسم"
              className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-brand" />
          </div>
        </div>
        {msg && <p className="text-xs font-bold text-slate-700 bg-slate-100 rounded-xl px-3 py-2">{msg}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500">
                <th className="py-3 px-3 font-bold">العميل</th>
                <th className="py-3 px-3 font-bold">الكود</th>
                <th className="py-3 px-3 font-bold">الحالة</th>
                <th className="py-3 px-3 font-bold">إيميل مختلف</th>
                <th className="py-3 px-3 font-bold">التواريخ</th>
                <th className="py-3 px-3 font-bold">تنتهي</th>
                <th className="py-3 px-3 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(r => {
                const st = STATUS[r.status] || STATUS.created;
                const open = r.status !== 'redeemed' && r.status !== 'expired';
                return (
                  <tr key={r.id} className="align-top">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{r.name || '—'}</div>
                      <div className="text-[11px] text-slate-500" dir="ltr">{r.email || r.phone || '—'}</div>
                      {r.redeemedBy && <div className="text-[10px] text-slate-400" dir="ltr">فُعّلت بـ {r.redeemedBy.email}</div>}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800" dir="ltr">{r.code}</td>
                    <td className="py-3 px-3"><Badge tone={st.tone}>{st.label}</Badge></td>
                    <td className="py-3 px-3">{r.emailMismatch ? <Badge tone="amber"><AlertTriangle className="w-3 h-3" />نعم</Badge> : <span className="text-slate-400">لا</span>}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-500 space-y-0.5">
                      <div>أُرسلت: {day(r.sentAt)}</div><div>فُتحت: {day(r.openedAt)}</div><div>فُعّلت: {day(r.redeemedAt)}</div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600">
                      {extendId === r.id ? (
                        <div className="flex items-center gap-1">
                          <input type="date" value={extendTo} onChange={e => setExtendTo(e.target.value)} className="px-2 py-1 border border-slate-200 rounded-lg text-[11px]" />
                          <button onClick={() => act(r.id, 'extend', { expiresAt: extendTo })} disabled={!extendTo} className="px-2 py-1 rounded-lg bg-brand-ink text-white font-bold disabled:opacity-40 cursor-pointer">حفظ</button>
                        </div>
                      ) : day(r.expiresAt)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button title="نسخ رابط واتساب" onClick={() => copy(r.whatsappLink)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                        {open && r.email && <button title="إعادة إرسال" onClick={() => act(r.id, 'resend')} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-700 cursor-pointer"><Send className="w-3.5 h-3.5" /></button>}
                        {r.status !== 'redeemed' && <button title="تمديد الصلاحية" onClick={() => { setExtendId(r.id); setExtendTo(''); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-700 cursor-pointer"><CalendarPlus className="w-3.5 h-3.5" /></button>}
                        {open && <button title="إلغاء الدعوة" onClick={() => act(r.id, 'cancel')} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-700 cursor-pointer"><Ban className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={7} className="py-10 text-center text-slate-400">لا توجد دعوات. أنشئها بالأمر: php artisan rowad:generate-invites</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
