import React, { useState, useRef, useEffect } from 'react';
import { RowadBadge } from '../RowadBadge';
import { useRowad } from '../../lib/rowad';
import { findPlan } from '../../../shared/plans';
import { 
  Search, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Coins, 
  ShieldCheck, 
  Bell, 
  ChevronLeft,
  ChevronRight,
  Folder,
  PanelLeft,
  Settings,
  Building2,
  CreditCard,
  BookOpen,
  Moon,
  Sun,
  Share2,
  BarChart2,
  Lock,
  LogOut,
  Repeat,
  Check,
  Zap,
  ArrowUpRight,
  SlidersHorizontal,
  ExternalLink,
  Volume2,
  Mic2
} from 'lucide-react';
import { DashboardNavKey } from './DashboardSidebar';
import { FeedbackModal } from './FeedbackModal';
import { openAssistant } from '../../lib/assistantEvents';
import { Company, User, ActiveView } from '../../types';

interface DashboardTopNavProps {
  activeNav: DashboardNavKey;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  balanceCredits: number;
  envMode: 'production' | 'sandbox';
  onToggleEnvMode: (mode: 'production' | 'sandbox') => void;
  onOpenAssistant: () => void;
  onOpenTopUp: () => void;
  onNavigateTab: (tab: DashboardNavKey) => void;
  currentCompany?: Company | null;
  currentUser?: User | null;
  availableCompanies?: Company[];
  onSwitchCompany?: (companyId: string) => void;
  onNavigate?: (view: ActiveView, extra?: any) => void;
  onLogout?: () => void;
}

