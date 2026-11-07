import React, { useState, useEffect, useRef } from 'react';
import { UsageView } from './UsageView';
import { 
  Plus, 
  X, 
  Users, 
  ShieldCheck, 
  Download, 
  Sparkles,
  Volume2,
  FolderPlus
} from 'lucide-react';
import { Company, User, Voice, Generation, ActiveView } from '../types';
import { findPlan } from '../../shared/plans';
import { api, UsageResponse, BillingResponse } from '../lib/api';
import { DashboardSidebar, DashboardNavKey, GATED_NAV } from './dashboard/DashboardSidebar';
import { useRowad } from '../lib/rowad';
import { RowadBadge } from './RowadBadge';
import { DashboardTopNav } from './dashboard/DashboardTopNav';
import { HomeSubView } from './dashboard/HomeSubView';
import { VoiceLibraryView, buildSampleSlug } from './VoiceLibraryView';
import { useNavigate } from 'react-router-dom';
import { TtsStudioPanel } from './TtsStudioPanel';
import { BillingTab } from './dashboard/BillingTab';
import { 
  ProjectsSubView, 
  AssetsSubView, 
  HumanBookingsSubView, 
  FlowsSubView 
} from './dashboard/OtherSubViews';

interface ClientDashboardViewProps {
  currentCompany: Company | null;
  currentUser: User | null;
  balanceCredits: number;
  voices: Voice[];
  availableCompanies: Company[];
  isLoggedIn: boolean;
  onSwitchCompany: (companyId: string) => void;
  onNavigate: (view: ActiveView, extra?: any) => void;
  onOpenTopUp: () => void;
  onOpenDemo: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenAssistant?: () => void;
  onGenerated?: (newBalanceCredits: number) => void;
}

