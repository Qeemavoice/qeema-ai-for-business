import React, { useEffect, useState } from 'react';
import { X, Coins, Check, Zap, ShieldCheck, CreditCard, Gift } from 'lucide-react';
import { api, type PlanOffer } from '../lib/api';
import { PLANS } from '../../shared/plans';

interface TopUpCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
  onPaymentSuccess?: (newBalance: number) => void;
  [extra: string]: unknown;
}

// Same plans as the public pricing page (shared/plans.ts): paid plans with monthly credits
const PACKS = PLANS.filter(p => p.priceUsd && p.monthlyCredits);
const ENTERPRISE = PLANS.find(p => p.priceUsd === null);

export const TopUpCreditsModal: React.FC<TopUpCreditsModalProps> = ({ isOpen, onClose, onSuccess, onPaymentSuccess }) => {
  const [selectedPack, setSelectedPack] = useState(PACKS.find(p => p.featured)?.id || PACKS[0]?.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // this account's price per pack (Rowad gift); list prices until it answers
  const [offers, setOffers] = useState<Record<string, PlanOffer>>({});
  useEffect(() => { if (isOpen) api.getOffers().then(r => setOffers(r.offers || {})).catch(() => setOffers({})); }, [isOpen]);

  if (!isOpen) return null;

  const packs = PACKS.map(p => ({
    id: p.id,
    credits: p.monthlyCredits,
    price: p.priceUsd!,
    unitCost: `$${((p.priceUsd! / p.monthlyCredits) * 1000).toFixed(2)} / 1,000 حرف`,
    popular: !!p.featured,
    title: `باقة ${p.nameAr}`,
    description: p.bookingDiscountPct ? `${p.tagline} وخصم ${p.bookingDiscountPct}% على حجوزات المعلقين` : p.tagline
  }));

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.topupCredits({ packId: selectedPack });
      (onPaymentSuccess || onSuccess)?.(res.newBalanceCredits);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'فشل شحن الرصيد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center border border-brand/30">
              <Coins className="w-5 h-5 text-brand-text" />
            </div>
            <div>
              <h3 className="font-bold text-lg">شحن الرصيد</h3>
              <p className="text-xs text-slate-300">نفس باقات صفحة الأسعار | 1 نقطة = 1 حرف</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {packs.map(pack => (
              <div
                key={pack.id}
                onClick={() => setSelectedPack(pack.id)}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  selectedPack === pack.id
                    ? 'border-brand bg-orange-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-brand text-white text-[10px] font-bold rounded-full">
                    الأكثر طلباً
                  </span>
                )}
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPack === pack.id ? 'border-brand bg-brand text-white' : 'border-slate-300'
                  }`}>
                    {selectedPack === pack.id && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{pack.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-700 font-bold">
                        {pack.credits.toLocaleString('en-US')} حرف
                      </span>
                      {(offers[pack.id]?.topup.bonusChars || 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-brand-ink text-white font-bold">
                          <Gift className="w-3 h-3 text-brand-yellow" />+{offers[pack.id].topup.bonusChars.toLocaleString('en-US')} حرف هدية روّاد قيمة
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{pack.description}</p>
                  </div>
                </div>

                <div className="text-left">
                  {offers[pack.id] && offers[pack.id].topup.price < pack.price ? (
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="text-xs text-slate-400 line-through font-mono">${pack.price}</span>
                      <span className="text-lg font-black text-brand-text font-mono">${offers[pack.id].topup.price}</span>
                    </div>
                  ) : (
                    <div className="text-lg font-black text-slate-900 font-mono">${pack.price}</div>
                  )}
                  <div className="text-[10px] text-slate-500">{pack.unitCost}</div>
                </div>
              </div>
            ))}
          </div>

          {ENTERPRISE && (
            <a href="/ar/contact-us" className="block p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand text-xs transition-colors">
              <span className="font-bold text-slate-900 text-sm">باقة {ENTERPRISE.nameAr}</span>
              <span className="text-slate-500 mr-2">{ENTERPRISE.tagline} سعر مخصص، تواصل معنا</span>
            </a>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>دفع آمن عبر Stripe مع فاتورة لكل عملية</span>
            </div>
            <span className="font-semibold text-slate-700">Visa / Mastercard / Apple Pay / Google Pay</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-bold shadow-lg shadow-brand/25 hover:bg-brand-orange transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'جارٍ معالجة الدفع...' : 'ادفع الآن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
