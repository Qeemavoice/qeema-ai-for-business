import React, { useState } from 'react';
import { 
  TrendingUp, 
  Mic2, 
  Clock, 
  Star, 
  DollarSign, 
  ShieldCheck, 
  Play, 
  Pause, 
  ArrowUpRight, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  ChevronLeft,
  Volume2,
  Sliders,
  Headphones,
  Award,
  Zap
} from 'lucide-react';
import { TalentProfile, TalentProject, TalentAudition } from '../../data/talentMockData';
import { audioSynth } from '../../utils/audioSynthesizer';

interface TalentOverviewSubViewProps {
  profile: TalentProfile;
  projects: TalentProject[];
  auditions: TalentAudition[];
  onNavigateToTab: (tab: any) => void;
  onOpenProjectDetail: (project: TalentProject) => void;
  onOpenStudioWithProject: (project: TalentProject) => void;
}

export const TalentOverviewSubView: React.FC<TalentOverviewSubViewProps> = ({
  profile,
  projects,
  auditions,
  onNavigateToTab,
  onOpenProjectDetail,
  onOpenStudioWithProject
}) => {
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);

  const urgentProject = projects.find(p => p.urgency === 'urgent' && p.status !== 'delivered');
  const activeProjects = projects.filter(p => p.status !== 'delivered');
  const openAuditions = auditions.filter(a => a.status === 'open');

  const toggleSoundPreview = (id: string) => {
    if (playingPreviewId === id) {
      audioSynth.stopAll();
      setPlayingPreviewId(null);
    } else {
      setPlayingPreviewId(id);
      audioSynth.playAcousticPreview(() => {
        setPlayingPreviewId(null);
      }, 4);
    }
  };

  return (
    <div className="space-y-6">
      {/* Urgent Top Alert for in-progress broadcast project */}
      {urgentProject && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-950 via-slate-900 to-slate-900 border border-orange-500/30 p-5 shadow-xl shadow-orange-950/20 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0 text-brand-text animate-pulse">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white uppercase tracking-wider">
                    مستعجل • مهلة التسليم قريبة
                  </span>
                  <span className="text-xs text-orange-200/80 font-mono">
                    {urgentProject.deadline}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {urgentProject.title}
                </h3>
                <p className="text-xs text-slate-300">
                  العميل: <span className="font-semibold text-white">{urgentProject.client}</span> • الميزانية: <span className="text-emerald-400 font-bold font-mono">{urgentProject.budgetSAR.toLocaleString()} ر.س</span> (مضمونة بالضمان 🛡️)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={() => onOpenProjectDetail(urgentProject)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer"
              >
                معاينة السيناريو
              </button>
              <button
                onClick={() => onOpenStudioWithProject(urgentProject)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand hover:bg-brand-orange text-white shadow-lg shadow-orange-600/30 transition-all cursor-pointer group"
              >
                <Mic2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>فتح في كابينة التسجيل الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">الرصيد القابل للسحب</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {profile.balanceSAR.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">ر.س</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">المعلق بالضمان: {profile.escrowSAR.toLocaleString()} ر.س</span>
            <button 
              onClick={() => onNavigateToTab('earnings')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>سحب فوري</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">مشاريع قيد التنفيذ</span>
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand-text flex items-center justify-center">
              <Mic2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {activeProjects.length}
            </span>
            <span className="text-xs text-orange-400 font-medium">مشاريع نشطة</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">1 يتطلب تسليم اليوم</span>
            <button 
              onClick={() => onNavigateToTab('projects')}
              className="text-brand-text hover:text-orange-400 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>عرض خط الإنتاج</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Client Rating */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">تقييم العملاء والشركات</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {profile.rating}
            </span>
            <span className="text-xs text-amber-400 font-bold">/ 5.0</span>
            <span className="text-xs text-slate-500">({profile.reviewsCount} مراجعة)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% نسبة إكمال المشاريع
            </span>
            <span className="text-slate-500">{profile.completedProjectsCount} منجز</span>
          </div>
        </div>

        {/* Studio Delivery Speed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">متوسط سرعة التسليم</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {profile.turnaroundAvgHours}
            </span>
            <span className="text-xs text-indigo-300 font-bold">ساعات</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono font-bold">أسرع من 92%</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">كابينة عزل -64dB</span>
            <span className="text-indigo-400 font-bold">48kHz Pro Master</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Active Pipeline & Quick Audio Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                <h3 className="text-sm font-bold text-white">المشاريع الحالية بانتظار الإجراء</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {projects.length}
                </span>
              </div>
              <button 
                onClick={() => onNavigateToTab('projects')}
                className="text-xs text-brand-text hover:text-orange-400 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => {
                const isUrgent = proj.urgency === 'urgent';
                return (
                  <div 
                    key={proj.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            proj.status === 'in_studio' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : proj.status === 'client_review'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : proj.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {proj.status === 'in_studio' && '🎙️ في الاستوديو'}
                            {proj.status === 'client_review' && '🔄 مراجعة العميل'}
                            {proj.status === 'delivered' && '✅ مكتمل ومسلّم'}
                            {proj.status === 'new_request' && '⚡ طلب جديد'}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">
                            {proj.categoryLabel}
                          </span>
                          <span className="text-xs text-slate-500">• {proj.dialect}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                          {proj.title}
                        </h4>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-sm font-black text-emerald-400 font-mono">
                          {proj.budgetSAR.toLocaleString()} ر.س
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>في الضمان</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/40 text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <span>العميل: <strong className="text-slate-200">{proj.client}</strong></span>
                        <span>عدد الكلمات: <strong className="text-slate-200">{proj.wordCount}</strong></span>
                        <span>المدة التقريبية: <strong className="text-slate-200">{proj.estimatedDurationSeconds}ث</strong></span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenProjectDetail(proj)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
                        >
                          عرض النص
                        </button>
                        {proj.status !== 'delivered' && (
                          <button
                            onClick={() => onOpenStudioWithProject(proj)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-brand hover:bg-orange-600 text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Mic2 className="w-3 h-3" />
                            <span>سجّل الآن</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Home Studio Live Hardware Status & Room Tone */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">جاهزية الاستوديو المنزلي والمعايرة</h3>
                  <p className="text-[11px] text-slate-400">مواصفات التسجيل الحي المعتمدة لدى الوكالات</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>معاير ومطابق للمعايير</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-800">
                <span className="text-slate-400 block mb-1">المايكروفون المعتمد</span>
                <span className="text-white font-bold block">{profile.equipment.mic}</span>
                <span className="text-[10px] text-emerald-400 mt-1 block">Large Diaphragm Condenser</span>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-800">
                <span className="text-slate-400 block mb-1">كرت الصوت والبري آمب</span>
                <span className="text-white font-bold block">{profile.equipment.interface}</span>
                <span className="text-[10px] text-indigo-400 mt-1 block">Unison Preamps DSP</span>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-800">
                <span className="text-slate-400 block mb-1">عزل الكابينة الصوتية</span>
                <span className="text-white font-bold block">{profile.equipment.acousticIsolation}</span>
                <span className="text-[10px] text-amber-400 mt-1 block">Room Tone &lt; -64 dB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Casting Matches & Quick Demos Player */}
        <div className="space-y-6">
          {/* Matched Auditions Radar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-brand-text flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">فرص كاستينج مطابقة لخامتك</h3>
                  <p className="text-[11px] text-slate-400">{openAuditions.length} تجربة أداء مفتوحة</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('auditions')}
                className="text-xs text-brand-text hover:text-orange-400 font-bold cursor-pointer"
              >
                الكل
              </button>
            </div>

            <div className="space-y-3">
              {auditions.map((aud) => (
                <div 
                  key={aud.id}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-orange-500/50 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                      {aud.title}
                    </h4>
                    <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                      {aud.budgetSAR.toLocaleString()} ر.س
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    "{aud.testScript}"
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-slate-500">{aud.deadline}</span>
                    <button
                      onClick={() => onNavigateToTab('auditions')}
                      className="px-2.5 py-1 rounded bg-brand/20 hover:bg-brand text-orange-300 hover:text-white font-bold transition-all cursor-pointer"
                    >
                      قدّم تجربتك الآن
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Voice Twin Monthly Passive Income */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">التوأم الصوتي المرخص والموثق</h3>
                  <p className="text-[10px] text-indigo-300">عوائد الترخيص السلبي هذا الشهر</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-indigo-500/20 mb-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">الكلمات المولدة:</span>
                <span className="font-mono font-bold text-white">{profile.voiceTwin.wordsThisMonth.toLocaleString()} كلمة</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">الأرباح التراكمية:</span>
                <span className="font-mono font-bold text-emerald-400">+{profile.voiceTwin.monthlyEarningsSAR.toLocaleString()} ر.س</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('twin')}
              className="w-full py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-center cursor-pointer shadow-md"
            >
              إدارة أذونات وحقوق التوأم الصوتي
            </button>
          </div>

          {/* Quick Rate Calculator Preview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">حاسبة التسعير القياسية</h3>
                <p className="text-[10px] text-slate-400">تسعير احترافي متوافق مع سوق الخليج</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              احسب تسعير أي سيناريو بدقة مع حقوق البث وحساب الكلمات بضغطة زر.
            </p>
            <button
              onClick={() => onNavigateToTab('rates')}
              className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>فتح حاسبة الأسعار</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
