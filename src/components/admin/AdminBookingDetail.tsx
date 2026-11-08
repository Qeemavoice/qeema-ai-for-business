import React, { useEffect, useState } from 'react';
import { ArrowRight, Copy, Mail, Phone, User, Mic2, FileText, Receipt, MessageSquare, Star, Ban, Paperclip, Check, Download } from 'lucide-react';
import { api } from '../../lib/api';
import { fmtDate, fmtDateTime, fmtNum } from '../../lib/format';
import { Badge, SamplePlayer, Tabs, type Tone } from './adminUi';

/** Server: App\Services\NewUi\BookingDetail::find (GET /api/v1/admin/bookings/{id}) */
interface Person { id: number | null; name: string; email: string; phone: string; hasAccount: boolean; since: string | null }
interface Detail {
  id: string; number: string; orderId: number; status: string; oldStatus: string; source: 'new-ui' | 'old-site';
  createdAt: string; updatedAt: string; usageLicense: string; delivery: string; deadlineDays: number; deliverableAudioUrl: string | null;
  review: { rating?: number; comment?: string; status?: string } | null;
  customer: Person & { history: { bookings: number; spentUsd: number; first: string | null; last: string | null }; repeatCustomer: boolean };
  narrator: Person;
  sample: { id: string; name: string; dialect: string; language: string; category: string; audioUrl: string } | null;
  script: string; notes: string; words: number; minutes: number; pricePerMinute: number;
  lines: { label: string; kind: 'voice' | 'service'; words: number | null; minutes: number | null; unitPrice: number; percentage: number | null; total: number }[];
  money: { totalUsd: number; narratorUsd: number; platformUsd: number; commissionPct: number; discountUsd: number; paymentFeeUsd: number };
  payments: { id: number; reference: string; status: string; type: string; method: string; amountPaid: number; received: number; fee: number; description: string; receipt: string; createdAt: string }[];
  cancellations: { id: number; reasons: string; status: string; from: string; createdAt: string }[];
  messages: { id: number; text: string; createdAt: string; from: string; side: 'client' | 'narrator' | 'admin'; seen: boolean; files: { name: string; url: string; size: number; type: string }[] }[];
  ratings: { clientAverage: number | null; clientResponse: string; narratorAverage: number | null; narratorResponse: string; clientRatedAt: string; narratorRatedAt: string }[];
}

const STATUS: Record<string, { label: string; tone: Tone }> = {
  awaiting_payment: { label: 'بانتظار دفع العميل', tone: 'amber' }, pending: { label: 'بانتظار المراجعة', tone: 'amber' }, in_studio: { label: 'في الاستوديو', tone: 'blue' },
  delivered: { label: 'تم التسليم', tone: 'orange' }, approved: { label: 'معتمد ومكتمل', tone: 'green' }, canceled: { label: 'ملغي', tone: 'slate' }
};
const NEXT: Record<string, { to: string; label: string } | undefined> = {
  pending: { to: 'in_studio', label: 'قبول ونقل للاستوديو' }, in_studio: { to: 'delivered', label: 'تسليم الملف' }, delivered: { to: 'approved', label: 'اعتماد نهائي' }
};
const LICENSE: Record<string, string> = {
  commercial_ads: 'إعلانات تجارية', internal_corporate: 'استخدام داخلي', broadcast_tv: 'بث تلفزيوني', elearning: 'تعليم إلكتروني', ivr: 'رد آلي IVR', global_license: 'ترخيص عالمي'
};
const DELIVERY: Record<string, string> = { '48h': 'خلال 48 ساعة', '24h': 'خلال 24 ساعة', '6h': 'خلال 6 ساعات', custom: 'موعد مخصص' };
const usd = (n?: number | null) => `$${fmtNum(Math.round((n ?? 0) * 100) / 100)}`;
const wa = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '').replace(/^00/, '')}`;

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
  <section className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3 ${className}`}>
    <h3 className="font-black text-sm text-slate-900 flex items-center gap-2"><span className="text-brand-text">{icon}</span>{title}</h3>
    {children}
  </section>
);
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0 text-xs">
    <span className="text-slate-500 shrink-0">{label}</span>
    <span className="font-bold text-slate-800 text-left break-words min-w-0">{children || <span className="text-slate-300">—</span>}</span>
  </div>
);
const Empty: React.FC<{ text: string }> = ({ text }) => <p className="py-8 text-center text-xs text-slate-400">{text}</p>;

