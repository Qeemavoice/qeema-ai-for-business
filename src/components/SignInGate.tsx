import React, { useState } from 'react';
import { api } from '../lib/api';
import { Lock } from 'lucide-react';
import type { User } from '../types';

interface SignInGateProps {
  user: User | null;
  isLoggedIn: boolean;
  /** Which signed-in accounts may see the page */
  allow: (user: User) => boolean;
  title: string;
  hint: string;
  onOpenLogin: () => void;
  onLogout: () => void;
  children: React.ReactNode;
  /** Admin page: an email + password form right here (no sign-up, no Google), then this callback */
  inlineLogin?: (user: User) => void;
}

/** Email + password only, for the admin dashboard */
const InlineLogin: React.FC<{ onDone: (user: User) => void }> = ({ onDone }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('اكتب البريد الإلكتروني وكلمة المرور'); return; }
    setBusy(true); setError('');
    try {
      const { user } = await api.login(email.trim(), password);
      if (!user.isPlatformAdmin) { await api.logout(); setError('هذا الحساب لا يملك صلاحية الإدارة'); return; }
      onDone(user);
    } catch (err: any) {
      // the general message points to Google / «نسيت كلمة المرور», which the admin page does not offer
      const msg = String(err?.message || '');
      setError(msg.includes('كثيرة') ? msg : 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally { setBusy(false); }
  };
  const field = 'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand/40';
  return (
    <form onSubmit={submit} className="space-y-3 text-right" noValidate>
      <input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className={field} dir="ltr" />
      <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className={field} dir="ltr" />
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-orange disabled:opacity-60 text-white text-sm font-bold shadow-md shadow-brand/25 transition-colors">
        {busy ? 'جارٍ الدخول...' : 'دخول'}
      </button>
    </form>
  );
};

/** Private pages (dashboards): shown only to the right signed-in account */
export const SignInGate: React.FC<SignInGateProps> = ({ user, isLoggedIn, allow, title, hint, onOpenLogin, onLogout, children, inlineLogin }) => {
  if (user && allow(user)) return <>{children}</>;
  if (isLoggedIn && !user) return <div className="min-h-[70vh]" />; // account still loading
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 text-brand-text flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {isLoggedIn ? 'الحساب الحالي لا يملك صلاحية هذه الصفحة. سجّل الخروج ثم ادخل بالحساب الصحيح.' : hint}
        </p>
        {inlineLogin && !isLoggedIn ? <InlineLogin onDone={inlineLogin} /> : (
        <button
          onClick={isLoggedIn ? onLogout : onOpenLogin}
          className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-sm font-bold shadow-md shadow-brand/25 transition-colors"
        >
          {isLoggedIn ? 'تسجيل الخروج' : 'تسجيل الدخول'}
        </button>
        )}
      </div>
    </div>
  );
};