export const DashboardTopNav: React.FC<DashboardTopNavProps> = ({
  activeNav,
  searchQuery,
  onSearchChange,
  balanceCredits,
  envMode,
  onToggleEnvMode,
  onOpenAssistant,
  onOpenTopUp,
  onNavigateTab,
  currentCompany,
  currentUser,
  availableCompanies = [],
  onSwitchCompany,
  onNavigate,
  onLogout
}) => {
  // Profile dropdown menu state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const canUseNew = useRowad().canUse;
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
        setIsWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    switch (activeNav) {
      case 'home':
        return { parent: 'الرئيسية', current: 'نظرة عامة' };
      case 'voices':
        return { parent: 'الأصوات', current: 'استكشاف' };
      case 'studio':
        return { parent: 'الاستوديو', current: 'تحويل النص إلى صوت' };
      case 'flows':
        return { parent: 'التدفقات', current: 'سير العمل' };
      case 'projects':
        return { parent: 'المشاريع', current: 'القوالب' };
      case 'assets':
        return { parent: 'الأصول', current: 'التراخيص' };
      case 'human-bookings':
        return { parent: 'السوق', current: 'المعلقين البشريين' };
      case 'compliance':
        return { parent: 'الامتثال', current: 'التراخيص' };
      default:
        return { parent: 'لوحة التحكم', current: 'الرئيسية' };
    }
  };

  const { parent, current } = getBreadcrumbs();

  return (
    <>
      <header 
        className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none"
        style={{ direction: 'rtl' }}
      >
        {/* 1. Right Side (in RTL): Sidebar Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => onNavigateTab('voices')}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="القائمة"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 truncate">
            <span className="text-slate-500 hover:text-slate-900 cursor-pointer">{parent}</span>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">{current}</span>
          </div>
        </div>

        {/* 2. Center: Search Bar (Exact pill style matching ElevenLabs screenshot) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث في كل شيء... (Search everything...)"
              className="w-full pl-10 pr-10 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 rounded-full border border-slate-200 focus:border-slate-400 outline-hidden transition-all"
            />
            <kbd className="absolute left-3 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400 shadow-2xs">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* 3. Left Side (in RTL): Action Buttons (Feedback, Docs, Ask, Folder, Notifications, Avatar) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Feedback Button */}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors hidden sm:inline-flex"
          >
            ملاحظات
          </button>

          {/* Ask: opens the "مساعد قيمة" chatbot */}
          <button
            onClick={() => openAssistant()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-text" />
            <span>اسأل</span>
          </button>

          {/* Projects / Folder Icon Button */}
          <button
            onClick={() => onNavigateTab('projects')}
            className="p-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
            title="المشاريع والمجلدات"
          >
            <Folder className="w-4 h-4" />
          </button>

          {/* Notification Bell with blue dot */}
          <button
            onClick={() => alert('لا توجد إشعارات جديدة في مساحة عملك.')}
            className="relative p-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
          </button>

          {/* User Profile Avatar with Dropdown Trigger */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="relative cursor-pointer group p-0.5 rounded-full hover:ring-2 hover:ring-slate-300 transition-all flex items-center justify-center"
              title="الملف الشخصي ورصيد الحساب ومساحة العمل"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-brand-ink to-slate-700 p-0.5 border border-slate-200 flex items-center justify-center overflow-hidden">
                <img 
                  src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </button>

            {/* ========================================================================= */}
            {/* PROFILE MENU DROPDOWN - Exact Match to Uploaded Screenshot */}
            {/* ========================================================================= */}
            {isProfileMenuOpen && (
              <div 
                className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 divide-y divide-slate-100 py-1 z-50 text-right animate-scale-up"
                style={{ direction: 'rtl' }}
              >
                <div className="px-3.5 pt-3 pb-1 empty:hidden"><RowadBadge /></div>

                {/* 1. Balance Box */}
                {<div className="p-3.5 space-y-2.5 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">رصيد الحساب</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenTopUp();
                      }}
                      className="px-3 py-1 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-full text-[11px] font-bold transition-all shadow-2xs active:scale-95"
                    >
                      شحن الرصيد
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>إجمالي النقاط المتاحة</span>
                      <span className="font-semibold text-slate-700">{balanceCredits.toLocaleString()} نقطة</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-800 font-bold">
                      <span>الرصيد المتبقي</span>
                      <span className="text-brand-text">{balanceCredits.toLocaleString()}</span>
                    </div>
                  </div>
                </div>}

                {/* 2. Current Workspace Section */}
                <div className="p-3.5 space-y-1.5">
                  <div className="text-[11px] font-medium text-slate-400">
                    مساحة العمل الحالية
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {currentCompany?.name || 'مساحة شركة قيمة للذكاء الصوتي'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {`باقة ${findPlan(currentCompany?.planId)?.nameAr || 'مجاني'}`}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                      title="تبديل المنشأة / مساحة العمل"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Workspace Switcher Submenu */}
                  {isWorkspaceMenuOpen && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1 animate-fade-in">
                      <div className="text-[10px] font-bold text-slate-400 px-1">اختر مساحة العمل:</div>
                      {availableCompanies.length > 0 ? (
                        availableCompanies.map((comp) => (
                          <button
                            key={comp.id}
                            onClick={() => {
                              if (onSwitchCompany) onSwitchCompany(comp.id);
                              setIsWorkspaceMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-right transition-colors ${
                              currentCompany?.id === comp.id
                                ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200'
                                : 'text-slate-600 hover:bg-white hover:text-slate-900'
                            }`}
                          >
                            <span className="truncate">{comp.name}</span>
                            {currentCompany?.id === comp.id && <Check className="w-3 h-3 text-brand-text" />}
                          </button>
                        ))
                      ) : (
                        <div className="text-[10px] text-slate-500 p-1">لا توجد مساحات إضافية</div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Account links (only pages that exist on the platform) */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigateTab('billing');
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between text-right"
                  >
                    <span>الباقات والفواتير</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigateTab('human-bookings');
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between text-right"
                  >
                    <span>حجوزاتي مع المعلقين</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigateTab('usage');
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between text-right"
                  >
                    <span>الاستهلاك والإحصائيات</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigateTab('team');
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between text-right"
                  >
                    <span>فريق العمل</span>
                  </button>
                </div>

                <div className="py-1">
                  <a href="/ar/p/terms-of-use" className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between text-right">
                    <span>شروط الاستخدام</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                  <a href="/ar/p/privacy-policy" className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between text-right">
                    <span>سياسة الخصوصية</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>

                {/* 6. Sign out */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (onLogout) onLogout();
                      else alert('تم تسجيل الخروج بنجاح.');
                    }}
                    className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-right transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج من الحساب</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </header>

      {isFeedbackOpen && <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />}
    </>
  );
};