export const ClientDashboardView: React.FC<ClientDashboardViewProps> = ({
  currentCompany,
  currentUser,
  balanceCredits,
  voices,
  availableCompanies,
  isLoggedIn,
  onSwitchCompany,
  onNavigate,
  onOpenTopUp,
  onOpenDemo,
  onOpenLogin,
  onOpenSignup,
  onOpenAssistant,
  onGenerated
}) => {
  // Navigation State inside ElevenLabs-style Workspace
  const [activeNav, setActiveNav] = useState<DashboardNavKey>('home');
  // «روّاد قيمة»: studio and billing tabs open to Rowad members now, to everyone from the public launch
  const canUseNew = useRowad().canUse;
  const navigateTo = useNavigate();
  const goNav = (nav: DashboardNavKey) => (!canUseNew && GATED_NAV.includes(nav) ? navigateTo('/ar/waitlist') : setActiveNav(nav));
  const [searchQuery, setSearchQuery] = useState('');
  const [envMode, setEnvMode] = useState<'production' | 'sandbox'>('production');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Studio Pre-fill state
  const [studioInitialText, setStudioInitialText] = useState('');
  const [studioInitialVoiceId, setStudioInitialVoiceId] = useState<string | undefined>(undefined);

  // Data states
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [usageData, setUsageData] = useState<UsageResponse | null>(null);
  const [billingData, setBillingData] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Audio Playback
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Interactive Projects
  // «المشاريع» and «فريق العمل» are kept on the company account (/api/v1/client/projects, /team)
  const [projects, setProjects] = useState<any[]>([]);
  const [team, setTeam] = useState<{ members: { id: string; name: string; email: string; role: string }[]; invites: { id: string; name: string; email: string; invitedAt: string; emailed: boolean }[] }>({ members: [], invites: [] });
  const [inviteError, setInviteError] = useState('');
  useEffect(() => {
    fetch('/api/v1/client/projects').then(r => (r.ok ? r.json() : null)).then(d => d && setProjects(d.projects)).catch(() => {});
    fetch('/api/v1/client/team').then(r => (r.ok ? r.json() : null)).then(d => d && setTeam(d)).catch(() => {});
  }, []);



  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDialect, setNewProjectDialect] = useState('سعودي (نجدي)');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'creator' | 'viewer'>('creator');

  const [isCreateVoiceModalOpen, setIsCreateVoiceModalOpen] = useState(false);
  const routerNavigate = useNavigate();
  const [newVoiceName, setNewVoiceName] = useState('');
  const [newVoiceDialect, setNewVoiceDialect] = useState('سعودي');
  const [newVoiceGender, setNewVoiceGender] = useState<'male' | 'female'>('male');

  const [viewingLicense, setViewingLicense] = useState<any | null>(null);

  // Fetch initial dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [genRes, usageRes, billingRes] = await Promise.all([
          api.getGenerations().catch(() => ({ total: 0, generations: [] })),
          api.getUsage().catch(() => null),
          api.getBilling().catch(() => null)
        ]);
        setGenerations(genRes.generations || []);
        setUsageData(usageRes);
        setBillingData(billingRes);
      } catch (err) {
        console.error('Failed to load client dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [currentCompany?.id]);

  const handleTogglePlay = (genId: string, audioUrl: string) => {
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

    setPlayingId(genId);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(console.error);
        audioRef.current.onended = () => setPlayingId(null);
      }
    }, 50);
  };

  const handleQuickGenerateFromHome = (text: string, voiceId: string) => {
    setStudioInitialText(text);
    setStudioInitialVoiceId(voiceId);
    goNav('studio');
  };

  const handleOpenStudioPreset = (text: string, voiceId?: string) => {
    setStudioInitialText(text);
    if (voiceId) setStudioInitialVoiceId(voiceId);
    goNav('studio');
  };

  const handleSelectVoiceForStudio = (voiceId: string) => {
    setStudioInitialVoiceId(voiceId);
    goNav('studio');
  };

  const handleGenerationComplete = (newGen: Generation) => {
    setGenerations([newGen, ...generations]);
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;
    const r = await fetch('/api/v1/client/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newProjectTitle.trim(), description: newProjectDesc.trim(), dialect: newProjectDialect })
    }).catch(() => null);
    if (!r?.ok) return;
    const { project } = await r.json();
    setProjects([project, ...projects]);
    setNewProjectTitle('');
    setNewProjectDesc('');
    setIsNewProjectModalOpen(false);
  };

  const handleSendInvite = async () => {
    setInviteError('');
    const r = await fetch('/api/v1/client/team/invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: inviteName.trim(), email: inviteEmail.trim() })
    }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (!r?.ok) { setInviteError(d?.error || 'تعذر إرسال الدعوة'); return; }
    setTeam(t => ({ ...t, invites: [d.invite, ...t.invites] }));
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
  };

  const handleCreateVoice = () => {
    if (!newVoiceName.trim()) return;
    setIsCreateVoiceModalOpen(false);
    setStudioInitialText(`أهلاً بك! هذا الصوت مخصص باسم "${newVoiceName.trim()}".`);
    goNav('studio');
  };

  return (
    <div className="h-screen w-full flex bg-[#F8FAFC] text-slate-900 font-['IBM_Plex_Sans_Arabic',sans-serif] overflow-hidden" dir="rtl">
      {/* Global Hidden Audio element for previewing */}
      <audio ref={audioRef} preload="metadata" />

      {/* 1. ElevenLabs Left Sidebar */}
      <DashboardSidebar
        activeNav={activeNav}
        onSelectNav={(nav) => goNav(nav)}
        currentCompany={currentCompany}
        currentUser={currentUser}
        availableCompanies={availableCompanies}
        onSwitchCompany={onSwitchCompany}
        balanceCredits={balanceCredits}
        onOpenTopUp={onOpenTopUp}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onOpenAssistant={onOpenAssistant}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Workspace Body (TopNav + Scrollable Views) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <DashboardTopNav
          activeNav={activeNav}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          balanceCredits={balanceCredits}
          envMode={envMode}
          onToggleEnvMode={setEnvMode}
          onOpenAssistant={onOpenAssistant || (() => onNavigate('generate'))}
          onOpenTopUp={onOpenTopUp}
          onNavigateTab={(tab) => goNav(tab)}
          currentCompany={currentCompany}
          currentUser={currentUser}
          availableCompanies={availableCompanies}
          onSwitchCompany={onSwitchCompany}
          onNavigate={onNavigate}
          onLogout={onOpenLogin}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70 custom-scrollbar">
          {activeNav === 'home' && (
            <HomeSubView
              voices={voices}
              generations={generations}
              playingId={playingId}
              onTogglePlay={handleTogglePlay}
              onNavigateTab={(tab) => goNav(tab)}
              onQuickGenerate={handleQuickGenerateFromHome}
              onOpenStudioPreset={handleOpenStudioPreset}
              canUseStudio={canUseNew}
              onGenerated={onGenerated}
            />
          )}

          {activeNav === 'voices' && (
            <div className="bg-[#FFFFFF] pb-10" dir="rtl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
                <div className="border-b border-slate-200/80 pb-4">
                  {/* Same heading and intro as the site's voice library (/ar/voices) */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">مكتبة أصوات المعلقين العرب</h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                    استمع لعينات أكثر من 1000 معلق صوتي عربي، رجالي ونسائي، بالفصحى والسعودية والإماراتية والمصرية وكل اللهجات، واختر الصوت المناسب لمشروعك.
                  </p>
                </div>
              </div>
              <VoiceLibraryView
                voices={voices}
                initialTab="human"
                isLoggedIn
                hideJoinNarrator
                onSelectForBooking={(voice: any) => routerNavigate(`/ar/booking/${buildSampleSlug(voice)}`)}
                onSelectForGeneration={(voice: any) => handleSelectVoiceForStudio(voice?.id)}
              />
            </div>
          )}

          {/* Same studio as the site's /ar/text-to-speech page */}
          {activeNav === 'studio' && (
            <div className="bg-[#FFFFFF] pb-10" dir="rtl">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                <div className="border-b border-slate-200/80 pb-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">تحويل النص إلى صوت عربي</h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                    استمع لنصك بأصوات AI مرخّصة من معلقين عرب حقيقيين وبتقاسم الأرباح معهم، ثم احجز المعلق البشري نفسه للنسخة النهائية.
                  </p>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-4 sm:p-7">
                  <TtsStudioPanel key={`${studioInitialVoiceId}|${studioInitialText}`} voices={voices} onGenerated={onGenerated} initialText={studioInitialText || undefined} initialVoiceId={studioInitialVoiceId || undefined} />
                </div>
              </div>
            </div>
          )}

          {activeNav === 'flows' && <FlowsSubView onNavigateTab={(tab) => goNav(tab)} />}

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
            <HumanBookingsSubView
              onBookTalent={() => goNav('voices')}
            />
          )}

          {activeNav === 'compliance' && (
            <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in text-right" dir="rtl">
              <div>
                <h2 className="text-xl font-black text-slate-900">التراخيص وحوكمة الأمان والامتثال</h2>
                <p className="text-xs text-slate-500">حماية الملكية الفكرية، وبراءة الذمة من المطالبات، وسياسة عدم الاحتفاظ بالبيانات</p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">ضمان البث التجاري الكامل بدون قيود</h3>
                    <p className="text-xs text-slate-400">كافة المقاطع المولدة والتسجيلات البشرية مرخصة للاستخدام الإعلاني والتجاري للأبد</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'team' && (
            <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in text-right" dir="rtl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">فريق العمل والمستخدمين</h2>
                  <p className="text-xs text-slate-500">إدارة صلاحيات التوليد، وإشراك كتاب النصوص ومهندسي الصوت</p>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-brand-text" />
                  <span>+ دعوة عضو جديد</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                {(team.members.length ? team.members : currentUser ? [{ id: currentUser.id, name: currentUser.name, email: currentUser.email, role: 'admin' }] : []).map(m => (
                  <div key={m.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand/20 text-brand-text font-bold flex items-center justify-center text-xs">{m.name?.charAt(0) || '؟'}</div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{m.name}{m.id === currentUser?.id ? ' (أنت)' : ''}</div>
                        <div className="text-[11px] text-slate-400" dir="ltr">{m.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{m.role === 'admin' ? 'مدير الحساب' : 'عضو'}</span>
                  </div>
                ))}
                {team.invites.map(inv => (
                  <div key={inv.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{inv.name}</div>
                      <div className="text-[11px] text-slate-400" dir="ltr">{inv.email}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {inv.emailed ? 'دعوة مرسلة' : 'دعوة محفوظة (البريد غير مفعّل)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'usage' && <UsageView />}

          {activeNav === 'billing' && (
            <BillingTab
              balanceCredits={balanceCredits}
              currentPlanId={currentCompany?.planId}
              onOpenTopUp={onOpenTopUp}
            />
          )}
        </main>
      </div>

      {/* ======================= MODAL: CREATE PROJECT ======================= */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-right animate-fade-in" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-brand-text" />
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
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اللهجة المستهدفة:</label>
                <select
                  value={newProjectDialect}
                  onChange={(e) => setNewProjectDialect(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand"
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
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand resize-none"
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
                className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-orange disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-all"
              >
                إنشاء المشروع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CREATE VOICE ======================= */}
      {isCreateVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-right animate-fade-in" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-text" />
                <h3 className="font-bold text-base text-slate-900">إنشاء واستنساخ صوت جديد</h3>
              </div>
              <button
                onClick={() => setIsCreateVoiceModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم الصوت / المعلق الافتراضي:</label>
                <input
                  type="text"
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  placeholder="مثال: فيصل - معلق أفق الإخباري"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اللهجة الأساسية:</label>
                <select
                  value={newVoiceDialect}
                  onChange={(e) => setNewVoiceDialect(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="سعودي نجدي">سعودي نجدي</option>
                  <option value="سعودي حجازي">سعودي حجازي</option>
                  <option value="عربي فصيح معاصر">عربي فصيح معاصر</option>
                  <option value="مصري">مصري</option>
                  <option value="شامي">شامي</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">النوع الصوتي:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewVoiceGender('male')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                      newVoiceGender === 'male'
                        ? 'bg-brand-ink text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    صوت رجالي
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVoiceGender('female')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                      newVoiceGender === 'female'
                        ? 'bg-brand-ink text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    صوت نسائي
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsCreateVoiceModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateVoice}
                disabled={!newVoiceName.trim()}
                className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-orange disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-all"
              >
                إنشاء وتصميم الصوت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: INVITE MEMBER ======================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-right animate-fade-in" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-text" />
                <h3 className="font-bold text-base text-slate-900">دعوة عضو جديد لفريق العمل</h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم العضو:</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="مثال: سارة الشريف"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">البريد الإلكتروني المهني:</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="sara@company.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand"
                  dir="ltr"
                />
              </div>
            </div>

            {inviteError && <p className="text-xs text-red-600">{inviteError}</p>}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!inviteName.trim() || !inviteEmail.trim()}
                className="px-5 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-all"
              >
                إرسال الدعوة
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
                  <p className="text-xs text-slate-500 font-mono">وثيقة حقوق الاستخدام التجاري المعتمدة</p>
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
                className="px-5 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل الشهادة المعتمدة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
