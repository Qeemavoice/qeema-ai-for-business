import React, { useState, useRef, useEffect } from 'react';
import { AI_VOICES_ENABLED } from '../../shared/features';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  ChevronDown, 
  Sparkles, 
  Mic2, 
  Layers, 
  CreditCard, 
  Menu, 
  X,
  BookOpen,
  GraduationCap,
  Info,
  Mail,
  HelpCircle,
  Users,
  Volume2
} from 'lucide-react';
import { Company, User } from '../types';
import { WhiteFridayBar } from './WhiteFridayBar';
import { RowadBadge } from './RowadBadge';
import { useRowad } from '../lib/rowad';

interface HeaderProps {
  currentCompany: Company | null;
  currentUser: User | null;
  balanceCredits?: number;
  availableCompanies?: Company[];
  onSwitchCompany?: (companyId: string) => void;
  onOpenTopUp?: () => void;
  onOpenDemo?: () => void;
  onOpenDocReport?: () => void;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCompany,
  currentUser,
  isLoggedIn = false,
  onOpenLogin,
  onOpenSignup,
  onLogout
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const canUseNew = useRowad().canUse;   // TTS links: Rowad members now, everyone from the public launch (plans are open to all)

  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown states for Desktop
  const [openDropdown, setOpenDropdown] = useState<'voices' | 'community' | 'contact' | null>(null);

