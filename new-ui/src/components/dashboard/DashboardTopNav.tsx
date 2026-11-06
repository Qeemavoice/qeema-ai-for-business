import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, CircleHelp, Folder, LogOut, MoreHorizontal, Search, Sparkles, UserRound } from 'lucide-react';
import { DashboardNavKey } from './DashboardSidebar';
import { Company, User, ActiveView } from '../../types';

interface DashboardTopNavProps {
  activeNav: DashboardNavKey;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  envMode: 'production' | 'sandbox';
  onToggleEnvMode: (mode: 'production' | 'sandbox') => void;
  onOpenAssistant: () => void;
  onNavigateTab: (tab: DashboardNavKey) => void;
  currentCompany?: Company | null;
  currentUser?: User | null;
  availableCompanies?: Company[];
  onSwitchCompany?: (companyId: string) => void;
  onNavigate?: (view: ActiveView, extra?: any) => void;
  onLogout?: () => void | Promise<void>;
}

const secondaryItems: { key: DashboardNavKey; label: string; soon?: boolean }[] = [
  { key: 'projects', label: 'المشاريع' },
  { key: 'assets', label: 'التسجيلات والتراخيص' },
  { key: 'voice-twins', label: 'استنساخ الصوت', soon: true },
  { key: 'compliance', label: 'التراخيص' },
];

function pageTitle(key: DashboardNavKey): string {
  const titles: Record<DashboardNavKey, string> = {
    home: 'نظرة عامة',
    voices: 'الأصوات البشرية',
    studio: 'الاستوديو',
    recordings: 'تسجيلاتي',
    flows: 'سير العمل',
    projects: 'المشاريع',
    assets: 'التسجيلات والتراخيص',
    'human-bookings': 'حجز المعلقين البشريين',
    'voice-twins': 'استنساخ الصوت',
    compliance: 'التراخيص',
    developers: 'المطورون',
  };
  return titles[key];
}

export const DashboardTopNav: React.FC<DashboardTopNavProps> = ({
  activeNav,
  searchQuery,
  onSearchChange,
  onOpenAssistant,
  onNavigateTab,
  currentCompany,
  currentUser,
  availableCompanies = [],
  onSwitchCompany,
  onLogout,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
        setIsWorkspaceOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenus);
    return () => document.removeEventListener('mousedown', closeMenus);
  }, []);

  const navigateTo = (key: DashboardNavKey) => {
    onNavigateTab(key);
    setIsMoreOpen(false);
  };

  return (
    <header ref={rootRef} className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6" dir="rtl">
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden text-xs font-medium text-slate-400 sm:inline">لوحة التحكم</span>
        <span className="hidden text-slate-300 sm:inline">/</span>
        <h1 className="max-w-48 truncate text-sm font-black text-slate-900">{pageTitle(activeNav)}</h1>
      </div>

      <nav aria-label="روابط إضافية" className="flex items-center gap-1">
        <button type="button" onClick={() => navigateTo('projects')} className={`hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition xl:inline-flex ${activeNav === 'projects' ? 'bg-orange-50 text-[#D94800]' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Folder className="h-4 w-4" /> المشاريع
        </button>
        <div className="relative">
          <button type="button" onClick={() => setIsMoreOpen((open) => !open)} aria-expanded={isMoreOpen} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100">
            <MoreHorizontal className="h-4 w-4" /><span className="hidden sm:inline">المزيد</span><ChevronDown className="h-3.5 w-3.5" />
          </button>
          {isMoreOpen && <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {secondaryItems.map((item) => (
              <button key={item.key} type="button" onClick={() => navigateTo(item.key)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                <span>{item.label}</span>
                {item.soon && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500">قريباً</span>}
              </button>
            ))}
          </div>}
        </div>
      </nav>

      <div className="relative mx-auto hidden w-full max-w-xs md:block">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="ابحث في لوحة التحكم" className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pr-9 pl-3 text-xs outline-none transition focus:border-slate-400 focus:bg-white" />
      </div>

      <div className="mr-auto flex shrink-0 items-center gap-2">
        <button type="button" onClick={onOpenAssistant} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800">
          <Sparkles className="h-4 w-4 text-[#FF7133]" /><span className="hidden sm:inline">اسأل المساعد</span>
        </button>
        <div className="relative">
          <button type="button" onClick={() => setIsNotificationsOpen((open) => !open)} aria-label="الإشعارات" aria-expanded={isNotificationsOpen} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50">
            <Bell className="h-4 w-4" />
          </button>
          {isNotificationsOpen && <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-xl">
            <h2 className="text-sm font-black text-slate-900">الإشعارات</h2>
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">لا توجد إشعارات جديدة.</p>
          </div>}
        </div>
        <div className="relative">
          <button type="button" onClick={() => setIsProfileOpen((open) => !open)} aria-label="قائمة الحساب" aria-expanded={isProfileOpen} className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-sm font-black text-[#C2410C] ring-1 ring-orange-200">
            {currentUser?.name?.trim()?.charAt(0) || <UserRound className="h-4 w-4" />}
          </button>
          {isProfileOpen && <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="truncate text-xs font-black text-slate-900">{currentUser?.name || 'حساب المستخدم'}</p>
              <p className="mt-1 truncate text-[11px] text-slate-500">{currentUser?.email || ''}</p>
              <p className="mt-2 truncate text-[11px] font-bold text-slate-600">{currentCompany?.name || 'مساحة العمل'}</p>
            </div>
            {availableCompanies.length > 1 && <div className="border-b border-slate-100 py-2">
              <button type="button" onClick={() => setIsWorkspaceOpen((open) => !open)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                تبديل مساحة العمل <ChevronDown className={`h-3.5 w-3.5 transition ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
              </button>
              {isWorkspaceOpen && availableCompanies.map((company) => <button key={company.id} type="button" onClick={() => { onSwitchCompany?.(company.id); setIsWorkspaceOpen(false); }} className={`block w-full truncate rounded-lg px-3 py-2 text-right text-xs ${currentCompany?.id === company.id ? 'bg-orange-50 font-bold text-[#C2410C]' : 'text-slate-600 hover:bg-slate-50'}`}>{company.name}</button>)}
            </div>}
            <button type="button" onClick={async () => { setIsProfileOpen(false); await onLogout?.(); }} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-right text-xs font-bold text-rose-600 hover:bg-rose-50">
              <LogOut className="h-4 w-4" /> تسجيل الخروج
            </button>
          </div>}
        </div>
        <button type="button" onClick={() => onNavigateTab('home')} aria-label="المساعدة والعودة للرئيسية" className="hidden h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 sm:grid">
          <CircleHelp className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
