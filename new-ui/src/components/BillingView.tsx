import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Coins,
  Check,
  Sparkles,
  Download,
  ShieldCheck,
  FileText,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { api, BillingResponse } from '../lib/api';

interface BillingViewProps {
  balanceCredits: number;
  onOpenTopUp: () => void;
  isLoggedIn: boolean;
  onOpenSignup: () => void;
  onContactSales: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  balanceCredits,
  onOpenTopUp,
  isLoggedIn,
  onOpenSignup,
  onContactSales
}) => {
  const [billing, setBilling] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBilling = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getBilling();
      setBilling(res);
    } catch (err) {
      console.error('Failed to load billing:', err);
      setError(err instanceof Error ? err.message : 'تعذر تحميل بيانات الفوترة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400" dir="rtl">
        <div className="w-6 h-6 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs">جارٍ تحميل بيانات الاشتراكات والفواتير...</p>
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center" dir="rtl">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8">
          <h1 className="text-lg font-black text-slate-900 mb-2">تعذر تحميل بيانات الفوترة</h1>
          <p className="text-sm text-slate-600 mb-5">{error || 'حدث خطأ غير متوقع. حاول مرة أخرى.'}</p>
          <button
            type="button"
            onClick={fetchBilling}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const { currentPlan, availablePlans, invoices } = billing;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الباقات والاشتراكات والفواتير</h1>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20">
            B2B Subscription
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          أسعار واضحة ويمكن مشاهدتها بدون حساب. اختر الباقة المناسبة، ثم أنشئ حسابك أو تواصل معنا للبدء.
        </p>
      </div>

      {/* Current Subscription Status Card */}
      {isLoggedIn && <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              الاشتراك نشط
            </span>
            <span className="text-xs text-slate-400 font-mono">B2B Verified Account</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">{currentPlan.nameAr}</h2>
          <p className="text-xs text-slate-300">
            يتجدد الاشتراك شهرياً مع منح {currentPlan.monthlyCredits.toLocaleString()} حرف ونقطة توليد.
          </p>
        </div>

        {/* Balance Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div className="text-right sm:text-left sm:border-l border-slate-700 sm:pl-4">
            <span className="text-[11px] text-slate-400 block">رصيد النقاط المتاح حالياً</span>
            <div className="text-2xl font-black text-[#FF5500] font-mono">
              {balanceCredits.toLocaleString()} <span className="text-xs font-normal text-slate-300">نقطة</span>
            </div>
            <span className="text-[10px] text-slate-400">1 نقطة = 1 حرف عربي</span>
          </div>

          <button
            onClick={onOpenTopUp}
            className="px-5 py-3 rounded-xl bg-[#FF5500] text-white font-bold text-xs hover:bg-[#E04800] transition-colors shadow-lg shadow-[#FF5500]/25 flex items-center justify-center gap-1.5 shrink-0"
          >
            <Coins className="w-4 h-4" />
            <span>شحن رصيد إضافي</span>
          </button>
        </div>
      </div>}

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-xl font-bold text-slate-900">باقات الإنتاج المعتمدة للشركات</h3>
          <p className="text-xs text-slate-500">اختر الخطة المناسبة لحجم استهلاك وحملات فريقك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {availablePlans.map(plan => {
            const isCurrent = plan.id === currentPlan.id;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 border-2 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-[#FF5500] shadow-lg shadow-orange-500/5 ring-1 ring-[#FF5500]'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-slate-900">{plan.nameAr}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#FF5500] text-white rounded-full">
                        باقتكم الحالية
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-black text-slate-900">${plan.priceUsd}</span>
                    <span className="text-xs text-slate-400">/ شهرياً</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 font-semibold font-mono">
                    {plan.monthlyCredits.toLocaleString()} نقطة شهرياً
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  {isLoggedIn && isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-default"
                    >
                      الخطة المفعلة حالياً
                    </button>
                  ) : (
                    <button
                      onClick={isLoggedIn ? onContactSales : onOpenSignup}
                      className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>{isLoggedIn ? 'اطلب تفعيل الباقة' : 'ابدأ بهذه الباقة'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices Table */}
      {isLoggedIn && <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FF5500]" />
            <span>سجل الفواتير الضريبية (Tax Invoices)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Saudi ZATCA Compliant Format</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3 font-medium font-mono">رقم الفاتورة</th>
                <th className="py-2.5 px-3 font-medium">التفاصيل والوصف</th>
                <th className="py-2.5 px-3 font-medium font-mono">النقاط المضافة</th>
                <th className="py-2.5 px-3 font-medium font-mono">المبلغ</th>
                <th className="py-2.5 px-3 font-medium">الحالة</th>
                <th className="py-2.5 px-3 font-medium">التاريخ</th>
                <th className="py-2.5 px-3 font-medium">تحميل PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 px-3 text-center text-slate-400">
                    لا توجد فواتير مسجلة حتى الآن.
                  </td>
                </tr>
              )}
              {invoices.map(inv => {
                const dateStr = new Date(inv.date).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{inv.id}</td>
                    <td className="py-3 px-3 text-slate-700">{inv.description}</td>
                    <td className="py-3 px-3 font-mono text-[#FF5500] font-bold">+{inv.creditsAdded.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">${inv.amountUsd}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        مدفوعة
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{dateStr}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => alert(`فاتورة ${inv.id} بصيغة PDF جاهزة للتحميل`)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="تحميل الفاتورة"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  );
};
