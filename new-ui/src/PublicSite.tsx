import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SuccessStoriesPage } from './pages/SuccessStoriesPage';
import { ServicePage, servicePages } from './pages/ServicePage';
import { ActiveView, Company, User, Voice } from './types';

interface PublicSiteProps {
  currentCompany: Company | null;
  currentUser: User | null;
  balanceCredits: number;
  availableCompanies: Company[];
  voices: Voice[];
  isLoggedIn: boolean;
  onSwitchCompany: (companyId: string) => void;
  onOpenTopUp: () => void;
  onOpenDemo: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onLogout: () => void;
  onOpenChangelog: () => void;
  onSelectForBooking: (voice: Voice) => void;
}

export const PublicSite: React.FC<PublicSiteProps> = (props) => {
  const navigate = useNavigate();

  const navigateFromView = (view: ActiveView, tab?: 'human' | 'ai' | 'my-voices') => {
    if (view === 'customer-stories') {
      navigate('/ar/our-works');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'home') {
      navigate('/ar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetView = view === 'human-marketplace' ? 'voice-library' : view;
    const url = new URL('/new-ui/', window.location.origin);
    url.searchParams.set('view', targetView === 'admin' ? 'home' : targetView);
    if (tab) url.searchParams.set('tab', tab);
    window.location.assign(url.toString());
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9] text-[#0F172A] font-['IBM_Plex_Sans_Arabic',sans-serif]">
      <Header
        activeView="home"
        setActiveView={navigateFromView}
        currentCompany={props.currentCompany}
        currentUser={props.currentUser}
        balanceCredits={props.balanceCredits}
        availableCompanies={props.availableCompanies}
        onSwitchCompany={props.onSwitchCompany}
        onOpenTopUp={props.onOpenTopUp}
        onOpenDemo={props.onOpenDemo}
        isLoggedIn={props.isLoggedIn}
        onOpenLogin={props.onOpenLogin}
        onOpenSignup={props.onOpenSignup}
        onLogout={props.onLogout}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/ar" element={<HomePage voices={props.voices} onOpenDemo={props.onOpenDemo} onOpenSignup={props.onOpenSignup} onOpenLogin={props.onOpenLogin} isLoggedIn={props.isLoggedIn} onOpenTopUp={props.onOpenTopUp} onSelectForBooking={props.onSelectForBooking} />} />
          <Route path="/ar/our-works" element={<SuccessStoriesPage onOpenDemo={props.onOpenDemo} />} />
          {Object.values(servicePages).map((service) => (
            <Route key={service.slug} path={`/ar/services/${service.slug}`} element={<ServicePage service={service} onOpenDemo={props.onOpenDemo} />} />
          ))}
          <Route path="*" element={<Navigate to="/ar" replace />} />
        </Routes>
      </main>

      <Footer onNavigate={navigateFromView} onOpenChangelog={props.onOpenChangelog} />
    </div>
  );
};
