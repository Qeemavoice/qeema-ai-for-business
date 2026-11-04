import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Sliders, 
  Lock, 
  Check, 
  AlertTriangle, 
  Bell, 
  ChevronDown, 
  LogOut, 
  FileText, 
  User, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  Download, 
  ExternalLink,
  Info,
  Calendar,
  DollarSign,
  AlertCircle,
  HelpCircle,
  X,
  CreditCard,
  Building,
  Smartphone,
  ChevronLeft,
  Music,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  Clock,
  Wallet,
  Mic,
  Volume2,
  Edit2,
  Send,
  LayoutDashboard,
  CheckSquare,
  FileCheck,
  Printer,
  QrCode,
  Shield,
  Camera,
  Square,
  RotateCcw,
  BadgeCheck
} from 'lucide-react';
import { 
  ActiveView, 
  Narrator, 
  AIVoice, 
  VoiceContract, 
  UsageEvent, 
  UseCase,
  AIVoiceStatus,
  VoiceSample,
  VoiceSampleStatus,
  VoiceOverBooking,
  VoiceOverBookingStatus,
  NarratorNotification
} from '../../types';
import { SAMPLE_RULES } from '../../../shared/sampleRules';
import { fmtUsd, PLATFORM_COMMISSION_PERCENT } from '../../../shared/pricing';
import { fmtDate, fmtDateTime } from '../../lib/format';
import { narratorService } from '../../services/narratorService';
import { audioSynth } from '../../utils/audioSynthesizer';
import { useSiteLists } from '../../lib/siteLists';
import { VOICE_CATEGORY_FILTERS } from '../../data/humanVoices';

interface VoiceTalentDashboardViewProps {
  onNavigate: (view: ActiveView, tab?: any) => void;
  initialSubPage?: 'main' | 'profile' | 'samples' | 'earnings' | 'settings';
}

interface StudioVoice { id: string; name: string; gender: 'male' | 'female'; dialectLabel: string; styleLabel: string; previewUrl: string; avatar?: string; sharePercent: number }

/** Listen-only player for a studio voice sample. */
const StudioVoicePlayer: React.FC<{ url: string }> = ({ url }) => {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { ref.current?.pause(); }, []);
  const toggle = () => {
    if (!ref.current) { ref.current = new Audio(url); ref.current.onended = () => setPlaying(false); ref.current.onpause = () => setPlaying(false); }
    if (playing) { ref.current.pause(); return; }
    ref.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  return (
    <button type="button" onClick={toggle} aria-label={playing ? 'إيقاف' : 'استماع'}
      className="w-11 h-11 rounded-full bg-brand-ink hover:bg-brand-ink/90 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer">
      {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 -scale-x-100" />}
    </button>
  );
};

const VERIFICATION_SENTENCES = [
  'أسجّل هذا المقطع بصوتي الحقيقي لتوثيق حسابي كمعلق صوتي في قيمة فويس.',
  'أؤكد أن هذا الصوت صوتي أنا، وأنني أقرأ هذا النص الآن مباشرة.',
  'أقرأ هذه الجملة بنفسي لتأكيد هويتي الصوتية على منصة قيمة فويس.',
  'هذا تسجيل حي بصوتي الطبيعي، دون أي فلاتر أو برامج تحويل صوت.',
  'أوافق على مراجعة هذا التسجيل من فريق قيمة فويس لمنحي شارة معلق بشري.'
];
const VERIFICATION_MAX_SECONDS = 20;

/** Same seed + name = same text, so it stays stable while the narrator reads it. */
const buildVerificationText = (name: string, seed: number) => {
  const sentence = VERIFICATION_SENTENCES[seed % VERIFICATION_SENTENCES.length];
  const code = String(1000 + (Math.floor(seed / 7) % 9000));
  return `أنا ${name || 'المعلق'}. ${sentence} رمز التحقق: ${code}.`;
};

/** Shrinks the selfie so it fits in browser storage (max 640px, JPEG). */
const compressImage = (dataUrl: string, maxSide = 640): Promise<string> => new Promise(resolve => {
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL('image/jpeg', 0.8));
  };
  img.onerror = () => resolve(dataUrl);
  img.src = dataUrl;
});

const USE_CASE_LABELS: Record<UseCase, string> = {
  ads: 'إعلانات تجارية',
  corporate: 'هوية مؤسسية',
  elearning: 'تعليم إلكتروني',
  ivr: 'رد آلي IVR',
  documentary: 'وثائقي ورواية',
  podcast: 'بودكاست وإنتاج صوتي',
  social: 'سوشيال ميديا',
  audiobook: 'كتب ومقالات صوتية',
  political: 'محتوى سياسي',
  religious: 'محتوى ديني',
  adult: 'محتوى للبالغين',
  gambling: 'قمار ومراهنات',
  impersonation: 'انتحال شخصية'
};

const NOTICE_PERIOD_OPTIONS = [
  { days: 30, share: 20, label: '30 يومًا', desc: 'حصة أرباح 20%' },
  { days: 180, share: 30, label: '6 أشهر', desc: 'حصة أرباح 30%' },
  { days: 365, share: 40, label: 'سنة واحدة', desc: 'حصة أرباح 40% (الأكثر شيوعاً)' },
  { days: 730, share: 50, label: 'سنتان', desc: 'حصة أرباح 50% (الأعلى عائداً)' }
];

/** Same categories as the voice library filters */

/** Dialing codes: all Arab countries first (arab: true), then the other supported ones. */
const COUNTRY_CODES = [
  { code: '+966', name: 'المملكة العربية السعودية', flag: '🇸🇦', arab: true },
  { code: '+971', name: 'الإمارات العربية المتحدة', flag: '🇦🇪', arab: true },
  { code: '+965', name: 'الكويت', flag: '🇰🇼', arab: true },
  { code: '+974', name: 'قطر', flag: '🇶🇦', arab: true },
  { code: '+968', name: 'سلطنة عمان', flag: '🇴🇲', arab: true },
  { code: '+973', name: 'البحرين', flag: '🇧🇭', arab: true },
  { code: '+20', name: 'جمهورية مصر العربية', flag: '🇪🇬', arab: true },
  { code: '+962', name: 'الأردن', flag: '🇯🇴', arab: true },
  { code: '+961', name: 'لبنان', flag: '🇱🇧', arab: true },
  { code: '+963', name: 'سوريا', flag: '🇸🇾', arab: true },
  { code: '+964', name: 'العراق', flag: '🇮🇶', arab: true },
  { code: '+970', name: 'فلسطين', flag: '🇵🇸', arab: true },
  { code: '+967', name: 'اليمن', flag: '🇾🇪', arab: true },
  { code: '+218', name: 'ليبيا', flag: '🇱🇾', arab: true },
  { code: '+216', name: 'تونس', flag: '🇹🇳', arab: true },
  { code: '+213', name: 'الجزائر', flag: '🇩🇿', arab: true },
  { code: '+212', name: 'المغرب', flag: '🇲🇦', arab: true },
  { code: '+249', name: 'السودان', flag: '🇸🇩', arab: true },
  { code: '+222', name: 'موريتانيا', flag: '🇲🇷', arab: true },
  { code: '+252', name: 'الصومال', flag: '🇸🇴', arab: true },
  { code: '+253', name: 'جيبوتي', flag: '🇩🇯', arab: true },
  { code: '+269', name: 'جزر القمر', flag: '🇰🇲', arab: true },
  { code: '+90', name: 'تركيا', flag: '🇹🇷', arab: false },
  { code: '+61', name: 'أستراليا', flag: '🇦🇺', arab: false },
  { code: '+1', name: 'أمريكا / كندا', flag: '🇺🇸🇨🇦', arab: false },
  { code: '+39', name: 'إيطاليا', flag: '🇮🇹', arab: false }
];
const COUNTRY_OTHER = 'أخرى';
const ARAB_COUNTRY_NAMES = COUNTRY_CODES.filter(c => c.arab).map(c => c.name);

