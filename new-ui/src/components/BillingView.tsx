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
import { Plan } from '../types';
import { SIGNUP_BONUS_CREDITS } from '../../shared/plans';

const creditsLabel = (plan: Plan, long = false) => {
  if (plan.isCustom) return 'رصيد حروف حسب احتياج منشأتك';
  if (plan.monthlyCredits === 0) return `${SIGNUP_BONUS_CREDITS.toLocaleString('en-US')} حرف رصيد ترحيبي مرة واحدة`;
  return long
    ? `يتجدد الاشتراك شهرياً مع ${plan.monthlyCredits.toLocaleString('en-US')} حرف توليد.`
    : `${plan.monthlyCredits.toLocaleString('en-US')} حرف شهرياً`;
};

interface BillingViewProps {
  balanceCredits: number;
  onOpenTopUp: () => void;
  onPlanChanged: (newPlan: Plan, newBalance: number) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  balanceCredits,
  onOpenTopUp,
  onPlanChanged
}) => {
  const [billing, setBilling] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const res = await api.getBilling();
      setBilling(res);
    } catch (err) {
      console.error('Failed to load billing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (!confirm('هل ترغب في ترقية اشتراك الشركة إلى هذه الباقة؟')) return;
    try {
      setUpgrading(true);
      const res = await api.changePlan(planId);
      onPlanChanged(res.currentPlan, res.newBalanceCredits);
      await fetchBilling();
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading || !billing) {
    return (
      <div className="py-24 text-center text-slate-400" dir="rtl">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs">جارٍ تحميل بيانات الاشتراكات والفواتير...</p>
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
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-brand/10 text-brand-text border border-brand/20">
            B2B Subscription
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          إدارة خطة اشتراك الشركة، شحن حزم النقاط الإضافية، واستخراج الفواتير الضريبية المعتمدة.
        </p>
      </div>

      {/* Current Subscription Status Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              الاشتراك نشط
            </span>
            <span className="text-xs text-emerald-400 font-bold">حساب منشأة معتمد</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">{currentPlan.nameAr}</h2>
          <p className="text-xs text-slate-300">
            {creditsLabel(currentPlan, true)}
          </p>
        </div>

        {/* Balance Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div className="text-right sm:text-left sm:border-l border-slate-700 sm:pl-4">
            <span className="text-[11px] text-slate-400 block">رصيد النقاط المتاح حالياً</span>
            <div className="text-2xl font-black text-brand-text font-mono">
              {balanceCredits.toLocaleString()} <span className="text-xs font-normal text-slate-300">نقطة</span>
            </div>
            <span className="text-[10px] text-slate-400">1 نقطة = 1 حرف عربي</span>
          </div>

          <button
            onClick={onOpenTopUp}
            className="px-5 py-3 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-orange transition-colors shadow-lg shadow-brand/25 flex items-center justify-center gap-1.5 shrink-0"
          >
            <Coins className="w-4 h-4" />
            <span>شحن رصيد إضافي</span>
          </button>
        </div>
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-xl font-bold text-slate-900">الباقات</h3>
          <p className="text-xs text-slate-500">نفس باقات صفحة الأسعار، اختر الأنسب لحجم إنتاجك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-4">
          {availablePlans.map(plan => {
            const isCurrent = plan.id === currentPlan.id;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 border-2 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-brand shadow-lg shadow-orange-500/5 ring-1 ring-brand'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-slate-900">{plan.nameAr}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-brand text-white rounded-full">
                        باقتكم الحالية
                      </span>
                    )}
                  </div>

                  {plan.badge && (
                    <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-baseline gap-1 font-mono">
                    {plan.priceUsd === null ? (
                      <span className="text-2xl font-black text-slate-900 font-sans">تسعير مخصص</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-slate-900">${plan.priceUsd}</span>
                        <span className="text-xs text-slate-400">/ شهرياً</span>
                      </>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 font-semibold">
                    {creditsLabel(plan)}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
                    {plan.inheritsFrom && (
                      <li className="text-slate-400">كل ما في {plan.inheritsFrom}، بالإضافة إلى:</li>
                    )}
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-default"
                    >
                      الخطة المفعلة حالياً
                    </button>
                  ) : plan.isCustom ? (
                    <a
                      href="/ar/contact-us"
                      className="w-full py-2.5 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-orange transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>تواصل مع المبيعات</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading}
                      className="w-full py-2.5 rounded-xl bg-brand-ink text-white font-bold text-xs hover:bg-brand-ink/90 transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>{(plan.priceUsd ?? 0) < (currentPlan.priceUsd ?? 0) ? 'الانتقال لهذه الباقة' : 'الترقية لهذه الباقة'}</span>
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
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-text" />
            <span>سجل الفواتير الضريبية</span>
          </h3>
          <span className="text-xs text-slate-400">متوافق مع هيئة الزكاة والضريبة والجمارك</span>
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
                <th className="py-2.5 px-3 font-medium">تحميل الفاتورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                    <td className="py-3 px-3 font-mono text-brand-text font-bold">+{inv.creditsAdded.toLocaleString()}</td>
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
      </div>
    </div>
  );
};
