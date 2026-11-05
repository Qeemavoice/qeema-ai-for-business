import React, { useState } from 'react';
import { getGoogleAccessToken } from '../lib/googleSignIn';
import { api } from '../lib/api';
import type { User as AppUser } from '../types';
import { X, Sparkles, Mail, Lock, User, Building2, CheckCircle2, ArrowRight, ShieldCheck, Mic2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  mode?: 'login' | 'signup';
  initialMode?: 'login' | 'signup';
  initialRole?: 'talent' | 'client';
  /** pre-filled e-mail (e.g. the address a «روّاد قيمة» invite was sent to) */
  initialEmail?: string;
  onClose: () => void;
  /** Called with the signed-in account (the session token is already stored) */
  onAuthSuccess?: (user: AppUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode: propMode,
  initialEmail,
  initialMode = 'login',
  initialRole = 'client',
  onClose,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(propMode || initialMode);
  const [accountType, setAccountType] = useState<'talent' | 'client'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync mode when prop changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(propMode || initialMode);
      if (initialRole) setAccountType(initialRole);
      if (initialEmail) setEmail(initialEmail);
      setMessage(null);
    }
  }, [isOpen, propMode, initialMode, initialRole, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // our own checks with a clear message (the browser's validation bubble is easy to miss, Safari especially)
    const problem = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'اكتب بريداً إلكترونياً صحيحاً'
      : !password ? 'اكتب كلمة المرور'
      : mode === 'signup' && !name.trim() ? 'اكتب الاسم الكامل'
      : mode === 'signup' && password.length < 8 ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      : '';
    if (problem) { setMessage({ type: 'error', text: problem }); return; }
    setLoading(true);
    setMessage(null);
    try {
      const { user } = mode === 'login'
        ? await api.login(email, password)
        : await api.signup({ name, email, password, company: company || undefined, accountType });
      setMessage({ type: 'success', text: mode === 'login' ? 'تم تسجيل الدخول بنجاح.' : 'تم إنشاء حسابك بنجاح.' });
      onAuthSuccess?.(user);
      onClose();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ، حاول مرة أخرى' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { user } = await api.loginWithGoogle(await getGoogleAccessToken(), accountType);
      onAuthSuccess?.(user);
      onClose();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'تعذر تسجيل الدخول عبر Google' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header & Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-yellow to-brand-orange mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand/25 mb-3">
            ق
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'تسجيل الدخول إلى قيمة' : 'إنشاء حساب جديد في قيمة'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' 
              ? 'الوصول إلى مكتبة الأصوات المعتمدة وتوليد التعليق الصوتي المؤسسي'
              : accountType === 'talent'
                ? 'أنشئ حساب المعلق ثم أدخل بياناتك وعيناتك لتبدأ باستقبال المشاريع'
                : 'ابدأ تجربتك المجانية واحصل على 5,000 نقطة تجربة فورية'
            }
          </p>
        </div>

        {/* Switch Tabs (Login / Signup) */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200/60">
          <button
            type="button"
            onClick={() => { setMode('login'); setMessage(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'login' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setMessage(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`} />
            <span>{message.text}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full mb-4 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70"
        >
          <svg viewBox="0 0 48 48" className="w-4 h-4" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/>
            <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.5 42.6 14.600 48 24 48z"/>
          </svg>
          <span>{mode === 'login' ? 'تسجيل الدخول عبر Google' : 'إنشاء حساب عبر Google'}</span>
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center"><span className="px-3 bg-white text-slate-400 text-[11px]">أو بالبريد الإلكتروني</span></div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          {mode === 'signup' && (
            <>
              {/* اختيار نوع الحساب: معلق صوتي، عميل */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">نوع الحساب المطلوب:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('talent')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                      accountType === 'talent'
                        ? 'bg-orange-50 border-brand text-slate-900 shadow-2xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      accountType === 'talent' ? 'bg-brand text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Mic2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs">معلق صوتي</div>
                      <div className="text-[10px] text-slate-500 font-normal">استلام مشاريع</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('client')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                      accountType === 'client'
                        ? 'bg-orange-50 border-brand text-slate-900 shadow-2xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      accountType === 'client' ? 'bg-brand text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs">عميل</div>
                      <div className="text-[10px] text-slate-500 font-normal">إنتاج وحجز أصوات</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: سلطان القحطاني"
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المؤسسة أو الشركة (اختياري)</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="مثال: شركة الحلول الرقمية"
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">كلمة المرور</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('يرجى التحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور.')}
                  className="text-[11px] text-brand-text hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={mode === 'signup' ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                aria-describedby={mode === 'signup' ? 'qv-password-hint' : undefined}
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
              />
            </div>
            {mode === 'signup' && (
              <p id="qv-password-hint" className={`mt-1 text-[11px] ${password && password.length < 8 ? 'text-rose-600' : 'text-slate-500'}`}>
                8 أحرف على الأقل{password ? ` (${password.length}/8)` : ''}
              </p>
            )}
          </div>

          {mode === 'login' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-brand-text rounded-sm border-slate-300 focus:ring-brand"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-600 select-none cursor-pointer">
                تذكر تسجيل دخولي على هذا الجهاز
              </label>
            </div>
          )}

          {mode === 'signup' && (
            <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80 text-[11px] text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-text shrink-0" />
              <span>{accountType === 'talent' ? 'بعد إنشاء الحساب ستنتقل لملفك الشخصي لإدخال بياناتك ورفع عيناتك الصوتية.' : 'تحصل على 5,000 نقطة مجانية (توليد وتجربة أصوات AI) فور التسجيل.'}</span>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shadow-md shadow-brand/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? (
              <span>جاري المعالجة...</span>
            ) : mode === 'login' ? (
              <>
                <span>تسجيل الدخول</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>إنشاء حساب مجاني</span>
              </>
            )}
          </button>
        </form>

        {/* Enterprise Notice */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-400">
            للمؤسسات والجهات الحكومية التي تستخدم SSO: 
          </span>{' '}
          <a href="#demo" onClick={(e) => { e.preventDefault(); onClose(); }} className="text-[11px] font-bold text-brand-text hover:underline">
            طلب تكامل مؤسسي
          </a>
        </div>

      </div>
    </div>
  );
};
