import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Coins } from 'lucide-react';
import { INSUFFICIENT_CREDITS_EVENT } from '../lib/api';

/** «رصيدك لا يكفي»: opened by any refused TTS generation (402), offers a top-up or a plan (at the Rowad price when it applies). */
export const InsufficientCreditsDialog: React.FC<{ onOpenTopUp: () => void }> = ({ onOpenTopUp }) => {
  const navigate = useNavigate();
  const [info, setInfo] = useState<{ requiredCredits?: number; currentBalance?: number; rowadPriceActive?: boolean } | null>(null);
  useEffect(() => {
    const open = (e: Event) => setInfo((e as CustomEvent).detail || {});
    window.addEventListener(INSUFFICIENT_CREDITS_EVENT, open);
    return () => window.removeEventListener(INSUFFICIENT_CREDITS_EVENT, open);
  }, []);
  if (!info) return null;
  const close = () => setInfo(null);
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 flex items-center justify-center p-4" dir="rtl" onClick={close}>
      <div role="dialog" aria-modal="true" aria-labelledby="qv-insufficient-title" onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-center">
        <button onClick={close} aria-label="إغلاق" className="float-left p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand/10 text-brand-text flex items-center justify-center"><Coins className="w-6 h-6" /></div>
        <h2 id="qv-insufficient-title" className="text-lg font-black text-slate-900">رصيدك لا يكفي</h2>
        {info.requiredCredits !== undefined && (
          <p className="text-sm text-slate-600">يحتاج هذا النص {info.requiredCredits.toLocaleString('en')} حرف، ورصيدك {(info.currentBalance ?? 0).toLocaleString('en')} حرف.</p>
        )}
        <div className="flex flex-col gap-2">
          <button onClick={() => { close(); onOpenTopUp(); }} className="py-3 rounded-xl bg-brand hover:bg-brand-orange text-white text-sm font-bold cursor-pointer">
            {info.rowadPriceActive ? 'اشحن رصيدك مع هدية روّاد قيمة' : 'اشحن رصيدك'}
          </button>
          <button onClick={() => { close(); navigate('/ar/pricing'); }} className="py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-bold cursor-pointer">
            {info.rowadPriceActive ? 'اشترك بسعر روّاد قيمة' : 'اشترك في باقة'}
          </button>
        </div>
      </div>
    </div>
  );
};
