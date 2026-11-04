import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Coins, 
  FileAudio, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Calendar,
  Layers
} from 'lucide-react';
import { api, UsageResponse } from '../lib/api';
import { CreditTransaction } from '../types';

export const UsageView: React.FC = () => {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [uRes, cRes] = await Promise.all([
          api.getUsage(),
          api.getCredits()
        ]);
        setUsage(uRes);
        setTransactions(cRes.transactions);
      } catch (err) {
        console.error('Failed to load usage data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400" dir="rtl">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs">جارٍ تحميل بيانات الاستهلاك والمحفظة...</p>
      </div>
    );
  }

  const metrics = usage?.metrics || {
    totalGenerations: 0,
    totalCharacters: 0,
    totalCredits: 0,
    totalAudioMinutes: 0,
    topVoiceName: 'لا يوجد بعد'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">تحليلات الاستهلاك والرصيد</h1>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700">
            Usage & Ledger
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          لوحة قياس استهلاك الحروف وتوزيع اللهجات وسجل المعاملات المحاسبي المالي للشركة.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">إجمالي الحروف المستهلكة</span>
            <Sparkles className="w-4 h-4 text-brand-text" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {metrics.totalCharacters.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">1 حرف = 1 نقطة معتمدة</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">إجمالي عمليات التوليد</span>
            <FileAudio className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {metrics.totalGenerations.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">تسجيلات صوتية مكتملة</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">النقاط المستهلكة</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {metrics.totalCredits.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">خصم دقيق بالـ Ledger</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">الصوت الأكثر استخداماً</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {metrics.topVoiceName}
          </div>
          <div className="text-[11px] text-slate-500">
            {metrics.totalAudioMinutes} دقيقة صوتية إجمالية
          </div>
        </div>
      </div>

      {/* Dialect Breakdown & Top Voices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dialect Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-text" />
            <span>توزيع الاستهلاك حسب اللهجات العربية</span>
          </h3>

          <div className="space-y-3 pt-2">
            {usage?.dialectBreakdown.map(d => {
              const total = metrics.totalCharacters || 1;
              const pct = Math.round((d.characters / total) * 100);
              return (
                <div key={d.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{d.label}</span>
                    <span className="text-slate-500 font-mono">
                      {d.characters.toLocaleString()} حرف ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-yellow to-brand-orange rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Voices Used */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>أكثر الأصوات طلباً لشركتكم</span>
          </h3>

          <div className="space-y-3 pt-2">
            {usage?.topVoices && usage.topVoices.length > 0 ? (
              usage.topVoices.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-900">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500">{v.count} تسجيلات</span>
                    <span className="font-bold text-brand-text">{v.characters.toLocaleString()} حرف</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">لا توجد بيانات أصوات مسجلة بعد</p>
            )}
          </div>
        </div>
      </div>

      {/* Credit Ledger Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-text" />
              <span>سجل حركات الرصيد المحاسبي (Credit Ledger)</span>
            </h3>
            <p className="text-xs text-slate-400">سجل غير قابل للتعديل يوثق كل إضافة أو خصم للنقاط بدقة</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 text-brand-text font-bold font-mono">
            {transactions.length} حركات مسجلة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3 font-medium">العملية / الوصف</th>
                <th className="py-2.5 px-3 font-medium">النوع</th>
                <th className="py-2.5 px-3 font-medium font-mono">التغيير (Delta)</th>
                <th className="py-2.5 px-3 font-medium font-mono">الرصيد بعد العملية</th>
                <th className="py-2.5 px-3 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(tx => {
                const isPositive = tx.delta > 0;
                const dateStr = new Date(tx.createdAt).toLocaleDateString('ar-SA', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.reason === 'generation' ? 'bg-slate-100 text-slate-700' :
                        tx.reason === 'purchase' ? 'bg-emerald-50 text-emerald-700' :
                        tx.reason === 'admin_grant' ? 'bg-blue-50 text-blue-700' :
                        'bg-orange-50 text-brand-text'
                      }`}>
                        {tx.reason === 'generation' ? 'توليد صوت' :
                         tx.reason === 'purchase' ? 'شحن رصيد' :
                         tx.reason === 'admin_grant' ? 'منحة إدارية' : 'رصيد ترحيبي'}
                      </span>
                    </td>
                    <td className={`py-3 px-3 font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {isPositive ? `+${tx.delta.toLocaleString()}` : tx.delta.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {tx.balanceAfter.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {dateStr}
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
