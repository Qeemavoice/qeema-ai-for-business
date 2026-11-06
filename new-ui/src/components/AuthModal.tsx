import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, Building2, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onLoginSuccess?: () => void | Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync mode when initialMode changes upon opening
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        await api.login({ email, password, remember: rememberMe });
        setMessage({ type: 'success', text: 'تم تسجيل الدخول بنجاح! مرحباً بك في منصة قيمة.' });
      } else {
        await api.register({ name, email, password, company: company || undefined });
        setMessage({ type: 'success', text: 'تم إنشاء حسابك وتسجيل دخولك بنجاح.' });
      }

      await onLoginSuccess?.();
      onClose();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'حدث خطأ غير متوقع. حاول مرة أخرى.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const returnUrl = new URL(window.location.href);
    returnUrl.searchParams.set('view', 'client-dashboard');
    const returnTo = `${returnUrl.pathname}${returnUrl.search}`;
    window.location.assign(`/ar/auth/google?type=2&return_to=${encodeURIComponent(returnTo)}`);
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-[#FF7733] mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#FF5500]/25 mb-3">
            ق
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'تسجيل الدخول إلى قيمة' : 'إنشاء حساب جديد في قيمة'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'الوصول إلى مكتبة الأصوات المعتمدة وتوليد التعليق الصوتي المؤسسي'
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
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
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]/20"
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
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]/20"
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
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">كلمة المرور</label>
              {mode === 'login' && (
                <a
                  href="/ar/password/email"
                  className="text-[11px] text-[#FF5500] hover:underline"
                >
                  نسيت كلمة المرور؟
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]/20"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#FF5500] rounded-sm border-slate-300 focus:ring-[#FF5500]"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-600 select-none cursor-pointer">
                تذكر تسجيل دخولي على هذا الجهاز
              </label>
            </div>
          )}

          {mode === 'signup' && (
            <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80 text-[11px] text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5500] shrink-0" />
              <span>أنشئ حساب عميل للوصول إلى مكتبة الأصوات وطلبات التسجيل.</span>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-bold shadow-md shadow-[#FF5500]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
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

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-slate-400 text-[11px]">أو المتابعة باستخدام</span>
          </div>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-[#4285F4]" />
          <span>{mode === 'login' ? 'تسجيل الدخول باستخدام Google' : 'إنشاء حساب باستخدام Google'}</span>
        </button>

      </div>
    </div>
  );
};
