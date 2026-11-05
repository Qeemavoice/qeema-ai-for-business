import React, { useState } from 'react';
import { 
  Mic2, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  ChevronLeft, 
  Volume2, 
  Sparkles,
  ExternalLink,
  X,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import { TalentProject } from '../../data/talentMockData';

interface TalentProjectsSubViewProps {
  projects: TalentProject[];
  onOpenStudioWithProject: (project: TalentProject) => void;
  onUpdateProjectStatus?: (projectId: string, newStatus: TalentProject['status']) => void;
}

export const TalentProjectsSubView: React.FC<TalentProjectsSubViewProps> = ({
  projects,
  onOpenStudioWithProject,
  onUpdateProjectStatus
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'new_request' | 'in_studio' | 'client_review' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProject, setActiveModalProject] = useState<TalentProject | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const filteredProjects = projects.filter(p => {
    if (selectedFilter !== 'all' && p.status !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || 
             p.client.toLowerCase().includes(q) || 
             p.dialect.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenDelivery = (p: TalentProject) => {
    setActiveModalProject(p);
    setIsSubmitModalOpen(true);
    setIsSubmittedSuccess(false);
    setUploadedFileName(null);
    setDeliveryNotes('');
  };

  const handleConfirmDelivery = () => {
    if (!activeModalProject) return;
    if (onUpdateProjectStatus) {
      onUpdateProjectStatus(activeModalProject.id, 'client_review');
    }
    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmitModalOpen(false);
      setIsSubmittedSuccess(false);
      setActiveModalProject(null);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-brand text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            الكل ({projects.length})
          </button>
          <button
            onClick={() => setSelectedFilter('new_request')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'new_request'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            طلبات جديدة ({projects.filter(p => p.status === 'new_request').length})
          </button>
          <button
            onClick={() => setSelectedFilter('in_studio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'in_studio'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            قيد التسجيل ({projects.filter(p => p.status === 'in_studio').length})
          </button>
          <button
            onClick={() => setSelectedFilter('client_review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'client_review'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            مراجعة العميل ({projects.filter(p => p.status === 'client_review').length})
          </button>
          <button
            onClick={() => setSelectedFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'delivered'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            مكتمل ومسلّم ({projects.filter(p => p.status === 'delivered').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالمشروع، العميل، اللهجة..."
            className="w-full pl-3 pr-9 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => {
          const isUrgent = project.urgency === 'urgent';
          return (
            <div
              key={project.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                isUrgent ? 'border-orange-500/50 shadow-lg shadow-orange-950/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        project.status === 'in_studio'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : project.status === 'client_review'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : project.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {project.status === 'in_studio' && '🎙️ في الاستوديو'}
                        {project.status === 'client_review' && '🔄 مراجعة وتعديلات'}
                        {project.status === 'delivered' && '✅ مكتمل ومعتمد'}
                        {project.status === 'new_request' && '⚡ طلب جديد'}
                      </span>
                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                          مستعجل ⏰
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {project.title}
                    </h3>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {project.budgetSAR.toLocaleString()} ر.س
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{project.inEscrow ? 'مؤمن بالضمان' : 'تم التحويل'}</span>
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-800 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">العميل:</span>
                    <strong className="text-slate-200 block truncate">{project.client}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">اللهجة والأسلوب:</span>
                    <strong className="text-slate-200 block truncate">{project.dialect}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">الكلمات / المدة:</span>
                    <span className="text-slate-200 font-mono">{project.wordCount} كلمة (~{project.estimatedDurationSeconds}ث)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">الموعد النهائي:</span>
                    <span className={`font-semibold ${isUrgent ? 'text-orange-400' : 'text-slate-200'}`}>
                      {project.deadline}
                    </span>
                  </div>
                </div>

                {/* Script Excerpt */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>مقتطف من السيناريو:</span>
                    <span className="text-[10px] text-slate-500">صيغة: {project.audioFormat.split(' ')[0]}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 italic">
                    "{project.script}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setActiveModalProject(project)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>تفاصيل السيناريو</span>
                </button>

                {project.status !== 'delivered' && (
                  <>
                    <button
                      onClick={() => onOpenStudioWithProject(project)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-brand hover:bg-orange-600 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20"
                    >
                      <Mic2 className="w-3.5 h-3.5" />
                      <span>الكابينة والملقّن</span>
                    </button>

                    <button
                      onClick={() => handleOpenDelivery(project)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      title="تسليم الماستر الصوتي"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">تسليم</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Script & Project Details Modal */}
      {activeModalProject && !isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalProject(null)}
              className="absolute left-5 top-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-brand-text uppercase tracking-wider">
                  {activeModalProject.categoryLabel}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activeModalProject.title}
                </h3>
                <p className="text-xs text-slate-400">
                  العميل: <strong className="text-slate-200">{activeModalProject.client}</strong> • اللهجة: <strong className="text-slate-200">{activeModalProject.dialect}</strong>
                </p>
              </div>

              {/* Audio Specifications required */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-brand-text" />
                  <span>المواصفات الهندسية المطلوبة للتسليم:</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  {activeModalProject.audioFormat}
                </div>
                {activeModalProject.notes && (
                  <div className="text-amber-300/90 pt-1 text-[11px] border-t border-slate-700/60 mt-1">
                    ملاحظات المخرج: {activeModalProject.notes}
                  </div>
                )}
              </div>

              {/* Full Script */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-300">نص السيناريو الكامل:</h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {activeModalProject.wordCount} كلمة • ~{activeModalProject.estimatedDurationSeconds} ثانية
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-sm leading-relaxed text-slate-100 font-medium whitespace-pre-wrap selection:bg-brand selection:text-white">
                  {activeModalProject.script}
                </div>
              </div>

              {/* Modal footer actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setActiveModalProject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    const p = activeModalProject;
                    setActiveModalProject(null);
                    onOpenStudioWithProject(p);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand hover:bg-orange-600 text-white transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-600/30"
                >
                  <Mic2 className="w-4 h-4" />
                  <span>فتح في كابينة التسجيل والملقّن</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission & Master Delivery Modal */}
      {isSubmitModalOpen && activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-right">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute left-5 top-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmittedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">تم تسليم العمل بنجاح!</h3>
                <p className="text-xs text-slate-400">
                  تم إشعار العميل ووكالة الإنتاج للاستماع والاعتماد النهائي أو طلب أي تعديلات ضمن الحزمة.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    تسليم الماستر النهائي
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {activeModalProject.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    قيمة المشروع: <strong className="text-emerald-400 font-mono">{activeModalProject.budgetSAR.toLocaleString()} ر.س</strong>
                  </p>
                </div>

                {/* Dropzone simulator */}
                <div 
                  onClick={() => setUploadedFileName(`Master_Take_Final_48kHz_24bit_${Date.now().toString().slice(-4)}.wav`)}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    uploadedFileName 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : 'border-slate-700 hover:border-brand bg-slate-800/40 hover:bg-slate-800/70'
                  }`}
                >
                  <UploadCloud className={`w-10 h-10 mx-auto mb-2 ${uploadedFileName ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {uploadedFileName ? (
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block">{uploadedFileName}</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">جاهز للإرسال (WAV 48kHz / 24-bit PCM)</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-bold text-white block">انقر لرفع ملف التسجيل الصوتي (Master WAV)</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">يدعم صيغ WAV, FLAC, AIFF حتى 500MB</span>
                    </div>
                  )}
                </div>

                {/* Notes to director */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    ملاحظات للمخرج أو العميل (اختياري):
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="مثال: تم تسجيل نسختين مختلفتين من جملة الخاتمة بنبرة تصاعدية لتختار الأنسب..."
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand h-20 resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    onClick={handleConfirmDelivery}
                    className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>إرسال التسليم واعتماد مراجعة العميل</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
