import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Public SEO Page Components (src/pages/)
import { HomePage } from './pages/HomePage';
import { VoicesPage } from './pages/VoicesPage';
import { VoiceTemplatesPage } from './pages/VoiceTemplatesPage';
import { BookingVoicePage } from './pages/BookingVoicePage';
import { BlogsPage } from './pages/BlogsPage';
import { BlogDetailsPage } from './pages/BlogDetailsPage';
import { GuidesPage } from './pages/GuidesPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { TermsOfUsePage } from './pages/TermsOfUsePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { FaqsPage } from './pages/FaqsPage';
import { BookingStepsPage } from './pages/BookingStepsPage';
import { RevisionsPolicyPage } from './pages/RevisionsPolicyPage';
import { GuideDetailPage } from './pages/GuideDetailPage';
import { OurWorksPage } from './pages/OurWorksPage';
import { CategoriesPage } from './pages/CategoriesPage';

// Commercial & Dialect Services Pages
import { DubbingServicePage } from './pages/DubbingServicePage';
import { AudiobooksServicePage } from './pages/AudiobooksServicePage';
import { PodcastServicePage } from './pages/PodcastServicePage';
import { IvrServicePage } from './pages/IvrServicePage';
import { TextToSpeechPage } from './pages/TextToSpeechPage';
import { PricingPage } from './pages/PricingPage';
import { SaudiVoiceOverPage } from './pages/SaudiVoiceOverPage';
import { EmiratiVoiceOverPage } from './pages/EmiratiVoiceOverPage';
import { EgyptianVoiceOverPage } from './pages/EgyptianVoiceOverPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Internal Views & Modals
import { ClientDashboardView } from './components/ClientDashboardView';
import { VoiceTalentDashboardView } from './components/talent/VoiceTalentDashboardView';
import { NarratorClaimView } from './components/talent/NarratorClaimView';
import { AdminView } from './components/AdminView';
import { GenerateVoiceView } from './components/GenerateVoiceView';

// Interactive Overlays / Modals
import { TopUpCreditsModal } from './components/TopUpCreditsModal';
import { BusinessDemoModal } from './components/BusinessDemoModal';
import { COMMERCIAL_SERVICES } from './data/commercialServicesData';
import { CommercialServiceTemplate } from './pages/CommercialServiceTemplate';
import { BookHumanVoiceModal } from './components/BookHumanVoiceModal';
import { ProjectChangelogModal } from './components/ProjectChangelogModal';
import { AuthModal } from './components/AuthModal';
import { JobsPage } from './pages/JobsPage';
import { TALENT_SIGNUP_EVENT, openTalentSignup } from './lib/talentJoin';
import { narratorService } from './services/narratorService';

import { Voice, Company, User, Generation, Plan } from './types';
import { api, getToken, ACCOUNT_CHANGED_EVENT } from './lib/api';
import { getGoogleAccessToken } from './lib/googleSignIn';
import { SignInGate } from './components/SignInGate';
import { NewFeaturesGate } from './components/NewFeaturesGate';
import { InsufficientCreditsDialog } from './components/InsufficientCreditsDialog';
import { EarlyAccessPage, EarlyWelcomePage, WaitlistPage, ResetPasswordPage } from './pages/EarlyAccessPage';
import { setRowadFeatures, setPublicLaunchAt, markRowadReady } from './lib/rowad';
import { setCommissionPercent } from '../shared/pricing';

const ADMIN_DASHBOARD_PATH = '/ar/dashboard';

// Every audio that starts playing is remembered, so leaving a page can stop it (samples kept playing after navigation).
// ponytail: wraps HTMLMediaElement.play once for the whole app instead of a cleanup in each of the ~20 pages with players.
const playingMedia = new Set<HTMLMediaElement>();
if (typeof HTMLMediaElement !== 'undefined') {
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) { playingMedia.add(this); return play.call(this); };
}
const stopAllMedia = () => { playingMedia.forEach(m => { if (!m.paused) m.pause(); }); playingMedia.clear(); };

// Lazy loaded non-blocking widgets

