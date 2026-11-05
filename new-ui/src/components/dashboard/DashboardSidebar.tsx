import React from 'react';
import { RowadBadge } from '../RowadBadge';
import { useRowad } from '../../lib/rowad';
import { 
  Home, 
  Mic2, 
  Sliders, 
  GitFork, 
  LayoutTemplate, 
  FileAudio, 
  Volume2, 
  Users2, 
  Sparkles, 
  ShieldCheck, 
  Globe2, 
  Code2, 
  CreditCard, 
  UserPlus, 
  ChevronDown, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  Bot
} from 'lucide-react';
import { Company, User } from '../../types';
import { findPlan } from '../../../shared/plans';

/** Tabs closed until the public launch for accounts without early access (credits, plans, TTS) */
export const GATED_NAV: string[] = ['studio', 'billing'];

export type DashboardNavKey = 
  | 'home' 
  | 'voices' 
  | 'studio' 
  | 'flows' 
  | 'projects' 
  | 'assets' 
  | 'human-bookings' 
  | 'compliance' 
  | 'team' 
  | 'billing';

interface DashboardSidebarProps {
  activeNav: DashboardNavKey;
  onSelectNav: (key: DashboardNavKey) => void;
  currentCompany: Company | null;
  currentUser: User | null;
  availableCompanies: Company[];
  onSwitchCompany: (id: string) => void;
  balanceCredits: number;
  onOpenTopUp: () => void;
  onOpenInvite: () => void;
  onOpenAssistant?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeNav,
  onSelectNav,
  currentCompany,
  currentUser,
  availableCompanies,
  onSwitchCompany,
  balanceCredits,
  onOpenTopUp,
  onOpenInvite,
  onOpenAssistant,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = React.useState(false);
  const canUseNew = useRowad().canUse;

  const mainNavItems = [
    { key: 'home' as DashboardNavKey, label: 'الرئيسية', icon: Home, badge: undefined },
    { key: 'voices' as DashboardNavKey, label: 'مكتبة الأصوات', icon: Mic2, badge: undefined },
    { key: 'studio' as DashboardNavKey, label: 'استوديو التوليد', icon: Sliders, badge: undefined },
    { key: 'flows' as DashboardNavKey, label: 'التدفقات وسير العمل', icon: GitFork, badge: undefined },
    { key: 'projects' as DashboardNavKey, label: 'المشاريع والقوالب', icon: LayoutTemplate, badge: undefined },
    { key: 'human-bookings' as DashboardNavKey, label: 'حجوزاتي (معلقون بشريون)', icon: Users2, badge: undefined },
    { key: 'assets' as DashboardNavKey, label: 'أصولي والتراخيص', icon: FileAudio, badge: undefined },
    { key: 'billing' as DashboardNavKey, label: 'الباقة والفوترة', icon: CreditCard, badge: undefined },
  ];


  return (
    <aside 
      className={`relative h-full flex flex-col bg-white border-l border-slate-200/80 select-none transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
      style={{ direction: 'rtl' }}
    >
      {/* 1. Workspace Header / Switcher */}
      <div className="p-3.5 border-b border-slate-100 relative">
        <button
          onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80 group text-right"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-ink text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-brand-text">Q</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {currentCompany?.name || 'مساحة عملي'}
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand/10 text-brand-text border border-brand/30 shrink-0">
                    {findPlan(currentCompany?.planId)?.nameAr || 'مجاني'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">مساحة عمل الشركة</p>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />}
        </button>

        {/* Company Dropdown Menu */}
        {isCompanyMenuOpen && !isCollapsed && (
          <div className="absolute top-full right-3.5 left-3.5 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-fade-in space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400">تبديل مساحة العمل</div>
            {availableCompanies.map((comp) => (
              <button
                key={comp.id}
                onClick={() => {
                  onSwitchCompany(comp.id);
                  setIsCompanyMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors text-right ${
                  currentCompany?.id === comp.id
                    ? 'bg-brand/10 text-brand-text font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">{comp.name}</div>
                <span className="text-[10px] text-slate-400">{comp.plan}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 custom-scrollbar">
        {/* Main Section */}
        <div className="space-y-0.5">
          {mainNavItems.filter(item => canUseNew || !GATED_NAV.includes(item.key)).map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectNav(item.key)}
                title={item.label}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group text-right ${
                  isActive
                    ? 'bg-brand-ink text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-brand-text' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Workspace Controls */}
      <div className="p-3 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
        {/* Invite Team Card */}
        {!isCollapsed && (
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <UserPlus className="w-3.5 h-3.5 text-brand-text" />
                <span>فريق العمل</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">4 أعضاء</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              شارك الأصوات والإنتاج الصوتي مع زملائك بالوكالة
            </p>
            <button
              onClick={onOpenInvite}
              className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold transition-colors text-center"
            >
              + دعوة عضو جديد
            </button>
          </div>
        )}

        {/* Upgrade / Credits Bar (Rowad members now, everyone from the public launch) */}
        {canUseNew && <div className="p-2.5 rounded-2xl bg-gradient-to-r from-brand-ink to-brand-ink/90 text-white shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[11px] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-brand-text" />
              {!isCollapsed && <span>رصيد المنشأة</span>}
            </div>
            <span className="text-xs font-black text-white">{balanceCredits.toLocaleString()}</span>
          </div>
          {!isCollapsed && (
            <div className="space-y-2">
              <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-brand-yellow to-brand-orange h-full w-3/4 rounded-full" />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenTopUp}
                  className="flex-1 py-1.5 bg-brand hover:bg-brand-orange text-white text-[10px] font-bold rounded-lg transition-all text-center"
                >
                  شحن رصيد
                </button>
                <button
                  onClick={() => onSelectNav('billing')}
                  className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 text-[10px] font-bold rounded-lg transition-all"
                >
                  الباقات
                </button>
              </div>
            </div>
          )}
        </div>}

        {/* User Profile Mini Bar */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-brand/20 text-brand-text font-bold text-xs flex items-center justify-center shrink-0 border border-brand/30">
              {currentUser?.name?.charAt(0) || 'أ'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 text-right">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name || 'حسابي'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || ''}
                </div>
                <RowadBadge className="mt-1" />
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => onSelectNav('team')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              title="إعدادات الحساب"
            >
              <Users2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