/** «الحجوزات» → one booking: everything the old back office showed, in one page. */
export const AdminBookingDetail: React.FC<{ bookingId: string; onBack: () => void; onChanged?: () => void }> = ({ bookingId, onBack, onChanged }) => {
  const [d, setD] = useState<Detail | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('payments');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deliverUrl, setDeliverUrl] = useState('');

  const load = () => fetch(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}`).then(async r => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'تعذّر تحميل الحجز');
    setD(j.booking);
  }).catch(e => setError(e.message));
  useEffect(() => { setD(null); setError(''); load(); }, [bookingId]);

  const advance = async () => {
    const next = d && NEXT[d.status];
    if (!d || !next) return;
    if (next.to === 'delivered' && !deliverUrl.trim()) { setError('أضف رابط الملف الصوتي النهائي قبل التسليم'); return; }
    if (!confirm(`${next.label} للحجز ${d.id}؟`)) return;
    setBusy(true); setError('');
    try { await api.updateBookingStatus(d.id, next.to, next.to === 'delivered' ? deliverUrl.trim() : undefined); await load(); onChanged?.(); }
    catch (e: any) { setError(e?.message || 'تعذّر تحديث الحالة'); } finally { setBusy(false); }
  };

  if (error && !d) return (
    <div className="space-y-4" dir="rtl">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"><ArrowRight className="w-4 h-4" />الرجوع للحجوزات</button>
      <p className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm font-bold">{error}</p>
    </div>
  );
  if (!d) return <p className="py-16 text-center text-sm text-slate-400" dir="rtl">جارٍ تحميل الحجز...</p>;

  const st = STATUS[d.status] || STATUS.pending;
  const next = NEXT[d.status];
  const c = d.customer;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"><ArrowRight className="w-4 h-4" />الرجوع للحجوزات</button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 font-mono">{d.id}</h2>
            <span className="text-xs font-mono text-slate-400">{d.number}</span>
            <Badge tone={st.tone}>{st.label}</Badge>
            {d.oldStatus && <Badge tone="slate">في الموقع القديم: {d.oldStatus}</Badge>}
            <Badge tone="slate">{d.source === 'new-ui' ? 'من الموقع الجديد' : 'من الموقع القديم'}</Badge>
          </div>
          <p className="text-xs text-slate-500">أُنشئ {fmtDateTime(d.createdAt)} · آخر تحديث {fmtDateTime(d.updatedAt)}</p>
        </div>
        {next && (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {next.to === 'delivered' && (
              <input value={deliverUrl} onChange={e => setDeliverUrl(e.target.value)} dir="ltr" placeholder="رابط الملف الصوتي النهائي"
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-full sm:w-72 focus:outline-hidden focus:border-brand" />
            )}
            <button onClick={advance} disabled={busy} className="px-5 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold cursor-pointer disabled:opacity-50 whitespace-nowrap">
              {busy ? 'جارٍ التحديث...' : next.label}
            </button>
          </div>
        )}
      </div>
      {error && <p className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold">{error}</p>}

      {/* Money */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'قيمة الحجز', value: usd(d.money.totalUsd), hint: 'ما دفعه العميل', tone: 'text-slate-900' },
          { label: 'حصة المعلق', value: usd(d.money.narratorUsd), hint: `سعر المعلق قبل عمولة ${d.money.commissionPct}%`, tone: 'text-slate-900' },
          { label: 'ربح المنصة', value: usd(d.money.platformUsd), hint: `عمولة ${d.money.commissionPct}% فوق سعر المعلق`, tone: 'text-brand-text' }
        ].map(m => (
          <div key={m.label} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">{m.label}</span>
            <div className={`mt-2 text-2xl font-black font-mono ${m.tone}`}>{m.value}</div>
            <div className="mt-1 text-[11px] text-slate-400">{m.hint}</div>
          </div>
        ))}
      </div>

      {/* People + order */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="تفاصيل الطلب" icon={<FileText className="w-4 h-4" />}>
          <div>
            <Row label="تاريخ الطلب">{fmtDateTime(d.createdAt)}</Row>
            <Row label="نوع الطلب">حجز صوت</Row>
            <Row label="الترخيص">{LICENSE[d.usageLicense] || d.usageLicense}</Row>
            <Row label="موعد التسليم">{d.source === 'new-ui' ? DELIVERY[d.delivery] || d.delivery : `${d.deadlineDays} أيام`}</Row>
            <Row label="عدد الكلمات">{fmtNum(d.words)}</Row>
            <Row label="عدد الدقائق">{fmtNum(d.minutes)}</Row>
            <Row label="سعر الدقيقة">{usd(d.pricePerMinute)}</Row>
          </div>
        </Card>

        <Card title="العميل" icon={<User className="w-4 h-4" />}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-slate-900 text-sm">{c.name}</span>
            {c.repeatCustomer && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">زبون متكرر · {c.history.bookings}</span>}
            {!c.hasAccount && <Badge tone="slate">حجز بدون حساب</Badge>}
          </div>
          <div>
            <Row label="البريد">{c.email && <a href={`mailto:${c.email}`} className="text-brand-text hover:underline inline-flex items-center gap-1" dir="ltr"><Mail className="w-3 h-3" />{c.email}</a>}</Row>
            <Row label="الهاتف">{c.phone && <a href={wa(c.phone)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline inline-flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3" />{c.phone}</a>}</Row>
            <Row label="عميل منذ">{c.since ? fmtDate(c.since) : ''}</Row>
            <Row label="كل حجوزاته">{`${fmtNum(c.history.bookings)} حجز · ${usd(c.history.spentUsd)}`}</Row>
            <Row label="أول / آخر حجز">{c.history.first ? `${fmtDate(c.history.first)} ← ${fmtDate(c.history.last)}` : ''}</Row>
          </div>
        </Card>

        <Card title="المعلق الصوتي" icon={<Mic2 className="w-4 h-4" />}>
          <span className="font-black text-slate-900 text-sm block">{d.narrator.name || '—'}</span>
          <div>
            <Row label="البريد">{d.narrator.email && <a href={`mailto:${d.narrator.email}`} className="text-brand-text hover:underline inline-flex items-center gap-1" dir="ltr"><Mail className="w-3 h-3" />{d.narrator.email}</a>}</Row>
            <Row label="الهاتف">{d.narrator.phone && <a href={wa(d.narrator.phone)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline inline-flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3" />{d.narrator.phone}</a>}</Row>
            <Row label="رقم الحساب">{d.narrator.id ? `#${d.narrator.id}` : ''}</Row>
          </div>
        </Card>
      </div>

      {/* Booking data + script */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="بيانات الحجز" icon={<Mic2 className="w-4 h-4" />}>
          <div>
            <Row label="الصوت (المقطع)">{d.sample?.name}</Row>
            <Row label="اللهجة">{d.sample?.dialect}</Row>
            <Row label="اللغة">{d.sample?.language}</Row>
            <Row label="التصنيف">{d.sample?.category}</Row>
          </div>
          {d.sample?.audioUrl && <div className="pt-1"><p className="text-[11px] text-slate-500 mb-1.5">عينة الصوت</p><SamplePlayer url={d.sample.audioUrl} /></div>}
          {d.deliverableAudioUrl && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 mb-1.5">الملف النهائي المسلَّم</p>
              <SamplePlayer url={d.deliverableAudioUrl} />
              <a href={d.deliverableAudioUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-text hover:underline"><Download className="w-3 h-3" />تنزيل</a>
            </div>
          )}
        </Card>

        <Card title="السيناريو" icon={<FileText className="w-4 h-4" />} className="lg:col-span-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{fmtNum(d.script.length)} حرف · {fmtNum(d.words)} كلمة</span>
            {d.script && (
              <button onClick={() => { navigator.clipboard?.writeText(d.script); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? 'تم النسخ' : 'نسخ النص'}
              </button>
            )}
          </div>
          {d.script ? <p className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm leading-loose text-slate-800 whitespace-pre-wrap max-h-80 overflow-y-auto">{d.script}</p> : <Empty text="لا يوجد نص سيناريو في هذا الطلب" />}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5">ملاحظات وتوجيهات الأداء</p>
            {d.notes ? <p className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{d.notes}</p> : <p className="text-xs text-slate-400">لا توجد ملاحظات</p>}
          </div>
        </Card>
      </div>

      {/* Price lines */}
      <Card title={`تفاصيل السعر (${d.number})`} icon={<Receipt className="w-4 h-4" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead><tr className="text-[11px] text-slate-500 border-b border-slate-200">
              <th className="py-2.5 px-3 font-bold">العنصر</th><th className="py-2.5 px-3 font-bold">عدد الكلمات</th><th className="py-2.5 px-3 font-bold">عدد الدقائق</th>
              <th className="py-2.5 px-3 font-bold">سعر الدقيقة</th><th className="py-2.5 px-3 font-bold">النسبة (%)</th><th className="py-2.5 px-3 font-bold">المجموع</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {d.lines.map((l, i) => (
                <tr key={i}>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{l.label}{l.kind === 'service' && <span className="mr-1.5 text-[10px] text-slate-400 font-normal">خدمة إضافية</span>}</td>
                  <td className="py-2.5 px-3 font-mono">{l.words ?? '—'}</td><td className="py-2.5 px-3 font-mono">{l.minutes ?? '—'}</td>
                  <td className="py-2.5 px-3 font-mono">{usd(l.unitPrice)}</td><td className="py-2.5 px-3 font-mono">{l.percentage ?? 0}%</td>
                  <td className="py-2.5 px-3 font-mono font-bold">{usd(l.total)}</td>
                </tr>
              ))}
              {!d.lines.length && <tr><td colSpan={6}><Empty text="لا توجد بنود" /></td></tr>}
            </tbody>
            <tfoot>
              {d.money.discountUsd > 0 && <tr><td colSpan={5} className="py-2 px-3 text-left text-slate-500">خصم</td><td className="py-2 px-3 font-mono text-rose-600">−{usd(d.money.discountUsd)}</td></tr>}
              {d.money.paymentFeeUsd > 0 && <tr><td colSpan={5} className="py-2 px-3 text-left text-slate-500">رسوم الدفع</td><td className="py-2 px-3 font-mono">{usd(d.money.paymentFeeUsd)}</td></tr>}
              <tr className="border-t-2 border-slate-200"><td colSpan={5} className="py-3 px-3 text-left font-black text-slate-900">المجموع الإجمالي</td><td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">{usd(d.money.totalUsd)}</td></tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Activity */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <Tabs active={tab} onChange={setTab} tabs={[
          { id: 'payments', label: 'المعاملات المالية', count: d.payments.length },
          { id: 'cancellations', label: 'طلبات الإلغاء', count: d.cancellations.length },
          { id: 'messages', label: 'الرسائل', count: d.messages.length },
          { id: 'ratings', label: 'التقييمات', count: d.ratings.length + (d.review ? 1 : 0) }
        ]} />
        <div className="p-5">
          {tab === 'payments' && (d.payments.length ? (
            <div className="overflow-x-auto"><table className="w-full text-right text-xs">
              <thead><tr className="text-[11px] text-slate-500 border-b border-slate-200">
                <th className="py-2 px-3 font-bold">التاريخ</th><th className="py-2 px-3 font-bold">النوع</th><th className="py-2 px-3 font-bold">الحالة</th><th className="py-2 px-3 font-bold">الطريقة</th>
                <th className="py-2 px-3 font-bold">المدفوع</th><th className="py-2 px-3 font-bold">المستلم</th><th className="py-2 px-3 font-bold">الرسوم</th><th className="py-2 px-3 font-bold">المرجع</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">{d.payments.map(p => (
                <tr key={p.id}>
                  <td className="py-2.5 px-3">{fmtDateTime(p.createdAt)}</td><td className="py-2.5 px-3">{p.type}</td><td className="py-2.5 px-3"><Badge>{p.status || '—'}</Badge></td>
                  <td className="py-2.5 px-3">{p.method}</td><td className="py-2.5 px-3 font-mono font-bold">{usd(p.amountPaid)}</td><td className="py-2.5 px-3 font-mono">{usd(p.received)}</td>
                  <td className="py-2.5 px-3 font-mono">{usd(p.fee)}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px]" dir="ltr">{p.receipt ? <a href={p.receipt} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:underline">إيصال</a> : p.reference || '—'}</td>
                </tr>
              ))}</tbody>
            </table></div>
          ) : <Empty text="لا توجد معاملات مالية لهذا الحجز" />)}

          {tab === 'cancellations' && (d.cancellations.length ? (
            <ul className="space-y-2">{d.cancellations.map(x => (
              <li key={x.id} className="p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between"><span className="font-bold text-slate-800 inline-flex items-center gap-1"><Ban className="w-3.5 h-3.5 text-rose-500" />{x.from}</span><Badge>{x.status}</Badge></div>
                <p className="text-slate-600 leading-relaxed">{x.reasons}</p><p className="text-[10px] text-slate-400">{fmtDateTime(x.createdAt)}</p>
              </li>
            ))}</ul>
          ) : <Empty text="لا توجد طلبات إلغاء" />)}

          {tab === 'messages' && (d.messages.length ? (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto">{d.messages.map(m => (
              <div key={m.id} className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${m.side === 'client' ? 'bg-slate-100 ml-auto' : m.side === 'narrator' ? 'bg-orange-50 mr-auto' : 'bg-sky-50 mx-auto'}`}>
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-500"><span className="font-bold">{m.from} · {m.side === 'client' ? 'العميل' : m.side === 'narrator' ? 'المعلق' : 'الإدارة'}</span><span>{fmtDateTime(m.createdAt)}</span></div>
                {m.text && <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{m.text}</p>}
                {m.files.map(f => <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-text font-bold hover:underline"><Paperclip className="w-3 h-3" />{f.name}</a>)}
              </div>
            ))}</div>
          ) : <Empty text="لا توجد رسائل بين العميل والمعلق لهذا الحجز" />)}

          {tab === 'ratings' && (d.ratings.length || d.review ? (
            <div className="space-y-3">
              {d.review && (
                <div className="p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-bold text-slate-800"><Star className="w-3.5 h-3.5 text-amber-500" />تقييم العميل في الموقع الجديد: {d.review.rating ?? '—'}/5</div>
                  {d.review.comment && <p className="text-slate-600">{d.review.comment}</p>}
                </div>
              )}
              {d.ratings.map((r, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1 font-bold text-slate-800"><MessageSquare className="w-3.5 h-3.5 text-slate-400" />العميل قيّم المعلق: {r.clientAverage ?? '—'}</div>
                    {r.clientResponse && <p className="text-slate-600">{r.clientResponse}</p>}
                    {r.clientRatedAt && <p className="text-[10px] text-slate-400">{fmtDateTime(r.clientRatedAt)}</p>}
                  </div>
                  <div className="p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1 font-bold text-slate-800"><MessageSquare className="w-3.5 h-3.5 text-slate-400" />المعلق قيّم العميل: {r.narratorAverage ?? '—'}</div>
                    {r.narratorResponse && <p className="text-slate-600">{r.narratorResponse}</p>}
                    {r.narratorRatedAt && <p className="text-[10px] text-slate-400">{fmtDateTime(r.narratorRatedAt)}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty text="لا توجد تقييمات" />)}
        </div>
      </div>
    </div>
  );
};
