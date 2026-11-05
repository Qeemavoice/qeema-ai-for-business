import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Play, 
  Pause, 
  Sliders, 
  Lock, 
  Check, 
  AlertTriangle, 
  Layers, 
  Volume2,
  TrendingUp,
  RefreshCw,
  Clock,
  AlertCircle,
  FileText,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { TalentProfile } from '../../data/talentMockData';
import { audioSynth } from '../../utils/audioSynthesizer';
import { narratorService } from '../../services/narratorService';
import { AIVoice, VoiceContract, UsageEvent, AuditLog, ActiveView } from '../../types';

interface TalentVoiceTwinSubViewProps {
  profile: TalentProfile;
  onNavigateToWizard?: () => void;
}

export const TalentVoiceTwinSubView: React.FC<TalentVoiceTwinSubViewProps> = ({ 
  profile,
  onNavigateToWizard
}) => {
  const [aiVoice, setAiVoice] = useState<AIVoice | null>(null);
  const [contract, setContract] = useState<VoiceContract | null>(null);
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Notice Period & Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Audio Test generation
  const [testText, setTestText] = useState('مرحبًا بك في نظامنا الذكي، يسعدني التحدث نيابة عن علامتك التجارية اليوم بأعلى معايير الأداء والاحترافية.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingTwin, setIsPlayingTwin] = useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'status_usage' | 'audit_ledger' | 'test_playground'>('status_usage');

  // Load backend / service data
  useEffect(() => {
    loadVoiceData();
  }, [profile.id]);

  const loadVoiceData = async () => {
    setLoading(true);
    try {
      const v = await narratorService.getAIVoice('narrator_tareq_01');
      setAiVoice(v);
      if (v?.contractId) {
        const c = await narratorService.getVoiceContract(v.contractId);
        setContract(c);
      }
      if (v) {
        const events = await narratorService.getUsageEvents(v.id);
        setUsageEvents(events);
      }
      const logs = await narratorService.getAuditLogs('narrator_tareq_01');
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async () => {
    if (!aiVoice) return;
    try {
      const updated = await narratorService.togglePauseAIVoice(aiVoice.narratorId);
      setAiVoice(updated);
      await loadVoiceData();
    } catch (err) {
      alert('تعذر تغيير حالة الصوت');
    }
  };

  const handleConfirmWithdrawal = async () => {
    if (!aiVoice) return;
    setIsSubmittingWithdraw(true);
    try {
      const updated = await narratorService.startNoticePeriodWithdrawal(aiVoice.narratorId, withdrawReason);
      setAiVoice(updated);
      setIsWithdrawModalOpen(false);
      await loadVoiceData();
    } catch (err) {
      alert('حدث خطأ أثناء بدء فترة الإشعار');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const handleCancelNoticePeriod = async () => {
    if (!aiVoice) return;
    try {
      const updated = await narratorService.cancelNoticePeriod(aiVoice.narratorId);
      setAiVoice(updated);
      await loadVoiceData();
    } catch (err) {
      alert('تعذر إلغاء فترة الإشعار');
    }
  };

  const handleTestGenerate = () => {
    if (isPlayingTwin) {
      audioSynth.stopAll();
      setIsPlayingTwin(false);
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsPlayingTwin(true);
      audioSynth.playAcousticPreview(() => {
        setIsPlayingTwin(false);
      }, 5.0);
    }, 600);
  };

  // Calculations
  const totalCharacters = usageEvents.reduce((acc, ev) => acc + ev.characters, 312000);
  const grossUsd = usageEvents.reduce((acc, ev) => acc + ev.grossAmount, 915.50);
  const revShare = contract?.revenueSharePercent || 45;
  const narratorEarningsUsd = usageEvents.reduce((acc, ev) => acc + ev.narratorEarning, 412.00);

  // Status rendering helpers
  const getStatusBadge = () => {
    const st = aiVoice?.status || 'published';
    if (st === 'published') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>منشور في المكتبة ●</span>
        </span>
      );
    }
    if (st === 'paused') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>متوقف مؤقتاً (مخفي عن العملاء)</span>
        </span>
      );
    }
    if (st === 'notice_period') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <Clock className="w-3.5 h-3.5" />
          <span>قيد فترة الإشعار لإنهاء الترخيص</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-800 text-slate-400 border border-slate-700">
        <span>غير مكتمل الإعداد</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Overview Card (Full Width) */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-yellow to-amber-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">صوتي الذكي المعتمد</h2>
                  {getStatusBadge()}
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                  <span>اللهجة: <strong className="text-slate-200">{aiVoice?.dialect || 'سعودي نجدي'}</strong></span>
                  <span>•</span>
                  <span>فترة الإشعار: <strong className="text-slate-200 font-mono">{contract?.noticePeriodDays || 365} يوم</strong></span>
                  <span>•</span>
                  <span>نسبتك من المبيعات: <strong className="text-orange-400 font-mono font-black">{revShare}%</strong></span>
                  <span>•</span>
                  <span className="font-mono text-slate-500 text-[10px]">معرف الصوت: {aiVoice?.elevenLabsVoiceId || 'el_voice_tareq_v2'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {aiVoice?.status === 'notice_period' ? (
              <button
                onClick={handleCancelNoticePeriod}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                إلغاء فترة الإشعار واستئناف النشاط
              </button>
            ) : (
              <>
                <button
                  onClick={handleTogglePause}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    aiVoice?.status === 'paused'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-755'
                  }`}
                >
                  {aiVoice?.status === 'paused' ? 'استئناف النشر 🟢' : 'إيقاف مؤقت ⏸️'}
                </button>

                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  سحب الموافقة
                </button>
              </>
            )}

            <button
              onClick={onNavigateToWizard}
              className="px-4 py-2.5 rounded-xl bg-brand hover:bg-orange-600 text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة التدريب / المعالج</span>
            </button>
          </div>
        </div>

        {/* Notice Period Warning Alert Banner if active */}
        {aiVoice?.status === 'notice_period' && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <strong className="text-white block font-black text-sm">
                فترة الإشعار سارية حتى {aiVoice.disableAt ? new Date(aiVoice.disableAt).toLocaleDateString('ar-SA') : 'نهاية الفترة التعاقدية'}
              </strong>
              <p className="text-rose-200/90 mt-1">
                خلال هذه الفترة، يستمر إكمال المشاريع المصرح بها مسبقاً وتستلم كامل عوائدك ({revShare}%). فور انتهاء الفترة سيتم تعطيل النموذج بالكامل وحذفه من مكتبة الأصوات.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Monthly Metrics Cards (in USD and Western Digits) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-xs text-slate-400 block mb-1">أرباح هذا الشهر (بالدولار)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              ${narratorEarningsUsd.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            ▲ 18% مقارنة بالشهر السابق
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-xs text-slate-400 block mb-1">مرات الاستخدام</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">
              1,284
            </span>
            <span className="text-[11px] text-slate-400 font-bold">جلسة</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            إجمالي المشروعات المولدة
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-xs text-slate-400 block mb-1">الحروف المولّدة</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">
              {totalCharacters > 1000 ? `${(totalCharacters / 1000).toFixed(0)}K` : totalCharacters}
            </span>
            <span className="text-[11px] text-indigo-400 font-bold">حرف</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            إجمالي المحتوى الاصطناعي
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-xs text-slate-400 block mb-1">الحجوزات البشرية</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-orange-400 font-mono">
              6
            </span>
            <span className="text-[11px] text-slate-400 font-bold">مشاريع</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            قيد التنفيذ في الاستوديو
          </span>
        </div>
      </div>

      {/* Sub Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('status_usage')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'status_usage'
              ? 'text-white border-b-2 border-brand'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          سجل عمليات الاستخدام والأرباح
        </button>

        <button
          onClick={() => setActiveTab('audit_ledger')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'audit_ledger'
              ? 'text-white border-b-2 border-brand'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          سجل التدقيق والموافقات (Immutable Audit Log)
        </button>

        <button
          onClick={() => setActiveTab('test_playground')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'test_playground'
              ? 'text-white border-b-2 border-brand'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          مختبر تجربة الصوت العصبي
        </button>
      </div>

      {/* TAB 1: Usage Events Table */}
      {activeTab === 'status_usage' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black text-white">آخر عمليات توليد المحتوى بصوتك الذكي</h3>
            <span className="text-[11px] text-slate-400">تُحدث لحظياً مع كل عملية توليد ناجحة</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="p-3.5">العميل / المنشأة</th>
                  <th className="p-3.5">المجال المصرح به</th>
                  <th className="p-3.5">عدد الحروف</th>
                  <th className="p-3.5">إجمالي الفاتورة</th>
                  <th className="p-3.5">حصتك ({revShare}%)</th>
                  <th className="p-3.5">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {usageEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="p-3.5 font-bold text-white font-['Cairo']">
                      {ev.clientName || 'عميل مرخص'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {ev.useCase}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {ev.characters.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      ${ev.grossAmount.toFixed(2)}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      +${ev.narratorEarning.toFixed(2)}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(ev.createdAt).toLocaleString('en-US', { hour12: false })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Immutable Audit Log Ledger */}
      {activeTab === 'audit_ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>سجل التدقيق الرقمي المعتمد للبصمة الصوتية</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              سجل تسلسلي غير قابل للتعديل أو الحذف، يوثّق كل موافقة، توقيع، إيقاف، أو تغيير في حالة الترخيص بتوقيت مشفر.
            </p>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-orange-400 font-bold">{log.action}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                      IP: {log.ip || '151.254.12.89'}
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] truncate max-w-xl">
                    {JSON.stringify(log.payload)}
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <div className="text-slate-300 font-mono text-[11px]">
                    {new Date(log.at).toISOString().replace('T', ' ').substring(0, 19)}
                  </div>
                  {log.hash && (
                    <div className="text-slate-600 font-mono text-[9px] truncate max-w-[140px]" title={log.hash}>
                      SHA256: {log.hash.substring(0, 16)}...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Neural Inference Test Playground */}
      {activeTab === 'test_playground' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>مختبر تجربة الصوت العصبي المباشر</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                اختبر طبقة الرنين ونبرة صوتك المستنسخ مع نصوص تجريبية جديدة
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              ElevenLabs Engine Ready
            </span>
          </div>

          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              عدد الحروف: {testText.length} | الكلمات: {testText.trim().split(/\s+/).length}
            </span>

            <button
              onClick={handleTestGenerate}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                isPlayingTwin 
                  ? 'bg-amber-500 text-slate-950 font-black' 
                  : 'bg-brand hover:bg-orange-600 text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري التوليد...</span>
                </>
              ) : isPlayingTwin ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>إيقاف التشغيل</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>توليد ومعاينة الصوت</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* WITHDRAWAL / NOTICE PERIOD MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white">سحب الموافقة وبدء فترة الإشعار التعاقدية</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              وفقاً لبنود عقد ترخيص البصمة الصوتية الموقع برقم <strong>{contract?.id || 'CONTRACT_2026'}</strong>، فإن سحب الموافقة يخضع لفترة إشعار مدتها <strong>{contract?.noticePeriodDays || 365} يومًا</strong>.
            </p>

            <div className="my-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span>تاريخ التوقيع الأصلي:</span>
                <span className="font-mono text-slate-400">{contract?.signedAt ? new Date(contract.signedAt).toLocaleDateString('ar-SA') : '2026/02/15'}</span>
              </div>
              <div className="flex justify-between">
                <span>تاريخ التعطيل النهائي المحسوب:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {new Date(Date.now() + (contract?.noticePeriodDays || 365) * 86400000).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>مستحقاتك خلال الفترة:</span>
                <span className="text-emerald-400 font-bold">تستمر في تلقي كامل الأرباح ({revShare}%)</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                سبب السحب (اختياري، لتحسين تجربة المعلقين):
              </label>
              <textarea
                rows={2}
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="اذكر سبب الرغبة في إيقاف ترخيص البصمة الصوتية"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdrawal}
                disabled={isSubmittingWithdraw}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                {isSubmittingWithdraw ? 'جاري التوثيق...' : 'تأكيد بدء فترة الإشعار'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