  // Close dropdown on click outside
  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setShowCompanyMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isVoicesActive = currentPath.startsWith('/ar/voices') || currentPath.startsWith('/ar/text-to-speech') || currentPath.startsWith('/ar/voice-templates') || currentPath.startsWith('/ar/booking-steps');
  const isCommunityActive = currentPath.startsWith('/ar/blogs') || currentPath.startsWith('/ar/guides') || currentPath.startsWith('/ar/our-works');
  const isPricingActive = currentPath === '/ar/pricing';
  const isContactActive = currentPath.startsWith('/ar/contact-us') || currentPath.startsWith('/ar/p/about-us');

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all" dir="rtl">
      <WhiteFridayBar />
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Right Side (in RTL): Logo + Structured Navigation */}
          <div className="flex items-center gap-8">
            {/* الشعار الرسمي عالي الجودة */}
            <Link 
              to="/ar"
              className="flex items-center select-none group"
              title="قيمة فويس - الصوت يبدأ هنا"
            >
              <img 
                src="/assets/aistudio/qeemavoice_logo_5d0c91ae.png" 
                alt="قيمة فويس - Qeema Voice" 
                width="145"
                height="50"
                className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>

            {/* Desktop Structured Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-2">
              
              {/* 1. مكتبة الأصوات */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'voices' ? null : 'voices')}
                  onMouseEnter={() => setOpenDropdown('voices')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isVoicesActive
                      ? 'text-slate-950 font-black'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                  }`}
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>مكتبة الأصوات</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    openDropdown === 'voices' ? 'rotate-180' : ''
                  }`} />
                </button>

                {openDropdown === 'voices' && (
                  <div 
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    {/* الأصوات البشرية */}
                    <Link
                      to="/ar/voices"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-right hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Mic2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">الأصوات البشرية</span>
                    </Link>

                    {/* أصوات AI — hidden until launch (shared/features.ts) */}
                    {AI_VOICES_ENABLED && (
                    <Link
                      to="/ar/voices"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-right hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-brand-text flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">أصوات AI</span>
                    </Link>
                    )}

                    {/* أستوديو TTS (Rowad members now, everyone from the public launch) */}
                    {canUseNew && (
                    <Link
                      to="/ar/text-to-speech"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-right hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>أستوديو TTS</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">توليد فوري</span>
                      </div>
                    </Link>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    {/* كيف نعمل؟ */}
                    <Link
                      to="/ar/booking-steps"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-right hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">كيف نعمل؟</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 2. المجتمع */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'community' ? null : 'community')}
                  onMouseEnter={() => setOpenDropdown('community')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isCommunityActive
                      ? 'text-slate-950 font-black'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>المجتمع</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    openDropdown === 'community' ? 'rotate-180' : ''
                  }`} />
                </button>

                {openDropdown === 'community' && (
                  <div 
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    {/* قصص النجاح */}
                    <Link
                      to="/ar/our-works"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-right hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-brand-text flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">قصص النجاح</span>
                    </Link>

                    {/* المدونة */}
                    <Link
                      to="/ar/blogs"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-right hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">المدونة</span>
                    </Link>

                    {/* الأدلة والتدريب */}
                    <Link
                      to="/ar/guides"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-right hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">الأدلة الإرشادية</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. الأسعار */}
              {(
              <Link
                to="/ar/pricing"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isPricingActive
                    ? 'text-slate-950 font-black'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>الأسعار</span>
              </Link>
              )}

              {/* 4. تواصل معنا */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'contact' ? null : 'contact')}
                  onMouseEnter={() => setOpenDropdown('contact')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isContactActive
                      ? 'text-slate-950 font-black'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                  }`}
                >
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>تواصل معنا</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    openDropdown === 'contact' ? 'rotate-180' : ''
                  }`} />
                </button>

                {openDropdown === 'contact' && (
                  <div 
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    {/* من نحن */}
                    <Link
                      to="/ar/p/about-us"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-right hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Info className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">من نحن</span>
                    </Link>

                    {/* تواصل معنا */}
                    <Link
                      to="/ar/contact-us"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-right hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-brand-text flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">تواصل معنا</span>
                    </Link>
                  </div>
                )}
              </div>

            </nav>
          </div>

          {/* Left Side (in RTL): Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  تسجيل الدخول
                </button>

                <button
                  onClick={onOpenSignup}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shadow-md shadow-brand/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>إنشاء حساب</span>
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-right cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-brand-text font-black text-xs flex items-center justify-center">
                    {currentUser?.name?.charAt(0) || 'ق'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate">
                      {currentUser?.name || 'المستخدم'}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {currentCompany?.name.split('|')[0] || 'حساب المؤسسة'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showCompanyMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 text-xs text-slate-400 font-semibold space-y-1.5">
                      <div>الملف الشخصي والحساب</div>
                      <RowadBadge />
                    </div>

                    {canUseNew && (
                    <div className="p-2 border-b border-slate-100 space-y-1">
                      <Link
                        to="/ar/text-to-speech"
                        onClick={() => setShowCompanyMenu(false)}
                        className="w-full flex items-center gap-2 py-2 px-3 text-xs font-bold text-slate-800 hover:bg-orange-50 rounded-xl transition-all text-right"
                      >
                        <Volume2 className="w-4 h-4 text-brand-text" />
                        <span>استوديو تحويل النص إلى صوت (TTS)</span>
                      </Link>
                    </div>
                    )}

                    <div className="p-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowCompanyMenu(false);
                          onLogout?.();
                        }}
                        className="w-full py-1.5 text-center text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 lg:hidden text-slate-600 hover:bg-slate-50 cursor-pointer"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 animate-in slide-in-from-top-2">
          
          {/* 1. مكتبة الأصوات */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 px-3 py-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-text" />
              <span>مكتبة الأصوات</span>
            </div>
            
            <Link
              to="/ar/voices"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-amber-500" />
                <span>الأصوات البشرية</span>
              </div>
              <span className="text-[10px] text-slate-400">1000+ موهبة</span>
            </Link>

            {canUseNew && (
            <Link
              to="/ar/text-to-speech"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span>أستوديو TTS</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">توليد فوري</span>
            </Link>
            )}

            <Link
              to="/ar/booking-steps"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span>كيف نعمل؟</span>
              </div>
            </Link>
          </div>

          {/* 2. المجتمع */}
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <div className="text-[11px] font-bold text-slate-400 px-3 py-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>المجتمع</span>
            </div>
            <Link
              to="/ar/our-works"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-700" />
                <span>قصص النجاح</span>
              </div>
            </Link>
            <Link
              to="/ar/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span>المدونة والأبحاث</span>
              </div>
            </Link>
            <Link
              to="/ar/guides"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>الأدلة والتدريب</span>
              </div>
            </Link>
          </div>

          {/* 3. الأسعار */}
          {<div className="border-t border-slate-100 pt-3 space-y-1">
            <Link
              to="/ar/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>الأسعار والباقات</span>
              </div>
            </Link>
          </div>}

          {/* 4. تواصل معنا */}
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <div className="text-[11px] font-bold text-slate-400 px-3 py-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-text" />
              <span>تواصل معنا</span>
            </div>
            <Link
              to="/ar/p/about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                <span>من نحن</span>
              </div>
            </Link>
            <Link
              to="/ar/contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-text" />
                <span>تواصل معنا</span>
              </div>
            </Link>
          </div>

          {/* 5. Visitor Authentication Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {!isLoggedIn ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin?.();
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors text-center cursor-pointer"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSignup?.();
                  }}
                  className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shadow-md shadow-brand/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>إنشاء حساب</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full py-2.5 text-center text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-100 transition-colors cursor-pointer"
              >
                تسجيل الخروج (تصفح كزائر)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
