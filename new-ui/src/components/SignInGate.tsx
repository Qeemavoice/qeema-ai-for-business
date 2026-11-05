import React from 'react';
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
}

/** Private pages (dashboards): shown only to the right signed-in account */
export const SignInGate: React.FC<SignInGateProps> = ({ user, isLoggedIn, allow, title, hint, onOpenLogin, onLogout, children }) => {
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
        <button
          onClick={isLoggedIn ? onLogout : onOpenLogin}
          className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-sm font-bold shadow-md shadow-brand/25 transition-colors"
        >
          {isLoggedIn ? 'تسجيل الخروج' : 'تسجيل الدخول'}
        </button>
      </div>
    </div>
  );
};
