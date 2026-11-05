import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowDownLeft, 
  ShieldCheck, 
  FileText, 
  Download, 
  Check, 
  X, 
  ExternalLink, 
  CreditCard, 
  Building2, 
  Smartphone,
  Printer
} from 'lucide-react';
import { TalentProfile, TalentInvoice } from '../../data/talentMockData';

interface TalentEarningsSubViewProps {
  profile: TalentProfile;
  invoices: TalentInvoice[];
  onCashoutRequested?: (amount: number) => void;
}

export const TalentEarningsSubView: React.FC<TalentEarningsSubViewProps> = ({
  profile,
  invoices,
  onCashoutRequested
}) => {
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
  const [cashoutMethod, setCashoutMethod] = useState<'bank' | 'stcpay' | 'paypal'>('bank');
  const [cashoutAmount, setCashoutAmount] = useState<number>(profile.balanceSAR);
  const [cashoutSuccess, setCashoutSuccess] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TalentInvoice | null>(null);

  const handleConfirmCashout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashoutAmount <= 0 || cashoutAmount > profile.balanceSAR) return;

    if (onCashoutRequested) onCashoutRequested(cashoutAmount);
    setCashoutSuccess(true);
    setTimeout(() => {
      setCashoutSuccess(false);
      setIsCashoutModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>المحفظة المالية وعمليات السحب والفواتير</span>
          </h2>
          <p className="text-xs text-slate-400">
            إدارة مستحقات المشاريع المنجزة وحسابات الضمان المصرفي والتحويلات المباشرة
          </p>
        </div>

        <button
          onClick={() => {
            setCashoutAmount(profile.balanceSAR);
            setIsCashoutModalOpen(true);
          }}
          disabled={profile.balanceSAR <= 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>طلب سحب الأرباح المتاحة ({profile.balanceSAR.toLocaleString()} ر.س)</span>
        </button>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400">الرصيد القابل للسحب الفوري</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {profile.balanceSAR.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-400">ر.س</span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1">
            جاهز للتحويل إلى حسابك البنكي أو المحفظة الرقمية
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400">المبالغ المحجوزة بالضمان المالي</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">
              {profile.escrowSAR.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">ر.س</span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1">
            مؤمنة بالكامل لصالحك وتتحرر تلقائياً فور اعتماد العميل للتسليم
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400">إجمالي الأرباح التاريخية المكتسبة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-200 font-mono">
              {profile.totalEarningsSAR.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">ر.س</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold block pt-1">
            +{profile.monthlyGrowthPercent}% نمو عن الشهر الماضي
          </span>
        </div>
      </div>

      {/* Invoices Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-text" />
            <h3 className="text-sm font-bold text-white">سجل الفواتير الضريبية والمعاملات</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {invoices.length} فواتير
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 font-semibold">رقم الفاتورة</th>
                <th className="pb-3 font-semibold">المشروع والجهة</th>
                <th className="pb-3 font-semibold">التاريخ</th>
                <th className="pb-3 font-semibold">المبلغ (شامل الضريبة)</th>
                <th className="pb-3 font-semibold">الحالة</th>
                <th className="pb-3 font-semibold text-left">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 font-mono text-slate-300 font-bold">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5">
                    <strong className="text-white block">{inv.projectTitle}</strong>
                    <span className="text-[11px] text-slate-400">{inv.client}</span>
                  </td>
                  <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                    {inv.date}
                  </td>
                  <td className="py-3.5 font-mono font-bold text-emerald-400">
                    {inv.amountSAR.toLocaleString()} ر.س
                    <span className="text-[10px] text-slate-500 block font-normal">
                      (ض.ق.م: {inv.vatAmountSAR} ر.س)
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {inv.status === 'paid' ? 'مدفوع ومودع' : 'في حساب الضمان'}
                    </span>
                  </td>
                  <td className="py-3.5 text-left">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] font-bold"
                    >
                      عرض الفاتورة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cashout Modal */}
      {isCashoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-right">
            <button
              onClick={() => setIsCashoutModalOpen(false)}
              className="absolute left-5 top-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {cashoutSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">تم تأكيد طلب السحب!</h3>
                <p className="text-xs text-slate-400">
                  تمت جدولة التحويل بمبلغ {cashoutAmount.toLocaleString()} ر.س وسيصل لحسابك خلال ساعات العمل الرسمية.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmCashout} className="space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    سحب الأرباح المباشر
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    تحويل مستحقات التعليق الصوتي
                  </h3>
                  <p className="text-xs text-slate-400">
                    الرصيد المتاح: <strong className="text-white font-mono">{profile.balanceSAR.toLocaleString()} ر.س</strong>
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    المبلغ المطلوب سحبه (ر.س):
                  </label>
                  <input
                    type="number"
                    max={profile.balanceSAR}
                    min={100}
                    value={cashoutAmount}
                    onChange={(e) => setCashoutAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Method selector */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5">
                    طريقة استلام الأرباح:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCashoutMethod('bank')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        cashoutMethod === 'bank'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Building2 className="w-5 h-5 mx-auto mb-1" />
                      <span className="block text-[11px]">تحويل بنكي (آيبان)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCashoutMethod('stcpay')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        cashoutMethod === 'stcpay'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 mx-auto mb-1" />
                      <span className="block text-[11px]">محفظة رقمية</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCashoutMethod('paypal')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        cashoutMethod === 'paypal'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <span className="block text-[11px]">باي بال</span>
                    </button>
                  </div>
                </div>

                {/* Account info field */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {cashoutMethod === 'bank' && 'رقم الحساب الدولي (الآيبان):'}
                    {cashoutMethod === 'stcpay' && 'رقم جوال المحفظة:'}
                    {cashoutMethod === 'paypal' && 'بريد حساب باي بال:'}
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue={
                      cashoutMethod === 'bank' ? 'SA44 8000 0201 6080 1012 3456' :
                      cashoutMethod === 'stcpay' ? '0501234567' : 'tariq.voice@gmail.com'
                    }
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCashoutModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    تأكيد السحب الآن
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-right border border-slate-200">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute left-5 top-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Invoice Header */}
            <div className="border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
                    فاتورة ضريبية مبسطة (ZATCA Compliant)
                  </span>
                  <h3 className="text-xl font-black text-slate-900 font-mono mt-0.5">
                    {selectedInvoice.invoiceNumber}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">
                  🎙️
                </div>
              </div>
            </div>

            {/* Bill Details */}
            <div className="space-y-3 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">المعلق الصوتي (المورد):</span>
                <strong className="text-slate-900">{profile.name} ({profile.code})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">العميل (المستفيد):</span>
                <strong className="text-slate-900">{selectedInvoice.client}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">اسم العمل الصوتي:</span>
                <strong className="text-slate-900">{selectedInvoice.projectTitle}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">تاريخ الإصدار:</span>
                <span className="font-mono text-slate-700">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">المبلغ قبل الضريبة:</span>
                <span className="font-mono text-slate-700">{(selectedInvoice.amountSAR - selectedInvoice.vatAmountSAR).toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ضريبة القيمة المضافة (15%):</span>
                <span className="font-mono text-slate-700">{selectedInvoice.vatAmountSAR.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-black text-slate-900 border-t border-slate-300">
                <span>الإجمالي النهائي المستحق:</span>
                <span className="font-mono text-emerald-600">{selectedInvoice.amountSAR.toLocaleString()} ر.س</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الفاتورة</span>
              </button>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-ink hover:bg-brand-ink/90 text-white transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
