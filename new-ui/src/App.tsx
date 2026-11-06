import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { B2BHome } from './components/B2BHome';
import { VoiceLibraryView } from './components/VoiceLibraryView';
import { TtsStudioView } from './components/TtsStudioView';
import { MyAudioView } from './components/MyAudioView';
import { ClientDashboardView } from './components/ClientDashboardView';
import { UsageView } from './components/UsageView';
import { BillingView } from './components/BillingView';
import { IndustriesView } from './components/IndustriesView';
import { VoiceDataView } from './components/VoiceDataView';
import { HowItWorksView } from './components/HowItWorksView';
import { CommunityBlogView } from './components/CommunityBlogView';
import { CommunityTrainingView } from './components/CommunityTrainingView';
import { AboutContactView } from './components/AboutContactView';
import { CustomerStoriesView } from './components/CustomerStoriesView';
import { TopUpCreditsModal } from './components/TopUpCreditsModal';
import { BusinessDemoModal } from './components/BusinessDemoModal';
import { BookHumanVoiceModal } from './components/BookHumanVoiceModal';
import { ProjectChangelogModal } from './components/ProjectChangelogModal';
import { AuthModal } from './components/AuthModal';
import { AssistantWidget } from './components/ai-assistant/AssistantWidget';
import { Footer } from './components/Footer';
import { ActiveView, Voice, Company, User, IndustryKey, Generation } from './types';
import { api } from './lib/api';
import { Mic2 } from 'lucide-react';
import { PublicSite } from './PublicSite';

