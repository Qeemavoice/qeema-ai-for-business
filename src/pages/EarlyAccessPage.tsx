import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Clock, Link2Off, MessageCircle, UserCheck, Loader2, ShieldAlert } from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { api } from '../lib/api';

/** Verdict written by the server on /ar/early (App\Http\Controllers\NewUi\EarlyAccessController) */
interface EarlyBoot { state: string; whatsapp?: string; publicLaunchAt?: string; freeChars?: number; invitedName?: string; invitedEmail?: string; accountExists?: boolean }
const boot = (): EarlyBoot => ((window as any).__QV_EARLY as EarlyBoot) || { state: 'invalid' };

const Shell: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="max-w-xl mx-auto px-4 py-20 text-center" dir="rtl">
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 space-y-5">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-brand/10 text-brand-text flex items-center justify-center">{icon}</div>
      <h1 className="text-2xl font-black text-slate-900">{title}</h1>
      {children}
    </div>
  </section>
);

const launchDay = (iso?: string) =>
  new Date(iso || '2026-11-27T00:00:00+02:00').toLocaleDateString('ar', { day: 'numeric', month: 'long', timeZone: 'Africa/Cairo', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);

/** /ar/early: the «روّاد قيمة» invite link */
export const EarlyAccessPage: React.FC<{ isLoggedIn: boolean; onOpenLogin: (email?: string) => void; onOpenSignup: (email?: string) => void; onActivated?: () => void }> = ({
  isLoggedIn, onOpenLogin, onOpenSignup, onActivated
}) => {
  useSeo({ path: '/ar/early', title: 'دعوة روّاد قيمة | قيمة فويس', h1: 'دعوة روّاد قيمة', description: 'فعّل دعوتك للوصول المبكر إلى رصيد واستوديو TTS في قيمة فويس.', noindex: true });
  const navigate = useNavigate();
  const b = boot();
  const [state, setState] = useState(b.state);

  // signed in with the new UI's token: activate (or recognise an invite this account already activated)
  useEffect(() => {
    if (state !== 'login' || !isLoggedIn) return;
    setState('checking');
    api.earlyRedeem().then(r => {
      if (r.status === 'redeemed' || r.status === 'already') { onActivated?.(); navigate('/ar/early/welcome', { replace: true }); }
      else setState(r.status === 'invalid' ? 'invalid' : r.status || 'error');
    }).catch(() => setState('error'));
  }, [isLoggedIn, state]);

  const whatsapp = (
    <a href={b.whatsapp} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">
      <MessageCircle className="w-4 h-4" /> تواصل معنا على واتساب
    </a>
  );

  if (state === 'checking') {
    return <Shell icon={<Loader2 className="w-7 h-7 animate-spin" />} title="جارٍ تفعيل دعوتك..."><p className="text-sm text-slate-500">لحظات من فضلك.</p></Shell>;
  }
  if (state === 'login') {
    // no account yet for the invited address → «إنشاء حساب» first, with the address filled in
    const newAccount = Boolean(b.invitedEmail) && b.accountExists === false;
    const signup = <button key="s" onClick={() => onOpenSignup(b.invitedEmail)} className={`px-6 py-3 rounded-xl text-sm font-bold cursor-pointer ${newAccount ? 'bg-brand hover:bg-brand-orange text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-800'}`}>إنشاء حساب جديد</button>;
    const login = <button key="l" onClick={() => onOpenLogin(b.invitedEmail)} className={`px-6 py-3 rounded-xl text-sm font-bold cursor-pointer ${newAccount ? 'border border-slate-200 hover:bg-slate-50 text-slate-800' : 'bg-brand-ink hover:bg-brand-ink/90 text-white'}`}>تسجيل الدخول</button>;
    return (
      <Shell icon={<Award className="w-7 h-7" />} title={b.invitedName ? `أهلاً ${b.invitedName}، دعوتك جاهزة` : 'دعوتك إلى روّاد قيمة جاهزة'}>
        <p className="text-sm text-slate-700 font-bold">{newAccount ? 'أنشئ حسابك لتفعيل دعوتك:' : 'سجّل دخولك أو أنشئ حسابك لتفعيل دعوتك:'}</p>
        <ul className="text-sm text-slate-600 leading-relaxed space-y-1.5 text-right max-w-sm mx-auto list-disc pr-5">
          <li>وصول مبكر لاستوديو TTS والرصيد والباقات</li>
          <li>{(b.freeChars || 5000).toLocaleString('en')} حرف هدية</li>
          <li>سعر روّاد قيمة</li>
        </ul>
        {newAccount && <p className="text-xs text-slate-500">ليس لهذا البريد حساب بعد: <span className="font-bold text-slate-700" dir="ltr">{b.invitedEmail}</span></p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">{newAccount ? [signup, login] : [login, signup]}</div>
        <p className="text-[11px] text-slate-400">ستُفعَّل الدعوة تلقائياً بعد الدخول.</p>
      </Shell>
    );
  }
  if (state === 'used') {
    return (
      <Shell icon={<UserCheck className="w-7 h-7" />} title="هذه الدعوة مستخدمة">
        <p className="text-sm text-slate-600">فُعّلت هذه الدعوة بحساب آخر. إذا كانت دعوتك، تواصل معنا وسنساعدك.</p>
        {whatsapp}
      </Shell>
    );
  }
  if (state === 'expired') {
    return (
      <Shell icon={<Clock className="w-7 h-7" />} title="انتهى الوصول المبكر">
        <p className="text-sm text-slate-600">انتهت صلاحية هذه الدعوة. العرض العام يبدأ {launchDay(b.publicLaunchAt)}، سجّل في قائمة الانتظار ليصلك التنبيه أولاً.</p>
        <Link to="/ar/waitlist" className="inline-flex px-6 py-3 rounded-xl bg-brand hover:bg-brand-orange text-white text-sm font-bold">انضم لقائمة الانتظار</Link>
      </Shell>
    );
  }
  if (state === 'staff') {
    return (
      <Shell icon={<UserCheck className="w-7 h-7" />} title="أنت مسجّل بحساب الإدارة">
        <p className="text-sm text-slate-600">دعوات روّاد قيمة لحسابات العملاء فقط، ولم تُستخدم هذه الدعوة. سجّل الخروج ثم افتح الرابط وادخل بحساب العميل.</p>
      </Shell>
    );
  }
    if (state === 'rate_limited') {
    return <Shell icon={<ShieldAlert className="w-7 h-7" />} title="محاولات كثيرة"><p className="text-sm text-slate-600">حاول مرة أخرى بعد ساعة.</p></Shell>;
  }
  if (state === 'error') {
    return <Shell icon={<ShieldAlert className="w-7 h-7" />} title="تعذّر تفعيل الدعوة"><p className="text-sm text-slate-600">حدث خطأ غير متوقع ولم يُخصم أي شيء. حاول مرة أخرى أو تواصل معنا.</p>{whatsapp}</Shell>;
  }
  return (
    <Shell icon={<Link2Off className="w-7 h-7" />} title="رابط غير صالح">
      <p className="text-sm text-slate-600">تأكد من فتح الرابط كما وصلك تماماً، أو تواصل معنا.</p>
      {whatsapp}
    </Shell>
  );
};

/** /ar/early/welcome */
export const EarlyWelcomePage: React.FC<{ isLoggedIn: boolean; onOpenLogin: () => void }> = ({ isLoggedIn, onOpenLogin }) => {
  useSeo({ path: '/ar/early/welcome', title: 'أهلاً بك في روّاد قيمة | قيمة فويس', h1: 'أهلاً بك في روّاد قيمة', description: 'رصيدك المجاني جاهز في استوديو TTS.', noindex: true });
  const [chars, setChars] = useState<number | null>(null);
  useEffect(() => {
    if (!isLoggedIn) return;
    api.earlyStatus().then(s => setChars(s.freeGrant?.remaining ?? 0)).catch(() => setChars(null));
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Shell icon={<Award className="w-7 h-7" />} title="سجّل دخولك"><button onClick={onOpenLogin} className="px-6 py-3 rounded-xl bg-brand-ink text-white text-sm font-bold cursor-pointer">تسجيل الدخول</button></Shell>;
  }
  const shown = (chars ?? 5000).toLocaleString('en');
  return (
    <Shell icon={<Award className="w-7 h-7" />} title="أهلاً بك في روّاد قيمة 🎉">
      <p className="text-base text-slate-700 leading-relaxed">
        رصيدك <span className="font-black text-brand-text">{shown} حرف</span> جاهز (يكفي تقريباً 10 إعلانات بطول 30 ثانية)
      </p>
      <div className="flex flex-col items-center gap-3 pt-2">
        <Link to="/ar/text-to-speech" className="px-7 py-3 rounded-xl bg-brand hover:bg-brand-orange text-white text-sm font-bold">جرّب الـTTS الآن</Link>
        <Link to="/ar/pricing" className="text-xs font-bold text-brand-text hover:underline">اعرف مزايا روّاد قيمة</Link>
      </div>
    </Shell>
  );
};

/** /ar/waitlist: where closed features send visitors before the public launch */
export const WaitlistPage: React.FC = () => {
  useSeo({ path: '/ar/waitlist', title: 'قائمة الانتظار | قيمة فويس', h1: 'قريباً للجميع', description: 'استوديو TTS والرصيد والباقات تفتح للجميع قريباً. سجّل ليصلك التنبيه أولاً.', noindex: true });
  const [email, setEmail] = useState('');
  const [done, setDone] = useState<'' | 'ok' | 'err'>('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/v1/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'waitlist' }) }).catch(() => null);
    setDone(r?.ok ? 'ok' : 'err');
  };
  return (
    <Shell icon={<Clock className="w-7 h-7" />} title="قريباً للجميع">
      <p className="text-sm text-slate-600 leading-relaxed">استوديو TTS والرصيد والباقات متاحة الآن لروّاد قيمة فقط، وتفتح للجميع {launchDay()}. اترك بريدك ليصلك التنبيه أولاً.</p>
      {done === 'ok' ? (
        <p className="text-sm font-bold text-emerald-700">تم تسجيلك في قائمة الانتظار.</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="بريدك الإلكتروني" dir="ltr"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-brand" />
          <button className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-orange text-white text-sm font-bold cursor-pointer">سجّلني</button>
        </form>
      )}
      {done === 'err' && <p className="text-xs text-rose-600">تعذّر التسجيل، حاول مرة أخرى.</p>}
      <Link to="/ar/voices" className="inline-block text-xs font-bold text-brand-text hover:underline">تصفّح الأصوات البشرية واحجز الآن</Link>
    </Shell>
  );
};

/** /ar/reset-password?token=…&email=… : the link from «نسيت كلمة المرور؟»; sets a new password and signs in */
export const ResetPasswordPage: React.FC<{ onSignedIn: (user: any) => void }> = ({ onSignedIn }) => {
  useSeo({ path: '/ar/reset-password', title: 'تعيين كلمة مرور جديدة | قيمة فويس', h1: 'تعيين كلمة مرور جديدة', description: 'اختر كلمة مرور جديدة لحسابك في قيمة فويس.', noindex: true });
  const q = new URLSearchParams(window.location.search);
  const token = q.get('token') || '';
  const email = q.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين');
    setBusy(true); setError('');
    try {
      const { user } = await api.resetPassword(email, token, password);
      onSignedIn(user);
    } catch (err: any) {
      setError(err.message || 'تعذر تعيين كلمة المرور');
    } finally {
      setBusy(false);
    }
  };
  if (!token || !email) {
    return (
      <Shell icon={<Link2Off className="w-7 h-7" />} title="رابط غير صالح">
        <p className="text-sm text-slate-600 leading-relaxed">هذا الرابط ناقص. افتح الرابط من رسالة البريد كما هو، أو اطلب رابطاً جديداً من «نسيت كلمة المرور؟» في نافذة تسجيل الدخول.</p>
      </Shell>
    );
  }
  return (
    <Shell icon={<UserCheck className="w-7 h-7" />} title="تعيين كلمة مرور جديدة">
      <p className="text-sm text-slate-600 leading-relaxed">لحساب <strong dir="ltr">{email}</strong>. بعد الحفظ تدخل حسابك مباشرة.</p>
      <form onSubmit={submit} noValidate className="space-y-3 text-right">
        <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-brand" />
        <input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="أعد كتابة كلمة المرور"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-brand" />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button disabled={busy} className="w-full px-6 py-3 rounded-xl bg-brand hover:bg-brand-orange disabled:opacity-60 text-white text-sm font-bold cursor-pointer flex items-center justify-center gap-2">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} حفظ كلمة المرور والدخول
        </button>
      </form>
    </Shell>
  );
};
