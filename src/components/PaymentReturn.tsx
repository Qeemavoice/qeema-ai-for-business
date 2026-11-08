import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { api, ACCOUNT_CHANGED_EVENT, PAYMENT_CONFIRMED_EVENT } from '../lib/api';

/**
 * Back from Stripe (?payment=success&session_id=… or ?payment=cancelled): asks the server to verify the payment,
 * shows the result, then removes the parameters from the address. Rendered once inside the router.
 */
export const PaymentReturn: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error' | 'busy'; text: string } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const state = q.get('payment');
    if (!state || !isLoggedIn) return;
    const sessionId = q.get('session_id') || '';
    q.delete('payment');
    q.delete('session_id');
    const rest = q.toString();
    const clean = () => navigate({ pathname: location.pathname, search: rest ? `?${rest}` : '' }, { replace: true });
    if (state !== 'success' || !sessionId) {
      setNotice({ tone: 'error', text: 'لم تكتمل عملية الدفع ولم يُخصم أي مبلغ. يمكنك المحاولة مرة أخرى.' });
      clean();
      return;
    }
    setNotice({ tone: 'busy', text: 'جارٍ التحقق من عملية الدفع...' });
    api.confirmPayment(sessionId).then(r => {
      window.dispatchEvent(new Event(ACCOUNT_CHANGED_EVENT));
      window.dispatchEvent(new CustomEvent(PAYMENT_CONFIRMED_EVENT, { detail: r }));
      const what = r.kind === 'guide' ? 'تم شراء الدليل، ويمكنك تحميله الآن.' : r.kind === 'plan' ? 'تم تفعيل باقتك الجديدة وإضافة رصيدها.' : 'تمت إضافة الرصيد إلى حسابك.';
      setNotice({ tone: 'ok', text: `تم الدفع بنجاح ($${r.amountUsd}). ${what}` });
    }).catch(e => setNotice({ tone: 'error', text: e.message })).finally(clean);
  }, [location.search, isLoggedIn]);

  if (!notice) return null;
  const tone = notice.tone === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : notice.tone === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-slate-200 text-slate-700';
  const Icon = notice.tone === 'ok' ? CheckCircle2 : notice.tone === 'error' ? XCircle : Loader2;
  return (
    <div className="fixed top-4 inset-x-4 z-[70] flex justify-center pointer-events-none" dir="rtl" role="status">
      <div className={`pointer-events-auto max-w-lg w-full flex items-start gap-3 rounded-2xl border shadow-xl px-4 py-3 text-sm font-bold ${tone}`}>
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${notice.tone === 'busy' ? 'animate-spin' : ''}`} />
        <span className="flex-1 leading-relaxed">{notice.text}</span>
        {notice.tone !== 'busy' && <button type="button" onClick={() => setNotice(null)} aria-label="إغلاق" className="p-0.5 rounded-lg hover:bg-black/5 cursor-pointer"><X className="w-4 h-4" /></button>}
      </div>
    </div>
  );
};
