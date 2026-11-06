import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Download,
  Sparkles,
  FolderPlus,
  Search,
  Pause,
  Play
} from 'lucide-react';
import { Company, User, Voice, Generation, ActiveView } from '../types';
import { api } from '../lib/api';
import { DashboardSidebar, DashboardNavKey } from './dashboard/DashboardSidebar';
import { DashboardTopNav } from './dashboard/DashboardTopNav';
import { HomeSubView } from './dashboard/HomeSubView';
import { VoicesSubView } from './dashboard/VoicesSubView';
import { TtsHistoryView, TtsStudioView } from './TtsStudioView';
import { ProjectsSubView, AssetsSubView } from './dashboard/OtherSubViews';

interface ClientDashboardViewProps {
  currentCompany: Company | null;
  currentUser: User | null;
  voices: Voice[];
  availableCompanies: Company[];
  isLoggedIn: boolean;
  onSwitchCompany: (companyId: string) => void;
  onNavigate: (view: ActiveView, extra?: any) => void;
  onOpenLogin: () => void;
  onLogout: () => void | Promise<void>;
  onOpenAssistant?: () => void;
  onSelectForBooking: (voice: Voice) => void;
}

export const ClientDashboardView: React.FC<ClientDashboardViewProps> = ({
  currentCompany,
  currentUser,
  voices,
  availableCompanies,
  isLoggedIn,
  onSwitchCompany,
  onNavigate,
  onOpenLogin,
  onLogout,
  onOpenAssistant,
  onSelectForBooking
}) => {
  // Navigation State inside ElevenLabs-style Workspace
  const [activeNav, setActiveNav] = useState<DashboardNavKey>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [envMode, setEnvMode] = useState<'production' | 'sandbox'>('production');

  // Studio Pre-fill state
  const [studioInitialText, setStudioInitialText] = useState('');
  const [studioInitialVoiceId, setStudioInitialVoiceId] = useState<string | undefined>(undefined);

  // Data states
  const [generations, setGenerations] = useState<Generation[]>([]);

  // Audio Playback
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Interactive Projects
  const [projects, setProjects] = useState([
    {
      id: 'proj-1',
      title: 'حملة إعلانات اليوم الوطني 94',
      description: 'نصوص إعلانية موجهة لمنصات السوشيال ميديا والتلفزيون بلهجة نجدية وحجازية',
      dialect: 'سعودي (نجدي وحجازي)',
      progress: 92,
      clipsCount: 14,
      totalChars: 18400,
      status: 'active'
    },
    {
      id: 'proj-2',
      title: 'نظام الرد الصوتي التفاعلي للمصرف (IVR Banking)',
      description: 'رسائل الترحيب وتوجيه عملاء الخدمات المصرفية الخاصة وعمليات البطاقات',
      dialect: 'عربي فصيح معاصر',
      progress: 78,
      clipsCount: 22,
      totalChars: 31200,
      status: 'active'
    },
    {
      id: 'proj-3',
      title: 'بودكاست "أفق الابتكار" - الموسم الثاني',
      description: 'افتتاحيات الحلقات والتعليق الصوتي الفاصل بين فقرات التقنية والذكاء الاصطناعي',
      dialect: 'فصحى إذاعية وقورة',
      progress: 100,
      clipsCount: 8,
      totalChars: 12500,
      status: 'completed'
    },
    {
      id: 'proj-4',
      title: 'حقيبة التدريب المهني لمنسوبي الشركة',
      description: 'سرد تدريبي تعليمي مريح للمقررات الإلكترونية وأنظمة الامتثال والحوكمة',
      dialect: 'فصحى تعليمية هادئة',
      progress: 45,
      clipsCount: 19,
      totalChars: 46000,
      status: 'in_progress'
    }
  ]);

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDialect, setNewProjectDialect] = useState('سعودي (نجدي)');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [viewingLicense, setViewingLicense] = useState<any | null>(null);

  // Fetch initial dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const genRes = await api.getGenerations().catch(() => ({ total: 0, generations: [] }));
        setGenerations(genRes.generations || []);
      } catch (err) {
        console.error('Failed to load client dashboard data:', err);
      }
    };
    loadDashboardData();
  }, [currentCompany?.id]);

  const handleTogglePlay = (genId: string, audioUrl: string) => {
    if (!audioUrl) return;
    if (playingId === genId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = audioRef.current;
    if (!audio) return;
    audio.src = audioUrl;
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    audio.play().then(() => setPlayingId(genId)).catch((error) => {
      console.error('Audio playback failed:', error);
      setPlayingId(null);
    });
  };

  const handleQuickGenerateFromHome = (text: string, voiceId: string) => {
    setStudioInitialText(text);
    setStudioInitialVoiceId(voiceId);
    setActiveNav('studio');
  };

  const handleOpenStudioPreset = (text: string, voiceId?: string) => {
    setStudioInitialText(text);
    if (voiceId) setStudioInitialVoiceId(voiceId);
    setActiveNav('studio');
  };

  const handleGenerationComplete = (newGen: Generation) => {
    setGenerations([newGen, ...generations]);
  };

  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim() || 'مشروع صوتي جديد للمنشأة',
      dialect: newProjectDialect,
      progress: 5,
      clipsCount: 1,
      totalChars: 850,
      status: 'active'
    };
    setProjects([newProj, ...projects]);
    setNewProjectTitle('');
    setNewProjectDesc('');
    setIsNewProjectModalOpen(false);
  };

  return (
    <div className="h-screen w-full flex bg-[#F8FAFC] text-slate-900 font-['IBM_Plex_Sans_Arabic',sans-serif] overflow-hidden" dir="ltr">
      {/* Global Hidden Audio element for previewing */}
      <audio ref={audioRef} preload="metadata" />

      {/* 1. ElevenLabs Left Sidebar */}
      <DashboardSidebar
        activeNav={activeNav}
        onSelectNav={(nav) => setActiveNav(nav)}
      />

      {/* 2. Main Workspace Body (TopNav + Scrollable Views) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <DashboardTopNav
          activeNav={activeNav}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          envMode={envMode}
          onToggleEnvMode={setEnvMode}
          onOpenAssistant={onOpenAssistant || (() => onNavigate('generate'))}
          onNavigateTab={(tab) => setActiveNav(tab)}
          currentCompany={currentCompany}
          currentUser={currentUser}
          availableCompanies={availableCompanies}
          onSwitchCompany={onSwitchCompany}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70 custom-scrollbar">
          {activeNav === 'home' && (
            <HomeSubView
              voices={voices}
              generations={generations}
              playingId={playingId}
              onTogglePlay={handleTogglePlay}
              onNavigateTab={(tab) => setActiveNav(tab)}
              onQuickGenerate={handleQuickGenerateFromHome}
              onOpenStudioPreset={handleOpenStudioPreset}
            />
          )}

          {activeNav === 'voices' && (
            <VoicesSubView
              voices={voices}
              playingVoiceId={playingId}
              onTogglePlayVoice={(id) => {
                const targetVoice = voices.find(v => v.id === id);
                if (targetVoice?.previewUrl) {
                  handleTogglePlay(id, targetVoice.previewUrl);
                }
              }}
              onBookHumanVoice={onSelectForBooking}
            />
          )}

          {activeNav === 'studio' && (
            <TtsStudioView
              isLoggedIn={isLoggedIn}
              onRequireAuth={onOpenLogin}
              initialVoiceId={studioInitialVoiceId}
            />
          )}

          {activeNav === 'recordings' && <TtsHistoryView />}

          {activeNav === 'projects' && (
            <ProjectsSubView
              projects={projects}
              onOpenNewProject={() => setIsNewProjectModalOpen(true)}
              onNavigateToStudio={(preset) => handleOpenStudioPreset(preset || 'مشروع صوتي جديد')}
            />
          )}

          {activeNav === 'assets' && (
            <AssetsSubView
              generations={generations}
              playingId={playingId}
              onTogglePlay={handleTogglePlay}
              onViewLicense={(gen) => {
                setViewingLicense({
                  id: `LIC-${gen.id.slice(0, 8).toUpperCase()}`,
                  companyName: currentCompany?.name || 'وكالة الأفق الإبداعية',
                  voiceName: gen.voiceName,
                  date: new Date(gen.createdAt).toLocaleDateString('ar-SA')
                });
              }}
            />
          )}

          {activeNav === 'human-bookings' && (
            <HumanBookingCatalog voices={voices} onBook={onSelectForBooking} />
          )}

          {activeNav === 'voice-twins' && (
            <div className="max-w-3xl mx-auto p-8 text-center" dir="rtl">
              <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
                <Sparkles className="mx-auto h-10 w-10 text-[#FF5500]" />
                <span className="mt-5 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#D94800]">قريباً</span>
                <h2 className="mt-4 text-2xl font-black text-slate-950">استنساخ الصوت والتوأم الصوتي</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">نعمل على إطلاق الاستنساخ بموافقات صريحة وحماية حقوق صاحب الصوت. لن نعرض نماذج تجريبية وهمية قبل جاهزية الخدمة.</p>
              </div>
            </div>
          )}

          {activeNav === 'compliance' && (
            <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in text-right" dir="rtl">
              <div>
                <h2 className="text-xl font-black text-slate-900">التراخيص وحوكمة الأمان (Compliance)</h2>
                <p className="text-xs text-slate-500">حماية الملكية الفكرية، وبراءة الذمة من المطالبات، وسياسة عدم الاحتفاظ بالبيانات</p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">ضمان البث التجاري الكامل (Commercial Royalty-Free)</h3>
                    <p className="text-xs text-slate-400">كافة المقاطع المولدة والتسجيلات البشرية مرخصة للاستخدام الإعلاني والتجاري للأبد</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ======================= MODAL: CREATE PROJECT ======================= */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-right animate-fade-in" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#FF5500]" />
                <h3 className="font-bold text-base text-slate-900">إنشاء مشروع صوتي جديد</h3>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المشروع أو الحملة:</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="مثال: حملة إعلانات التأسيس 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اللهجة المستهدفة:</label>
                <select
                  value={newProjectDialect}
                  onChange={(e) => setNewProjectDialect(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="سعودي (نجدي وحجازي)">سعودي (نجدي وحجازي)</option>
                  <option value="عربي فصيح معاصر">عربي فصيح معاصر</option>
                  <option value="لهجة مصرية تسويقية">لهجة مصرية تسويقية</option>
                  <option value="لهجة شامية">لهجة شامية</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">وصف موجز للمشروع:</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="اكتب أهداف الحملة ونمط الإلقاء المطلوب لمساعدة الفريق..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectTitle.trim()}
                className="px-5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#e04b00] disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-all"
              >
                إنشاء المشروع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: COMMERCIAL LICENSE CERTIFICATE ======================= */}
      {viewingLicense && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-right animate-fade-in" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">شهادة ترخيص الملكية التجارية</h3>
                  <p className="text-xs text-slate-500 font-mono">Certificate of Commercial Voice Rights</p>
                </div>
              </div>
              <button
                onClick={() => setViewingLicense(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">رقم الوثيقة الرسمية:</span>
                <strong className="font-mono text-slate-900">{viewingLicense.id}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">الجهة المرخص لها:</span>
                <strong className="text-slate-900">{viewingLicense.companyName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">اسم الموهبة / الصوت:</span>
                <strong className="text-slate-900">{viewingLicense.voiceName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">تاريخ الإصدار:</span>
                <strong className="font-mono text-slate-900">{viewingLicense.date}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">نطاق الاستخدام:</span>
                <strong className="text-emerald-700 font-bold">بث تجاري وإعلاني غير محدود ومحمي بحقوق الملكية</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              تشهد منصة "قيمة" بأن هذا الملف الصوتي مملوك بالكامل للجهة المرخص لها مع براءة ذمة فكرية شاملة تتيح البث التلفزيوني والإذاعي والرقمي بدون أي مطالبات حقوق إضافية.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingLicense(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  setViewingLicense(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل الشهادة الموثقة (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HumanBookingCatalog: React.FC<{ voices: Voice[]; onBook: (voice: Voice) => void }> = ({ voices, onBook }) => {
  const [query, setQuery] = useState('');
  const [dialect, setDialect] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [previewErrorId, setPreviewErrorId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const humans = voices.filter((voice) => voice.type === 'human' && voice.isActive);
  const dialects = Array.from(new Set(humans.map((voice) => voice.dialectLabel).filter(Boolean)));
  const shown = humans.filter((voice) => {
    const matchQuery = `${voice.name} ${voice.dialectLabel} ${voice.styleLabel}`.toLowerCase().includes(query.toLowerCase());
    return matchQuery && (dialect === 'all' || voice.dialectLabel === dialect);
  });

  const togglePreview = async (voice: Voice) => {
    const audio = audioRef.current;
    if (!audio || !voice.previewUrl) return;
    setPreviewErrorId(null);
    if (playingId === voice.id) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingId(null);
      return;
    }
    audio.pause();
    audio.src = voice.previewUrl;
    audio.load();
    try {
      await audio.play();
      setPlayingId(voice.id);
    } catch {
      setPlayingId(null);
      setPreviewErrorId(voice.id);
    }
  };

  return (
    <section dir="rtl" className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-6 rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
        <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-300/10 px-3 py-1 text-xs font-bold text-orange-200">حجز وتسجيل بشري</span>
        <h1 className="mt-3 text-2xl font-black sm:text-3xl">اختر المعلق المناسب لمشروعك</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">استمع إلى العينات، ابحث حسب الاسم واللهجة، ثم أرسل تفاصيل المشروع من نفس اللوحة.</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن معلق أو أسلوب أداء..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-10 pl-4 text-sm outline-none focus:border-[#FF5500] focus:ring-4 focus:ring-orange-100" />
        </label>
        <select value={dialect} onChange={(event) => setDialect(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#FF5500]">
          <option value="all">كل اللهجات</option>
          {dialects.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <p className="mb-4 text-xs font-bold text-slate-500">{shown.length} معلق متاح للحجز</p>
      <audio
        ref={audioRef}
        preload="none"
        className="hidden"
        onEnded={() => setPlayingId(null)}
        onError={() => {
          setPreviewErrorId(playingId);
          setPlayingId(null);
        }}
      />
      {shown.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((voice) => {
            return (
              <article key={voice.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg">
                <div className="flex items-center gap-3 p-4">
                  <img src={voice.avatar} alt="" className="h-14 w-14 rounded-2xl bg-slate-100 object-cover" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-black text-slate-900">{voice.name}</h2>
                    <p className="mt-1 truncate text-xs text-slate-500">{voice.dialectLabel} · {voice.styleLabel}</p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">صوت بشري موثّق</span>
                  </div>
                </div>
                <div className="px-4">
                  <button
                    type="button"
                    disabled={!voice.previewUrl}
                    onClick={() => void togglePreview(voice)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    aria-label={`${playingId === voice.id ? 'إيقاف' : 'استمع إلى'} عينة ${voice.name}`}
                  >
                    {playingId === voice.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {voice.previewUrl ? (playingId === voice.id ? 'إيقاف العينة' : 'استمع للعينة هنا') : 'لا توجد عينة صوتية'}
                  </button>
                  {previewErrorId === voice.id && <p role="status" className="mt-2 text-center text-[11px] text-rose-600">تعذّر تشغيل العينة. حاول مرة أخرى لاحقاً.</p>}
                </div>
                <div className="flex gap-2 p-4 pt-3">
                  <button type="button" onClick={() => onBook(voice)} className="flex-1 rounded-xl bg-[#FF5500] px-3 py-2.5 text-xs font-black text-white transition hover:bg-[#e34c00]">احجز هذا المعلق</button>
                </div>
              </article>
            );
          })}
        </div>
      ) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">لا توجد نتائج مطابقة. جرّب تغيير البحث أو اللهجة.</div>}
    </section>
  );
};