export default function App() {
  // Parse initial view from URL query param or hash if available
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam && [
        'home',
        'client-dashboard',
        'voice-library',
        'tts',
        'my-audio',
        'usage',
        'billing',
        'industries',
        'voice-data',
        'how-it-works',
        'blog',
        'training',
        'about',
        'contact',
        'customer-stories'
      ].includes(viewParam)) {
        return viewParam as ActiveView;
      }
      if (viewParam === 'dashboard') return 'client-dashboard';
      const hash = window.location.hash.replace('#', '');
      if (hash === 'dashboard') return 'client-dashboard';
      if (hash === 'home') return 'home';
    } catch {
      // ignore
    }
    return 'home';
  });
  const [voiceLibraryTab, setVoiceLibraryTab] = useState<'human' | 'ai' | 'my-voices'>('human');
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [balanceCredits, setBalanceCredits] = useState<number>(0);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryKey>('banking');

  // Studio pre-fill state
  const [studioPreset, setStudioPreset] = useState<{ voiceId?: string; text?: string }>({});

  // Modals state
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [bookingVoice, setBookingVoice] = useState<Voice | null>(null);

  // Visitor vs Logged-In state comes from the Laravel backend.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNavigate = (
    view: ActiveView,
    tab?: 'human' | 'ai' | 'my-voices',
    allowProtected = false
  ) => {
    if (['generate', 'branded-voice', 'voice-clone', 'instant-studio'].includes(view)) {
      setVoiceLibraryTab('human');
      view = 'voice-library';
    }
    if (view === 'client-dashboard' && !isLoggedIn && !allowProtected) {
      setAuthModalMode('login');
      return;
    }

    if (tab) {
      setVoiceLibraryTab(tab);
    }
    const targetView = view === 'admin'
      ? 'home'
      : view === 'human-marketplace'
        ? 'voice-library'
        : view;
    if (view === 'human-marketplace') {
      setVoiceLibraryTab('human');
    }
    setActiveView(targetView);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', targetView);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const [meRes, voicesRes] = await Promise.all([
          api.getMe(),
          api.getVoices()
        ]);
        setCurrentCompany(meRes.company);
        setCurrentUser(meRes.user);
        setIsLoggedIn(meRes.authenticated);
        setBalanceCredits(meRes.balanceCredits);
        setAvailableCompanies(meRes.availableCompanies);
        setVoices(voicesRes.voices.filter((voice) => voice.type === 'human'));
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      } finally {
        setAuthChecked(true);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('payment') === 'cancelled') {
      setPaymentNotice({ type: 'error', text: 'تم إلغاء عملية الدفع ولم يتم خصم أي مبلغ.' });
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.toString());
      return;
    }
    if (params.get('payment') !== 'success' || !sessionId) return;

    api.confirmCreditPayment(sessionId)
      .then((result) => {
        setBalanceCredits(result.balanceCredits);
        setPaymentNotice({ type: 'success', text: 'تم تأكيد الدفع وإضافة الرصيد إلى حسابك.' });
      })
      .catch((error) => setPaymentNotice({ type: 'error', text: error instanceof Error ? error.message : 'تعذر تأكيد عملية الدفع.' }))
      .finally(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('session_id');
        window.history.replaceState({}, '', url.toString());
      });
  }, []);

  // لوحة التحكم مساحة خاصة: أي رابط مباشر إليها يعيد الزائر لتسجيل الدخول.
  useEffect(() => {
    if (authChecked && activeView === 'client-dashboard' && !isLoggedIn) {
      handleNavigate('home');
      setAuthModalMode('login');
    }
  }, [authChecked, activeView, isLoggedIn]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const handleSwitchCompany = async (companyId: string) => {
    try {
      const res = await api.switchCompany(companyId);
      setCurrentCompany(res.company);
      setCurrentUser(res.user);
      setBalanceCredits(res.balanceCredits);
    } catch (err) {
      console.error('Switch company failed:', err);
    }
  };

  const handleGenerationComplete = (gen: Generation, newBalance: number) => {
    setBalanceCredits(newBalance);
  };

  const handleTopUpSuccess = (newBalance: number) => {
    setBalanceCredits(newBalance);
  };

  const handleLogout = async () => {
    await api.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentCompany(null);
    setAvailableCompanies([]);
    setBalanceCredits(0);
    handleNavigate('home', undefined, true);
  };

  const pathname = window.location.pathname;
  const isPublicSitePath = pathname.startsWith('/new-ui/ar')
    || pathname === '/ar'
    || pathname.startsWith('/ar/services/')
    || pathname === '/ar/our-works';

  if (isPublicSitePath) {
    return (
      <>
        <PublicSite
          currentCompany={currentCompany}
          currentUser={currentUser}
          balanceCredits={balanceCredits}
          availableCompanies={availableCompanies}
          voices={voices}
          isLoggedIn={isLoggedIn}
          onSwitchCompany={handleSwitchCompany}
          onOpenTopUp={() => isLoggedIn ? setIsTopUpOpen(true) : setAuthModalMode('login')}
          onOpenDemo={() => setIsDemoOpen(true)}
          onOpenLogin={() => setAuthModalMode('login')}
          onOpenSignup={() => setAuthModalMode('signup')}
          onLogout={handleLogout}
          onOpenChangelog={() => setIsChangelogOpen(true)}
          onSelectForBooking={(voice) => setBookingVoice(voice)}
        />
        <TopUpCreditsModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} onSuccess={handleTopUpSuccess} />
        <BusinessDemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
        <BookHumanVoiceModal isOpen={Boolean(bookingVoice)} voice={bookingVoice} currentUser={currentUser} onClose={() => setBookingVoice(null)} />
        <ProjectChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
        <AuthModal
          isOpen={authModalMode !== null}
          initialMode={authModalMode || 'login'}
          onClose={() => setAuthModalMode(null)}
          onLoginSuccess={async () => {
            const meRes = await api.getMe();
            setCurrentCompany(meRes.company);
            setCurrentUser(meRes.user);
            setIsLoggedIn(meRes.authenticated);
            setBalanceCredits(meRes.balanceCredits);
            setAvailableCompanies(meRes.availableCompanies);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9] text-[#0F172A] font-['IBM_Plex_Sans_Arabic',sans-serif]">
      {paymentNotice && <div className={`fixed top-4 left-1/2 z-[100] -translate-x-1/2 rounded-2xl border px-5 py-3 text-sm font-bold shadow-xl ${paymentNotice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`} dir="rtl">
        {paymentNotice.text}
        <button onClick={() => setPaymentNotice(null)} className="mr-4 text-current opacity-60 hover:opacity-100">×</button>
      </div>}
      {/* Universal B2B Header - hidden on workspace dashboard */}
      {!(activeView === 'client-dashboard' && isLoggedIn) && (
        <Header
          activeView={activeView}
          setActiveView={handleNavigate}
          voiceLibraryTab={voiceLibraryTab}
          currentCompany={currentCompany}
          currentUser={currentUser}
          balanceCredits={balanceCredits}
          availableCompanies={availableCompanies}
          onSwitchCompany={handleSwitchCompany}
          onOpenTopUp={() => {
            if (!isLoggedIn) {
              setAuthModalMode('login');
            } else {
              setIsTopUpOpen(true);
            }
          }}
          onOpenDemo={() => setIsDemoOpen(true)}
          isLoggedIn={isLoggedIn}
          onOpenLogin={() => setAuthModalMode('login')}
          onOpenSignup={() => setAuthModalMode('signup')}
          onLogout={handleLogout}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <B2BHome
            onNavigate={(view, extra) => {
              if (extra) setStudioPreset(extra);
              handleNavigate(view, extra?.tab);
            }}
            onOpenDemo={() => setIsDemoOpen(true)}
            onOpenSignup={() => setAuthModalMode('signup')}
            onOpenLogin={() => setAuthModalMode('login')}
            isLoggedIn={isLoggedIn}
            onOpenTopUp={() => {
              if (!isLoggedIn) {
                setAuthModalMode('login');
              } else {
                setIsTopUpOpen(true);
              }
            }}
            voices={voices}
            onSelectForBooking={(voice) => setBookingVoice(voice)}
          />
        )}

        {activeView === 'client-dashboard' && isLoggedIn && (
          <ClientDashboardView
            currentCompany={currentCompany}
            currentUser={currentUser}
            voices={voices}
            availableCompanies={availableCompanies}
            isLoggedIn={isLoggedIn}
            onSwitchCompany={handleSwitchCompany}
            onNavigate={(view, extra) => {
              if (extra) setStudioPreset(extra);
              handleNavigate(view, extra?.tab);
            }}
            onOpenLogin={() => setAuthModalMode('login')}
            onLogout={handleLogout}
            onSelectForBooking={(voice) => setBookingVoice(voice)}
          />
        )}

        {activeView === 'voice-library' && (
          <VoiceLibraryView
            voices={voices}
            initialTab={voiceLibraryTab}
            isLoggedIn={isLoggedIn}
            onRequireAuth={() => setAuthModalMode('login')}
            onSelectForGeneration={(voice) => {
              setStudioPreset({ voiceId: voice.id });
              handleNavigate('voice-library', 'human');
            }}
            onSelectForBooking={(voice) => setBookingVoice(voice)}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}

        {activeView === 'tts' && (
          <TtsStudioView
            isLoggedIn={isLoggedIn}
            onRequireAuth={() => setAuthModalMode('signup')}
            initialVoiceId={studioPreset.voiceId}
          />
        )}

        {activeView === 'my-audio' && (
          <MyAudioView
            onNavigateToGenerate={(extra) => {
              setStudioPreset(extra);
              handleNavigate('voice-library', 'human');
            }}
          />
        )}

        {activeView === 'usage' && (
          <UsageView />
        )}

        {activeView === 'billing' && (
          <BillingView
            balanceCredits={balanceCredits}
            onOpenTopUp={() => isLoggedIn ? setIsTopUpOpen(true) : setAuthModalMode('signup')}
            isLoggedIn={isLoggedIn}
            onOpenSignup={() => setAuthModalMode('signup')}
            onContactSales={() => setIsDemoOpen(true)}
          />
        )}

        {activeView === 'industries' && (
          <IndustriesView
            initialIndustry={selectedIndustry}
            onNavigate={(view) => setActiveView(view)}
          />
        )}

        {activeView === 'voice-data' && (
          <VoiceDataView onNavigate={(view) => setActiveView(view)} />
        )}

        {activeView === 'how-it-works' && (
          <HowItWorksView
            onNavigate={(view) => setActiveView(view)}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}

        {activeView === 'blog' && (
          <CommunityBlogView
            onNavigate={(view) => setActiveView(view)}
          />
        )}

        {activeView === 'training' && (
          <CommunityTrainingView
            onNavigate={(view) => setActiveView(view)}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}

        {activeView === 'about' && (
          <AboutContactView
            initialMode="about"
            onNavigate={(view) => setActiveView(view)}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}

        {activeView === 'customer-stories' && (
          <CustomerStoriesView
            initialStoryId={studioPreset.voiceId || 'jahez'}
            onNavigate={(view, extra) => {
              if (extra) setStudioPreset(extra);
              handleNavigate(view, extra?.tab);
            }}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}

        {activeView === 'contact' && (
          <AboutContactView
            initialMode="contact"
            onNavigate={(view) => setActiveView(view)}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}
      </main>

      {/* Universal Footer - hidden on workspace dashboard for full-height experience */}
      {activeView !== 'client-dashboard' && (
        <Footer
          onNavigate={(view) => setActiveView(view)}
          onOpenChangelog={() => setIsChangelogOpen(true)}
        />
      )}

      {/* Top-up Credits Modal */}
      <TopUpCreditsModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleTopUpSuccess}
      />

      {/* Business Demo Modal */}
      <BusinessDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />

      {/* Book Human Voice Modal */}
      <BookHumanVoiceModal
        isOpen={Boolean(bookingVoice)}
        voice={bookingVoice}
        currentUser={currentUser}
        onClose={() => setBookingVoice(null)}
      />

      {/* Architecture & Deliverables Changelog Modal */}
      <ProjectChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      {/* Authentication Modal (Login / Sign Up) for Visitors */}
      <AuthModal
        isOpen={authModalMode !== null}
        initialMode={authModalMode || 'login'}
        onClose={() => setAuthModalMode(null)}
        onLoginSuccess={async () => {
          const meRes = await api.getMe();
          setCurrentCompany(meRes.company);
          setCurrentUser(meRes.user);
          setIsLoggedIn(meRes.authenticated);
          setBalanceCredits(meRes.balanceCredits);
          setAvailableCompanies(meRes.availableCompanies);
          handleNavigate('client-dashboard', undefined, true);
        }}
      />

      {/* Global AI Conversational Assistant Widget */}
      {activeView !== 'home' && (
        <AssistantWidget
          availableVoices={voices}
          onNavigateTo={(view, tab) => {
            handleNavigate(view as ActiveView, tab as any);
          }}
          onSelectVoice={(voice) => {
            if (voice.type === 'human') {
              setBookingVoice(voice);
            }
          }}
          onOpenDemo={() => setIsDemoOpen(true)}
        />
      )}
    </div>
  );
}
