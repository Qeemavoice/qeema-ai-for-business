import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronsRight, ChevronsLeft, Home, User, LogOut, KeyRound, X } from 'lucide-react';
import { api } from '../../lib/api';
import { ADMIN_NAV, AdminTab, findNavMeta } from './adminNav';

interface Props {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  badges?: Partial<Record<AdminTab, number>>;
  actions?: React.ReactNode;
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

/** «تغيير كلمة المرور» for the signed-in admin */
const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== again) return setMsg({ ok: false, text: 'كلمتا المرور الجديدتان غير متطابقتين' });
    setBusy(true); setMsg(null);
    try { await api.changePassword(cur, next); setMsg({ ok: true, text: 'تم تغيير كلمة المرور.' }); setCur(''); setNext(''); setAgain(''); }
    catch (err: any) { setMsg({ ok: false, text: err.message }); }
    finally { setBusy(false); }
  };
  const field = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand';
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-3 text-right" dir="rtl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">تغيير كلمة المرور</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer" aria-label="إغلاق"><X className="w-4 h-4" /></button>
        </div>
        <input type="password" autoComplete="current-password" placeholder="كلمة المرور الحالية" value={cur} onChange={e => setCur(e.target.value)} className={field} required />
        <input type="password" autoComplete="new-password" placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)" value={next} onChange={e => setNext(e.target.value)} className={field} minLength={8} required />
        <input type="password" autoComplete="new-password" placeholder="أعد كتابة كلمة المرور الجديدة" value={again} onChange={e => setAgain(e.target.value)} className={field} minLength={8} required />
        {msg && <p className={`text-xs font-bold ${msg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="w-full py-2.5 rounded-xl bg-brand-ink text-white text-sm font-bold disabled:opacity-60 cursor-pointer">{busy ? '...' : 'حفظ'}</button>
      </form>
    </div>
  );
};

/** Old admin layout: dark right sidebar with grouped, collapsible items + light top bar. */
export const AdminShell: React.FC<Props> = ({ activeTab, onSelect, badges = {}, actions, children, userName, userEmail, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
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
            <div className="relative" ref={menuRef}>
              <button type="button" onClick={() => setMenuOpen(o => !o)} className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 flex items-center justify-center cursor-pointer" title="حساب المشرف" aria-haspopup="menu" aria-expanded={menuOpen}>
                <User className="w-5 h-5" />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute left-0 top-11 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50">
                  {(userName || userEmail) && (
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      {userName && <div className="text-xs font-bold text-slate-900 truncate">{userName}</div>}
                      {userEmail && <div className="text-[11px] text-slate-500 truncate font-mono" dir="ltr">{userEmail}</div>}
                    </div>
                  )}
                  <button role="menuitem" type="button" onClick={() => { setMenuOpen(false); setPwOpen(true); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <KeyRound className="w-4 h-4" /> تغيير كلمة المرور
                  </button>
                  <button role="menuitem" type="button" onClick={() => { setMenuOpen(false); onLogout?.(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer">
                    <LogOut className="w-4 h-4" /> تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
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
      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </div>
  );
};
