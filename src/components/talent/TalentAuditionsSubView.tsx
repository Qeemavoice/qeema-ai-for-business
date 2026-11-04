import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  Send, 
  Mic2, 
  DollarSign, 
  CheckCircle2, 
  Award, 
  FileText, 
  X, 
  UploadCloud,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import { TalentAudition } from '../../data/talentMockData';

interface TalentAuditionsSubViewProps {
  auditions: TalentAudition[];
  onNavigateToStudio?: () => void;
}

export const TalentAuditionsSubView: React.FC<TalentAuditionsSubViewProps> = ({
  auditions: initialAuditions,
  onNavigateToStudio
}) => {
  const [auditions, setAuditions] = useState<TalentAudition[]>(initialAuditions);
  const [selectedAudition, setSelectedAudition] = useState<TalentAudition | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [proposalPrice, setProposalPrice] = useState<number>(0);
  const [proposalPitch, setProposalPitch] = useState('');
  const [isRecordedTakeReady, setIsRecordedTakeReady] = useState(false);

  const handleOpenAudition = (aud: TalentAudition) => {
    setSelectedAudition(aud);
    setProposalPrice(aud.budgetSAR);
    setProposalPitch('');
    setIsRecordedTakeReady(false);
    setAppliedSuccess(false);
  };

  const handleSubmitAudition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudition) return;

    setAuditions(prev => prev.map(a => {
      if (a.id === selectedAudition.id) {
        return { ...a, status: 'applied', applicantsCount: a.applicantsCount + 1 };
      }
      return a;
    }));

    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setSelectedAudition(null);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-text" />
            <span>بورصة تجارب الأداء واختبارات الصوت</span>
          </h2>
          <p className="text-xs text-slate-400">
            فرص تعليق صوتي مفتوحة من وكالات الإعلانات ودور الإنتاج متوافقة مع طبقة صوتك
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-orange-500/20 text-brand-text font-bold border border-orange-500/30">
            {auditions.filter(a => a.status === 'open').length} فرص جديدة متاحة
          </span>
        </div>
      </div>

      {/* Audition cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {auditions.map(aud => {
          const isOpen = aud.status === 'open';
          const isApplied = aud.status === 'applied';
          const isShortlisted = aud.status === 'shortlisted';

          return (
            <div
              key={aud.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                isShortlisted 
                  ? 'border-amber-500/60 shadow-xl shadow-amber-950/20' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isOpen 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : isShortlisted
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {isOpen && '🟢 مفتوح للتقديم'}
                    {isApplied && '📨 تم التقديم (قيد المراجعة)'}
                    {isShortlisted && '⭐ في القائمة القصيرة!'}
                  </span>

                  <span className="text-xs font-mono font-black text-emerald-400">
                    {aud.budgetSAR.toLocaleString()} ر.س
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">
                  {aud.title}
                </h3>

                <p className="text-xs text-slate-400 mb-2">
                  الجهة: <strong className="text-slate-200">{aud.agency}</strong>
                </p>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs mb-3 space-y-1">
                  <div className="text-[11px] text-slate-400">
                    اللهجة المطلوبة: <strong className="text-slate-200">{aud.dialectRequired}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    النبرة: <strong className="text-slate-200">{aud.toneRequired}</strong>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 mb-3 text-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">نص تجربة الأداء:</span>
                  <p className="text-slate-200 italic line-clamp-2">
                    "{aud.testScript}"
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  {aud.deadline} • {aud.applicantsCount} متقدم
                </span>

                <button
                  onClick={() => handleOpenAudition(aud)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    isOpen
                      ? 'bg-brand hover:bg-orange-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isOpen ? 'قدّم تجربة صوتك' : 'عرض التفاصيل'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audition Submission Modal */}
      {selectedAudition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-right">
            <button
              onClick={() => setSelectedAudition(null)}
              className="absolute left-5 top-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {appliedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">تم إرسال تجربة الأداء بنجاح!</h3>
                <p className="text-xs text-slate-400">
                  سيتم إشعارك فور استماع المخرج والوكالة للعينة الصوتية.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAudition} className="space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-brand-text uppercase tracking-wider">
                    تقديم تجربة أداء صوتية
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {selectedAudition.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    الجهة: {selectedAudition.agency} • الميزانية المقترحة: <strong className="text-emerald-400 font-mono">{selectedAudition.budgetSAR.toLocaleString()} ر.س</strong>
                  </p>
                </div>

                {/* Test Script to record */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    نص التجربة المطلوب قراءته (30 ثانية):
                  </span>
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    {selectedAudition.testScript}
                  </p>
                </div>

                {/* Recording Take Simulation / Upload */}
                <div 
                  onClick={() => setIsRecordedTakeReady(true)}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isRecordedTakeReady
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-brand bg-slate-800/40'
                  }`}
                >
                  <Mic2 className={`w-8 h-8 mx-auto mb-1 ${isRecordedTakeReady ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {isRecordedTakeReady ? (
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block">
                        تم إرفاق العينة الصوتية: Audition_Take_48kHz.wav
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        جاهز للمعاينة والإرسال
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-bold text-white block">
                        انقر لإرفاق أو تسجيل العينة الاختبارية
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        (WAV 48kHz / MP3 عالي الدقة)
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Proposal & Pitch */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      عرضك المالي (ر.س):
                    </label>
                    <input
                      type="number"
                      value={proposalPrice}
                      onChange={(e) => setProposalPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      وقت التسليم المقترح:
                    </label>
                    <select className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand">
                      <option>خلال 4 ساعات (تسليم سريع)</option>
                      <option>خلال 12 ساعة</option>
                      <option>خلال 24 ساعة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    رسالة تقديم للمخرج (اختياري):
                  </label>
                  <textarea
                    value={proposalPitch}
                    onChange={(e) => setProposalPitch(e.target.value)}
                    placeholder="مثال: جاهز للتسجيل فوراً في كابينة معزولة بمايكروفون Neumann U87، ومتاح لجلسة توجيه مباشر..."
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand h-16 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAudition(null)}
                    className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-brand hover:bg-orange-600 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-orange-600/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال تجربة الأداء</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
