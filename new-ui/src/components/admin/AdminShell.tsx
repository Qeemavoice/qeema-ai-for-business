import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronsRight, ChevronsLeft, Home, User } from 'lucide-react';
import { ADMIN_NAV, AdminTab, findNavMeta } from './adminNav';

interface Props {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  badges?: Partial<Record<AdminTab, number>>;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Old admin layout: dark right sidebar with grouped, collapsible items + light top bar. */
export const AdminShell: React.FC<Props> = ({ activeTab, onSelect, badges = {}, actions, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const meta = findNavMeta(activeTab);

  // keep the parent group open when one of its children is active
  useEffect(() => {
    if (!meta.parent) return;
    setOpen(o => ({ ...o, [meta.parent!]: true }));
  }, [activeTab]);

  return (
    <div className="fixed inset-0 z-40 flex bg-[#F4F5F9] text-right" dir="rtl">
      {/* Sidebar (right in RTL) */}
      <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} shrink-0 bg-[#1B1B2F] text-slate-300 flex flex-col transition-all duration-200 h-full`}>
        <div className="h-16 flex items-center justify-between px-4 bg-[#16162A] shrink-0">
          {!collapsed && (
            <Link to="/ar" className="flex items-center gap-2 text-white font-black" title="زيارة الموقع">
              <span className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center text-sm">ق</span>
              <span className="text-sm">قيمة فويس</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(c => !c)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer" title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}>
            {collapsed ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
          {ADMIN_NAV.map((group, gi) => (
            <div key={gi} className="space-y-0.5">
              {group.title && !collapsed && (
                <p className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-500">{group.title}</p>
              )}
              {group.items.map(item => {
                const Icon = item.icon;
                const hasChildren = !!item.children;
                const childActive = item.children?.some(c => c.id === activeTab);
                const isActive = item.id === activeTab;
                const expanded = hasChildren && (open[item.label] ?? false);
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          if (collapsed) { onSelect(item.children![0].id); return; }
                          setOpen(o => ({ ...o, [item.label]: !o[item.label] }));
                        } else onSelect(item.id!);
                      }}
                      title={item.label}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors cursor-pointer ${
                        isActive || (childActive && !expanded) ? 'bg-black/30 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive || childActive ? 'text-brand-yellow' : 'text-slate-500'}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {!collapsed && (
                        <span className="flex items-center gap-2">
                          {item.id && badges[item.id] ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold">{badges[item.id]}</span>
                          ) : null}
                          {hasChildren && (expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />)}
                        </span>
                      )}
                    </button>

                    {hasChildren && expanded && !collapsed && (
                      <div className="mt-0.5 mb-1 mr-4 border-r border-white/10 pr-2 space-y-0.5">
                        {item.children!.map(c => (
                          <button key={c.id} onClick={() => onSelect(c.id)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer ${
                              activeTab === c.id ? 'text-white bg-black/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}>
                            <span className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === c.id ? 'bg-brand-yellow' : 'bg-slate-600'}`} />
                              <span>{c.label}</span>
                            </span>
                            {badges[c.id] ? <span className="px-1.5 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold">{badges[c.id]}</span> : null}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4">
          <Link to="/ar" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-text">
            <Home className="w-4 h-4" />
            <span>زيارة الموقع</span>
          </Link>
          <div className="flex items-center gap-3">
            {actions}
            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center" title="حساب المشرف"><User className="w-5 h-5" /></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5 pb-3 flex items-center gap-4 flex-wrap">
            <h1 className="text-xl font-black text-slate-900">{meta.label}</h1>
            <span className="h-5 w-px bg-slate-300" />
            <nav className="text-xs text-slate-400 flex items-center gap-1.5" aria-label="مسار التصفح">
              <button onClick={() => onSelect('overview')} className="hover:text-slate-700 cursor-pointer">الرئيسية</button>
              {meta.parent && (<><span>-</span><span>{meta.parent}</span></>)}
              <span>-</span>
              <span className="text-slate-700 font-semibold">{meta.label}</span>
            </nav>
            {meta.desc && <p className="w-full text-xs text-slate-500">{meta.desc}</p>}
          </div>
          <div className="px-6 pb-16 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
