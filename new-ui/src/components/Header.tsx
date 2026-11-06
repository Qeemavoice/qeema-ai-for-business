import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Coins,
  ChevronDown,
  Sparkles,
  Mic2,
  Sliders,
  Layers,
  FileAudio,
  BarChart3,
  CreditCard,
  Plus,
  Check,
  Menu,
  X,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Info,
  Mail,
  HelpCircle,
  Users,
  Volume2,
  LayoutDashboard
} from 'lucide-react';
import { ActiveView, Company, User } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView, tab?: 'human' | 'ai' | 'my-voices') => void;
  voiceLibraryTab?: 'human' | 'ai' | 'my-voices';
  currentCompany: Company | null;
  currentUser: User | null;
  balanceCredits: number;
  availableCompanies: Company[];
  onSwitchCompany: (companyId: string) => void;
  onOpenTopUp: () => void;
  onOpenDemo: () => void;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  voiceLibraryTab = 'human',
  currentCompany,
  currentUser,
  balanceCredits,
  availableCompanies,
  onSwitchCompany,
  onOpenTopUp,
  onOpenDemo,
  isLoggedIn = false,
  onOpenLogin,
  onOpenSignup,
  onLogout
}) => {
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

  const handleNavClick = (view: ActiveView, tab?: 'human' | 'ai' | 'my-voices') => {
    setActiveView(view, tab);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const isVoicesActive = ['voice-library', 'human-marketplace', 'how-it-works'].includes(activeView);
  const isCommunityActive = ['blog', 'training', 'customer-stories'].includes(activeView);
  const isPricingActive = activeView === 'billing';
  const isTtsActive = activeView === 'tts';
  const isContactActive = ['about', 'contact'].includes(activeView);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all" dir="rtl">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Right Side (in RTL): Logo + Structured Navigation */}
          <div className="flex items-center gap-8">
            {/* الشعار: الرئيسية يدخل لها لما يضغط على الشعار */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center cursor-pointer select-none group"
              title="الرئيسية - اضغط للعودة إلى الصفحة الرئيسية"
            >
              <img
                src="/app/assets/img/logo1.png"
                alt="قيمة"
                className="h-11 w-auto max-w-[118px] object-contain transition-transform duration-200 group-hover:scale-[1.03] sm:h-12 sm:max-w-[132px]"
              />
            </div>

            {/* Desktop Structured Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1">

              {/* 1. مكتبة الأصوات البشرية وكيف نعمل */}
              <div className="relative">
                <button
                  onClick={() => handleNavClick('voice-library')}
                  onMouseEnter={() => setOpenDropdown('voices')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isVoicesActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className={`w-4 h-4 ${isVoicesActive ? 'text-[#FF5500]' : 'text-slate-400'}`} />
                  <span>مكتبة الأصوات</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openDropdown === 'voices' ? 'rotate-180' : ''
                  }`} />
                </button>

                {openDropdown === 'voices' && (
                  <div
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    {/* أصوات بشرية */}
                    <button
                      onClick={() => handleNavClick('voice-library', 'human')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-right transition-colors ${
                        activeView === 'voice-library' && voiceLibraryTab === 'human' ? 'bg-orange-50/80 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Mic2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">أصوات بشرية</div>
                        <p className="text-[10px] text-slate-500">تصفّح ملفات المعلّقين والعينات المتاحة</p>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {/* كيف نعمل؟ */}
                    <button
                      onClick={() => handleNavClick('how-it-works')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-right transition-colors ${
                        activeView === 'how-it-works' ? 'bg-orange-50/80 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">كيف نعمل؟</div>
                        <p className="text-[10px] text-slate-500">منهجية دمج الصوت البشري مع الذكاء الاصطناعي</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('tts')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isTtsActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isTtsActive ? 'text-[#FF5500]' : 'text-slate-400'}`} />
                <span>تحويل النص لصوت</span>
              </button>

              {/* 2. المجتمع (المدونة، التدريب) */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'community' ? null : 'community')}
                  onMouseEnter={() => setOpenDropdown('community')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isCommunityActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className={`w-4 h-4 ${isCommunityActive ? 'text-[#FF5500]' : 'text-slate-400'}`} />
                  <span>المجتمع</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openDropdown === 'community' ? 'rotate-180' : ''
                  }`} />
                </button>

                {openDropdown === 'community' && (
                  <div
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    {/* قصص نجاح العملاء */}
                    <button
                      onClick={() => handleNavClick('customer-stories')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-right transition-colors ${
                        activeView === 'customer-stories' ? 'bg-orange-50/80 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#FF5500] flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">قصص وتجارب العملاء</div>
                        <p className="text-[10px] text-slate-500">تُنشر بعد مراجعة المصدر وموافقة العميل</p>
                      </div>
                    </button>

                    {/* المدونة */}
                    <button
                      onClick={() => handleNavClick('blog')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-right transition-colors ${
                        activeView === 'blog' ? 'bg-orange-50/80 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">المدونة</div>
                        <p className="text-[10px] text-slate-500">مقالات وأبحاث الذكاء الاصطناعي الصوتي العربي</p>
                      </div>
                    </button>

                    {/* التدريب */}
                    <button
                      onClick={() => handleNavClick('training')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-right transition-colors ${
                        activeView === 'training' ? 'bg-orange-50/80 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">التدريب</div>
                        <p className="text-[10px] text-slate-500">أكاديمية تأهيل المعلقين وهندسة الصوت للاستوديو</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. الأسعار */}
              <button
                onClick={() => handleNavClick('billing')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isPricingActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CreditCard className={`w-4 h-4 ${isPricingActive ? 'text-[#FF5500]' : 'text-slate-400'}`} />
                <span>الأسعار</span>
              </button>

              {/* لوحة التحكم تظهر فقط لصاحب الحساب بعد تسجيل الدخول. */}
              {isLoggedIn && (
                <button
                  onClick={() => handleNavClick('client-dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'client-dashboard'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeView === 'client-dashboard' ? 'text-[#FF5500]' : 'text-slate-400'}`} />
                  <span>صفحتي</span>
                </button>
              )}

              {/* 4. تواصل معنا (من نحن، تواصل معنا) */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'contact' ? null : 'contact')}
                  onMouseEnter={() => setOpenDropdown('contact')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isContactActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Mail className={`w-4 h-4 ${isContactActive ? 'text-[#FF5500]' : 'text-slate-400'}`} />
                  <span>تواصل معنا</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openDropdown === 'contact' ? 'rotate-180' : ''
                  }`} />
                </button>

                {openDropdown === 'contact' && (
                  <div
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    {/* من نحن */}
                    <button
                      onClick={() => handleNavClick('about')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-right transition-colors ${
                        activeView === 'about' ? 'bg-orange-50/80 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">من نحن</div>
                        <p className="text-[10px] text-slate-500">رؤية منصة قيمة وبنية الذكاء الصوتي العربي</p>
                      </div>
                    </button>

                    {/* تواصل معنا */}
                    <button
                      onClick={() => handleNavClick('contact')}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-right transition-colors ${
                        activeView === 'contact' ? 'bg-orange-50/80 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#FF5500] flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">تواصل معنا</div>
                        <p className="text-[10px] text-slate-500">فريق الدعم، عروض المؤسسات والمبيعات</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

            </nav>
          </div>

          {/* Left Side (in RTL): Auth Buttons (Visitor) OR Credits Balance + Company Switcher (Logged-in) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isLoggedIn ? (
              <>
                {/* زر تسجيل الدخول */}
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  تسجيل الدخول
                </button>

                {/* زر إنشاء حساب */}
                <button
                  onClick={onOpenSignup}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-bold shadow-md shadow-[#FF5500]/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>إنشاء حساب</span>
                </button>
              </>
            ) : (
              <>
                {/* Real-time Credits Pill */}
                <div
                  onClick={onOpenTopUp}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-slate-800 cursor-pointer hover:bg-orange-100/80 transition-all shadow-sm"
                  title="اضغط لشحن الرصيد الفوري"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#FF5500] text-white flex items-center justify-center">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-right">
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-black text-xs text-slate-900">
                        {balanceCredits.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500">نقطة</span>
                    </div>
                    <span className="text-[9px] text-[#FF5500] font-bold">1 نقطة = 1 حرف</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-400 hover:text-[#FF5500]" />
                </div>

                {/* B2B Company Switcher Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-right"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="hidden sm:flex flex-col">
                      <span className="text-xs font-bold text-slate-900 max-w-[130px] truncate">
                        {currentCompany?.name.split('|')[0] || 'حساب المؤسسة'}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {currentUser?.name || 'مدير الحساب'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showCompanyMenu && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-100 text-xs text-slate-400 font-semibold">
                        تبديل حساب الشركة (B2B Multi-tenancy)
                      </div>
                      <div className="p-2 border-b border-slate-100 space-y-1">
                        <button
                          onClick={() => {
                            setShowCompanyMenu(false);
                            handleNavClick('client-dashboard');
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#FF5500]" />
                          <span>فتح لوحة تحكم المنشأة</span>
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                        {availableCompanies.map(c => {
                          const isSelected = c.id === currentCompany?.id;
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                onSwitchCompany(c.id);
                                setShowCompanyMenu(false);
                              }}
                              className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                                isSelected ? 'bg-orange-50/80 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="truncate">
                                  <p className="truncate font-semibold">{c.name}</p>
                                  <p className="text-[10px] text-slate-400">{c.industry}</p>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#FF5500] shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setShowCompanyMenu(false);
                            onLogout?.();
                          }}
                          className="w-full py-1.5 text-center text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          تسجيل الخروج (تصفح كزائر)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 lg:hidden text-slate-600 hover:bg-slate-50"
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
              <Layers className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>مكتبة الأصوات</span>
            </div>
            <button
              onClick={() => handleNavClick('voice-library', 'human')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'voice-library' && voiceLibraryTab === 'human' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-amber-500" />
                <span>أصوات بشرية</span>
              </div>
              <span className="text-[10px] text-slate-400">مكتبة المعلّقين</span>
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'how-it-works' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span>كيف نعمل؟</span>
              </div>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1">
            <button
              onClick={() => handleNavClick('tts')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'tts' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#FF5500]" />
                <span>تحويل النص إلى صوت</span>
              </div>
            </button>
          </div>

          {/* 2. المجتمع */}
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <div className="text-[11px] font-bold text-slate-400 px-3 py-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>المجتمع</span>
            </div>
            <button
              onClick={() => handleNavClick('blog')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'blog' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span>المدونة</span>
              </div>
            </button>
            <button
              onClick={() => handleNavClick('training')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'training' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>التدريب</span>
              </div>
            </button>
          </div>

          {/* 3. الأسعار */}
          <div className="border-t border-slate-100 pt-3 space-y-1">
            <button
              onClick={() => handleNavClick('billing')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'billing' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>الأسعار والباقات</span>
              </div>
            </button>

            {isLoggedIn && (
              <button
                onClick={() => handleNavClick('client-dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'client-dashboard' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-[#FF5500]" />
                  <span>صفحتي</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-100 text-[#FF5500]">Dashboard</span>
              </button>
            )}
          </div>

          {/* 4. تواصل معنا */}
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <div className="text-[11px] font-bold text-slate-400 px-3 py-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>تواصل معنا</span>
            </div>
            <button
              onClick={() => handleNavClick('about')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'about' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                <span>من نحن</span>
              </div>
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'contact' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF5500]" />
                <span>تواصل معنا</span>
              </div>
            </button>
          </div>

          {/* 5. Visitor Authentication Buttons (or Logout for Logged-in User) */}
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
                  className="w-full py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-bold shadow-md shadow-[#FF5500]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