export const VoiceTalentDashboardView: React.FC<VoiceTalentDashboardViewProps> = ({
  onNavigate,
  initialSubPage
}) => {
  // Pre-seeded narrators for instant switching between preview states
  const [narratorList, setNarratorList] = useState<Narrator[]>([]);
  const [selectedNarratorId, setSelectedNarratorId] = useState<string>(() => { try { return localStorage.getItem('qeema_current_narrator') || 'narrator_tareq_01'; } catch { return 'narrator_tareq_01'; } });
  
  // Core loaded state
  const [narrator, setNarrator] = useState<Narrator | null>(null);
  const [aiVoice, setAiVoice] = useState<AIVoice | null>(null);
  const [contract, setContract] = useState<VoiceContract | null>(null);
  // Earnings from uses of the narrator's studio voices, computed on the server for every TTS generation
  const [usageEvents, setUsageEvents] = useState<{ id: string; voiceName: string; chars: number; narratorEarning: number; createdAt: string }[]>([]);
  const [voiceSamples, setVoiceSamples] = useState<VoiceSample[]>([]);
  const [voiceOverBookings, setVoiceOverBookings] = useState<VoiceOverBooking[]>([]);

  // Earnings Summary
  const [earningsSummary, setEarningsSummary] = useState({
    voThisMonth: 830,
    aiThisMonth: 128.09,
    totalMonthly: 958.09,
    availableBalance: 160.60
  });

  // Current Sub-Page: 'main' | 'profile' | 'samples' | 'earnings' | 'settings'
  const [currentSubPage, setCurrentSubPage] = useState<'main' | 'profile' | 'samples' | 'earnings' | 'settings'>(() => {
    if (initialSubPage) return initialSubPage;
    try {
      const p = window.location.pathname;
      if (p.includes('/talent-samples')) return 'samples';
      if (p.includes('/talent-profile') || p.includes('/narrator/profile')) return 'profile';
      if (p.includes('/talent-earnings') || p.includes('/narrator/earnings')) return 'earnings';
      if (p.includes('/talent-voices') || p.includes('/talent-settings') || p.includes('/narrator/settings')) return 'settings';
    } catch {}
    return 'main';
  });

  // Sync subpage with browser path and popstate
  const navigateToSubPage = (subPage: 'main' | 'profile' | 'samples' | 'earnings' | 'settings') => {
    setCurrentSubPage(subPage);
    try {
      const routeMap: Record<string, string> = {
        main: '/ar/talent-dashboard',
        profile: '/ar/talent-profile',
        samples: '/ar/talent-samples',
        earnings: '/ar/talent-earnings',
        settings: '/ar/talent-voices'
      };
      window.history.pushState({ subPage }, '', routeMap[subPage] || '/ar/talent-dashboard');
    } catch {}
  };

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p.includes('/talent-samples')) setCurrentSubPage('samples');
      else if (p.includes('/talent-profile')) setCurrentSubPage('profile');
      else if (p.includes('/talent-earnings')) setCurrentSubPage('earnings');
      else if (p.includes('/talent-voices') || p.includes('/talent-settings')) setCurrentSubPage('settings');
      else setCurrentSubPage('main');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Audio player state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isPlayingConsent, setIsPlayingConsent] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modals state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPayoutSheetOpen, setIsPayoutSheetOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEmergencyHaltOpen, setIsEmergencyHaltOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Payout form state
  const [payoutAmount, setPayoutAmount] = useState<string>('160.60');
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'wallet'>('bank');
  const [payoutAccount, setPayoutAccount] = useState<string>('SA4420000001234567891234');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  // Withdrawal confirm form state
  const [confirmInputText, setConfirmInputText] = useState('');
  const [isWithdrawSubmitting, setIsWithdrawSubmitting] = useState(false);

  // Emergency halt form state
  const [emergencyReason, setEmergencyReason] = useState('ظروف قاهرة تمنع استخدام الصوت');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [emergencySuccess, setEmergencySuccess] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ========================================================
  // PROFILE STATE & FORMS
  // ========================================================
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCountry, setContactCountry] = useState('');
  const [contactCountryOther, setContactCountryOther] = useState(false);
  // Voices the admin approved for the TTS studio under this narrator (read-only)
  const [studioVoices, setStudioVoices] = useState<StudioVoice[]>([]);
  const [contactDialects, setContactDialects] = useState<string[]>([]);
  const [contactCountryCode, setContactCountryCode] = useState('+966');
  const [contactPhoneLocal, setContactPhoneLocal] = useState('');
  const [contactErrors, setContactErrors] = useState<{ email?: string; phone?: string; name?: string }>({});
  
  // Verification code modal state
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingVerificationData, setPendingVerificationData] = useState<{ email?: string; phone?: string; displayName?: string; country?: string; dialects?: string[] } | null>(null);
  const [verificationTargetDesc, setVerificationTargetDesc] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Add Sample Modal state (Max 3 samples)
  const [isAddSampleModalOpen, setIsAddSampleModalOpen] = useState(false);
  const [newSampleTitle, setNewSampleTitle] = useState('');
  // Sample categories and dialects come from the dashboard (التصنيفات / اللهجات واللغات)
  const siteLists = useSiteLists();
  const SAMPLE_CATEGORIES = siteLists.categories;
  const DIALECTS = siteLists.dialects;
  const [newSampleCategory, setNewSampleCategory] = useState(SAMPLE_CATEGORIES[0]);
  const [newSampleDialect, setNewSampleDialect] = useState('سعودي نجدي');
  const [newSampleFileName, setNewSampleFileName] = useState<string | null>(null);
  const [newSampleFile, setNewSampleFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState<NarratorNotification[]>([]);
  const [isSubmittingSample, setIsSubmittingSample] = useState(false);
  const [sampleFormError, setSampleFormError] = useState<string | null>(null);

  // Simplified Contract consent checkbox state
  const [isContractConsentChecked, setIsContractConsentChecked] = useState(true);

  // ========================================================
  // HUMAN TALENT BADGE VERIFICATION STATE («معلق بشري»)
  // ========================================================
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState<string | null>(null);
  const [selfieFileName, setSelfieFileName] = useState<string | null>('tareq_live_selfie.jpg');
  const [isRecordingHumanVoice, setIsRecordingHumanVoice] = useState(false);
  const [humanVoiceRecorded, setHumanVoiceRecorded] = useState(false);
  const [humanVoiceUrl, setHumanVoiceUrl] = useState('');
  // Random sentence shown only once the narrator presses record (a new one on every attempt)
  const [verificationText, setVerificationText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const humanVoiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingHumanVoice, setIsPlayingHumanVoice] = useState(false);
  const [humanVoiceDuration, setHumanVoiceDuration] = useState(8);
  const [humanVoiceTimer, setHumanVoiceTimer] = useState(0);
  const [isSubmittingHumanVerification, setIsSubmittingHumanVerification] = useState(false);
  const selfieFileRef = useRef<HTMLInputElement | null>(null);

  // ========================================================
  // EARNINGS PAGE STATE
  // ========================================================
  const [earningsTab, setEarningsTab] = useState<'vo' | 'ai'>('vo');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<'all' | '2026-10' | '2026-09' | '2026-08'>('all');

  // Load initial narrators
  useEffect(() => {
    const loadNarrators = async () => {
      const all = await narratorService.getAllNarrators();
      setNarratorList(all);
    };
    loadNarrators();
  }, []);

  // Fetch data whenever selected narrator changes
  useEffect(() => {
    loadNarratorData(selectedNarratorId);
  }, [selectedNarratorId]);

  const loadNarratorData = async (narratorId: string) => {
    const n = await narratorService.getNarratorById(narratorId);
    setNarrator(n);
    fetch(`/api/v1/narrators/${narratorId}/studio-voices`).then(r => (r.ok ? r.json() : Promise.reject())).then(d => setStudioVoices(d.voices)).catch(() => setStudioVoices([]));

    if (n) {
      setContactName(n.displayName);
      setContactEmail(n.email || '');
      setContactDialects((n.dialects || []).filter(d => DIALECTS.some(x => x.key === d)));
      const country = n.country || [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find(c => c.arab && (n.phone || '').startsWith(c.code))?.name || '';
      setContactCountry(country);
      setContactCountryOther(!!country && !ARAB_COUNTRY_NAMES.includes(country));
      
      const phoneStr = n.phone || '';
      const matchedCode = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find(c => phoneStr.startsWith(c.code));
      if (matchedCode) {
        setContactCountryCode(matchedCode.code);
        setContactPhoneLocal(phoneStr.replace(matchedCode.code, ''));
      } else {
        setContactCountryCode('+966');
        setContactPhoneLocal(phoneStr.replace('+966', ''));
      }
    }

    setNotifications(await narratorService.getNotifications(narratorId));

    const voice = await narratorService.getAIVoice(narratorId);
    setAiVoice(voice);

    if (voice?.contractId) {
      const c = await narratorService.getVoiceContract(voice.contractId);
      setContract(c);
    } else {
      setContract(null);
    }

    let ai = { events: [] as typeof usageEvents, totalUsd: 0, monthUsd: 0 };
    try {
      const d = await fetch(`/api/v1/narrators/${narratorId}/earnings`).then(r => (r.ok ? r.json() : Promise.reject()));
      ai = { events: d.events.map((e: any) => ({ id: e.id, voiceName: e.voiceName, chars: e.chars, narratorEarning: e.narratorUsd, createdAt: e.createdAt })), totalUsd: d.totalUsd, monthUsd: d.monthUsd };
    } catch { /* keep zeros */ }
    setUsageEvents(ai.events);

    // Voice Samples
    const samples = await narratorService.getVoiceSamples(narratorId);
    setVoiceSamples(samples);

    // Voice Over Bookings
    const bookings = await narratorService.getVoiceOverBookings(narratorId);
    setVoiceOverBookings(bookings);

    // Monthly Earnings & Balance
    const vo = await narratorService.getMonthlyEarnings(narratorId);
    const earnings = {
      voThisMonth: vo.voThisMonth,
      aiThisMonth: ai.monthUsd,
      totalMonthly: Number((vo.voThisMonth + ai.monthUsd).toFixed(2)),
      availableBalance: Number((vo.availableBalance + ai.totalUsd).toFixed(2))
    };
    setEarningsSummary(earnings);
    setPayoutAmount(earnings.availableBalance.toFixed(2));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Audio Playback Handler
  const handleTogglePlayAudio = (id: string, url: string) => {
    if (playingAudioId === id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(e => console.log(e));
      setPlayingAudioId(id);
      setIsPlayingConsent(false);

      audio.onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

  const handleToggleConsentAudio = () => {
    const consentUrl = aiVoice?.consentRecordingUrl || 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3';
    handleTogglePlayAudio('consent_sentence', consentUrl);
    setIsPlayingConsent(playingAudioId !== 'consent_sentence');
  };

  // Status Action Handlers
  const handleTogglePause = async () => {
    if (!selectedNarratorId) return;
    try {
      const updated = await narratorService.togglePauseAIVoice(selectedNarratorId);
      setAiVoice(updated);
      showToast(updated.status === 'paused' ? 'تم إيقاف صوتك الذكي مؤقتاً' : 'تم استئناف تشغيل صوتك الذكي');
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmWithdrawNotice = async () => {
    if (confirmInputText.trim() !== 'تأكيد' || !selectedNarratorId) return;
    setIsWithdrawSubmitting(true);
    try {
      const updated = await narratorService.startNoticePeriodWithdrawal(selectedNarratorId);
      setAiVoice(updated);
      setIsWithdrawModalOpen(false);
      setConfirmInputText('');
      navigateToSubPage('main');
      showToast('بدأت فترة الإشعار المحددة في العقد بنجاح');
    } catch (err) {
      console.error(err);
    } finally {
      setIsWithdrawSubmitting(false);
    }
  };

  const handleToggleUseCase = async (useCaseKey: UseCase) => {
    if (!contract || !selectedNarratorId) return;
    const isAllowed = contract.allowedUseCases.includes(useCaseKey);
    let nextAllowed: UseCase[];
    if (isAllowed) {
      if (contract.allowedUseCases.length <= 1) {
        showToast('يجب إبقاء مجال استخدام مصرح به واحد على الأقل');
        return;
      }
      nextAllowed = contract.allowedUseCases.filter(u => u !== useCaseKey);
    } else {
      nextAllowed = [...contract.allowedUseCases, useCaseKey];
    }

    try {
      const updatedContract = await narratorService.updateAllowedUseCases(selectedNarratorId, nextAllowed);
      setContract(updatedContract);
      showToast(`تم تحديث مجالات الاستخدام وحفظ نسخة العقد (${updatedContract.version})`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectNoticePeriod = async (days: 30 | 180 | 365 | 730) => {
    if (!contract || !selectedNarratorId) return;
    if (days < contract.noticePeriodDays) {
      showToast('لا يمكن تقليل فترة الإشعار المتفق عليها بالعقد، فقط تمديدها لخيار أطول');
      return;
    }
    if (days === contract.noticePeriodDays) return;

    try {
      const updatedContract = await narratorService.updateNoticePeriod(selectedNarratorId, days);
      setContract(updatedContract);
      showToast(`تم تمديد فترة الإشعار وزيادة حصتك من الأرباح إلى ${updatedContract.revenueSharePercent}%`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmPayout = async () => {
    if (!selectedNarratorId) return;
    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    try {
      await narratorService.requestPayout(selectedNarratorId, amountNum, payoutMethod);
      setPayoutSuccessMsg(`تم إرسال طلب سحب مبلغ $${amountNum.toFixed(2)} بنجاح`);
      setTimeout(() => {
        setIsPayoutSheetOpen(false);
        setPayoutSuccessMsg(null);
        loadNarratorData(selectedNarratorId);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitEmergencyHalt = async () => {
    if (!selectedNarratorId) return;
    try {
      await narratorService.submitEmergencyStopRequest(selectedNarratorId, emergencyReason, emergencyNotes);
      setEmergencySuccess(true);
      setTimeout(() => {
        setIsEmergencyHaltOpen(false);
        setEmergencySuccess(false);
        setEmergencyNotes('');
        showToast('تم رفع طلب الإيقاف الاستثنائي إلى فريق العمليات للمراجعة العاجلة');
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // ========================================================
  // CONTACT INFO VERIFICATION & SAVE
  // ========================================================
  const validateContactForm = () => {
    const errors: { email?: string; phone?: string; name?: string } = {};
    
    if (!contactName.trim()) {
      errors.name = 'يرجى إدخال الاسم الكامل';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactEmail.trim() || !emailRegex.test(contactEmail.trim())) {
      errors.email = 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@domain.com)';
    }

    const cleanPhone = contactPhoneLocal.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 8 || cleanPhone.length > 12 || !/^\d+$/.test(cleanPhone)) {
      errors.phone = 'يرجى إدخال رقم هاتف صحيح مكوّن من 8 إلى 12 رقمًا';
    }

    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveContactChanges = async () => {
    if (!validateContactForm() || !narrator) return;

    const fullPhone = `${contactCountryCode}${contactPhoneLocal.replace(/[\s-]/g, '')}`;
    const isEmailChanged = contactEmail.trim().toLowerCase() !== (narrator.email || '').toLowerCase();
    const isPhoneChanged = fullPhone !== narrator.phone;

    // A new email must be confirmed with a code sent to it; other fields save directly
    if (isEmailChanged) {
      let sentTo = '';
      try { sentTo = await narratorService.sendVerificationCode(contactEmail.trim()); }
      catch (err: any) { showToast(err?.message || 'تعذر إرسال رمز التحقق'); return; }
      setOtpCodeInput('');
      setOtpError(null);
      setPendingVerificationData({
        displayName: contactName.trim(),
        email: contactEmail.trim(),
        phone: fullPhone,
        country: contactCountry,
        dialects: contactDialects
      });
      setVerificationTargetDesc(`البريد الإلكتروني الجديد (${sentTo})`);
      setIsVerificationModalOpen(true);
    } else {
      await narratorService.updateNarratorContact(narrator.id, {
        displayName: contactName.trim(),
        phone: isPhoneChanged ? fullPhone : undefined,
        country: contactCountry,
        dialects: contactDialects
      });
      await loadNarratorData(narrator.id);
      showToast('تم حفظ التعديلات بنجاح');
    }
  };

  const handleConfirmVerificationOtp = async () => {
    if (!pendingVerificationData || !narrator) return;
    if (!otpCodeInput.trim()) {
      setOtpError('يرجى إدخال رمز التحقق المكوّن من 6 أرقام');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      try {
        await narratorService.verifyCode(pendingVerificationData.email || '', otpCodeInput.trim());
      } catch (err: any) {
        setOtpError(err?.message || 'رمز التحقق غير صحيح، يرجى المحاولة مجددًا');
        setIsVerifyingOtp(false);
        return;
      }

      await narratorService.updateNarratorContact(narrator.id, pendingVerificationData);
      await loadNarratorData(narrator.id);
      setIsVerificationModalOpen(false);
      setPendingVerificationData(null);
      setOtpCodeInput('');
      showToast('تم التحقق وتحديث بيانات التواصل بنجاح ✅');
    } catch (e: any) {
      setOtpError(e.message || 'فشل التحقق من الرمز');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ========================================================
  // VOICE SAMPLES ACTIONS (MAX 3 SAMPLES - MP3 ONLY)
  // ========================================================
  // Any audio file is accepted here; the platform rules (MP3 only, max 40s) are applied
  // on submit and a sample that breaks them is auto-rejected with a notification.
  const acceptSampleFile = (file: File) => {
    const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac|wma)$/i.test(file.name);
    if (!isAudio) {
      setSampleFormError('يرجى اختيار ملف صوتي');
      setNewSampleFileName(null); setNewSampleFile(null);
      return;
    }
    if (file.size > SAMPLE_RULES.maxSizeMb * 1024 * 1024) {
      setSampleFormError(`حجم الملف يتجاوز الحد الأقصى المسموح (${SAMPLE_RULES.maxSizeMb} ميجابايت)`);
      setNewSampleFileName(null); setNewSampleFile(null);
      return;
    }
    setSampleFormError(null);
    setNewSampleFileName(file.name);
    setNewSampleFile(file);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptSampleFile(file);
  };

  const readAudioDuration = (url: string) => new Promise<number | undefined>(resolve => {
    const a = new Audio();
    a.preload = 'metadata';
    a.onloadedmetadata = () => resolve(isFinite(a.duration) ? Math.round(a.duration) : undefined);
    a.onerror = () => resolve(undefined);
    a.src = url;
  });

  const handleCreateSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrator) return;

    if (!newSampleTitle.trim()) {
      setSampleFormError('يرجى كتابة عنوان العينة');
      return;
    }

    if (voiceSamples.length >= 3) {
      setSampleFormError('متاح إضافة 3 عينات فقط بشرط التوافق مع شروط العينات في المنصة');
      return;
    }

    setIsSubmittingSample(true);
    setSampleFormError(null);

    try {
      // ponytail: object URL lives only in this browser session; real upload goes to storage once the backend exists
      const audioUrl = newSampleFile ? URL.createObjectURL(newSampleFile) : undefined;
      const created = await narratorService.addVoiceSample({
        narratorId: narrator.id,
        title: newSampleTitle.trim(),
        category: newSampleCategory,
        dialect: newSampleDialect,
        audioUrl,
        durationSec: audioUrl ? await readAudioDuration(audioUrl) : 30,
        format: (newSampleFileName?.split('.').pop() || 'mp3').toLowerCase(),
        sizeMb: newSampleFile ? Math.round(newSampleFile.size / 1048576 * 100) / 100 : undefined
      });

      await loadNarratorData(narrator.id);
      setIsAddSampleModalOpen(false);
      setNewSampleTitle('');
      setNewSampleFileName(null);
      setNewSampleFile(null);
      showToast(created.status === 'rejected'
        ? `رُفضت العينة تلقائياً: ${created.rejectionReason || 'مخالفة لشروط العينات'}`
        : 'تم رفع العينة الصوتية بنجاح وهي الآن قيد المراجعة');
    } catch (err: any) {
      setSampleFormError(err.message || 'حدث خطأ أثناء إضافة العينة');
    } finally {
      setIsSubmittingSample(false);
    }
  };

  const handleDeleteSample = async (sampleId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه العينة؟')) return;
    try {
      await narratorService.deleteVoiceSample(sampleId);
      if (narrator) await loadNarratorData(narrator.id);
      showToast('تم حذف العينة بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف العينة');
    }
  };

  // ========================================================
  // HUMAN TALENT BADGE VERIFICATION HANDLERS («معلق بشري»)
  // ========================================================
  const handleSelfieSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح (JPG أو PNG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('حجم صورة السيلفي يجب ألا يتجاوز 10 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setSelfiePhotoUrl(await compressImage(reader.result as string));
      setSelfieFileName(file.name);
      showToast('تم رفع صورة السيلفي للتحقق');
    };
    reader.readAsDataURL(file);
  };

  // Real microphone recording of the random sentence (stored as a data URL for the admin to review)
  const handleStartRecordHumanVoice = async () => {
    try {
      setVerificationText(buildVerificationText(narrator?.displayName || '', Math.floor(Math.random() * 1e9)));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = ev => { if (ev.data.size) chunks.push(ev.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const reader = new FileReader();
        reader.onload = () => { setHumanVoiceUrl(String(reader.result)); setHumanVoiceRecorded(true); showToast('تم تسجيل عينة التحقق الصوتي'); };
        reader.readAsDataURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
      };
      setHumanVoiceRecorded(false);
      setHumanVoiceUrl('');
      humanVoiceAudioRef.current?.pause();
      recorder.start();
      setIsRecordingHumanVoice(true);
      setHumanVoiceTimer(0);
      let seconds = 0;
      recordTimerRef.current = setInterval(() => {
        seconds += 1;
        setHumanVoiceTimer(seconds);
        setHumanVoiceDuration(seconds);
        if (seconds >= VERIFICATION_MAX_SECONDS) handleStopRecordHumanVoice();
      }, 1000);
    } catch {
      setVerificationText('');
      showToast('تعذر الوصول إلى الميكروفون. اسمح للمتصفح باستخدامه ثم أعد المحاولة');
    }
  };

  const handleStopRecordHumanVoice = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    recordTimerRef.current = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    setIsRecordingHumanVoice(false);
  };

  const handleTogglePlayHumanVoice = () => {
    if (!shownVoiceUrl) return;
    if (!humanVoiceAudioRef.current) {
      humanVoiceAudioRef.current = new Audio(shownVoiceUrl);
      humanVoiceAudioRef.current.onended = () => setIsPlayingHumanVoice(false);
    }
    if (isPlayingHumanVoice) { humanVoiceAudioRef.current.pause(); setIsPlayingHumanVoice(false); return; }
    humanVoiceAudioRef.current.src = shownVoiceUrl;
    humanVoiceAudioRef.current.play().then(() => setIsPlayingHumanVoice(true)).catch(() => setIsPlayingHumanVoice(false));
  };

  const handleSubmitHumanVerification = async () => {
    if (!selfiePhotoUrl) {
      showToast('يرجى التقاط أو رفع صورة سيلفي مباشرة أولاً');
      return;
    }
    if (!humanVoiceRecorded || !humanVoiceUrl || !verificationText) {
      showToast('يرجى تسجيل النص الصوتي المطلوب للتحقق');
      return;
    }

    if (!narrator) return;
    setIsSubmittingHumanVerification(true);
    try {
      // The admin team reviews the selfie + recording and grants the badge
      await narratorService.submitHumanVerification(narrator.id, { selfieUrl: selfiePhotoUrl, voiceUrl: humanVoiceUrl, text: verificationText });
      await loadNarratorData(narrator.id);
      showToast('تم إرسال طلبك إلى الإدارة، وستصلك الشارة بعد المراجعة');
    } finally {
      setIsSubmittingHumanVerification(false);
    }
  };

  // Consent section values (from the signed contract)
  const noticeDays = contract?.noticePeriodDays || 365;
  const consentShare = NOTICE_PERIOD_OPTIONS.find(o => o.days === noticeDays)?.share ?? 40;
  const consentStart = contract?.signedAt || '2026-02-15T10:00:00Z';
  const consentEnd = (() => { const d = new Date(consentStart); d.setFullYear(d.getFullYear() + 1); return d.toISOString(); })();


  // «معلق بشري» badge: granted by the admin only (see AdminNarratorsView)
  const humanBadgeStatus: 'verified' | 'pending' | 'unverified' =
    narrator?.humanBadge === 'verified' ? 'verified' : narrator?.humanBadge === 'pending' ? 'pending' : 'unverified';
  // Granted by the admin only: once requested or granted, the steps are shown for reference but cannot be changed
  const verificationLocked = humanBadgeStatus !== 'unverified';
  const submitted = narrator?.humanVerification;
  const shownSelfie = verificationLocked ? submitted?.selfieUrl || null : selfiePhotoUrl;
  const shownVoiceUrl = verificationLocked ? submitted?.voiceUrl || '' : humanVoiceUrl;
  const shownRecorded = verificationLocked ? !!submitted : humanVoiceRecorded;
  const shownText = verificationLocked && submitted ? submitted.text : verificationText;


  return (
    <div className="h-screen flex overflow-hidden bg-[#FBFBFC] text-slate-900 font-sans text-right selection:bg-brand selection:text-white" dir="rtl">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

          <aside className="relative h-full w-64 shrink-0 flex flex-col bg-white border-l border-slate-200/80 select-none z-30">
            {/* Brand */}
            <div className="p-3.5 border-b border-slate-100">
              <div onClick={() => onNavigate('home')} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-lg bg-brand-ink text-white flex items-center justify-center font-black text-sm shrink-0">
                  <span className="text-brand-text">ق</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">قيمة فويس</h3>
                  <p className="text-[10px] text-slate-400 truncate">منصة المعلقين الصوتيين</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 custom-scrollbar">
              <div className="px-1.5">
            {/* Narrator Profile Widget in Sidebar */}
            <div className="flex items-center gap-3">
              <img
                src={narrator?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                alt={narrator?.displayName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {narrator?.displayName || 'المعلق الصوتي'}
                  </h3>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5" dir="ltr">
                  {narrator?.phone}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600">حساب موثق</span>
                  </span>
                  
                  {humanBadgeStatus === 'verified' && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                      <Mic className="w-2.5 h-2.5 text-blue-600" />
                      <span>معلق بشري</span>
                    </span>
                  )}
                  {humanBadgeStatus === 'pending' && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      <span>مراجعة الشارة</span>
                    </span>
                  )}
                  {humanBadgeStatus === 'unverified' && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-500">
                      بدون شارة بشرية
                    </span>
                  )}
                </div>
              </div>
            </div>

              </div>
              <nav className="space-y-0.5">
              <button
                onClick={() => navigateToSubPage('main')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group text-right cursor-pointer ${
                  currentSubPage === 'main' ? 'bg-brand-ink text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <LayoutDashboard className={`w-4 h-4 shrink-0 ${currentSubPage === 'main' ? 'text-brand-text' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span className="truncate">لوحة المعلق</span>
                </div>
              </button>
              <button
                onClick={() => navigateToSubPage('profile')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group text-right cursor-pointer ${
                  currentSubPage === 'profile' ? 'bg-brand-ink text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <User className={`w-4 h-4 shrink-0 ${currentSubPage === 'profile' ? 'text-brand-text' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span className="truncate">ملفي الشخصي</span>
                </div>
              </button>
              <button
                onClick={() => navigateToSubPage('samples')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group text-right cursor-pointer ${
                  currentSubPage === 'samples' ? 'bg-brand-ink text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Music className={`w-4 h-4 shrink-0 ${currentSubPage === 'samples' ? 'text-brand-text' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span className="truncate">عيناتي الصوتية</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${currentSubPage === 'samples' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{voiceSamples.length}/3</span>
              </button>
              <button
                onClick={() => navigateToSubPage('earnings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group text-right cursor-pointer ${
                  currentSubPage === 'earnings' ? 'bg-brand-ink text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Wallet className={`w-4 h-4 shrink-0 ${currentSubPage === 'earnings' ? 'text-brand-text' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span className="truncate">سجل الأرباح</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${currentSubPage === 'earnings' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>${earningsSummary.availableBalance.toFixed(0)}</span>
              </button>
              <button
                onClick={() => navigateToSubPage('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group text-right cursor-pointer ${
                  currentSubPage === 'settings' ? 'bg-brand-ink text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sliders className={`w-4 h-4 shrink-0 ${currentSubPage === 'settings' ? 'text-brand-text' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span className="truncate">أصواتي في الاستوديو</span>
                </div>
              </button>
              </nav>
            </div>

            <div className="p-3 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
            {/* Quick Balance & Payout Box in Sidebar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-ink to-brand-ink/90 text-white space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">الرصيد المتاح للسحب</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    ${earningsSummary.availableBalance.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">دولار</span>
                </div>
              </div>

              <button
                onClick={() => setIsPayoutSheetOpen(true)}
                className="w-full py-2 bg-brand hover:bg-brand-orange text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>سحب الأرباح الآن</span>
              </button>
            </div>

            {/* Logout button in sidebar */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigate('home')}
                className="w-full text-right px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>العودة للرئيسية</span>
              </button>
            </div>
            </div>
          </aside>

      {/* Main workspace: top bar + scrollable pages (same shell as the client dashboard) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      {/* Top Mobile/Header Strip */}
      <header className="relative z-40 shrink-0 bg-white border-b border-slate-200/80">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Current page title (the logo moved to the sidebar) */}
          <h1 className="text-sm sm:text-base font-black text-slate-900">
            {{ main: 'لوحة المعلق', profile: 'ملفي الشخصي', samples: 'عيناتي الصوتية', earnings: 'سجل الأرباح', settings: 'أصواتي في الاستوديو' }[currentSubPage]}
          </h1>

          {/* Top Actions: Notification bell + Quick preview switcher */}
          <div className="flex items-center gap-3">
            {/* Demo Narrator Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-xs">
              <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">معاينة الحساب:</span>
              <select
                value={selectedNarratorId}
                onChange={(e) => setSelectedNarratorId(e.target.value)}
                className="bg-transparent text-slate-800 font-bold text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="narrator_tareq_01">طارق الشمري (صوت ذكي منشور)</option>
                <option value="narrator_sara_02">سارة الدوسري (صوت ذكي لم يبدأ)</option>
                <option value="narrator_karim_03">كريم المنصور (صوت ذكي متوقف مؤقتاً)</option>
                <option value="narrator_nour_04">نور الهدى إبراهيم (حساب تجريبي)</option>
                {narratorList.filter(n => !n.id.startsWith('narrator_') || !/_0\d$/.test(n.id)).map(n => (
                  <option key={n.id} value={n.id}>{n.displayName} (حساب جديد)</option>
                ))}
              </select>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => {
                const opening = !isNotificationsOpen;
                setIsNotificationsOpen(opening);
                if (opening && narrator && notifications.some(n => !n.read)) {
                  narratorService.markNotificationsRead(narrator.id);
                  setTimeout(() => setNotifications(p => p.map(n => ({ ...n, read: true }))), 1500);
                }
              }}
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/60 flex items-center justify-center transition-colors relative cursor-pointer"
              title="الإشعارات"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center font-mono">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute left-4 top-16 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 text-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800">التنبيهات</span>
                  <span className="text-[10px] text-slate-400 font-mono">{notifications.length}</span>
                </div>
                <div className="space-y-2 text-slate-600 max-h-80 overflow-y-auto">
                  {notifications.length === 0 && <p className="text-center text-slate-400 py-4">لا توجد تنبيهات</p>}
                  {notifications.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-xl border ${n.type === 'sample_rejected' ? 'bg-rose-50/60 border-rose-100 text-rose-900' : !n.read ? 'bg-orange-50/60 border-orange-100 text-orange-900' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                      <p className="font-bold">{n.title}</p>
                      <p className="text-[10px] mt-0.5 opacity-80">{n.body}</p>
                      {n.reasons && n.reasons.length > 0 && (
                        <ul className="mt-1 list-disc pr-4 text-[10px] space-y-0.5">{n.reasons.map(r => <li key={r}>{r}</li>)}</ul>
                      )}
                      <p className="text-[9px] opacity-60 mt-1 font-mono">{fmtDateTime(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avatar Dropdown Menu (الملف الشخصي · العقد والموافقات · تسجيل الخروج) */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 transition-colors cursor-pointer"
                title="قائمة الحساب"
              >
                <img
                  src={narrator?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80'}
                  alt={narrator?.displayName}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                />
                <span className="text-xs font-bold text-slate-800 hidden md:inline">
                  {narrator?.displayName ? narrator.displayName.split(' ')[0] : 'المعلق'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute left-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs space-y-1 animate-fade-in">
                  <div className="px-3 py-2.5 border-b border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <img src={narrator?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80'} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{narrator?.displayName}</p>
                        <p className="text-[10px] text-slate-400 truncate" dir="ltr">{narrator?.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono" dir="ltr">{narrator?.phone}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {humanBadgeStatus === 'verified' && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">معلق بشري ✓</span>}
                      {humanBadgeStatus === 'pending' && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">طلب الشارة قيد المراجعة</span>}
                      {humanBadgeStatus === 'unverified' && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">بدون شارة</span>}
                      {narrator?.country && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">{narrator.country}</span>}
                    </div>
                    {(narrator?.dialects?.length ?? 0) > 0 && <p className="text-[10px] text-slate-500 leading-relaxed">اللهجات: {narrator!.dialects.join('، ')}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 px-1 py-1">
                    <div className="rounded-xl bg-slate-50 p-2 text-center"><p className="text-[9px] text-slate-400">العينات</p><p className="font-mono font-black text-slate-900">{voiceSamples.length}/3</p></div>
                    <div className="rounded-xl bg-slate-50 p-2 text-center"><p className="text-[9px] text-slate-400">سعر الدقيقة</p><p className="font-mono font-black text-slate-900">${fmtUsd(narrator?.rates?.perMinuteUsd ?? 0)}</p></div>
                    <div className="rounded-xl bg-emerald-50 p-2 text-center"><p className="text-[9px] text-emerald-600">الرصيد المتاح</p><p className="font-mono font-black text-emerald-700">${earningsSummary.availableBalance.toFixed(0)}</p></div>
                  </div>

                  <button
                    onClick={() => { setIsUserMenuOpen(false); navigateToSubPage('profile'); }}
                    className="w-full text-right px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-bold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" /><span>الملف الشخصي</span></span>
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); navigateToSubPage('samples'); }}
                    className="w-full text-right px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-bold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2"><Music className="w-3.5 h-3.5 text-slate-400" /><span>عيناتي الصوتية</span></span>
                    <span className="text-[10px] font-mono text-slate-400">{voiceSamples.length}/3</span>
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); navigateToSubPage('earnings'); }}
                    className="w-full text-right px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-bold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2"><Wallet className="w-3.5 h-3.5 text-slate-400" /><span>سجل الأرباح</span></span>
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); navigateToSubPage('settings'); }}
                    className="w-full text-right px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-bold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2"><Sliders className="w-3.5 h-3.5 text-slate-400" /><span>أصواتي في الاستوديو</span></span>
                  </button>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/70 custom-scrollbar">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">


            {/* ========================================================= */}
            {/* SUBPAGE 1: MAIN DASHBOARD */}
            {/* ========================================================= */}
            {currentSubPage === 'main' && (
              <div className="space-y-6 animate-fade-in">
                {/* Greeting */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    أهلًا {narrator?.displayName ? narrator.displayName.split(' ')[0] : 'طارق'} 👋
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    لوحة تحكمك الصوتية الموحدة • متابعة الأرباح، إدارة العينات المعتمدة، وضبط تراخيص صوتك الذكي
                  </p>
                </div>

                {/* BLOCK 1: MY VOICES IN THE TTS STUDIO (approved by the admin, read-only) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">أصواتي في استوديو TTS</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${studioVoices.length ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                        {studioVoices.length
                          ? `لديك ${studioVoices.length} ${studioVoices.length === 1 ? 'صوت معتمد' : 'أصوات معتمدة'} للتوليد، وتحصل على أرباح كل استخدام لها.`
                          : 'لا توجد أصوات معتمدة باسمك في الاستوديو حاليًا. تعتمدها إدارة قيمة فويس وتظهر هنا.'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigateToSubPage('settings')}
                      className="shrink-0 self-start sm:self-auto px-5 py-2.5 rounded-2xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-sm transition-all cursor-pointer"
                    >
                      استمع لأصواتي
                    </button>
                  </div>
                </div>

                {/* BLOCK 2: EARNINGS CARDS SPLIT BY SOURCE */}
                {(
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Card 1: Human Voice-over */}
                      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
                          <span>من التعليق الصوتي</span>
                          <Mic className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                            ${earningsSummary.voThisMonth}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">دولار</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">حجوزات الاستوديو البشري لهذا الشهر</span>
                      </div>

                      {/* Card 2: AI Voice */}
                      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
                          <span>من أصواتي في الاستوديو</span>
                          <Sparkles className="w-4 h-4 text-orange-700" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black font-mono text-orange-700">
                            ${earningsSummary.aiThisMonth}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">دولار</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">ترخيص التوليد الفوري بالذكاء الاصطناعي</span>
                      </div>
                    </div>

                    {/* Balance Line */}
                    <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-slate-600">
                        الإجمالي هذا الشهر: <strong className="font-mono text-slate-900">${earningsSummary.totalMonthly}</strong>
                        <span className="mx-2 text-slate-300">•</span>
                        رصيدك المتاح: <strong className="font-mono text-emerald-600 font-bold">${earningsSummary.availableBalance.toFixed(2)}</strong>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigateToSubPage('earnings')}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          سجل الأرباح ←
                        </button>
                        <button
                          onClick={() => setIsPayoutSheetOpen(true)}
                          className="px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          سحب الأرباح
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* BLOCK 3: LAST 5 USAGES */}
                {(
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">آخر الاستخدامات</h3>
                      <button
                        onClick={() => navigateToSubPage('earnings')}
                        className="text-xs font-bold text-orange-700 hover:text-orange-700 cursor-pointer transition-colors"
                      >
                        عرض الكل ←
                      </button>
                    </div>

                    {usageEvents.length === 0 ? (
                      <p className="text-center py-6 text-slate-400 text-xs">لم يُسجّل أي استخدام لصوتك بعد.</p>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {usageEvents.slice(0, 5).map(ev => (
                          <div key={ev.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-orange-400" />
                              <span className="font-bold text-slate-800">
                                {ev.voiceName} · {ev.chars.toLocaleString()} حرف
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {fmtDate(ev.createdAt)}
                              </span>
                            </div>

                            <span className="font-bold font-mono text-emerald-600 text-sm">
                              + ${ev.narratorEarning.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Row Links to Profile and Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => navigateToSubPage('profile')}
                    className="bg-white hover:bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between text-right text-slate-800 font-bold text-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span>ملفي الشخصي والعينات</span>
                        <span className="text-[10px] text-slate-400 font-normal block">تعديل بيانات التواصل والعينات الصوتية المعتمدة</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </button>

                  <button
                    onClick={() => navigateToSubPage('settings')}
                    className="bg-white hover:bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between text-right text-slate-800 font-bold text-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <span>أصواتي في الاستوديو</span>
                        <span className="text-[10px] text-slate-400 font-normal block">استمع لأصواتك المعتمدة وحصتك من كل استخدام</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* SUBPAGE 2: PROFILE PAGE «ملفي الشخصي» */}
            {/* ========================================================= */}
            {currentSubPage === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-black text-slate-900">ملفي الشخصي</h2>
                      {humanBadgeStatus === 'verified' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Mic className="w-3.5 h-3.5 text-blue-600" />
                          <span>معلق بشري معتمد ✓</span>
                        </span>
                      )}
                      {humanBadgeStatus === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>تحقق الهوية قيد المراجعة</span>
                        </span>
                      )}
                      {humanBadgeStatus === 'unverified' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          غير موثق بشرياً
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      بيانات التواصل الرسمية، العينات الصوتية، وتوثيق شارة «معلق بشري»
                    </p>
                  </div>
                  <button
                    onClick={() => navigateToSubPage('main')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>العودة للوحة المعلق</span>
                  </button>
                </div>

                {/* A) CONTACT INFO CARD «بيانات التواصل» */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-sm text-slate-900">بيانات التواصل</h3>
                    </div>
                    <span className="text-[10px] text-slate-400">تحديث فوري مع تحقق أمني</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Full Name (right) + Email (left) on one row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">الاسم الكامل *</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => {
                          setContactName(e.target.value);
                          if (contactErrors.name) setContactErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        placeholder="مثال: طارق الشمري"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors"
                      />
                      {contactErrors.name && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{contactErrors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => {
                          setContactEmail(e.target.value);
                          if (contactErrors.email) setContactErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        placeholder="name@domain.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors"
                        dir="ltr"
                      />
                      {contactErrors.email && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium text-right">{contactErrors.email}</p>
                      )}
                    </div>

                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                    {/* WhatsApp Phone with Country Code Picker */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">رقم واتساب للتواصل *</label>
                      <div className="flex gap-2" dir="ltr">
                        <div className="relative w-[108px] shrink-0">
                          <select
                            value={contactCountryCode}
                            onChange={(e) => setContactCountryCode(e.target.value)}
                            className="w-full h-[42px] appearance-none pl-3 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                          >
                            {COUNTRY_CODES.map(c => (
                              <option key={c.name} value={c.code}>{c.flag} {c.code}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        <input
                          type="tel"
                          value={contactPhoneLocal}
                          onChange={(e) => {
                            setContactPhoneLocal(e.target.value);
                            if (contactErrors.phone) setContactErrors(prev => ({ ...prev, phone: undefined }));
                          }}
                          placeholder="555 124 567"
                          className="flex-1 min-w-0 h-[42px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                      {contactErrors.phone && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{contactErrors.phone}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        * ملاحظة: تعديل البريد أو رقم الواتساب يتطلب إدخال رمز تحقق مكوّن من 6 أرقام لحماية حسابك.
                      </p>
                    </div>

                    {/* Country (Arab countries + other) */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">الدولة</label>
                      <div className="relative">
                        <select
                          value={contactCountryOther ? COUNTRY_OTHER : contactCountry}
                          onChange={(e) => {
                            const v = e.target.value;
                            setContactCountryOther(v === COUNTRY_OTHER);
                            setContactCountry(v === COUNTRY_OTHER ? '' : v);
                          }}
                          className="w-full h-[42px] appearance-none pr-4 pl-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                        >
                          <option value="">اختر الدولة</option>
                          {COUNTRY_CODES.filter(c => c.arab).map(c => (
                            <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                          ))}
                          <option value={COUNTRY_OTHER}>{COUNTRY_OTHER}</option>
                        </select>
                        <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      </div>
                      {contactCountryOther && (
                        <input
                          type="text"
                          value={contactCountry}
                          onChange={(e) => setContactCountry(e.target.value)}
                          placeholder="اكتب اسم الدولة"
                          className="mt-2 w-full h-[42px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                        />
                      )}
                    </div>
                    </div>

                    {/* Dialects */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">اللهجات</label>
                      <div className="flex flex-wrap gap-2">
                        {DIALECTS.map(d => d.key).map(key => {
                          const on = contactDialects.includes(key);
                          const flag = DIALECTS.find(d => d.key === key)?.flag;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setContactDialects(on ? contactDialects.filter(d => d !== key) : [...contactDialects, key])}
                              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer ${on ? 'bg-brand-ink text-white border-brand-ink' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'}`}
                            >
                              {flag ? `${flag} ` : ''}{key}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Prices (set by the Qeema team) */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">سعر الدقيقة ($)</label>
                        <input type="text" readOnly value={fmtUsd(narrator?.rates?.perMinuteUsd ?? 0)} dir="ltr"
                          className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">سعر الساعة ($)</label>
                        <input type="text" readOnly value={fmtUsd(narrator?.rates?.hourlyLiveDirectingUsd ?? 0)} dir="ltr"
                          className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed" />
                      </div>
                      <p className="sm:col-span-2 text-[10px] text-slate-400 -mt-2">* الأسعار يحدّدها فريق قيمة، ويرى العميل سعر الدقيقة شاملاً عمولة المنصة. للتعديل تواصل مع الدعم.</p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleSaveContactChanges}
                        className="w-full py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>حفظ التعديلات</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* C) HUMAN IDENTITY VERIFICATION & "HUMAN TALENT" BADGE CARD */}
                {/* «تحقق الهوية وشارة معلق بشري» */}
                <div className="bg-white rounded-3xl p-6 border-2 border-blue-500/30 shadow-sm space-y-6">
                  {/* Hidden Selfie File Input */}
                  <input
                    ref={selfieFileRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleSelfieSelect}
                  />

                  {/* Header & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-slate-900">تحقق الهوية وشارة «معلق بشري»</h3>
                          {humanBadgeStatus === 'verified' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                              <BadgeCheck className="w-3.5 h-3.5" />
                              <span>شارة معتمدة ✓</span>
                            </span>
                          )}
                          {humanBadgeStatus === 'pending' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>قيد التدقيق ⏳</span>
                            </span>
                          )}
                          {humanBadgeStatus === 'unverified' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              غير موثق
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          التحقق بصورة سيلفي حية وتسجيل صوتي لنص معتمد للحصول على شارة «معلق بشري» الرسمية أو إيقافها
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Top Status Notification Banner */}
                  {humanBadgeStatus === 'verified' && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                          <strong className="text-blue-950 font-black text-sm">
                            شارة «معلق بشري معتمد» مفعلة وتظهر على ملفك الشخصي
                          </strong>
                        </div>
                        <p className="text-blue-800 text-[11px] leading-relaxed">
                          ملفك موثق بنجاح بصورة السيلفي الحية والتسجيل الصوتي. تمنحك هذه الشارة أولوية الظهور للعملاء الباحثين عن تسجيلات بشرية في الاستوديو.
                        </p>
                      </div>

                      <div className="shrink-0 text-left sm:text-right font-mono text-[11px] text-blue-700 bg-white/80 px-3 py-1.5 rounded-xl border border-blue-200">
                        <span className="block font-bold">كود التوثيق: HUM-2026-9812</span>
                        <span className="text-[10px] text-slate-500">معتمد حتى فبراير 2027</span>
                      </div>
                    </div>
                  )}

                  {humanBadgeStatus === 'pending' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="text-amber-950 font-bold block text-sm">
                          طلب التحقق من الهوية قيد المراجعة والتدقيق ⏳
                        </strong>
                        <p className="text-amber-800 text-[11px] leading-relaxed">
                          تم استلام صورة السيلفي والتسجيل الصوتي الحي. يجري فريق ضبط الجودة مطابقة الصوت مع ملامح المعلق. يستغرق التحقق عادة من 15 دقيقة إلى ساعتين.
                        </p>
                      </div>
                    </div>
                  )}

                  {humanBadgeStatus === 'unverified' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
                      <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="text-slate-900 font-bold block text-sm">
                          أنت غير حاصل على شارة «معلق بشري» حالياً
                        </strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          لإثبات أنك معلق صوتي بشري حقيقي وتمييز حسابك عن النماذج الآلية أو الحصول على مشاريع الاستوديو، يرجى إتمام الخطوتين أدناه (سيلفي حي + تسجيل نص التحقق).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Two Main Verification Steps: interactive until the badge is requested, then read-only */}
                  {verificationLocked && (
                    <p className="text-[11px] text-slate-500">
                      {humanBadgeStatus === 'verified' ? 'اعتمدت الإدارة توثيقك. صورتك وتسجيلك معروضان ولا يمكن تعديلهما.' : submitted ? 'طلبك قيد مراجعة الإدارة. صورتك وتسجيلك معروضان ولا يمكن تعديلهما.' : ''}
                    </p>
                  )}
                  {(
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 pt-1 ${verificationLocked ? '[&_button:not([data-listen])]:pointer-events-none [&_button:not([data-listen])]:opacity-40' : ''}`}>
                    
                    {/* STEP 1: LIVE SELFIE PHOTO */}
                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-blue-600" />
                            <span>1. التقاط صورة سيلفي حية</span>
                          </span>
                          {shownSelfie ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>تم الالتقاط</span>
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${verificationLocked ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-800'}`}>
                              {verificationLocked ? 'لم يُرفع بعد' : 'مطلوب'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          التقط صورة ذاتية (Selfie) مباشرة لوجهك بإضاءة واضحة لمطابقتها مع هوية المعلق الصوتي.
                        </p>

                        {/* Selfie Preview or Capture Prompt */}
                        {shownSelfie ? (
                          <div className="pt-2">
                            <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md group">
                              <img
                                src={shownSelfie}
                                alt="Selfie Verification"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => selfieFileRef.current?.click()}
                                  className="p-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                                  title="تغيير الصورة"
                                >
                                  <Camera className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelfiePhotoUrl(null);
                                    setSelfieFileName(null);
                                    showToast('تم حذف صورة السيلفي');
                                  }}
                                  className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-lg text-[9px] font-bold shadow-xs flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            </div>
                            <span className="block text-center text-[10px] text-slate-400 font-mono mt-2 truncate">
                              {selfieFileName || 'live_selfie_verification.jpg'}
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={() => selfieFileRef.current?.click()}
                            className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 text-center transition-all cursor-pointer space-y-2"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                              <Camera className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-xs text-slate-800 block">
                              انقر لالتقاط صورة سيلفي بالكاميرا أو اختيار صورة
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              صيغة JPG أو PNG (الحد الأقصى 10MB)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Selfie Guidelines */}
                      <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>وجه واضح ومباشر نحو الكاميرا</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>بدون نظارات شمسية أو أقنعة أو فلاتر</span>
                        </div>
                      </div>

                      {/* Selfie Action Button */}
                      <button
                        type="button"
                        onClick={() => selfieFileRef.current?.click()}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>{shownSelfie ? 'التقاط صورة سيلفي أخرى' : 'التقاط صورة السيلفي'}</span>
                      </button>
                    </div>

                    {/* STEP 2: VOICE RECORDING OF TEXT */}
                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <Mic className="w-4 h-4 text-orange-700" />
                            <span>2. تسجيل صوتي حي لنص التحقق</span>
                          </span>
                          {shownRecorded ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{verificationLocked ? 'تم التسجيل' : `تم التسجيل (${humanVoiceDuration}ث)`}</span>
                            </span>
                          ) : isRecordingHumanVoice ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              <span>جاري التسجيل</span>
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${verificationLocked ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-800'}`}>
                              {verificationLocked ? 'لم يُرفع بعد' : 'مطلوب'}
                            </span>
                          )}
                        </div>

                        {shownText ? (
                          <>
                            <p className="text-[11px] text-slate-500">اقرأ النص التالي بصوتك الطبيعي الحي:</p>
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs leading-relaxed font-serif relative">
                              <span className="text-orange-700 font-black text-lg select-none">“</span>
                              <span className="font-bold text-slate-900">{shownText}</span>
                              <span className="text-orange-700 font-black text-lg select-none">”</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-[11px] text-slate-500">عند الضغط على «بدء تسجيل النص» يظهر لك نص عليك تسجيله بصوتك الآن</p>
                        )}

                        {/* Live Recording Box & Visual Feedback */}
                        {isRecordingHumanVoice ? (
                          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-3 animate-pulse">
                            <div className="flex items-center justify-center gap-2 text-rose-700 font-black text-sm">
                              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                              <span>جاري التسجيل المباشر... 00:{String(humanVoiceTimer).padStart(2, '0')}</span>
                            </div>

                            {/* Sound wave bars */}
                            <div className="flex items-center justify-center gap-1 h-8">
                              {[40, 70, 95, 60, 85, 100, 50, 75, 90, 45, 80, 65].map((h, idx) => (
                                <span
                                  key={idx}
                                  className="w-1 bg-rose-500 rounded-full animate-pulse"
                                  style={{ height: `${h}%`, animationDelay: `${idx * 80}ms` }}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={handleStopRecordHumanVoice}
                              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                            >
                              <Square className="w-3.5 h-3.5" />
                              <span>إنهاء التسجيل وحفظ العينة</span>
                            </button>
                          </div>
                        ) : shownRecorded ? (
                          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={handleTogglePlayHumanVoice}
                                data-listen
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                  isPlayingHumanVoice
                                    ? 'bg-emerald-600 text-white shadow-md animate-pulse'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                                title={isPlayingHumanVoice ? 'إيقاف' : 'الاستماع للتسجيل'}
                              >
                                {isPlayingHumanVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                              </button>
                              <div className="text-xs">
                                <span className="font-bold text-emerald-950 block">عينة التحقق الصوتي الحي</span>
                                <span className="text-[10px] text-emerald-700 font-mono">{verificationLocked ? 'مقطع التحقق المرسل للإدارة' : `المدة: ${humanVoiceDuration} ثوانٍ`}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleStartRecordHumanVoice}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                              title="تسجيل العينة من جديد"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>إعادة التسجيل</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                            <span className="text-[11px] text-slate-500 block mb-2">
                              انقر لبدء التسجيل بصوتك الآن عبر ميكروفون جهازك
                            </span>
                            <button
                              type="button"
                              onClick={handleStartRecordHumanVoice}
                              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                            >
                              <Mic className="w-4 h-4" />
                              <span>بدء تسجيل النص الآن</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Voice Recording Requirements */}
                      <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>صوت واضح وخالي من الموسيقى أو الفلاتر الاصطناعية</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>اقرأ النص كما هو بما فيه رمز التحقق</span>
                        </div>
                      </div>

                      {/* Voice Action Button */}
                      {!isRecordingHumanVoice && (
                        <button
                          type="button"
                          onClick={handleStartRecordHumanVoice}
                          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Mic className="w-3.5 h-3.5 text-orange-700" />
                          <span>{shownRecorded ? 'إعادة تسجيل عينة التحقق' : 'تسجيل النص الصوتي'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  )}

                  {/* Submit / Verification Execution Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {humanBadgeStatus === 'unverified' ? (
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 font-bold ${selfiePhotoUrl ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {selfiePhotoUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
                          <span>صورة السيلفي الحية</span>
                        </span>

                        <span className={`flex items-center gap-1 font-bold ${humanVoiceRecorded ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {humanVoiceRecorded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
                          <span>التسجيل الصوتي للنص</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        اكتمال الخطوتين يؤهلك مباشرة للاحتفاظ بشارة «معلق بشري» الموثقة
                      </span>
                    </div>
                    ) : <span />}
                    <div className="flex items-center gap-2">
                      {humanBadgeStatus === 'verified' ? (
                        <span className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center gap-1.5">
                          <BadgeCheck className="w-4 h-4" />
                          الشارة ممنوحة من إدارة قيمة ولا يمكن إلغاؤها من حسابك
                        </span>
                      ) : humanBadgeStatus === 'pending' ? (
                        <span className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          طلبك قيد مراجعة الإدارة
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitHumanVerification}
                          disabled={!selfiePhotoUrl || !humanVoiceRecorded || isSubmittingHumanVerification}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                        >
                          <BadgeCheck className="w-4 h-4" />
                          <span>{isSubmittingHumanVerification ? 'جاري الإرسال...' : 'إرسال طلب الحصول على شارة «معلق بشري» للإدارة'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* SUBPAGE: SAMPLES «عيناتي الصوتية» */}
            {/* ========================================================= */}
            {currentSubPage === 'samples' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-200/80 pb-4">
                  <h2 className="text-xl font-black text-slate-900">عيناتي الصوتية</h2>
                  <p className="text-xs text-slate-500 mt-0.5">العينات المعروضة للعملاء في مكتبة الأصوات. العينة بعد اعتمادها من الإدارة لا يمكن حذفها أو إلغاؤها.</p>
                </div>

                {/* B) VOICE SAMPLES CARD «عيناتي الصوتية» (MAX 3 SAMPLES) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-orange-700" />
                        <h3 className="font-bold text-sm text-slate-900">عيناتي الصوتية</h3>
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {voiceSamples.length} / 3 عينات
                        </span>
                      </div>
                      <p className="text-xs font-bold text-orange-700">
                        متاح إضافة 3 عينات بشرط التوافق مع شروط العينات في المنصة
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsGuidelinesOpen(!isGuidelinesOpen)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-blue-600" />
                        <span>شروط العينات</span>
                      </button>

                      <button
                        onClick={() => setIsAddSampleModalOpen(true)}
                        disabled={voiceSamples.length >= 3}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة عينة</span>
                      </button>
                    </div>
                  </div>

                  {/* Platform Sample Conditions Guideline Box */}
                  {(isGuidelinesOpen || voiceSamples.length === 0) && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-950 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between font-bold text-blue-900">
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                          <span>شروط العينات الصوتية المعتمدة في منصة قيمة فويس:</span>
                        </span>
                        <button
                          onClick={() => setIsGuidelinesOpen(false)}
                          className="text-blue-500 hover:text-blue-800 text-[11px]"
                        >
                          إغلاق
                        </button>
                      </div>
                      <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
                        <li><strong>نقاء التسجيل:</strong> خلو التسجيل بنسبة 100% من صدى الصوت والضوضاء والتشويش الخلفي.</li>
                        <li><strong>صوت خام نقي:</strong> عدم إضافة أي مؤثرات موسيقية أو أصداء غير طبيعية في الخلفية.</li>
                        <li><strong>جودة الملف:</strong> صيغة إم بي ثري الصوتية فقط (الحد الأقصى 20 ميجابايت) وبجودة استوديو احترافية.</li>
                      </ul>
                    </div>
                  )}

                  {/* Samples List */}
                  <div className="space-y-3">
                    {voiceSamples.length === 0 ? (
                      <p className="text-center py-6 text-slate-400 text-xs">لا توجد عينات صوتية مرفوعة حتى الآن. يمكنك إضافة حتى 3 عينات متوافقة مع الشروط.</p>
                    ) : (
                      voiceSamples.map(sample => {
                        const isPlaying = playingAudioId === sample.id;

                        return (
                          <div
                            key={sample.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              sample.status === 'rejected'
                                ? 'bg-rose-50/30 border-rose-100'
                                : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Left: Play button + Title + Badges */}
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleTogglePlayAudio(sample.id, sample.audioUrl)}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                    isPlaying
                                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 animate-pulse'
                                      : 'bg-slate-100 text-slate-700 hover:bg-orange-500 hover:text-white'
                                  }`}
                                  title={isPlaying ? 'إيقاف' : 'تشغيل العينة'}
                                >
                                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                </button>

                                <div className="space-y-1">
                                  <span className="font-bold text-slate-900 text-sm block">{sample.title}</span>
                                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                    <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold">
                                      {sample.category}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                      {sample.dialect}
                                    </span>
                                    <span className="font-mono text-slate-400 text-[10px]">
                                      {Math.floor(sample.durationSec / 60)}:{String(sample.durationSec % 60).padStart(2, '0')} دقيقة
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Minute Price (Always Displayed & Read-only) + Status Chip («معتمد») + Actions */}
                              <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                                <div 
                                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs flex items-center gap-1.5 font-bold"
                                  title="سعر الدقيقة"
                                >
                                  <span className="text-slate-500 font-medium text-[11px]">سعر الدقيقة:</span>
                                  <span className="font-mono text-sm text-slate-900 font-black">
                                    ${fmtUsd(sample.pricePerMinute || narrator?.rates?.perMinuteUsd || 0)} / دقيقة
                                  </span>
                                </div>

                                {/* Status Chip: «معتمد» instead of «منشورة» */}
                                {sample.status === 'published' && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>معتمد</span>
                                  </span>
                                )}

                                {sample.status === 'pending_review' && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>قيد المراجعة</span>
                                  </span>
                                )}

                                {sample.status === 'rejected' && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>مرفوضة</span>
                                  </span>
                                )}

                                {/* Action Buttons: Delete (pending/rejected) ONLY - NO HIDE BUTTON */}
                                {(sample.status === 'pending_review' || sample.status === 'rejected') && (
                                  <button
                                    onClick={() => handleDeleteSample(sample.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="حذف العينة"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Rejection Reason notice if rejected */}
                            {sample.status === 'rejected' && sample.rejectionReason && (
                              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-[11px] text-rose-800 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block">سبب الرفض وتوجيه الإدارة:</strong>
                                  <span>{sample.rejectionReason}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* SUBPAGE 3: EARNINGS PAGE «أرباحي» */}
            {/* ========================================================= */}
            {currentSubPage === 'earnings' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">سجل الأرباح</h2>
                    <p className="text-xs text-slate-500 mt-0.5">تفاصيل العوائد المالية من التعليق الصوتي وحجوزات الاستوديو وصوتك الذكي</p>
                  </div>
                  <button
                    onClick={() => navigateToSubPage('main')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>العودة للوحة المعلق</span>
                  </button>
                </div>

                {/* Available Balance & Payout Bar */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">الرصيد المتاح للسحب الفوري</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black font-mono text-emerald-600">
                        ${earningsSummary.availableBalance.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-slate-400">دولار</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPayoutSheetOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-orange-400" />
                    <span>سحب الأرباح</span>
                  </button>
                </div>

                {/* Tabs: «التعليق الصوتي» | «صوتي AI» */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                      <button
                        onClick={() => setEarningsTab('vo')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          earningsTab === 'vo'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        التعليق الصوتي ({voiceOverBookings.length})
                      </button>

                      <button
                        onClick={() => setEarningsTab('ai')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          earningsTab === 'ai'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        صوتي AI ({usageEvents.length})
                      </button>
                    </div>

                    {/* Month Selector */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-bold">الشهر:</span>
                      <select
                        value={selectedMonthFilter}
                        onChange={(e: any) => setSelectedMonthFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-bold text-xs focus:outline-hidden cursor-pointer"
                      >
                        <option value="all">كل الأشهر (آخر 3 أشهر)</option>
                        <option value="2026-10">أكتوبر 2026</option>
                        <option value="2026-09">سبتمبر 2026</option>
                        <option value="2026-08">أغسطس 2026</option>
                      </select>
                    </div>
                  </div>

                  {/* Tab 1: Human Voice-over bookings */}
                  {earningsTab === 'vo' && (
                    <div className="divide-y divide-slate-100">
                      {voiceOverBookings
                        .filter(b => selectedMonthFilter === 'all' || b.date.startsWith(selectedMonthFilter))
                        .length === 0 ? (
                        <p className="text-center py-8 text-slate-400 text-xs">لا توجد حجوزات في هذه الفترة.</p>
                      ) : (
                        voiceOverBookings
                          .filter(b => selectedMonthFilter === 'all' || b.date.startsWith(selectedMonthFilter))
                          .map(booking => {
                            const statusBadge = {
                              in_progress: { label: 'قيد التنفيذ', color: 'bg-amber-50 text-amber-700' },
                              completed: { label: 'مكتمل', color: 'bg-blue-50 text-blue-700' },
                              paid: { label: 'مدفوع', color: 'bg-emerald-50 text-emerald-700' }
                            }[booking.status];

                            return (
                              <div key={booking.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-900 block text-sm">{booking.projectTitle}</span>
                                  {booking.scriptText && (
                                    <p className="text-[11px] text-slate-600 line-clamp-2 max-w-md" title={booking.scriptText}>{booking.scriptText}</p>
                                  )}
                                  {booking.deadlineDays !== undefined && (
                                    <p className="text-[10px] text-slate-500">مدة التسليم: {booking.deadlineDays} أيام{booking.notes ? ` · ملاحظات: ${booking.notes}` : ''}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                    <span>{booking.date}</span>
                                    <span>•</span>
                                    <span className={`px-2 py-0.5 rounded-full font-sans font-bold text-[10px] ${statusBadge.color}`}>
                                      {statusBadge.label}
                                    </span>
                                  </div>
                                </div>

                                <span className="font-bold font-mono text-slate-900 text-base">
                                  ${booking.amount.toFixed(2)}
                                </span>
                              </div>
                            );
                          })
                      )}
                    </div>
                  )}

                  {/* Tab 2: AI Voice Usages (NEVER SHOW CLIENT NAMES) */}
                  {earningsTab === 'ai' && (
                    <div className="divide-y divide-slate-100">
                      {usageEvents
                        .filter(ev => selectedMonthFilter === 'all' || ev.createdAt.startsWith(selectedMonthFilter))
                        .length === 0 ? (
                        <p className="text-center py-8 text-slate-400 text-xs">لا توجد استخدامات لأصواتك في هذه الفترة.</p>
                      ) : (
                        usageEvents
                          .filter(ev => selectedMonthFilter === 'all' || ev.createdAt.startsWith(selectedMonthFilter))
                          .map(ev => (
                            <div key={ev.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                                  <span className="font-bold text-slate-900 text-sm">
                                    {ev.voiceName} · {ev.chars.toLocaleString()} حرف
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono block">
                                  {fmtDate(ev.createdAt)}
                                </span>
                              </div>

                              <span className="font-bold font-mono text-emerald-600 text-base">
                                + ${ev.narratorEarning.toFixed(2)}
                              </span>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* SUBPAGE 4: MY VOICES IN THE TTS STUDIO (read-only) */}
            {/* ========================================================= */}
            {currentSubPage === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-200/80 pb-4">
                  <h2 className="text-xl font-black text-slate-900">أصواتي في الاستوديو</h2>
                  <p className="text-xs text-slate-500 mt-0.5">الأصوات التي اعتمدتها إدارة قيمة فويس للتوليد في استوديو TTS. استمع إليها لتعرف أي صوت تحصل على أرباح عند استخدامه.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                  عند استخدام أي صوت من أصواتك في الاستوديو تُضاف حصتك إلى أرباحك، وتظهر في «سجل الأرباح».
                </div>

                {studioVoices.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center text-sm text-slate-400">لا توجد أصوات معتمدة باسمك في الاستوديو حتى الآن.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studioVoices.map(v => (
                      <div key={v.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        {v.avatar ? <img src={v.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0" /> : <span className="w-14 h-14 rounded-2xl bg-brand-ink text-white flex items-center justify-center font-black text-lg shrink-0">{v.name.charAt(0)}</span>}
                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="font-black text-sm text-slate-900 truncate">{v.name}</h3>
                          <p className="text-[11px] text-slate-500">{v.gender === 'male' ? 'رجالي' : 'نسائي'} • {v.dialectLabel} • {v.styleLabel}</p>
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">حصتك {v.sharePercent}% من كل استخدام</span>
                        </div>
                        <StudioVoicePlayer url={v.previewUrl} />
                      </div>
                    ))}
                  </div>
                )}

                {/* قسم "الموافقة والإقرار الرقمي المعتمد" */}
                <div className="bg-white rounded-3xl p-6 border-2 border-orange-500/30 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-black text-base text-slate-900">الموافقة والإقرار الرقمي المعتمد</h3>
                        <p className="text-xs text-slate-500 mt-0.5">اتفاقك مع قيمة فويس بشكل مبسّط</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>اتفاق ساري</span>
                      </span>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="طباعة العقد"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>طباعة</span>
                      </button>
                      <button
                        onClick={() => showToast('تم إعداد وتحميل نسخة وثيقة العقد الرقمية المعتمدة')}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-400" />
                        <span>تحميل وثيقة العقد</span>
                      </button>
                    </div>
                  </div>

                  {/* The terms in plain words */}
                  <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Check className="w-3 h-3 stroke-[3]" /></span>
                      <span>يُستخدم صوتك الذكي للعملاء عبر قيمة فويس فقط.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Check className="w-3 h-3 stroke-[3]" /></span>
                      <span>تحصل على <strong className="text-orange-700 font-mono">{consentShare}%</strong> من كل استخدام لصوتك.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Check className="w-3 h-3 stroke-[3]" /></span>
                      <span>الاتفاق من <strong className="font-mono text-slate-900">{fmtDate(consentStart)}</strong> إلى <strong className="font-mono text-slate-900">{fmtDate(consentEnd)}</strong>، ويتجدد سنويًا بموافقتك.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Check className="w-3 h-3 stroke-[3]" /></span>
                      <span>مجالات استخدام صوتك تحددها إدارة قيمة فويس.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Check className="w-3 h-3 stroke-[3]" /></span>
                      <span>تستطيع الانسحاب في أي وقت بإشعار مسبق مدته <strong className="text-slate-900">{noticeDays} يومًا</strong>، ثم يتوقف صوتك.</span>
                    </li>
                  </ul>

                  {/* Acknowledgement and signature */}
                  <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200/90 flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0" title="إقرار معتمد ولا يمكن تعديله">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-900 text-sm leading-relaxed">أقرّ بأنني قرأتُ هذه البنود ووافقتُ عليها.</p>
                      <p className="text-slate-500">الإقرار موثّق ولا يمكن تعديله.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-400 block font-medium">وقّع إلكترونيًا:</span>
                      <strong className="text-slate-900 font-black text-sm">{contract?.signatureName || narrator?.displayName}</strong>
                    </div>
                    <div className="text-right sm:text-left font-mono text-[11px] text-slate-500 space-y-0.5">
                      <p>بتاريخ {fmtDate(consentStart)} • IP: {contract?.ipAddress || '151.254.12.89'}</p>
                      <p className="text-emerald-700 font-bold">ختم زمني رقمي موثّق</p>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                    لسحب الموافقة أو إيقاف أحد أصواتك تواصل مع إدارة قيمة فويس، وتُطبَّق فترة الإشعار المذكورة أعلاه.
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: PAYOUT BOTTOM SHEET */}
      {/* ========================================================= */}
      {isPayoutSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl p-6 text-right space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">سحب الأرباح المتاحة</h3>
              <button
                onClick={() => setIsPayoutSheetOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {payoutSuccessMsg ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-slate-900">{payoutSuccessMsg}</p>
                <p className="text-xs text-slate-500">تتم معالجة التحويلات البنكية خلال 24 ساعة عمل.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المبلغ المطلوب سحبه (بالدولار)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    max={earningsSummary.availableBalance}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-900 focus:outline-hidden focus:border-orange-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    الحد الأقصى المتاح: ${earningsSummary.availableBalance.toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">طريقة استلام الأرباح</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        payoutMethod === 'bank'
                          ? 'border-orange-500 bg-orange-50/50 text-orange-950'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Building className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                      <span>تحويل بنكي (آيبان)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('wallet')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        payoutMethod === 'wallet'
                          ? 'border-orange-500 bg-orange-50/50 text-orange-950'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                      <span>محفظة رقمية محلية</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {payoutMethod === 'bank' ? 'رقم الحساب الدولي (الآيبان)' : 'رقم جوال المحفظة'}
                  </label>
                  <input
                    type="text"
                    value={payoutAccount}
                    onChange={(e) => setPayoutAccount(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                    dir="ltr"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleConfirmPayout}
                    className="w-full py-3 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    تأكيد طلب السحب
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: 6-DIGIT OTP VERIFICATION MODAL */}
      {/* ========================================================= */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 text-right space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">التحقق من بيانات التواصل الجديدة</h3>
              </div>
              <button
                onClick={() => {
                  setIsVerificationModalOpen(false);
                  setPendingVerificationData(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              لحماية حسابك، تم إرسال رمز تحقق مكوّن من 6 أرقام إلى:
              <br />
              <strong className="text-slate-900 font-mono text-sm block mt-1" dir="ltr">
                {verificationTargetDesc}
              </strong>
            </p>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1.5">
                أدخل رمز التحقق (6 أرقام):
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCodeInput}
                onChange={(e) => {
                  setOtpCodeInput(e.target.value.replace(/\D/g, ''));
                  setOtpError(null);
                }}
                placeholder="######"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-black text-xl tracking-widest text-slate-900 focus:outline-hidden focus:border-blue-500"
                dir="ltr"
              />
              {otpError && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{otpError}</p>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleConfirmVerificationOtp}
                disabled={isVerifyingOtp || otpCodeInput.length !== 6}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/25 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isVerifyingOtp ? 'جاري التحقق...' : 'تأكيد وحفظ البيانات'}</span>
              </button>
              <button
                onClick={() => {
                  setIsVerificationModalOpen(false);
                  setPendingVerificationData(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ADD VOICE SAMPLE FORM (MAX 3 SAMPLES) */}
      {/* ========================================================= */}
      {isAddSampleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[460px] bg-white rounded-3xl p-6 text-right space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-orange-700">
                <Music className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">إضافة عينة صوتية جديدة</h3>
                  <span className="text-[10px] text-slate-500 block">العينة رقم {voiceSamples.length + 1} من 3 عينات متاحة</span>
                </div>
              </div>
              <button
                onClick={() => setIsAddSampleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSample} className="space-y-4 text-xs">
              {/* Sample Title */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">عنوان العينة *</label>
                <input
                  type="text"
                  value={newSampleTitle}
                  onChange={(e) => setNewSampleTitle(e.target.value)}
                  placeholder="مثال: إعلان سيارة عائلية فاخرة أو رد آلي بنكي"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">التصنيف *</label>
                <select
                  value={newSampleCategory}
                  onChange={(e) => setNewSampleCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-orange-500 cursor-pointer"
                >
                  {SAMPLE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Dialect */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">اللهجة المعتمدة *</label>
                <input
                  type="text"
                  value={newSampleDialect}
                  onChange={(e) => setNewSampleDialect(e.target.value)}
                  placeholder="مثال: سعودي نجدي، فصحى معاصرة، خليجي عام..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              {/* Minute Price Display (Read-only, Cannot be modified by narrator) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-700 font-bold block">سعر الدقيقة المعتمد:</span>
                  <span className="text-[10px] text-slate-500">سعرك الخاص. يرى العميل السعر شاملاً عمولة المنصة ({PLATFORM_COMMISSION_PERCENT}%)</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-mono font-black text-slate-900 text-sm">
                  ${fmtUsd(narrator?.rates?.perMinuteUsd ?? 0)} / دقيقة
                </div>
              </div>

              {/* File Upload Simulation (Strictly MP3 only, Max 20MB) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  رفع الملف الصوتي (<span className="text-orange-700 font-black">صيغة إم بي ثري الصوتية فقط</span>، الحد الأقصى 20 ميجابايت) *
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) acceptSampleFile(file);
                  }}
                  className="p-5 border-2 border-dashed border-slate-200 hover:border-orange-500 rounded-2xl bg-slate-50 text-center space-y-2 cursor-pointer transition-colors group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="audio/*"
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs">
                      {newSampleFileName || 'انقر لاختيار ملف صوتي أو سحبه هنا'}
                    </p>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      {newSampleFileName 
                        ? `✓ تم اعتماد واختيار الملف: ${newSampleFileName}` 
                        : `صيغة MP3 فقط، ومدة لا تتجاوز ${SAMPLE_RULES.maxDurationSec} ثانية. العينة المخالفة تُرفض تلقائياً`}
                    </span>
                  </div>
                  {!newSampleFileName && (
                    <div className="pt-1">
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSampleFormError(null);
                          setNewSampleFile(null);
                          setNewSampleFileName('عينة_صوتية_استوديو_نقية.mp3');
                        }}
                        className="inline-block text-[10px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 cursor-pointer"
                      >
                        ⚡ تجربة عينة صوتية جاهزة للمعاينة
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Guidelines reminder notice */}
              <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-[11px] text-orange-950 space-y-1">
                <span className="font-bold block">ملاحظة التوافق مع شروط المنصة:</span>
                <p className="text-slate-700">
                  متاح إضافة 3 عينات بشرط التوافق مع شروط العينات في المنصة: جودة الملف: <strong>صيغة صوتية نقية</strong>، ونقاء التسجيل وعزل الصدى والضوضاء، وتقديم صوت خام نقي ومباشر بدون موسيقى خلفية.
                </p>
              </div>

              {sampleFormError && (
                <p className="text-[11px] text-rose-500 font-medium">{sampleFormError}</p>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingSample}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmittingSample ? 'جاري الرفع...' : 'رفع العينة للاعتماد'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddSampleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
