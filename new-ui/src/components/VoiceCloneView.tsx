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
  ShieldCheck
} from 'lucide-react';
import { ActiveView } from '../types';

interface VoiceCloneViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenSignup?: () => void;
}

interface LabelPair {
  id: string;
  label: string;
  value: string;
}

export const VoiceCloneView: React.FC<VoiceCloneViewProps> = ({ onNavigate, onOpenSignup }) => {
  // Stepper state: 1 = Upload Audio, 2 = Voice Information, 3 = Finish / Upgrade Modal
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
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

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Recording simulation
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#FF5500] selection:text-white" dir="rtl">

      {/* Hidden audio element for preview */}
      <audio
        ref={audioPlayerRef}
        src="https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3"
        onEnded={() => { setIsPlayingAudio(false); setIsPlayingPreview(false); }}
      />

      {/* Outer Studio Card Container */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/[0.03] overflow-hidden p-6 sm:p-10">

        {/* Main 2-Column Layout (Matching Screenshots) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ========================================================================= */}
          {/* RIGHT SIDEBAR (In RTL: Stepper & Navigation matching left bar in images)  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 border-l border-slate-100 pl-0 lg:pl-8 flex flex-col justify-between space-y-8">

            <div className="space-y-6">
              {/* Top Spinner / Lightning Badge Button */}
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#FF5500] animate-pulse" />
              </div>

              {/* Step Title */}
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  استنساخ الصوت الفوري
                </h2>
                <span className="text-[11px] text-slate-500 font-mono">Instant Voice Clone</span>
              </div>

              {/* Stepper List */}
              <nav className="space-y-4 text-xs font-semibold">

                {/* Step 1: Upload Audio */}
                <div
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-2.5 cursor-pointer transition-colors ${
                    currentStep === 1
                      ? 'text-slate-950 font-bold'
                      : hasUploadedFile
                        ? 'text-slate-700 hover:text-slate-900'
                        : 'text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    currentStep === 1
                      ? 'bg-slate-900'
                      : hasUploadedFile
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                  }`} />
                  <span>رفع العينة الصوتية (Upload Audio)</span>
                </div>

                {/* Step 2: Voice Information */}
                <div
                  onClick={() => {
                    if (hasUploadedFile) setCurrentStep(2);
                  }}
                  className={`flex items-center gap-2.5 transition-colors ${
                    currentStep === 2
                      ? 'text-slate-950 font-bold cursor-pointer'
                      : hasUploadedFile
                        ? 'text-slate-700 hover:text-slate-900 cursor-pointer'
                        : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    currentStep === 2 ? 'bg-slate-900' : 'bg-slate-300'
                  }`} />
                  <span>معلومات الصوت (Voice Information)</span>
                </div>

                {/* Step 3: Finish up */}
                <div
                  onClick={() => {
                    if (hasUploadedFile) setShowUpgradeModal(true);
                  }}
                  className="flex items-center gap-2.5 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                  <span>الإنهاء والتفعيل (Finish up)</span>
                </div>
              </nav>
            </div>

            {/* Bottom Feedback Button */}
            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
              >
                ملاحظات ومساعدة (Feedback)
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MAIN WORKFLOW AREA (Steps 1 & 2)                                          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-9 space-y-8">

            {/* STEP 1: UPLOAD AUDIO (Matching Image 1 & Image 2) */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">

                {/* 3 Top Guidelines Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">

                  {/* Guideline 1 */}
                  <div className="space-y-2 text-right">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">تجنب الأماكن المزعجة</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      الأصوات الخلفية والصدى تؤثر سلباً على نقاء الصوت وجودة الاستنساخ النهائية.
                    </p>
                  </div>

                  {/* Guideline 2 */}
                  <div className="space-y-2 text-right">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">تحقق من جودة الميكروفون</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      استخدم ميكروفوناً خارجياً أو سماعات رأس لالتقاط الترددات الصوتية بدقة.
                    </p>
                  </div>

                  {/* Guideline 3 */}
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

                {/* Dropzone Box (Matching Dashed Border in Screenshot) */}
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

                  {/* Upload Icon Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 cursor-pointer hover:scale-105 transition-transform"
                  >
                    <Upload className="w-5 h-5 text-slate-800" />
                  </div>

                  <div className="space-y-1">
                    <p
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-bold text-slate-900 cursor-pointer hover:text-[#FF5500] transition-colors"
                    >
                      اضغط للرفع، أو اسحب وأفلت الملف الصوتي هنا
                    </p>
                    <p className="text-xs text-slate-500">
                      ملفات صوتية أو فيديو بحجم يصل إلى 10 ميجابايت لكل ملف (MP3, WAV, M4A)
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
                        <span>تسجيل صوتي مباشر (Record audio)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Uploaded Audio Item Card (Matching Screenshot 2) */}
                {hasUploadedFile && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlaySample}
                          className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
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
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
                        إزالة الضوضاء والأصوات الخلفية من التسجيلات الصوتية تلقائياً (Remove background noise)
                      </span>
                    </label>

                    {/* Status: Ready */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>جاهز (Ready) - يمكنك إضافة المزيد من التسجيلات لتوأم صوتي أكثر دقة وواقعية.</span>
                    </div>
                  </div>
                )}

                {/* Bottom Bar with Next Button */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span className={`w-2.5 h-2.5 rounded-full border ${hasUploadedFile ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400'}`} />
                    <span>مطلوب 10 ثوانٍ على الأقل من الصوت (10 seconds of audio required)</span>
                  </div>

                  <button
                    disabled={!hasUploadedFile}
                    onClick={() => setCurrentStep(2)}
                    className={`px-8 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                      hasUploadedFile
                        ? 'bg-slate-950 hover:bg-slate-800 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>التالي</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: VOICE INFORMATION (Matching Image 3) */}
            {currentStep === 2 && (
              <div className="space-y-7 animate-in fade-in duration-200">

                {/* Voice Avatar & Preview Button */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF5500] via-amber-500 to-purple-600 shadow-md flex items-center justify-center text-white overflow-hidden p-0.5">
                      <div className="w-full h-full rounded-full bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <button
                      className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs flex items-center justify-center hover:bg-slate-50 transition-colors"
                      title="تغيير المظهر"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={togglePlayPreview}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-xs transition-colors"
                  >
                    {isPlayingPreview ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-slate-800" />
                        <span>إيقاف المعاينة</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-slate-800 mr-0.5" />
                        <span>معاينة الصوت (Preview voice)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Field 1: Name */}
                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-900">الاسم (Name)</label>
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
                    <label className="text-xs font-bold text-slate-900">التصنيف (Label)</label>
                    <label className="text-xs font-bold text-slate-900">القيمة (Value)</label>
                  </div>

                  {labels.map((item) => (
                    <div key={item.id} className="grid grid-cols-2 gap-4 items-center">
                      <select
                        value={item.label}
                        onChange={(e) => updateLabel(item.id, 'label', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-900"
                      >
                        <option value="اللغة">اللغة (Language)</option>
                        <option value="اللهجة">اللهجة (Accent)</option>
                        <option value="الجنس">الجنس (Gender)</option>
                        <option value="النبرة">النبرة (Tone)</option>
                        <option value="الاستخدام">مجال الاستخدام (Use Case)</option>
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
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors mt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة تصنيف (+ Add label)</span>
                  </button>
                </div>

                {/* Field 3: Description */}
                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-900">الوصف (Description)</label>
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
                      أقر وأؤكد بأن لدي جميع الحقوق والموافقات القانونية اللازمة لرفع واستنساخ هذه العينات الصوتية، وأنني لن أستخدم المحتوى الصوتي المُولّد لأي غرض غير قانوني أو احتيالي أو ضار. كما أؤكد التزامي التام بشروط خدمة منصة قيمة (Qeema Voice)، وسياسة الاستخدام المعتمد، وحماية الملكية الفكرية.
                    </span>
                  </label>
                </div>

                {/* Bottom Bar: Back & Save Voice */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                  >
                    السابق (Back)
                  </button>

                  <button
                    disabled={!voiceName.trim() || !hasAgreedToTerms}
                    onClick={() => setShowUpgradeModal(true)}
                    className={`px-8 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                      voiceName.trim() && hasAgreedToTerms
                        ? 'bg-slate-950 hover:bg-slate-800 text-white cursor-pointer shadow-slate-950/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>حفظ وتفعيل الصوت (Save voice)</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 3 MODAL: UPGRADE TO USE CLONED VOICE (Matching Image 4 Pixel-Perfect) */}
      {/* ========================================================================= */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">

              {/* Left Column (Content & Pricing) */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-right order-2 md:order-1">

                <div className="space-y-5">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                    ترقية الباقة لاستخدام توأمك الصوتي
                  </h3>

                  {/* Plans Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => setSelectedPlan('starter')}
                      className={`px-3 py-1.5 rounded-xl transition-colors ${selectedPlan === 'starter' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
                    >
                      مبتدئ (Starter)
                    </button>
                    <button
                      onClick={() => setSelectedPlan('creator')}
                      className={`px-3 py-1.5 rounded-xl transition-colors ${selectedPlan === 'creator' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
                    >
                      صانع محتوى (Creator)
                    </button>
                    <button
                      onClick={() => setSelectedPlan('pro')}
                      className={`px-3 py-1.5 rounded-xl transition-colors ${selectedPlan === 'pro' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
                    >
                      احترافي (Pro)
                    </button>
                    <button
                      onClick={() => setSelectedPlan('scale')}
                      className={`px-3 py-1.5 rounded-xl transition-colors ${selectedPlan === 'scale' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
                    >
                      متقدم (Scale)
                    </button>
                    <button
                      onClick={() => setSelectedPlan('business')}
                      className={`px-3 py-1.5 rounded-xl transition-colors ${selectedPlan === 'business' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
                    >
                      شركات (Business)
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    الدفع حسب الاستخدام متاح في باقة صانع المحتوى وما فوقها من الباقات.
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      <span><strong>~ساعتان</strong> من توليد الصوت شهرياً (Audio generation / month)</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>إنتاج كتب صوتية وبودكاست بصوتك وتوأمك الخاص</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Video className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>توليد تعليق صوتي لمقاطع الفيديو بنطاق واسع (At scale)</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>دبلجة المحتوى الصوتي إلى أكثر من 31 لغة تلقائياً</span>
                    </div>
                  </div>

                  {/* Pricing Cards: Monthly vs Annual */}
                  <div className="grid grid-cols-2 gap-3 pt-2">

                    {/* Monthly Option */}
                    <div
                      onClick={() => setBillingCycle('monthly')}
                      className={`p-4 rounded-2xl border text-right cursor-pointer transition-all ${
                        billingCycle === 'monthly'
                          ? 'border-slate-900 bg-slate-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-slate-500">الدفع شهرياً</div>
                      <div className="text-xl font-black text-slate-950 mt-1">
                        $22 <span className="text-xs font-normal text-slate-500">/ شهرياً</span>
                      </div>
                      <span className="text-[10px] text-slate-400">82 ر.س / شهرياً</span>
                    </div>

                    {/* Annual Option */}
                    <div
                      onClick={() => setBillingCycle('annual')}
                      className={`p-4 rounded-2xl border text-right cursor-pointer transition-all relative ${
                        billingCycle === 'annual'
                          ? 'border-slate-900 bg-slate-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mb-1">
                        شهران مجاناً
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500">الدفع سنوياً</div>
                      <div className="text-xl font-black text-slate-950 mt-1">
                        $18.33 <span className="text-xs font-normal text-slate-500">/ شهرياً</span>
                      </div>
                      <span className="text-[10px] text-slate-400 line-through mr-1">$22</span>
                    </div>
                  </div>
                </div>

                {/* Big Subscribe CTA Button */}
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    if (onOpenSignup) onOpenSignup();
                    else onNavigate('billing');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xl shadow-slate-950/20 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer text-center"
                >
                  الاشتراك وتفعيل التوأم الصوتي في باقة {selectedPlan === 'creator' ? 'صانع المحتوى' : selectedPlan}
                </button>
              </div>

              {/* Right Column (Artwork & Particle Sphere matching Screenshot 4) */}
              <div className="md:col-span-5 relative bg-gradient-to-tr from-[#FF5500] via-[#D946EF] to-[#2563EB] p-6 flex flex-col justify-between items-center text-white overflow-hidden order-1 md:order-2 min-h-[260px] md:min-h-auto">

                {/* Close Button */}
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="self-end w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Glowing Particle Sphere Animation */}
                <div className="my-auto relative flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-white/20 flex items-center justify-center animate-pulse">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-white/40 flex items-center justify-center">
                      <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-white/10 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-2xl">
                        <Sparkles className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '8s' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Mini Action */}
                <div className="self-start">
                  <div className="w-7 h-7 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center text-white text-xs">
                    <Wand2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 text-right">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">ملاحظات ومساعدة (Feedback)</h4>
              <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-600">
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800"
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
