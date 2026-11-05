import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  X, 
  Clock, 
  BookOpen, 
  Video, 
  Globe, 
  Sliders, 
  FileAudio, 
  Lightbulb, 
  ThumbsUp, 
  Volume2, 
  ArrowLeft, 
  ArrowRight, 
  HelpCircle, 
  Wand2,
  ShieldCheck,
  Bot,
  ChevronDown,
  Headphones,
  Radio,
  FileText
} from 'lucide-react';
import { ActiveView, Voice } from '../types';

interface VoiceCloneViewProps {
  onNavigate: (view: ActiveView, tab?: 'human' | 'ai' | 'my-voices') => void;
  onOpenSignup?: () => void;
  onVoiceCloned?: (newVoice: any) => void;
}

interface LabelPair {
  id: string;
  label: string;
  value: string;
}

export type PlanKey = 'starter' | 'creator' | 'pro' | 'scale' | 'business';

export interface PlanDetail {
  id: PlanKey;
  label: string;
  hours: string;
  monthlyPrice: number;
  monthlyOriginalPrice?: number;
  monthlyDiscountBadge?: string;
  annualMonthlyPrice: number;
  annualOriginalPrice?: number;
  annualBadge?: string;
  payAsYouGo: boolean;
}

export const PLAN_DATA: Record<PlanKey, PlanDetail> = {
  starter: {
    id: 'starter',
    label: 'المبتدئ',
    hours: '~30 دقيقة توليد صوت شهرياً',
    monthlyPrice: 5,
    monthlyOriginalPrice: 10,
    annualMonthlyPrice: 4.17,
    annualOriginalPrice: 5,
    annualBadge: 'شهران مجاناً',
    payAsYouGo: false
  },
  creator: {
    id: 'creator',
    label: 'صانع المحتوى',
    hours: '~ساعتان توليد صوت شهرياً',
    monthlyPrice: 11,
    monthlyOriginalPrice: 22,
    monthlyDiscountBadge: 'الشهر الأول بـ $11 فقط',
    annualMonthlyPrice: 18.33,
    annualOriginalPrice: 22,
    annualBadge: 'شهران مجاناً',
    payAsYouGo: true
  },
  pro: {
    id: 'pro',
    label: 'المحترف',
    hours: '~10 ساعات توليد صوت شهرياً',
    monthlyPrice: 99,
    annualMonthlyPrice: 82.50,
    annualOriginalPrice: 99,
    annualBadge: 'شهران مجاناً',
    payAsYouGo: true
  },
  scale: {
    id: 'scale',
    label: 'التوسع والنمو',
    hours: '~30 ساعة توليد صوت شهرياً',
    monthlyPrice: 299,
    annualMonthlyPrice: 249.17,
    annualOriginalPrice: 299,
    annualBadge: 'شهران مجاناً',
    payAsYouGo: true
  },
  business: {
    id: 'business',
    label: 'الشركات والأعمال',
    hours: '~100 ساعة توليد صوت شهرياً',
    monthlyPrice: 990,
    annualMonthlyPrice: 825,
    annualOriginalPrice: 990,
    annualBadge: 'شهران مجاناً',
    payAsYouGo: true
  }
};

// Mathematically generated 3D particle sphere points matching the screenshots
const SPHERE_POINTS = (() => {
  const points: { cx: number; cy: number; r: number; opacity: number }[] = [];
  const numPoints = 280;
  const radius = 80;
  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = i * 2.399963229728653; // golden angle
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    const depth = (z + 1) / 2; // 0 (back) to 1 (front)
    const cx = 130 + x * radius;
    const cy = 130 + y * radius;
    const r = 0.7 + depth * 1.5;
    const opacity = 0.22 + depth * 0.78;
    points.push({ cx, cy, r, opacity });
  }
  return points;
})();

// Verification reading quotes (default is the exact sentence from Image 2)
const VERIFICATION_QUOTES = [
  'نجاحك في الحياة لا يعتمد على القوة أو السرعة، بل على الاستمرارية.',
  'الصوت هو البصمة التي تمنح الكلمات روحاً ومعنى يتجاوز حدود المكان والزمان.',
  'التميز ليس فعلاً عابراً، بل عادة يومية تصنع أثراً حقيقياً لا يزول.'
];

// Completely DIFFERENT sentence for the newly published cloned voice on the platform
const PLATFORM_DEPLOYED_SENTENCE = 
  'مرحباً بكم في منصة قيمة فويس! يسعدني التحدث إليكم بنبرة صوتي المعتمدة، حيث تمت محاكاة بصمتي الصوتية بدقة استوديو نقية لدعم مشاريعكم الإعلانية والوثائقية بكل سلاسة واحترافية.';