// Layout wrapper to control Header/Footer visibility on private workspaces
function AppLayout({ 
  children,
  currentCompany,
  currentUser,
  balanceCredits,
  isLoggedIn,
  onOpenLogin,
  onOpenSignup,
  onLogout,
  onOpenChangelog
}: {
  children: React.ReactNode;
  currentCompany: Company | null;
  currentUser: User | null;
  balanceCredits: number;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onLogout: () => void;
  onOpenChangelog: () => void;
}) {
  const location = useLocation();
  const path = location.pathname;
  // a new page opens at its top (the browser would keep the previous page's scroll position)
  useEffect(() => { stopAllMedia(); if (!location.hash) window.scrollTo(0, 0); }, [path]);

  // dashboards have their own top bar (avatar + account menu), so the site header would show the account twice
  const isWorkspaceDashboard = path === '/ar/dashboard' || path === '/ar/account' || path.startsWith('/ar/account/') ||
    path.startsWith('/ar/talent-');
  // the admin login screen stands alone: no site header (its «إنشاء حساب» / Google sign-in) and no footer
  const adminPathCfg = (window as any).__QV_CONFIG?.adminPath as string | undefined;
  // the admin dashboard answers at /ar/dashboard (and at the private address, if one is set)
  const onAdminPage = path === ADMIN_DASHBOARD_PATH || (Boolean(adminPathCfg) && path === adminPathCfg);
  const isAdminLogin = onAdminPage && !currentUser;
  const hideChrome = isWorkspaceDashboard || isAdminLogin;
  // مساعد قيمة is off on the public site for now; the admin dashboard loads it so it can be developed there
  useEffect(() => {
    if (!onAdminPage || !currentUser?.isPlatformAdmin || document.getElementById('qv-chat-script')) return;
    const s = document.createElement('script');
    s.id = 'qv-chat-script'; s.src = '/qv-chat/qv-chat.js'; s.defer = true;
    s.dataset.position = 'right'; s.dataset.mock = 'true';
    document.body.appendChild(s);
  }, [onAdminPage, currentUser?.isPlatformAdmin]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#0F172A] font-['IBM_Plex_Sans_Arabic','Cairo',sans-serif]">
      {!hideChrome && (
        <Header
          currentCompany={currentCompany}
          currentUser={currentUser}
          balanceCredits={balanceCredits}
          isLoggedIn={isLoggedIn}
          onOpenLogin={onOpenLogin}
          onOpenSignup={onOpenSignup}
          onLogout={onLogout}
        />
      )}

      <main className="flex-1">
        {children}
      </main>

      {!hideChrome && (
        <Footer onOpenChangelog={onOpenChangelog} />
      )}
    </div>
  );
}

