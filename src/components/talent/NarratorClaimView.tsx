import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  Lock, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Play, 
  Pause, 
  Upload, 
  Camera, 
  FileText, 
  Key, 
  Clock, 
  RotateCcw,
  Check,
  ChevronLeft,
  Mail,
  HelpCircle,
  Mic2
} from 'lucide-react';
import { narratorService } from '../../services/narratorService';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSiteLists } from '../../lib/siteLists';
import { api, setToken } from '../../lib/api';
import { getGoogleAccessToken } from '../../lib/googleSignIn';
import { Narrator, ActiveView } from '../../types';

interface NarratorClaimViewProps {
  token?: string;
  onNavigate: (view: ActiveView, tab?: any) => void;
  onClaimCompleted?: (narrator: Narrator) => void;
}

type ClaimStep = 'welcome' | 'otp' | 'login' | 'review' | 'done' | 'expired' | 'manual_review';

export const NarratorClaimView: React.FC<NarratorClaimViewProps> = ({
  onNavigate,
  onClaimCompleted
}) => {
  // Invite link: /claim/<token> or /ar/claim?token=<token>
  const params = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const [currentToken, setCurrentToken] = useState<string>(params.token || searchParams.get('token') || '');
  const AVAILABLE_DIALECTS = useSiteLists().dialects.filter(d => d.type !== 'لغة').map(d => d.key);
  const [step, setStep] = useState<ClaimStep>('welcome');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [narrator, setNarrator] = useState<Narrator | null>(null);

  // Audio sample playback
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [sampleAudio] = useState<HTMLAudioElement>(new Audio());

  // Step 2: OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(5);
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Step 3: Login Credentials State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'google'>('password');

  // Step 4: Profile Review State
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedDialects, setSelectedDialects] = useState<string[]>([]);
  const [newDialectInput, setNewDialectInput] = useState('');
  const [commercialRate, setCommercialRate] = useState<number>(350);
  const [perWordRate, setPerWordRate] = useState<number>(0.45);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Manual Review Request State
  const [manualFullName, setManualFullName] = useState('');
  const [manualNewPhone, setManualNewPhone] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualReference, setManualReference] = useState<string | null>(null);
  const [manualSubmitting, setManualSubmitting] = useState(false);


  // Load narrator profile by token
  useEffect(() => {
    loadNarrator(currentToken);
  }, [currentToken]);

  const loadNarrator = async (tkn: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { narrator: data, isExpired } = await narratorService.getNarratorByClaimToken(tkn);
      setNarrator(data);
      setDisplayName(data.displayName || '');
      setBio(data.bio || '');
      setSelectedDialects(data.dialects || []);
      setCommercialRate(data.rates?.standardCommercialUsd || 350);
      setPerWordRate(data.rates?.perWordRateUsd || 0.45);
      setAvatarUrl(data.avatarUrl || '');

      if (isExpired) {
        setStep('expired');
      } else if (data.status === 'active') {
        // Already claimed
        setStep('done');
      } else {
        setStep('welcome');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'رمز التفعيل غير صالح.');
      setStep('expired');
    } finally {
      setLoading(false);
    }
  };

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Audio sample playback handling
  const togglePlaySample = () => {
    if (!narrator?.sampleAudioUrl) return;
    if (isPlayingSample) {
      sampleAudio.pause();
      setIsPlayingSample(false);
    } else {
      sampleAudio.src = narrator.sampleAudioUrl;
      sampleAudio.play()
        .then(() => setIsPlayingSample(true))
        .catch(() => setIsPlayingSample(false));
      sampleAudio.onended = () => setIsPlayingSample(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`claim-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // The code goes to the narrator's email on file (sent by the server)
  const [codeSentTo, setCodeSentTo] = useState('');
  const sendCode = async () => {
    setErrorMsg(null);
    try {
      setCodeSentTo(await narratorService.sendClaimCode(currentToken));
      setResendTimer(60);
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err?.message || 'تعذر إرسال رمز التحقق');
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMsg(null);
    try {
      await narratorService.verifyOtp(currentToken, fullOtp);
      setStep('login');
    } catch (err: any) {
      setOtpAttemptsLeft(prev => Math.max(0, prev - 1));
      setErrorMsg(err?.message || 'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    await sendCode();
  };

  const handleSaveCredentials = () => {
    if (loginMethod === 'password') {
      if (password.length < 8) {
        setErrorMsg('كلمة المرور يجب أن لا تقل عن 8 خانات');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('كلمتا المرور غير متطابقتين');
        return;
      }
    }
    setErrorMsg(null);
    setStep('review');
  };

  const handleSaveProfile = async () => {
    if (!narrator) return;
    setLoading(true);
    try {
      // Create the narrator's account (password or Google), then save the profile as its owner
      await fetch('/api/v1/auth/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginMethod === 'google'
          ? { claimToken: currentToken, googleAccessToken: await getGoogleAccessToken() }
          : { claimToken: currentToken, password })
      }).then(async r => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || 'تعذر إنشاء الحساب');
        setToken(data.token);
      });
      await narratorService.useAccountInsteadOfClaim();
      const updated = await narratorService.completeProfileClaim(narrator.id, {
        displayName,
        bio,
        dialects: selectedDialects,
        rates: {
          standardCommercialUsd: commercialRate,
          perWordRateUsd: perWordRate,
          hourlyLiveDirectingUsd: narrator.rates?.hourlyLiveDirectingUsd || 150
        },
        avatarUrl
      });
      setNarrator(updated);
      onClaimCompleted?.(updated);
      setStep('done');
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ الملف');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManualReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFullName || !manualNewPhone) {
      setErrorMsg('يرجى كتابة الاسم الكامل ورقم الجوال الجديد');
      return;
    }
    setManualSubmitting(true);
    try {
      const res = await narratorService.submitManualReviewRequest({
        fullName: manualFullName,
        newPhone: manualNewPhone,
        notes: manualNotes,
        token: currentToken
      });
      setManualReference(res.referenceNumber);
    } catch (err: any) {
      setErrorMsg(err?.message || 'تعذر إرسال الطلب');
    } finally {
      setManualSubmitting(false);
    }
  };

  const handleRequestNewLink = async (phoneOrEmail: string) => {
    try {
      const res = await narratorService.requestNewClaimLink(phoneOrEmail);
      alert(res.message);
    } catch (e: any) {
      alert(e.message || 'حدث خطأ أثناء إرسال الرابط');
    }
  };

  const maskPhone = (phoneStr: string) => {
    if (!phoneStr) return '+966 ••• •• 4567';
    const last4 = phoneStr.slice(-4);
    const code = phoneStr.slice(0, 4);
    return `${code} ••• •• ${last4}`;
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-['Cairo',sans-serif]" dir="rtl">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0b101b]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-yellow to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-wide">قيمة فويس</span>
              <span className="text-[10px] text-slate-400 block -mt-1">بوابة تفعيل حسابات المعلقين</span>
            </div>
          </div>
        </div>

        {/* Step progress pills */}
        {step !== 'expired' && step !== 'done' && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className={`px-3 py-1 rounded-full font-bold ${step === 'welcome' ? 'bg-brand text-white' : 'bg-slate-800 text-slate-400'}`}>
              1. مرحباً
            </span>
            <span className="text-slate-600">←</span>
            <span className={`px-3 py-1 rounded-full font-bold ${step === 'otp' ? 'bg-brand text-white' : 'bg-slate-800 text-slate-400'}`}>
              2. التحقق
            </span>
            <span className="text-slate-600">←</span>
            <span className={`px-3 py-1 rounded-full font-bold ${step === 'login' ? 'bg-brand text-white' : 'bg-slate-800 text-slate-400'}`}>
              3. الدخول
            </span>
            <span className="text-slate-600">←</span>
            <span className={`px-3 py-1 rounded-full font-bold ${step === 'review' ? 'bg-brand text-white' : 'bg-slate-800 text-slate-400'}`}>
              4. الملف الشخصي
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            الرئيسية
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-2xl w-full">

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* STEP 1: Welcome & Profile Card */}
          {step === 'welcome' && narrator && (
            <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ملفك المهني جاهز للتفعيل</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  أهلًا {narrator.displayName}، ملفك على قيمة فويس جاهز
                </h1>
                <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
                  قام فريقنا في منصة قيمة فويس بإعداد ملفك الصوتي الاحترافي. قم بتفعيل حسابك الآن لتلقي طلبات العمل وتدريب بصمتك الصوتية الذكية.
                </p>
              </div>

              {/* Profile Card Preview */}
              <div className="bg-[#141b2d] border border-slate-700/80 rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-4">
                  <img
                    src={narrator.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={narrator.displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-orange-500/40 shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white">{narrator.displayName}</h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        غير مفعّل بعد
                      </span>
                    </div>

                    {/* Dialects */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {narrator.dialects.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Sample Audio player */}
                    {narrator.sampleAudioUrl && (
                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlaySample}
                            className="w-8 h-8 rounded-full bg-brand hover:bg-orange-600 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md"
                          >
                            {isPlayingSample ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white mr-0.5" />}
                          </button>
                          <span className="text-xs text-slate-300 font-medium">
                            {isPlayingSample ? 'جاري الاستماع للعينة الصوتية...' : 'استمع لعينة من صوتك المسجلة'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">0:15 / HQ WAV</span>
                      </div>
                    )}
                  </div>
                </div>

                {narrator.bio && (
                  <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/50 leading-relaxed">
                    «{narrator.bio}»
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={sendCode}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-yellow to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-base shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>تفعيل حسابي</span>
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <span>هل تغير رقم هاتفك المسجل؟</span>
                  <button
                    onClick={() => setStep('manual_review')}
                    className="text-orange-400 hover:underline font-bold"
                  >
                    طلب تفعيل يدوي
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && narrator && (
            <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">التحقق من بريدك الإلكتروني</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                  تم إرسال رمز تحقق مكوّن من 6 أرقام إلى بريدك المسجل:
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm font-bold text-orange-400" dir="ltr">
                  {codeSentTo}
                </div>
              </div>


              {/* 6-Digit OTP Inputs */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-6" dir="ltr">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`claim-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && idx > 0) {
                        document.getElementById(`claim-otp-${idx - 1}`)?.focus();
                      }
                    }}
                    className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
                <span>المحاولات المتبقية: <strong className="text-white font-mono">{otpAttemptsLeft}</strong></span>
                <button
                  disabled={resendTimer > 0}
                  onClick={handleResendOtp}
                  className={`font-bold transition-colors ${resendTimer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-orange-400 hover:underline cursor-pointer'}`}
                >
                  {resendTimer > 0 ? `إعادة الإرسال بعد (${resendTimer} ثانية)` : 'إعادة إرسال الرمز الآن'}
                </button>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || otp.join('').length < 6}
                className="w-full py-3.5 rounded-2xl bg-brand hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifyingOtp ? 'جاري التحقق...' : 'تأكيد الرمز والمتابعة'}
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep('manual_review')}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  لم يعد لديك إمكانية الوصول لهذا الرقم؟ طلب تفعيل يدوي
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Set Login */}
          {step === 'login' && (
            <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">إعداد وسيلة تسجيل الدخول</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                  اختر طريقة تسجيل دخولك المستقبلية لإدارة أعمالك وحسابك
                </p>
              </div>

              {/* Toggle Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    loginMethod === 'password'
                      ? 'bg-orange-500/10 border-brand text-orange-400'
                      : 'bg-brand-ink border-slate-700 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>كلمة مرور سرية</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginMethod('google')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    loginMethod === 'google'
                      ? 'bg-orange-500/10 border-brand text-orange-400'
                      : 'bg-brand-ink border-slate-700 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>حساب قوقل</span>
                </button>
              </div>

              {loginMethod === 'password' ? (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-center mb-6">
                  <p className="text-xs text-slate-300">
                    سيتم ربط حسابك بعنوان بريدك الإلكتروني عبر Google تلقائياً للدخول بضغطة زر واحدة بأمان.
                  </p>
                </div>
              )}

              <button
                onClick={handleSaveCredentials}
                className="w-full py-3.5 rounded-2xl bg-brand hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>متابعة لمراجعة الملف الشخصي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 4: Review Profile */}
          {step === 'review' && narrator && (
            <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white">مراجعة وتحديث الملف المهني</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  تأكد من دقة بياناتك، هذه البيانات هي ما ستظهر لشركات الإنتاج والعملاء
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {/* Photo & Name */}
                <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <div className="relative group shrink-0">
                    <img
                      src={avatarUrl || narrator.avatarUrl}
                      alt={displayName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500/40"
                    />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white cursor-pointer transition-opacity">
                      <Camera className="w-5 h-5" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setAvatarUrl(url);
                          }
                        }} 
                      />
                    </label>
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الفني / المعروض</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                {/* Dialects */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اللهجات الصوتية المتقنة</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedDialects.map((d) => (
                      <span
                        key={d}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand/20 text-orange-300 border border-brand/40 flex items-center gap-1.5"
                      >
                        <span>{d}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedDialects(selectedDialects.filter(item => item !== d))}
                          className="hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={newDialectInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !selectedDialects.includes(val)) {
                          setSelectedDialects([...selectedDialects, val]);
                        }
                        setNewDialectInput('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                    >
                      <option value="">+ إضافة لهجة من القائمة...</option>
                      {AVAILABLE_DIALECTS.filter(d => !selectedDialects.includes(d)).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">سعر الإعلان التجاري القياسي (بالدولار)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">$</span>
                      <input
                        type="number"
                        value={commercialRate}
                        onChange={(e) => setCommercialRate(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">سعر الكلمة للمشاريع الطويلة (بالدولار)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">$</span>
                      <input
                        type="number"
                        step="0.05"
                        value={perWordRate}
                        onChange={(e) => setPerWordRate(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نبذة عن خبرتك والعملاء السابقين</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-yellow to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm shadow-lg shadow-orange-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'جاري الحفظ والتفعيل...' : 'حفظ ومتابعة'}
                <Check className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 5: Done Screen */}
          {step === 'done' && narrator && (
            <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">مبروك! تم تفعيل حسابك بنجاح</h2>
              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                أهلاً بك كمعلق معتمد على منصة قيمة فويس. ملفك متاح الآن لاستقبال طلبات التسجيل المباشرة.
              </p>

              {/* Next step: complete the profile */}
              <div className="my-8 p-6 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/5 border border-orange-500/30 text-right">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-white">خطوتك التالية: أكمل ملفك الشخصي</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      أدخل بياناتك وارفع عيناتك الصوتية لتبدأ باستقبال المشاريع من العملاء.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => onNavigate('talent-dashboard')}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        الانتقال إلى لوحة التحكم
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDGE CASE: Expired or Invalid Token */}
          {step === 'expired' && (
            <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">رابط التفعيل منتهي الصلاحية</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                تنتهي صلاحية روابط التفعيل خلال 7 أيام لضمان حماية الحسابات. يمكنك طلب إرسال رابط تفعيل جديد على جوالك أو بريدك فوراً.
              </p>

              <div className="mt-6 p-4 bg-slate-900 border border-slate-700 rounded-2xl max-w-md mx-auto">
                <label className="block text-right text-xs font-bold text-slate-300 mb-1.5">
                  رقم الجوال أو البريد الإلكتروني المسجل:
                </label>
                <div className="flex gap-2">
                  <input
                    id="new-claim-identifier"
                    type="text"
                    placeholder="+9665..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono outline-none"
                  />
                  <button
                    onClick={() => {
                      const val = (document.getElementById('new-claim-identifier') as HTMLInputElement)?.value;
                      if (val) handleRequestNewLink(val);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand hover:bg-orange-600 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    طلب رابط جديد
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setStep('manual_review')}
                  className="text-xs text-orange-400 hover:underline"
                >
                  هل تواجه صعوبة في الاستلام؟ انقر لطلب تفعيل يدوي
                </button>
              </div>
            </div>
          )}

          {/* EDGE CASE: Manual Review Request */}
          {step === 'manual_review' && (
            <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white">طلب تفعيل يدوي للحساب</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  إذا تغير رقم جوالك المسجل أو واجهت عائقاً في استلام رسالة OTP، سيتولى فريق العمل مراجعة بياناتك واعتماد ملفك.
                </p>
              </div>

              {manualReference ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-lg font-black text-white">تم استلام طلب التفعيل بنجاح</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    رقم تتبع طلبك: <strong className="font-mono text-emerald-400 text-sm">{manualReference}</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    سيتواصل معك فريق التحقق عبر الواتساب أو الاتصال المباشر خلال 24 ساعة.
                  </p>
                  <button
                    onClick={() => onNavigate('home')}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitManualReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل مطابق للهوية الوطنية</label>
                    <input
                      type="text"
                      required
                      value={manualFullName}
                      onChange={(e) => setManualFullName(e.target.value)}
                      placeholder="مثال: طارق عبدالعزيز الشمري"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">رقم الجوال الجديد (مع رمز الدولة)</label>
                    <input
                      type="text"
                      required
                      value={manualNewPhone}
                      onChange={(e) => setManualNewPhone(e.target.value)}
                      placeholder="+966 50 123 4567"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات إضافية أو إثبات الهوية (اختياري)</label>
                    <textarea
                      rows={2}
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      placeholder="يرجى ذكر سبب تغيير الرقم أو تفاصيل إضافية"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('welcome')}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={manualSubmitting}
                      className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                    >
                      {manualSubmitting ? 'جاري الإرسال...' : 'إرسال طلب المراجعة اليدوية'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
