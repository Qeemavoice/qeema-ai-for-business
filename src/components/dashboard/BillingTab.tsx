import React, { useEffect, useState } from 'react';
import { Check, FileText } from 'lucide-react';
import { PLANS, findPlan } from '../../../shared/plans';
import { api, ACCOUNT_CHANGED_EVENT, type PlanOffer } from '../../lib/api';
import { fmtDate, fmtNum } from '../../lib/format';
import { CreditTransaction, HumanBooking } from '../../types';
import { InvoiceModal, type InvoiceData } from './InvoiceModal';
import { bookingInvoice } from './OtherSubViews';

interface Props { balanceCredits: number; currentPlanId?: string; onOpenTopUp: () => void; }

/** "الباقات": plans (same as the pricing page), balance, and invoices for every purchase / project. */
export const BillingTab: React.FC<Props> = ({ balanceCredits, currentPlanId, onOpenTopUp }) => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [open, setOpen] = useState<InvoiceData | null>(null);
  const current = findPlan(currentPlanId);
  const [offers, setOffers] = useState<Record<string, PlanOffer>>({});
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { api.getOffers().then(r => setOffers(r.offers || {})).catch(() => setOffers({})); }, [currentPlanId]);

  // «اشترك الآن»: the plan at this account's price (Rowad price locked for members, or list price)
  const subscribe = async (planId: string, price: number) => {
    if (!confirm(`الاشتراك في هذه الباقة بسعر ${price}$ شهرياً؟`)) return;
    setBusy(planId); setNote(null);
    try {
      const r = await api.changePlan(planId);
      setNote({ ok: true, text: r.message || 'تم الاشتراك' });
      window.dispatchEvent(new CustomEvent(ACCOUNT_CHANGED_EVENT));
    } catch (e: any) {
      setNote({ ok: false, text: e?.message || 'تعذّر الاشتراك' });
    } finally { setBusy(''); }
  };

  useEffect(() => {
    Promise.all([api.getMyBookings(), api.getCredits()]).then(([bk, cr]) => {
      const customer = bk.company || { name: '' };
      const purchases = (cr.transactions as CreditTransaction[]).filter(t => t.reason === 'purchase');
      const fromPurchases = purchases.map((t): InvoiceData => {
        const price = Number(/(\d+(?:\.\d+)?) USD/.exec(t.description)?.[1] || 0);
        return {
          number: `INV-${t.referenceId || t.id.slice(0, 8).toUpperCase()}`,
          date: t.createdAt, customer,
          lines: [{ description: t.description.split(' (')[0], detail: `${fmtNum(t.delta)} حرف رصيد`, amountUsd: price }],
          paymentMethod: 'بطاقة عبر Stripe', status: 'مدفوعة'
        };
      });
      const paidPurchases = fromPurchases.filter(i => i.lines[0].amountUsd > 0);
      const fromBookings = (bk.bookings as HumanBooking[]).map(b => bookingInvoice(b, customer));
      setInvoices([...paidPurchases, ...fromBookings].sort((a, b) => b.date.localeCompare(a.date)));
    }).catch(() => setInvoices([]));
  }, [balanceCredits]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">الباقات والفواتير</h2>
          <p className="text-xs text-slate-500">نفس باقات صفحة الأسعار، ورصيدك وفواتير كل عملية ومشروع</p>
        </div>
        <button onClick={onOpenTopUp} className="px-4 py-2 bg-brand hover:bg-brand-orange text-white rounded-xl text-xs font-bold transition-all shadow-xs">
          + شحن الرصيد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 font-bold">الرصيد المتاح</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{fmtNum(balanceCredits)} <span className="text-sm font-sans">حرف</span></div>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 font-bold">الباقة الحالية</span>
          <div className="text-2xl font-black text-brand-text">{current?.nameAr || 'مجاني'}</div>
        </div>
      </div>

      {note && <p className={`text-xs font-bold rounded-xl px-3 py-2 ${note.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{note.text}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map(p => {
          const isCurrent = (current?.id || 'plan-free') === p.id;
          const sub = offers[p.id]?.subscription;
          const price = sub ? sub.price : p.priceUsd;
          const offerLabel = sub?.offer === 'rowad' || sub?.offer === 'rowad_locked' ? 'سعر روّاد قيمة' : '';
          return (
            <div key={p.id} className={`p-5 rounded-3xl border bg-white flex flex-col gap-3 ${isCurrent ? 'border-brand ring-2 ring-brand/20' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900">{p.nameAr}</h3>
                {isCurrent && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand-text border border-brand/30">باقتك</span>}
              </div>
              <div className="font-mono font-black text-2xl text-slate-900">
                {p.priceUsd === null ? <span className="text-base font-sans">سعر مخصص</span> : (
                  <>
                    {price !== p.priceUsd && <span className="text-sm text-slate-400 line-through ml-1.5">${p.priceUsd}</span>}
                    <span className={price !== p.priceUsd ? 'text-brand-text' : ''}>${price}</span>
                    <span className="text-xs text-slate-400 font-sans"> / شهرياً</span>
                  </>
                )}
              </div>
              {offerLabel && <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-ink text-white">{offerLabel}</span>}
              <ul className="space-y-1.5 text-xs text-slate-600 flex-1">
                {p.features.map(f => <li key={f.text} className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{f.text}</li>)}
              </ul>
              {p.priceUsd === null ? (
                <a href="/ar/contact-us" className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-center text-slate-800">تواصل معنا</a>
              ) : p.priceUsd > 0 ? (
                isCurrent ? (
                  <button onClick={onOpenTopUp} className="w-full py-2 rounded-xl text-xs font-bold cursor-pointer border border-slate-200 text-slate-700 hover:bg-slate-50">شحن رصيد إضافي</button>
                ) : (
                  <button onClick={() => subscribe(p.id, Number(price))} disabled={busy === p.id} className="w-full py-2 rounded-xl text-xs font-bold cursor-pointer bg-brand hover:bg-brand-orange text-white disabled:opacity-50">
                    {busy === p.id ? 'جارٍ الاشتراك...' : 'اشترك الآن'}
                  </button>
                )
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
        <h3 className="text-sm font-black text-slate-900">الفواتير</h3>
        {invoices.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">لا توجد فواتير بعد</p>}
        <div className="divide-y divide-slate-100">
          {invoices.map(inv => (
            <div key={inv.number} className="flex items-center justify-between gap-3 py-3 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{inv.lines[0].description}</p>
                <p className="text-slate-400 font-mono">{inv.number} · {fmtDate(inv.date)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-black text-slate-900">${inv.lines.reduce((a, l) => a + l.amountUsd, 0)}</span>
                <button onClick={() => setOpen(inv)} className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />عرض
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {open && <InvoiceModal invoice={open} onClose={() => setOpen(null)} />}
    </div>
  );
};
