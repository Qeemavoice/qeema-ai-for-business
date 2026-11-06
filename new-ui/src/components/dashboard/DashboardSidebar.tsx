import React from 'react';
import { CalendarDays, History, Home, Mic2, SlidersHorizontal } from 'lucide-react';

export type DashboardNavKey =
  | 'home'
  | 'voices'
  | 'studio'
  | 'recordings'
  | 'flows'
  | 'projects'
  | 'assets'
  | 'human-bookings'
  | 'voice-twins'
  | 'compliance'
  | 'developers';

interface DashboardSidebarProps {
  activeNav: DashboardNavKey;
  onSelectNav: (key: DashboardNavKey) => void;
}

const mainNavItems = [
  { key: 'home' as DashboardNavKey, label: 'الرئيسية', icon: Home },
  { key: 'voices' as DashboardNavKey, label: 'الأصوات البشرية', icon: Mic2 },
  { key: 'human-bookings' as DashboardNavKey, label: 'حجز المعلقين البشريين', icon: CalendarDays },
  { key: 'studio' as DashboardNavKey, label: 'الاستوديو', icon: SlidersHorizontal },
  { key: 'recordings' as DashboardNavKey, label: 'تسجيلاتي', icon: History },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeNav, onSelectNav }) => (
  <aside className="flex h-full w-16 shrink-0 flex-col border-r border-slate-200 bg-white sm:w-56" dir="rtl">
    <div className="border-b border-slate-100 px-2 py-5 sm:px-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-lg font-black text-[#FF5500]">Q</div>
        <div className="hidden sm:block">
          <p className="text-sm font-black text-slate-950">قيمة فويس</p>
          <p className="text-[11px] text-slate-500">مساحة العمل</p>
        </div>
      </div>
    </div>

    <nav aria-label="القائمة الرئيسية" className="flex-1 space-y-1 px-3 py-4">
      {mainNavItems.map(({ key, label, icon: Icon }) => {
        const isActive = activeNav === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectNav(key)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-right text-sm font-bold transition sm:justify-start sm:px-3 ${isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
            aria-label={label}
            title={label}
          >
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#FF5500]' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </nav>

    <div className="border-t border-slate-100 px-4 py-3">
      <span className="hidden rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-700 sm:block">التوليد مجاني حالياً</span>
    </div>
  </aside>
);
