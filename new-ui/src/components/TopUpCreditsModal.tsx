import React, { useState } from 'react';
import { X, Coins, Check, Zap, ShieldCheck, CreditCard } from 'lucide-react';
import { api } from '../lib/api';

interface TopUpCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export const TopUpCreditsModal: React.FC<TopUpCreditsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPack, setSelectedPack] = useState<'pack-5k' | 'pack-25k' | 'pack-100k'>('pack-25k');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const packs = [
    {
      id: 'pack-5k' as const,
      credits: 5000,
      price: 9,
      unitCost: '$1.80 / 1k',
      popular: false,
      title: 'باقة الإنتاج السريع',
      description: 'مثالية لحملات السوشيال ميديا والإعلانات القصيرة'
    },
    {
      id: 'pack-25k' as const,
      credits: 25000,
      price: 29,
      unitCost: '$1.16 / 1k',
      popular: true,
      title: 'باقة الوكالات المعتمدة',
      description: 'الأنسب لشركات الإنتاج والدورات التدريبية ومشاريع SaaS'
    },
    {
      id: 'pack-100k' as const,
      credits: 100000,
      price: 99,
      unitCost: '$0.99 / 1k',
      popular: false,
      title: 'باقة التوسع المؤسسي',
      description: 'أفضل قيمة للمشاريع الضخمة والإنتاج المستمر والتطبيقات'
    }
  ];

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.topupCredits({ packId: selectedPack });
      window.location.assign(res.checkoutUrl);
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
            <div className="w-10 h-10 rounded-xl bg-[#FF5500]/20 flex items-center justify-center border border-[#FF5500]/30">
              <Coins className="w-5 h-5 text-[#FF5500]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">شحن رصيد نقاط الإنتاج الصوتي</h3>
              <p className="text-xs text-slate-300">1 نقطة (Credit) = 1 حرف عربي أو إنجليزي | رصيد فوري غير قابل للانتهاء</p>
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
                    ? 'border-[#FF5500] bg-orange-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-[#FF5500] text-white text-[10px] font-bold rounded-full">
                    الأكثر طلباً للشركات
                  </span>
                )}
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPack === pack.id ? 'border-[#FF5500] bg-[#FF5500] text-white' : 'border-slate-300'
                  }`}>
                    {selectedPack === pack.id && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{pack.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-700 font-bold">
                        {pack.credits.toLocaleString()} نقطة
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{pack.description}</p>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-lg font-black text-slate-900 font-mono">${pack.price}</div>
                  <div className="text-[10px] text-slate-500">{pack.unitCost}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>دفع إلكتروني آمن ومشفر 100% مع فاتورة ضريبية رسمية</span>
            </div>
            <span className="font-semibold text-slate-700">Stripe / Visa / Mastercard</span>
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
              className="px-6 py-2.5 rounded-xl bg-[#FF5500] text-white text-sm font-bold shadow-lg shadow-[#FF5500]/25 hover:bg-[#E04800] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'جارٍ معالجة الدفع...' : 'تأكيد الشحن وإضافة النقاط'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