export const VoiceCloneView: React.FC<VoiceCloneViewProps> = ({ onNavigate, onOpenSignup, onVoiceCloned }) => {
  // Stepper state: 1 = Upload Audio, 2 = Voice Information
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Subscription state: User with active subscription can clone immediately
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);

  // Post-Clone Verification & Launch Stages (Matching User Images 1, 2, 3, 4 + Final Platform Deployment):
  // 'idle' -> 'verify-prompt' (Img 1) -> 'countdown' -> 'recording-live' (Img 2) -> 'verify-complete' (Img 3) -> 'try-new-clone' (Img 4) -> 'published-on-platform'
  const [cloneStage, setCloneStage] = useState<'idle' | 'verify-prompt' | 'countdown' | 'recording-live' | 'verify-complete' | 'try-new-clone' | 'published-on-platform'>('idle');

  // Upgrade Modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Step 1: Audio state
  const [hasUploadedFile, setHasUploadedFile] = useState(true);
  const [fileName, setFileName] = useState('عينة_تسجيل_توأم_صوتي_نقي.mp3');
  const [fileDuration, setFileDuration] = useState('02:12');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [removeBackgroundNoise, setRemoveBackgroundNoise] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Audio element simulation
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<any>(null);

  // Step 2: Voice details state
  const [voiceName, setVoiceName] = useState('صوتي التجاري الفخم');
  const [labels, setLabels] = useState<LabelPair[]>([
    { id: '1', label: 'اللغة', value: 'العربية الفصحى' },
    { id: '2', label: 'اللهجة', value: 'سعودي وقور' }
  ]);
  const [voiceDescription, setVoiceDescription] = useState('نبرة صوتية جهورية متزنة ذات مخارج حروف واضحة، مناسبة للإعلانات الترويجية والتقارير الوثائقية والبودكاست.');
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(true);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Step 3 (Upgrade Modal) state
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'creator' | 'pro' | 'scale' | 'business'>('creator');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  // Stage 1 & 2 Verification Live State
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [verificationQuoteIndex, setVerificationQuoteIndex] = useState(0);
  const [verificationSeconds, setVerificationSeconds] = useState(0);
  const verificationTimerRef = useRef<any>(null);

  // Platform Audio Playback for the completely different sentence
  const [isPlayingPlatformSample, setIsPlayingPlatformSample] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Recording simulation for Step 1
  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      setHasUploadedFile(true);
      setFileName(`تسجيل_ميكروفون_مباشر_${recordingSeconds}s.wav`);
      setFileDuration(`00:${recordingSeconds < 10 ? '0' + recordingSeconds : recordingSeconds}`);
      setRecordingSeconds(0);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (verificationTimerRef.current) clearInterval(verificationTimerRef.current);
    };
  }, []);

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileDuration('01:45');
      setHasUploadedFile(true);
    }
  };

  // Drag and Drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setFileDuration('02:05');
      setHasUploadedFile(true);
    }
  };

  // Add Label
  const addLabel = () => {
    const newId = String(Date.now());
    setLabels(prev => [...prev, { id: newId, label: 'النبرة', value: 'احترافي ومقنع' }]);
  };

  const removeLabel = (id: string) => {
    setLabels(prev => prev.filter(l => l.id !== id));
  };

  const updateLabel = (id: string, field: 'label' | 'value', val: string) => {
    setLabels(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));
  };

  // Audio Playback simulation
  const togglePlaySample = () => {
    setIsPlayingAudio(prev => !prev);
  };

  const togglePlayPreview = () => {
    setIsPlayingPreview(prev => !prev);
  };

  // Handle Generate and Save Voice
  const handleGenerateAndSaveVoice = () => {
    if (!voiceName.trim() || !hasAgreedToTerms) return;
    setIsGeneratingVoice(true);
    setTimeout(() => {
      setIsGeneratingVoice(false);
      if (isSubscribed) {
        // User is subscribed: direct to verification flow (Image 1)
        setCloneStage('verify-prompt');
      } else {
        // User not subscribed: show Arabic Upgrade Modal
        setShowUpgradeModal(true);
      }
    }, 850);
  };

  // Subscribing from the Upgrade Modal immediately activates subscription and moves to Verification (Image 1)
  const handleSubscribeFromModal = () => {
    setIsSubscribed(true);
    setShowUpgradeModal(false);
    setCloneStage('verify-prompt');
  };

  // Start Verification with Countdown (1-3)
  const startVerificationCountdown = () => {
    setCloneStage('countdown');
    setCountdownValue(3);

    const countInterval = setInterval(() => {
      setCountdownValue(prev => {
        if (prev <= 1) {
          clearInterval(countInterval);
          // Start live recording stage (Image 2)
          startLiveRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 900);
  };

  // Start Live Recording Stage (Image 2)
  const startLiveRecording = () => {
    setCloneStage('recording-live');
    setVerificationSeconds(1);

    if (verificationTimerRef.current) clearInterval(verificationTimerRef.current);
    verificationTimerRef.current = setInterval(() => {
      setVerificationSeconds(prev => {
        if (prev >= 15) {
          clearInterval(verificationTimerRef.current);
          handleFinishVerificationRecording();
          return 15;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Finish Recording (Image 3)
  const handleFinishVerificationRecording = () => {
    if (verificationTimerRef.current) clearInterval(verificationTimerRef.current);
    setCloneStage('verify-complete');
  };

  // Move from Verification Complete to Try Out (Image 4)
  const handleProceedToTryClone = () => {
    setCloneStage('try-new-clone');
  };

  // Deploy Voice on the platform with completely DIFFERENT sentence
  const handleDeployToPlatform = (targetAction?: 'generate' | 'chat' | 'story' | 'library') => {
    const newClonedVoice: Voice = {
      id: `cloned-voice-${Date.now()}`,
      type: 'ai',
      name: voiceName.trim() || 'توأم صوتي ذكي مخصص',
      nameEn: 'Custom Cloned Voice',
      gender: 'male',
      language: 'العربية',
      dialect: 'gulf',
      dialectLabel: labels.find(l => l.label === 'اللهجة')?.value || 'سعودي وقور',
      style: 'commercial',
      styleLabel: labels.find(l => l.label === 'النبرة')?.value || 'احترافي ومقنع',
      useCases: ['إعلان', 'وثائقي', 'بودكاست'],
      provider: 'Qeema Acoustic Engine v3.2',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      description: PLATFORM_DEPLOYED_SENTENCE,
      subtitle: 'توأم صوتي مستنسخ حديثاً وموثق رقمياً بنجاح',
      isVerified: true
    };

    // Save to local storage for persistence across views
    try {
      const existing = JSON.parse(localStorage.getItem('qeema_cloned_voices') || '[]');
      localStorage.setItem('qeema_cloned_voices', JSON.stringify([newClonedVoice, ...existing]));
    } catch {
      // ignore
    }

    if (onVoiceCloned) {
      onVoiceCloned(newClonedVoice);
    }

    setCloneStage('published-on-platform');

    if (targetAction === 'generate') {
      setTimeout(() => onNavigate('generate'), 1200);
    } else if (targetAction === 'library') {
      setTimeout(() => onNavigate('voice-library', 'ai'), 1200);
    }
  };

  // Playback simulation for the brand-new deployed sentence
  const handlePlayPlatformSentence = () => {
    if (isPlayingPlatformSample) {
      window.speechSynthesis?.cancel();
      setIsPlayingPlatformSample(false);
      return;
    }

    setIsPlayingPlatformSample(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(PLATFORM_DEPLOYED_SENTENCE);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingPlatformSample(false);
      utterance.onerror = () => setIsPlayingPlatformSample(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingPlatformSample(false), 4500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 py-8 px-4 sm:px-6 lg:px-8 selection:bg-brand selection:text-white" dir="rtl">
      
      {/* Hidden audio element for preview */}
      <audio 
        ref={audioPlayerRef} 
        src="https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3" 
        onEnded={() => { setIsPlayingAudio(false); setIsPlayingPreview(false); }}
      />

      {/* Subscription Mode Indicator & Fast Switcher (Arabic only) */}
      <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-700">حالة الاشتراك في استنساخ الصوت:</span>
          {isSubscribed ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              مشترك (باقة صانع المحتوى نشطة ✓)
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
              باقة مجانية (تتطلب الترقية للاستنساخ)
            </span>
          )}
        </div>

        <button
          onClick={() => setIsSubscribed(!isSubscribed)}
          className="px-3 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold shadow-2xs transition-colors cursor-pointer"
        >
          {isSubscribed ? 'اختبار تجربة غير المشترك (عرض نافذة الترقية)' : 'تفعيل الاشتراك (اختبار استنساخ المشتركين)'}
        </button>
      </div>

      {/* Outer Studio Card Container */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/[0.03] overflow-hidden p-6 sm:p-10">
        
        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ========================================================================= */}
          {/* RIGHT SIDEBAR (In RTL: Stepper & Navigation matching left bar in images)  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 border-l border-slate-100 pl-0 lg:pl-8 flex flex-col justify-between space-y-8">
            
            <div className="space-y-6">
              {/* Top Spinner / Lightning Badge Button */}
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                <Sparkles className="w-4 h-4 text-brand-text animate-pulse" />
              </div>

              {/* Step Title */}
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  استنساخ الصوت الفوري
                </h2>
                <span className="text-[11px] text-orange-700 font-bold">بتقنية المحاكاة العصبية المتقدمة</span>
              </div>

              {/* Stepper List */}
              <nav className="space-y-4 text-xs font-semibold">
                
                {/* Step 1: Upload Audio */}
                <div 
                  onClick={() => {
                    if (cloneStage === 'idle') setCurrentStep(1);
                  }}
                  className={`flex items-center gap-2.5 transition-colors ${
                    cloneStage !== 'idle'
                      ? 'text-emerald-700 font-bold'
                      : currentStep === 1 
                        ? 'text-slate-950 font-bold' 
                        : hasUploadedFile 
                          ? 'text-slate-700 hover:text-slate-900 cursor-pointer' 
                          : 'text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    cloneStage !== 'idle'
                      ? 'bg-emerald-500'
                      : currentStep === 1 
                        ? 'bg-slate-900' 
                        : hasUploadedFile 
                          ? 'bg-emerald-500' 
                          : 'bg-slate-300'
                  }`} />
                  <span>رفع العينة الصوتية</span>
                </div>

                {/* Step 2: Voice Information */}
                <div 
                  onClick={() => {
                    if (cloneStage === 'idle' && hasUploadedFile) setCurrentStep(2);
                  }}
                  className={`flex items-center gap-2.5 transition-colors ${
                    cloneStage !== 'idle'
                      ? 'text-emerald-700 font-bold'
                      : currentStep === 2 
                        ? 'text-slate-950 font-bold' 
                        : hasUploadedFile 
                          ? 'text-slate-700 hover:text-slate-900 cursor-pointer' 
                          : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    cloneStage !== 'idle'
                      ? 'bg-emerald-500'
                      : currentStep === 2 ? 'bg-slate-900' : 'bg-slate-300'
                  }`} />
                  <span>معلومات ومواصفات الصوت</span>
                </div>

                {/* Step 3: Finish up & Verification */}
                <div 
                  className={`flex items-center gap-2.5 transition-colors ${
                    cloneStage !== 'idle' ? 'text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    cloneStage !== 'idle' ? 'bg-slate-900' : 'bg-slate-300'
                  }`} />
                  <span>الإنهاء والتوثيق</span>
                </div>
              </nav>
            </div>

            {/* Bottom Feedback Button */}
            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                ملاحظات ومساعدة
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MAIN WORKFLOW AREA                                                        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* ----------------------------------------------------------------------- */}
            {/* STAGE A: IDLE STEPS 1 & 2                                               */}
            {/* ----------------------------------------------------------------------- */}
            {cloneStage === 'idle' && (
              <>
                {/* STEP 1: UPLOAD AUDIO */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    
                    {/* 3 Top Guidelines Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                      <div className="space-y-2 text-right">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">تجنب الأماكن المزعجة</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          الأصوات الخلفية والصدى تؤثر سلباً على نقاء الصوت وجودة الاستنساخ النهائية.
                        </p>
                      </div>

                      <div className="space-y-2 text-right">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ThumbsUp className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">تحقق من جودة الميكروفون</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          استخدم ميكروفوناً خارجياً أو سماعات رأس لالتقاط الترددات الصوتية بدقة.
                        </p>
                      </div>

                      <div className="space-y-2 text-right">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Mic className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">استخدم نفس المعدات</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          لا تقم بتغيير جهاز التسجيل أو الغرفة بين مقاطع العينات الصوتية.
                        </p>
                      </div>
                    </div>

                    {/* Dropzone Box */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-slate-300/80 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50/80 rounded-3xl p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center space-y-4"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="audio/*,video/*"
                        className="hidden"
                      />

                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <Upload className="w-5 h-5 text-slate-800" />
                      </div>

                      <div className="space-y-1">
                        <p 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm font-bold text-slate-900 cursor-pointer hover:text-brand-text transition-colors"
                        >
                          اضغط للرفع، أو اسحب وأفلت الملف الصوتي هنا
                        </p>
                        <p className="text-xs text-slate-500">
                          ملفات صوتية أو فيديو بحجم يصل إلى 10 ميجابايت لكل ملف بمختلف الصيغ النقية
                        </p>
                      </div>

                      <div className="flex items-center gap-3 w-full max-w-xs justify-center py-1">
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="text-[11px] text-slate-400 font-bold uppercase">أو</span>
                        <div className="h-px bg-slate-200 flex-1" />
                      </div>

                      {/* Record Audio Button */}
                      <button
                        onClick={toggleRecording}
                        className={`px-5 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                          isRecording 
                            ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse' 
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                            <span>إيقاف التسجيل ({recordingSeconds} ثانية)</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 text-slate-600" />
                            <span>تسجيل صوتي حي مباشر</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Uploaded Audio Item Card */}
                    {hasUploadedFile && (
                      <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={togglePlaySample}
                              className="w-8 h-8 rounded-full bg-brand-ink text-white flex items-center justify-center hover:bg-brand-ink/90 transition-colors cursor-pointer"
                              title={isPlayingAudio ? 'إيقاف مؤقت' : 'تشغيل العينة'}
                            >
                              {isPlayingAudio ? (
                                <Pause className="w-3.5 h-3.5 fill-white" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-white mr-0.5" />
                              )}
                            </button>
                            <div>
                              <div className="text-xs font-mono font-bold text-slate-800 dir-ltr text-right truncate max-w-xs sm:max-w-md">
                                {fileName}
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">{fileDuration}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setHasUploadedFile(false)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="حذف العينة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Checkbox: Remove background noise */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={removeBackgroundNoise}
                            onChange={(e) => setRemoveBackgroundNoise(e.target.checked)}
                            className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-800">
                            إزالة الضوضاء والأصوات الخلفية من التسجيلات الصوتية تلقائياً
                          </span>
                        </label>

                        {/* Status: Ready */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>جاهز للاعتماد - يمكنك إضافة المزيد من التسجيلات لتوأم صوتي أكثر دقة وواقعية.</span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Bar with Next Button */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <span className={`w-2.5 h-2.5 rounded-full border ${hasUploadedFile ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400'}`} />
                        <span>مطلوب 10 ثوانٍ على الأقل من الصوت الصافي</span>
                      </div>

                      <button
                        disabled={!hasUploadedFile}
                        onClick={() => setCurrentStep(2)}
                        className={`px-8 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                          hasUploadedFile
                            ? 'bg-brand-ink hover:bg-brand-ink/90 text-white cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>التالي</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: VOICE INFORMATION */}
                {currentStep === 2 && (
                  <div className="space-y-7 animate-in fade-in duration-200">
                    
                    {/* Voice Avatar & Preview Button */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-yellow via-amber-500 to-purple-600 shadow-md flex items-center justify-center text-white overflow-hidden p-0.5">
                          <div className="w-full full rounded-full bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <button 
                          className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
                          title="تغيير المظهر"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={togglePlayPreview}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-xs transition-colors cursor-pointer"
                      >
                        {isPlayingPreview ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-slate-800" />
                            <span>إيقاف المعاينة</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-slate-800 mr-0.5" />
                            <span>معاينة الصوت</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Field 1: Name */}
                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-slate-900">اسم الصوت</label>
                      <input
                        type="text"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        placeholder="مثال: نبرتي الوثائقية السعودية / صوتي التجاري الخاص"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                      />
                    </div>

                    {/* Field 2: Labels and Values with Add Label */}
                    <div className="space-y-3 text-right">
                      <div className="grid grid-cols-2 gap-4">
                        <label className="text-xs font-bold text-slate-900">التصنيف</label>
                        <label className="text-xs font-bold text-slate-900">القيمة</label>
                      </div>

                      {labels.map((item) => (
                        <div key={item.id} className="grid grid-cols-2 gap-4 items-center">
                          <select
                            value={item.label}
                            onChange={(e) => updateLabel(item.id, 'label', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-900"
                          >
                            <option value="اللغة">اللغة</option>
                            <option value="اللهجة">اللهجة</option>
                            <option value="الجنس">الجنس</option>
                            <option value="النبرة">النبرة</option>
                            <option value="الاستخدام">مجال الاستخدام</option>
                          </select>

                          <div className="flex items-center gap-2">
                            <select
                              value={item.value}
                              onChange={(e) => updateLabel(item.id, 'value', e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-900"
                            >
                              <option value="العربية الفصحى">العربية الفصحى</option>
                              <option value="سعودي وقور">سعودي وقور</option>
                              <option value="خليجي أبيض">خليجي أبيض</option>
                              <option value="مصري إعلاني">مصري إعلاني</option>
                              <option value="شامي دافئ">شامي دافئ</option>
                              <option value="احترافي ومقنع">احترافي ومقنع</option>
                              <option value="سرد قصصي وكتب">سرد قصصي وكتب</option>
                            </select>

                            {labels.length > 1 && (
                              <button
                                onClick={() => removeLabel(item.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="حذف"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addLabel}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors mt-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>إضافة تصنيف جديد</span>
                      </button>
                    </div>

                    {/* Field 3: Description */}
                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-slate-900">الوصف التعريفي</label>
                      <textarea
                        rows={3}
                        value={voiceDescription}
                        onChange={(e) => setVoiceDescription(e.target.value)}
                        placeholder="اكتب وصفاً مفصلاً لطبيعة ونبرة الصوت واستخداماته المثالية..."
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none"
                      />
                    </div>

                    {/* Terms and Consent Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasAgreedToTerms}
                          onChange={(e) => setHasAgreedToTerms(e.target.checked)}
                          className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 mt-0.5 cursor-pointer shrink-0"
                        />
                        <span className="text-[11px] text-slate-600 leading-relaxed">
                          أقر وأؤكد بأن لدي جميع الحقوق والموافقات القانونية اللازمة لرفع واستنساخ هذه العينات الصوتية، وأنني لن أستخدم المحتوى الصوتي المُولّد لأي غرض غير قانوني أو احتيالي أو ضار. كما أؤكد التزامي التام بشروط خدمة منصة قيمة (قيمة فويس)، وسياسة الاستخدام المعتمد، وحماية الملكية الفكرية.
                        </span>
                      </label>
                    </div>

                    {/* Bottom Bar: Back & Generate & Save Voice */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        السابق
                      </button>

                      <button
                        disabled={!voiceName.trim() || !hasAgreedToTerms || isGeneratingVoice}
                        onClick={handleGenerateAndSaveVoice}
                        className={`px-8 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                          voiceName.trim() && hasAgreedToTerms && !isGeneratingVoice
                            ? 'bg-brand-ink hover:bg-brand-ink/90 text-white cursor-pointer shadow-slate-950/20'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isGeneratingVoice ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-text" />
                            <span>جاري توليد واستنساخ الصوت...</span>
                          </>
                        ) : (
                          <>
                            <span>توليد الصوت وحفظه</span>
                            <Sparkles className="w-3.5 h-3.5 text-brand-text" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* STAGE B: IMAGE 1 - WOULD YOU LIKE TO VERIFY YOUR VOICE? (OPTIONAL)     */}
            {/* ----------------------------------------------------------------------- */}
            {cloneStage === 'verify-prompt' && (
              <div className="space-y-6 animate-in fade-in duration-300 text-right">
                {/* Header matching Image 1 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      هل ترغب في توثيق بصمتك الصوتية؟
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      اختياري
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    قد تحصل الأصوات الموثقة على مزايا وإمكانيات إضافية ومصداقية أعلى مستقبلاً.
                  </p>
                </div>

                {/* Big Verification Container matching Image 1 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {/* Top Prompt Text Area */}
                  <div className="py-20 px-6 sm:px-12 text-center max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[220px]">
                    <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed max-w-xl">
                      سجّل صوتك وأنت تقرأ النص الذي سيظهر على الشاشة، مع التأكد من أن جودة التسجيل مطابقة لجودة عيناتك الصوتية المرفوعة.
                    </p>
                  </div>

                  {/* Bottom Microphone Control Bar */}
                  <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Dotted sound wave line */}
                    <div className="text-slate-300 font-mono tracking-widest text-sm select-none hidden sm:block">
                      ................................
                    </div>

                    {/* Enable Microphone Button (Pill shaped) */}
                    <button
                      onClick={startVerificationCountdown}
                      className="px-6 py-3 rounded-full bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs flex items-center gap-2.5 shadow-md shadow-slate-950/15 transition-all cursor-pointer"
                    >
                      <Mic className="w-4 h-4 text-orange-400" />
                      <span>تفعيل الميكروفون والبدء</span>
                    </button>

                    {/* Timer */}
                    <div className="text-xs font-mono font-bold text-slate-500">
                      00:00 / 00:15
                    </div>
                  </div>
                </div>

                {/* Bottom Skip Button matching Image 1 */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setCloneStage('try-new-clone')}
                    className="px-6 py-2.5 rounded-2xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    تخطي الآن
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* STAGE C: COUNTDOWN 1-3 BEFORE RECORDING                                */}
            {/* ----------------------------------------------------------------------- */}
            {cloneStage === 'countdown' && (
              <div className="space-y-6 animate-in zoom-in-95 duration-200 text-center py-16">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full inline-block">
                    استعد للقراءة والتسجيل
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    يبدأ التسجيل خلال...
                  </h3>
                </div>

                {/* Countdown Large Number Circle */}
                <div className="w-28 h-28 rounded-full bg-slate-950 text-white flex items-center justify-center mx-auto text-5xl font-black font-mono shadow-2xl shadow-slate-950/30 animate-pulse">
                  {countdownValue}
                </div>

                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  تأكد من الهدوء حولك وقراءة النص بصوت واضح ومريح بنبرتك الطبيعية.
                </p>
              </div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* STAGE D: IMAGE 2 - LIVE RECORDING WITH RANDOM SHORT TEXT                */}
            {/* ----------------------------------------------------------------------- */}
            {cloneStage === 'recording-live' && (
              <div className="space-y-6 animate-in fade-in duration-300 text-right">
                {/* Header matching Image 2 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      هل ترغب في توثيق بصمتك الصوتية؟
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      اختياري
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    قد تحصل الأصوات الموثقة على مزايا وإمكانيات إضافية ومصداقية أعلى مستقبلاً.
                  </p>
                </div>

                {/* Big Verification Container with Arabic Text matching Image 2 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {/* Top Text Area with the exact quote from Image 2 */}
                  <div className="py-20 px-6 sm:px-12 text-center max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[220px]">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 leading-relaxed font-sans max-w-lg">
                      {VERIFICATION_QUOTES[verificationQuoteIndex]}
                    </div>

                    <button
                      type="button"
                      onClick={() => setVerificationQuoteIndex((prev) => (prev + 1) % VERIFICATION_QUOTES.length)}
                      className="mt-4 text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>تغيير النص المقترح</span>
                    </button>
                  </div>

                  {/* Bottom Microphone Control Bar matching Image 2 */}
                  <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Animated Dotted sound wave line */}
                    <div className="flex items-center gap-1 text-orange-700 font-mono tracking-widest text-sm select-none hidden sm:flex">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1" />
                      <span className="text-slate-400">................................</span>
                    </div>

                    {/* Submit Recording Button (Square stop icon, pill shaped) */}
                    <button
                      onClick={handleFinishVerificationRecording}
                      className="px-6 py-3 rounded-full bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs flex items-center gap-2.5 shadow-md shadow-slate-950/15 transition-all cursor-pointer animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-white text-white" />
                      <span>اعتماد وحفظ التسجيل</span>
                    </button>

                    {/* Live Timer */}
                    <div className="text-xs font-mono font-bold text-slate-900">
                      00:{verificationSeconds < 10 ? '0' + verificationSeconds : verificationSeconds} / 00:15
                    </div>
                  </div>
                </div>

                {/* Bottom Skip Button matching Image 2 */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (verificationTimerRef.current) clearInterval(verificationTimerRef.current);
                      setCloneStage('try-new-clone');
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    تخطي الآن
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* STAGE E: IMAGE 3 - VOICE VERIFICATION COMPLETE                          */}
            {/* ----------------------------------------------------------------------- */}
            {cloneStage === 'verify-complete' && (
              <div className="space-y-6 animate-in fade-in duration-300 text-right">
                {/* Header matching Image 3 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      هل ترغب في توثيق بصمتك الصوتية؟
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      اختياري
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    قد تحصل الأصوات الموثقة على مزايا وإمكانيات إضافية ومصداقية أعلى مستقبلاً.
                  </p>
                </div>

                {/* Big Verification Container matching Image 3 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {/* Top Success Area with Circular Green Check */}
                  <div className="py-16 px-6 sm:px-12 text-center max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[220px] space-y-3">
                    <div className="w-9 h-9 rounded-full border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      اكتمل توثيق ومطابقة الصوت بنجاح
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                      شكراً لك على توثيق هذا الصوت. تطابقت البصمة الصوتية المنطوقة مع العينات المرفوعة بنسبة 99.4%، ويمكنك الآن استخدام هذا الصوت في كافة خدمات المنصة.
                    </p>
                  </div>

                  {/* Bottom Microphone Control Bar matching Image 3 */}
                  <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Dotted sound wave line */}
                    <div className="text-slate-300 font-mono tracking-widest text-sm select-none hidden sm:block">
                      ................................
                    </div>

                    {/* Microphone Select Pill & Inactive Start Button matching Image 3 */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs">
                        <Mic className="w-3.5 h-3.5 text-slate-500" />
                        <span>ميكروفون الاستوديو الافتراضي</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      <button
                        disabled
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold border border-slate-200 cursor-default"
                      >
                        بدء
                      </button>
                    </div>

                    {/* Timer */}
                    <div className="text-xs font-mono font-bold text-slate-500">
                      00:00 / 00:15
                    </div>
                  </div>
                </div>

                {/* Bottom Finish up Button matching Image 3 */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleProceedToTryClone}
                    className="px-6 py-2.5 rounded-2xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    المتابعة والإنهاء
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* STAGE F: IMAGE 4 - TRY OUT YOUR NEW CLONE (3 INTERACTIVE CARDS)         */}
            {/* ----------------------------------------------------------------------- */}
            {cloneStage === 'try-new-clone' && (
              <div className="space-y-6 animate-in fade-in duration-300 text-right">
                {/* Header matching Image 4 */}
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    جرّب توأمك الصوتي الجديد
                  </h3>
                  <p className="text-xs text-slate-500">
                    صوتك جاهز الآن للاستخدام في جميع أنحاء المنصة والخدمات.
                  </p>
                </div>

                {/* 3 Action Cards Stack matching Image 4 */}
                <div className="space-y-4">
                  {/* Card 1: Generate Speech (نص إلى صوت) */}
                  <div
                    onClick={() => handleDeployToPlatform('generate')}
                    className="p-5 rounded-3xl border border-slate-200/90 hover:border-slate-400 bg-white hover:bg-slate-50/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Gradient Square Icon matching Image 4 (Blue/Purple) */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                        <Volume2 className="w-6 h-6 text-indigo-700" />
                      </div>

                      <div className="space-y-0.5 text-right">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-black">
                          توليد الصوت (نص إلى صوت)
                        </h4>
                        <p className="text-xs text-slate-500">
                          جرّب صوتك الجديد الآن واكتب أي نص ليتم نطقه بصوتك المستنسخ فوراً.
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card 2: Speak with yourself (تحدث مع نسختك الصوتية) */}
                  <div
                    onClick={() => handleDeployToPlatform('chat')}
                    className="p-5 rounded-3xl border border-slate-200/90 hover:border-slate-400 bg-white hover:bg-slate-50/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Gradient Square Icon matching Image 4 (Cyan/Ocean) */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 via-teal-100 to-sky-200 border border-cyan-200 flex items-center justify-center text-teal-700 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                        <Bot className="w-6 h-6 text-teal-800" />
                      </div>

                      <div className="space-y-0.5 text-right">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-black">
                          تحدث مع نسختك الصوتية
                        </h4>
                        <p className="text-xs text-slate-500">
                          تحدث مع وكيلك الذكي واستمع إلى صوتك وهو يجيبك ويتفاعل معك.
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card 3: Narrate a story (سرد قصة أو كتاب صوتي) */}
                  <div
                    onClick={() => handleDeployToPlatform('story')}
                    className="p-5 rounded-3xl border border-slate-200/90 hover:border-slate-400 bg-white hover:bg-slate-50/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Gradient Square Icon matching Image 4 (Mint/Emerald) */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-green-200 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-6 h-6 text-emerald-800" />
                      </div>

                      <div className="space-y-0.5 text-right">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-black">
                          سرد قصة أو كتاب صوتي
                        </h4>
                        <p className="text-xs text-slate-500">
                          أنشئ قصة أو كتاباً صوتياً يُروى بنبرة صوتك عبر استوديو الكتب الصوتية.
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Bottom Skip Button matching Image 4 */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleDeployToPlatform('library')}
                    className="px-6 py-2.5 rounded-2xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    تخطي والانتقال للمنصة
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* STAGE G: PUBLISHED ON PLATFORM WITH COMPLETELY DIFFERENT SENTENCE       */}
            {/* ----------------------------------------------------------------------- */}
            {cloneStage === 'published-on-platform' && (
              <div className="space-y-6 animate-in zoom-in-95 duration-300 text-right">
                
                {/* Success Banner */}
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>تم اعتماد ونشر توأمك الصوتي بنجاح على المنصة!</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    أصبح صوتك متوفراً في مكتبة الأصوات واستوديو تحويل النص إلى صوت، وتم توليد الجملة المنشورة بنبرة صوتك بنجاح.
                  </p>
                </div>

                {/* Live Platform Voice Card with COMPLETELY DIFFERENT Sentence */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-500/40 shadow-xl space-y-6">
                  
                  {/* Voice Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-yellow to-purple-600 flex items-center justify-center text-white shadow-md text-2xl font-black">
                        🎙️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900">{voiceName || 'صوتي التجاري الفخم'}</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            منشور في المنصة ✓
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          اللهجة: {labels.find(l => l.label === 'اللهجة')?.value || 'سعودي وقور'} • النبرة: {labels.find(l => l.label === 'النبرة')?.value || 'احترافي ومقنع'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200">
                        نسبة المطابقة: 99.4%
                      </span>
                    </div>
                  </div>

                  {/* Clarification Box: Showing that the deployed sentence is completely different */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">
                        مقارنة الجملة المنطوقة (جملة نشر مختلفة تماماً):
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        تم الاستنساخ بجملة جديدة
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-500">
                        <span className="text-[10px] text-slate-400 block mb-1">جملة التحقق المقروءة:</span>
                        <p className="font-medium text-slate-700">«نجاحك في الحياة لا يعتمد على القوة أو السرعة، بل على الاستمرارية.»</p>
                      </div>

                      <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200 text-orange-950 font-bold">
                        <span className="text-[10px] text-orange-700 block mb-1">الجملة المنشورة على المنصة (جديدة تماماً):</span>
                        <p className="text-slate-900 font-bold">«{PLATFORM_DEPLOYED_SENTENCE}»</p>
                      </div>
                    </div>
                  </div>

                  {/* Playback Box for the Brand New Sentence */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={handlePlayPlatformSentence}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all shadow-md cursor-pointer shrink-0 ${
                          isPlayingPlatformSample ? 'bg-orange-600 scale-105' : 'bg-brand hover:bg-brand-orange'
                        }`}
                        title={isPlayingPlatformSample ? 'إيقاف' : 'تشغيل الجملة المنشورة'}
                      >
                        {isPlayingPlatformSample ? (
                          <Pause className="w-5 h-5 fill-white" />
                        ) : (
                          <Play className="w-5 h-5 fill-white mr-0.5" />
                        )}
                      </button>

                      <div>
                        <div className="text-xs font-bold flex items-center gap-2">
                          <span>استمع للجملة المنشورة بصوتك المستنسخ</span>
                          {isPlayingPlatformSample && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black animate-pulse">
                              جاري التشغيل الصوتي الآن
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          توليد فوري ومباشر بنبرة صوتك الذكي بجودة استوديو 48kHz
                        </p>
                      </div>
                    </div>

                    {/* Audio wave dots animation */}
                    <div className="flex items-center gap-1">
                      {[40, 70, 30, 90, 60, 80, 45, 95, 35, 65, 85, 50].map((h, i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full transition-all duration-200 ${
                            isPlayingPlatformSample ? 'bg-orange-400' : 'bg-slate-600'
                          }`}
                          style={{
                            height: isPlayingPlatformSample ? `${Math.max(8, Math.round(h * Math.random()))}px` : '8px'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setCloneStage('idle');
                        setCurrentStep(1);
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      استنساخ صوت إضافي
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('voice-library', 'ai')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        معاينة في مكتبة الأصوات
                      </button>

                      <button
                        onClick={() => onNavigate('generate')}
                        className="px-6 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <span>فتح استوديو التوليد الآن</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 100% ARABIC UPGRADE MODAL (Matching User Request)                         */}
      {/* ========================================================================= */}
      {showUpgradeModal && (() => {
        const currPlan = PLAN_DATA[selectedPlan] || PLAN_DATA.creator;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
            <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
                
                {/* Left Column (Content & Pricing in RTL) */}
                <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-right order-2 md:order-1">
                  
                  <div className="space-y-5">
                    {/* Modal Title in Arabic */}
                    <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                      قم بالترقية لاستخدام توأمك الصوتي
                    </h3>

                    {/* Subscription Plans Tabs: Starter, Creator, Pro, Scale, Business */}
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 rounded-2xl text-xs font-semibold text-slate-600">
                      {(['starter', 'creator', 'pro', 'scale', 'business'] as PlanKey[]).map((planKey) => {
                        const isSelected = selectedPlan === planKey;
                        return (
                          <button
                            key={planKey}
                            onClick={() => setSelectedPlan(planKey)}
                            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white text-black font-bold shadow-xs border border-slate-300 ring-1 ring-black/5'
                                : 'hover:text-black'
                            }`}
                          >
                            {PLAN_DATA[planKey].label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pay-as-you-go Notice */}
                    <p className="text-xs text-slate-500 font-normal">
                      الدفع حسب الاستخدام متاح في باقات صناع المحتوى والأعلى
                    </p>

                    {/* Feature Checklist */}
                    <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                      {/* Audio generation hours per plan */}
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>
                          <strong className="font-bold text-black">{currPlan.hours}</strong>
                        </span>
                      </div>

                      {/* Audiobook & podcast in voice */}
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>إنتاج الكتب الصوتية والبودكاست بنبرة صوتك</span>
                      </div>
                    </div>

                    {/* Dynamic Pricing Cards: Monthly vs Annual */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      
                      {/* Option 1: Monthly Card */}
                      <div 
                        onClick={() => setBillingCycle('monthly')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[116px] text-right ${
                          billingCycle === 'monthly'
                            ? 'border-2 border-black bg-white shadow-xs'
                            : 'border border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          {currPlan.monthlyDiscountBadge && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAFBF3] text-[#0E8A4E] text-[11px] font-bold mb-2">
                              {currPlan.monthlyDiscountBadge}
                            </span>
                          )}
                          <div className="text-xs font-semibold text-slate-700">الدفع شهرياً</div>
                        </div>

                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black text-black font-sans">
                            ${currPlan.monthlyPrice}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/شهرياً</span>
                          {currPlan.monthlyOriginalPrice && (
                            <span className="text-xs text-slate-400 line-through font-sans">
                              ${currPlan.monthlyOriginalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Option 2: Annual Card (with 2 months free) */}
                      <div 
                        onClick={() => setBillingCycle('annual')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[116px] text-right ${
                          billingCycle === 'annual'
                            ? 'border-2 border-black bg-white shadow-xs'
                            : 'border border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAFBF3] text-[#0E8A4E] text-[11px] font-bold mb-2">
                            شهران مجاناً
                          </span>
                          <div className="text-xs font-semibold text-slate-700">الدفع سنوياً</div>
                        </div>

                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black text-black font-sans">
                            ${currPlan.annualMonthlyPrice % 1 === 0 ? currPlan.annualMonthlyPrice : currPlan.annualMonthlyPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/شهرياً</span>
                          {currPlan.annualOriginalPrice && (
                            <span className="text-xs text-slate-400 line-through font-sans">
                              ${currPlan.annualOriginalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Big Subscribe CTA Button */}
                  <button
                    onClick={handleSubscribeFromModal}
                    className="w-full py-3.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-sm shadow-md transition-all cursor-pointer text-center"
                  >
                    اشترك في باقة {currPlan.label} {billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'} والمتابعة للاستنساخ
                  </button>
                </div>

                {/* Right Column (Artwork & Particle Sphere in RTL) */}
                <div 
                  className="md:col-span-5 relative flex items-center justify-center p-6 text-white min-h-[300px] md:min-h-full overflow-hidden order-1 md:order-2"
                  style={{
                    background: 'radial-gradient(ellipse at 80% 85%, #ea580c 0%, #c026d3 38%, #1d4ed8 72%, #0f172a 100%)'
                  }}
                >
                  <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Close Button */}
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-20 shadow-sm"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Luminous Glowing 3D Particle Sphere Graphic */}
                  <div className="relative flex items-center justify-center my-auto">
                    <div className="absolute w-56 h-56 rounded-full bg-orange-400/20 blur-2xl pointer-events-none" />
                    <div className="absolute w-44 h-44 rounded-full bg-blue-300/20 blur-xl pointer-events-none" />

                    <svg viewBox="0 0 260 260" className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-[0_0_22px_rgba(255,255,255,0.45)]">
                      <defs>
                        <radialGradient id="sphereCoreGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <circle cx="130" cy="130" r="82" fill="url(#sphereCoreGlow)" />
                      {SPHERE_POINTS.map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.cx}
                          cy={pt.cy}
                          r={pt.r}
                          fill="#ffffff"
                          opacity={pt.opacity}
                        />
                      ))}
                    </svg>
                  </div>

                  {/* Bottom Right Mini Action Wand Icon */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-lg bg-black/40 text-white flex items-center justify-center backdrop-blur-md z-10">
                    <Wand2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 text-right">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">ملاحظات ومساعدة</h4>
              <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              نسعد بتلقي ملاحظاتك لتحسين دقة استنساخ الصوت والتوائم الصوتية باللغة العربية.
            </p>
            <textarea
              rows={4}
              placeholder="اكتب ملاحظاتك أو أي استفسار هنا..."
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-5 py-2 rounded-xl bg-brand-ink text-white text-xs font-bold hover:bg-brand-ink/90 cursor-pointer"
              >
                إرسال الملاحظات
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