/** Old /ar/services/<slug> links (e.g. saved in the dashboard) → /ar/voice-models/<slug> */
function OldServiceRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/ar/voice-models/${slug === 'commercial' ? 'ads' : slug}`} replace />;
}

/** Navigates once (rendered inside the router), then clears itself. */
function GoTo({ to, onDone }: { to: string; onDone: () => void }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(to); onDone(); }, []);
  return null;
}

export default function App() {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [balanceCredits, setBalanceCredits] = useState<number>(24500);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);

  // Modals state
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [bookingVoice, setBookingVoice] = useState<Voice | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(getToken()));
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [authRole, setAuthRole] = useState<'talent' | 'client'>('client');
  const [authEmail, setAuthEmail] = useState('');
  const [postAuthPath, setPostAuthPath] = useState<string | null>(null);

  // «انضم كمعلق صوتي» anywhere on the site opens the narrator sign-up
  useEffect(() => {
    const open = () => { setAuthRole('talent'); setAuthModalMode('signup'); };
    window.addEventListener(TALENT_SIGNUP_EVENT, open);
    return () => window.removeEventListener(TALENT_SIGNUP_EVENT, open);
  }, []);

  // Signed-in account (session token kept by lib/api)
  const loadMe = async () => {
    const meRes = await api.getMe();
    setCurrentCompany(meRes.company);
    setCurrentUser(meRes.user);
    setBalanceCredits(meRes.balanceCredits);
    setAvailableCompanies(meRes.availableCompanies);
    setRowadFeatures(meRes.features ?? null, Boolean(meRes.user.isPlatformAdmin));
    if (meRes.user.narratorId) { try { localStorage.setItem('qeema_current_narrator', meRes.user.narratorId); } catch {} }
    return meRes.user;
  };

  const signedOut = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentCompany(null);
    setBalanceCredits(0);
    setRowadFeatures(null);
    try { localStorage.removeItem('qeema_current_narrator'); } catch {}
  };

  // Initialize data on mount
  useEffect(() => {
    api.getVoices().then(r => setVoices(r.voices)).catch(err => console.error('Error loading voices:', err));
    if (getToken()) loadMe().catch(() => { api.logout(); signedOut(); }); // expired or revoked session
    else markRowadReady();
  }, []);

  // a plan bought inside a page (BillingTab): reload balance, plan and Rowad state
  useEffect(() => {
    const reload = () => { if (getToken()) loadMe().catch(() => {}); };
    window.addEventListener(ACCOUNT_CHANGED_EVENT, reload);
    return () => window.removeEventListener(ACCOUNT_CHANGED_EVENT, reload);
  }, []);

  const handleSwitchCompany = async (companyId: string) => {
    try {
      const res = await api.switchCompany(companyId);
      setCurrentCompany(res.company);
      setBalanceCredits(res.balanceCredits);
    } catch (err) {
      console.error('Error switching company:', err);
    }
  };

  const completeAuth = async (user: User) => {
    setAuthModalMode(null);
    setAuthRole('client');
    setIsLoggedIn(true);
    await loadMe();
    narratorService.reload();
    if (user.accountType === 'talent') {
      if (!user.narratorId) {
        // New narrator account: create the narrator record, then open the profile to fill in the data
        const n = await narratorService.registerNarrator({ name: user.name, email: user.email });
        try { localStorage.setItem('qeema_current_narrator', n.id); } catch {}
        setPostAuthPath('/ar/talent-profile');
      } else if (!location.pathname.startsWith('/ar/talent-')) {
        setPostAuthPath('/ar/talent-dashboard');
      }
    }
  };

  const logout = async () => {
    await api.logout();
    signedOut();
    narratorService.reload();
  };

  // Google button on the TTS landing: straight to Google, no modal
  const loginWithGoogle = async () => {
    try { const { user } = await api.loginWithGoogle(await getGoogleAccessToken(), 'client'); await completeAuth(user); }
    catch (err: any) { alert(err.message || 'تعذر تسجيل الدخول عبر Google'); }
  };

  // «إعدادات الصيانة» in the admin dashboard: visitors see a maintenance page, admins keep working
  const [maintenance, setMaintenance] = useState(false);
  useEffect(() => {
    fetch('/api/v1/site-status').then(r => (r.ok ? r.json() : null)).then(d => { setCommissionPercent(d?.commissionPercent); setMaintenance(Boolean(d?.maintenance)); setPublicLaunchAt(d?.publicLaunchAt); }).catch(() => {});
  }, []);
  // the admin dashboard's private address: from the admin page's own config, or from a signed-in admin's account
  const adminPath = ((window as any).__QV_CONFIG?.adminPath as string | undefined) || currentUser?.adminPath || '';
  const siteClosed = maintenance && !currentUser?.isPlatformAdmin && window.location.pathname !== ADMIN_DASHBOARD_PATH && !(adminPath && window.location.pathname === adminPath);

  return (
    <BrowserRouter>
      <AppLayout
        currentCompany={currentCompany}
        currentUser={currentUser}
        balanceCredits={balanceCredits}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setAuthModalMode('login')}
        onOpenSignup={() => setAuthModalMode('signup')}
        onLogout={logout}
        onOpenChangelog={() => setIsChangelogOpen(true)}
      >
        {siteClosed ? <MaintenancePage onLogin={() => setAuthModalMode('login')} /> : <Routes>
          {/* Section 1: / redirects to /ar via <Navigate replace /> */}
          <Route path="/" element={<Navigate to="/ar" replace />} />

          {/* Section 1 & 2: Public Real SEO Routes matching Laravel mapping */}
          <Route 
            path="/ar" 
            element={
              <HomePage
                voices={voices}
                onOpenDemo={() => setIsDemoOpen(true)}
                onOpenSignup={() => setAuthModalMode('signup')}
                onOpenLogin={() => setAuthModalMode('login')}
                isLoggedIn={isLoggedIn}
                onOpenTopUp={() => setIsTopUpOpen(true)}
                onSelectForBooking={(voice) => setBookingVoice(voice)}
              />
            } 
          />

          <Route 
            path="/ar/voices" 
            element={
              <VoicesPage voices={voices} isLoggedIn={isLoggedIn}  />
            } 
          />

          <Route path="/ar/voice-models" element={<VoiceTemplatesPage />} />
          <Route path="/ar/voice-templates" element={<Navigate to="/ar/voice-models" replace />} />

          <Route 
            path="/ar/booking/:slug" 
            element={<BookingVoicePage voices={voices} />} 
          />

          <Route path="/ar/blogs" element={<BlogsPage />} />
          <Route path="/ar/blogs/details/:slug" element={<BlogDetailsPage />} />
          <Route path="/ar/jobs" element={<JobsPage />} />
          <Route path="/ar/guides" element={<GuidesPage />} />
          <Route path="/ar/guides/:slug" element={<GuideDetailPage />} />
          <Route path="/ar/p/about-us" element={<AboutUsPage />} />
          <Route path="/ar/contact-us" element={<ContactUsPage />} />
          <Route path="/ar/p/terms-of-use" element={<TermsOfUsePage />} />
          <Route path="/ar/p/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/ar/faqs" element={<FaqsPage />} />
          <Route path="/ar/booking-steps" element={<BookingStepsPage />} />
          <Route path="/ar/p/revisions-policy" element={<RevisionsPolicyPage />} />
          <Route path="/ar/our-works" element={<OurWorksPage />} />
          <Route path="/ar/our-works/:storyId" element={<OurWorksPage />} />
          <Route path="/ar/categories" element={<CategoriesPage />} />

          {/* Commercial & Dialect Services */}
          <Route path="/ar/services/dubbing" element={<DubbingServicePage />} />
          <Route path="/ar/services/:slug" element={<OldServiceRedirect />} />
          <Route path="/ar/voice-models/audiobooks" element={<AudiobooksServicePage />} />
          <Route path="/ar/voice-models/podcast" element={<PodcastServicePage />} />
          <Route path="/ar/voice-models/ivr" element={<IvrServicePage />} />
          <Route path="/ar/voice-models/explainer" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['explainer']} />} />
          <Route path="/ar/voice-models/ads" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['ads']} />} />
          <Route path="/ar/voice-models/ugc" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['ugc']} />} />
          <Route path="/ar/voice-models/dialects" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['dialects']} />} />
          <Route path="/ar/voice-models/elearning" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['elearning']} />} />
          <Route path="/ar/voice-models/documentary" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['documentary']} />} />
          <Route path="/ar/voice-models/drama" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['drama']} />} />
          <Route path="/ar/voice-models/cartoon-dubbing" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['cartoon-dubbing']} />} />
          <Route path="/ar/voice-models/doc-dubbing" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['doc-dubbing']} />} />
          <Route path="/ar/voice-models/news" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['news']} />} />
          <Route path="/ar/voice-models/poetry" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['poetry']} />} />
          <Route path="/ar/voice-models/stories" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['stories']} />} />
          <Route path="/ar/voice-models/promo" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['promo']} />} />
          <Route path="/ar/voice-models/religious" element={<CommercialServiceTemplate data={COMMERCIAL_SERVICES['religious']} />} />
          {/* open to everyone (and to Google); the studio inside the page is for Rowad members until the public launch */}
          <Route path="/ar/text-to-speech" element={<TextToSpeechPage isLoggedIn={isLoggedIn} voices={voices} onGenerated={setBalanceCredits} onGoogle={loginWithGoogle} onOpenLogin={() => setAuthModalMode('login')} onOpenSignup={() => setAuthModalMode('signup')} />} />
          <Route path="/ar/pricing" element={<PricingPage />} />
          {/* «روّاد قيمة» invite links (the server checks the code first) and the waitlist */}
          <Route path="/ar/early" element={<EarlyAccessPage isLoggedIn={isLoggedIn} onOpenLogin={(email) => { setAuthEmail(email || ''); setAuthModalMode('login'); }} onOpenSignup={(email) => { setAuthEmail(email || ''); setAuthRole('client'); setAuthModalMode('signup'); }} onActivated={() => { loadMe().catch(() => {}); }} />} />
          <Route path="/ar/early/welcome" element={<EarlyWelcomePage isLoggedIn={isLoggedIn} onOpenLogin={() => setAuthModalMode('login')} />} />
          <Route path="/ar/waitlist" element={<WaitlistPage />} />
          <Route path="/ar/reset-password" element={<ResetPasswordPage onSignedIn={async (user) => { await completeAuth(user); if (user.accountType !== 'talent') setPostAuthPath('/ar/account'); }} />} />
          <Route path="/ar/saudi-voice-over" element={<SaudiVoiceOverPage />} />
          <Route path="/ar/emirati-voice-over" element={<EmiratiVoiceOverPage />} />
          <Route path="/ar/egyptian-voice-over" element={<EgyptianVoiceOverPage />} />

          {/* Private / Operational Routes (with noindex) */}
          <Route 
            path="/ar/account" 
            element={
              <SignInGate user={currentUser} allow={() => true} isLoggedIn={isLoggedIn} title="لوحة العميل" hint="سجّل الدخول لفتح لوحتك ومتابعة رصيدك وتوليداتك وحجوزاتك." onOpenLogin={() => setAuthModalMode('login')} onLogout={logout}>
              <ClientDashboardView
                currentCompany={currentCompany}
                currentUser={currentUser}
                balanceCredits={balanceCredits}
                voices={voices}
                availableCompanies={availableCompanies}
                isLoggedIn={isLoggedIn}
                onSwitchCompany={handleSwitchCompany}
                onNavigate={() => {}}
                onOpenTopUp={() => setIsTopUpOpen(true)}
                onGenerated={setBalanceCredits}
                onOpenDemo={() => setIsDemoOpen(true)}
                onOpenLogin={() => setAuthModalMode('login')}
                onOpenSignup={() => setAuthModalMode('signup')}
              />
              </SignInGate>
            } 
          />

          <Route 
            path="/ar/talent-dashboard" 
            element={<SignInGate user={currentUser} allow={u => u.accountType === 'talent' || Boolean(u.isPlatformAdmin)} isLoggedIn={isLoggedIn} title="لوحة المعلق الصوتي" hint="سجّل الدخول بحساب المعلق لفتح لوحتك." onOpenLogin={() => setAuthModalMode('login')} onLogout={logout}><VoiceTalentDashboardView onNavigate={() => {}} /></SignInGate>} 
          />
          <Route 
            path="/ar/talent-profile" 
            element={<SignInGate user={currentUser} allow={u => u.accountType === 'talent' || Boolean(u.isPlatformAdmin)} isLoggedIn={isLoggedIn} title="لوحة المعلق الصوتي" hint="سجّل الدخول بحساب المعلق لفتح لوحتك." onOpenLogin={() => setAuthModalMode('login')} onLogout={logout}><VoiceTalentDashboardView initialSubPage="profile" onNavigate={() => {}} /></SignInGate>} 
          />
          <Route 
            path="/ar/talent-earnings" 
            element={<SignInGate user={currentUser} allow={u => u.accountType === 'talent' || Boolean(u.isPlatformAdmin)} isLoggedIn={isLoggedIn} title="لوحة المعلق الصوتي" hint="سجّل الدخول بحساب المعلق لفتح لوحتك." onOpenLogin={() => setAuthModalMode('login')} onLogout={logout}><VoiceTalentDashboardView initialSubPage="earnings" onNavigate={() => {}} /></SignInGate>} 
          />
          <Route path="/ar/talent-samples" element={<SignInGate user={currentUser} allow={u => u.accountType === 'talent' || Boolean(u.isPlatformAdmin)} isLoggedIn={isLoggedIn} title="لوحة المعلق الصوتي" hint="سجّل الدخول بحساب المعلق لفتح لوحتك." onOpenLogin={() => setAuthModalMode('login')} onLogout={logout}><VoiceTalentDashboardView initialSubPage="samples" onNavigate={() => {}} /></SignInGate>} />
          <Route path="/ar/talent-voices" element={<SignInGate user={currentUser} allow={u => u.accountType === 'talent' || Boolean(u.isPlatformAdmin)} isLoggedIn={isLoggedIn} title="لوحة المعلق الصوتي" hint="سجّل الدخول بحساب المعلق لفتح لوحتك." onOpenLogin={() => setAuthModalMode('login')} onLogout={logout}><VoiceTalentDashboardView initialSubPage="settings" onNavigate={() => {}} /></SignInGate>} />
          <Route path="/ar/talent-settings" element={<Navigate to="/ar/talent-voices" replace />} />
          <Route path="/narrator/dashboard" element={<Navigate to="/ar/talent-dashboard" replace />} />
          <Route path="/narrator/profile" element={<Navigate to="/ar/talent-profile" replace />} />
          <Route path="/narrator/earnings" element={<Navigate to="/ar/talent-earnings" replace />} />
          <Route path="/narrator/settings" element={<Navigate to="/ar/talent-voices" replace />} />
          <Route 
            path="/ar/claim" 
            element={<NarratorClaimView onNavigate={() => {}} />} 
          />
          <Route 
            path="/claim/:token" 
            element={<NarratorClaimView onNavigate={() => {}} />} 
          />
          <Route 
            path="/ar/generate" 
            element={
              <NewFeaturesGate>
              <GenerateVoiceView
                voices={voices}
                balanceCredits={balanceCredits}
                currentCompany={currentCompany}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => setAuthModalMode('login')}
                onOpenLogin={() => setAuthModalMode('login')}
                onOpenSignup={() => setAuthModalMode('signup')}
                onOpenTopUp={() => setIsTopUpOpen(true)}
                onGenerationComplete={async () => {
                  const meRes = await api.getMe();
                  setBalanceCredits(meRes.balanceCredits);
                }}
              />
              </NewFeaturesGate>
            } 
          />
          <Route path="/ar/chatbot" element={<Navigate to="/ar/voices" replace />} />
          {/* the admin dashboard: /ar/dashboard, and the private address too when one is set (old back office: /ar/old-admin) */}
          {[ADMIN_DASHBOARD_PATH, ...(adminPath && adminPath !== ADMIN_DASHBOARD_PATH ? [adminPath] : [])].map(p => <React.Fragment key={p}><Route 
            path={p} 
            element={
              <SignInGate user={currentUser} allow={u => Boolean(u.isPlatformAdmin)} isLoggedIn={isLoggedIn} title="لوحة إدارة قيمة فويس" hint="ادخل بحساب الإدارة." onOpenLogin={() => setAuthModalMode('login')} onLogout={logout} inlineLogin={completeAuth}>
              <AdminView
                voices={voices}
                onVoiceToggled={(id, isActive) => setVoices(vs => vs.map(v => v.id === id ? { ...v, isActive } : v))}
                onVoiceAdded={(voice) => setVoices(vs => [voice, ...vs])}
                onVoiceUpdated={(voice) => setVoices(vs => vs.map(v => v.id === voice.id ? voice : v))}
                userName={currentUser?.name}
                userEmail={currentUser?.email}
                onLogout={logout}
              />
              </SignInGate>
            } 
          /></React.Fragment>)}

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>}
      </AppLayout>

      {/* Global Interactive Modals */}
      {isTopUpOpen && (
        <TopUpCreditsModal
          isOpen={isTopUpOpen}
          onClose={() => setIsTopUpOpen(false)}
          currentCompany={currentCompany}
          currentUser={currentUser}
          onPaymentSuccess={async (newBalance) => {
            setBalanceCredits(newBalance);
            setIsTopUpOpen(false);
            api.getMe().then(me => setCurrentCompany(me.company)).catch(() => {}); // plan may have changed
          }}
        />
      )}

      {isDemoOpen && (
        <BusinessDemoModal
          isOpen={isDemoOpen}
          onClose={() => setIsDemoOpen(false)}
        />
      )}

      {bookingVoice && (
        <BookHumanVoiceModal
          isOpen={Boolean(bookingVoice)}
          onClose={() => setBookingVoice(null)}
          voice={bookingVoice}
        />
      )}

      {isChangelogOpen && (
        <ProjectChangelogModal
          isOpen={isChangelogOpen}
          onClose={() => setIsChangelogOpen(false)}
        />
      )}

      {postAuthPath && <GoTo to={postAuthPath} onDone={() => setPostAuthPath(null)} />}

      <InsufficientCreditsDialog onOpenTopUp={() => setIsTopUpOpen(true)} />
      {authModalMode && (
        <AuthModal
          isOpen={Boolean(authModalMode)}
          mode={authModalMode}
          initialRole={authRole}
          initialEmail={authEmail}
          onClose={() => { setAuthModalMode(null); setAuthRole('client'); setAuthEmail(''); }}
          onAuthSuccess={completeAuth}
        />
      )}
    </BrowserRouter>
  );
}

/** Shown to visitors while the admin turns on maintenance mode. */
const MaintenancePage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24 gap-4" dir="rtl">
    <h1 className="text-2xl sm:text-3xl font-black text-slate-950">الموقع تحت الصيانة</h1>
    <p className="text-sm text-slate-500 max-w-md">نعمل على تحسين منصة قيمة فويس، وسنعود خلال وقت قصير. شكراً لصبركم.</p>
    <button type="button" onClick={onLogin} className="text-xs text-slate-400 hover:text-slate-700 underline cursor-pointer">دخول فريق الإدارة</button>
  </div>
);
