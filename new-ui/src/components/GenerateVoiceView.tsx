import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  RotateCcw, 
  FileAudio, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  Zap, 
  Layers, 
  Clock, 
  Volume2,
  Wand2,
  Share2,
  Search,
  Bell,
  Folder,
  MessageSquare,
  BookOpen,
  Smile,
  Film,
  Gamepad2,
  Radio,
  HelpCircle,
  X,
  ChevronDown,
  Check,
  Globe,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Voice, Generation, Company } from '../types';
import { api } from '../lib/api';
import { GlassyVoiceOrb } from './GlassyVoiceOrb';
import { AI_VOICES_CATALOG } from '../data/aiVoicesCatalog';
import { TextToSpeechVisitorLanding } from './TextToSpeechVisitorLanding';

interface GenerateVoiceViewProps {
  voices: Voice[];
  initialVoiceId?: string;
  initialText?: string;
  balanceCredits: number;
  currentCompany: Company | null;
  isLoggedIn?: boolean;
  onGenerationComplete: (gen: Generation, newBalance: number) => void;
  onOpenTopUp: () => void;
  onNavigateToMyAudio: () => void;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  onToggleLoginState?: () => void;
  onNavigate?: (view: string) => void;
}

export const GenerateVoiceView: React.FC<GenerateVoiceViewProps> = ({
  voices,
  initialVoiceId,
  initialText,
  balanceCredits,
  currentCompany,
  isLoggedIn = false,
  onGenerationComplete,
  onOpenTopUp,
  onNavigateToMyAudio,
  onOpenLogin,
  onOpenSignup,
  onToggleLoginState,
  onNavigate
}) => {
  // Mode switcher: Default based on isLoggedIn, but allow user to toggle freely for previewing!
  const [currentMode, setCurrentMode] = useState<'visitor' | 'studio'>(
    isLoggedIn ? 'studio' : 'visitor'
  );

  // Sync mode if parent isLoggedIn changes
  useEffect(() => {
    setCurrentMode(isLoggedIn ? 'studio' : 'visitor');
  }, [isLoggedIn]);

  // Studio State (Image 1)
  const aiVoices = voices.filter(v => v.type === 'ai');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    initialVoiceId || (aiVoices[0]?.id || '')
  );

  const [text, setText] = useState<string>(
    initialText || ''
  );

  // Right sidebar tab: 'settings' or 'history'
  const [sidebarTab, setSidebarTab] = useState<'settings' | 'history'>('settings');

  // Dismiss v3 promo banner in sidebar
  const [showV3Banner, setShowV3Banner] = useState<boolean>(true);

  // Voice selector modal / drawer
  const [isVoicePickerOpen, setIsVoicePickerOpen] = useState<boolean>(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState<string>('');
  const [voiceFilterDialect, setVoiceFilterDialect] = useState<string>('الكل');

  // Selected Model
  const [selectedModel, setSelectedModel] = useState<'v3' | 'v2'>('v3');

  // Sliders matching image 1
  const [speed, setSpeed] = useState<number>(1.0); // 0.70x to 1.50x
  const [stability, setStability] = useState<number>(75); // 0% to 100%
  const [similarity, setSimilarity] = useState<number>(85); // 0% to 100%
  const [styleExaggeration, setStyleExaggeration] = useState<number>(35); // 0% to 100%

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<Generation | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);

  // Search input in header
  const [headerSearch, setHeaderSearch] = useState<string>('');

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Selected Voice Object
  const selectedVoice = voices.find(v => v.id === selectedVoiceId) || aiVoices[0];
  const catalogItem = AI_VOICES_CATALOG.find(c => c.id === selectedVoice?.id || c.name === selectedVoice?.name);

  // Credit calculation: 1 Credit = 1 Character
  const cleanLength = text.trim().length;
  const estimatedCredits = Math.max(1, cleanLength);
  const hasEnoughCredits = balanceCredits >= estimatedCredits;

  useEffect(() => {
    if (initialVoiceId) setSelectedVoiceId(initialVoiceId);
  }, [initialVoiceId]);

  useEffect(() => {
    if (initialText) setText(initialText);
  }, [initialText]);

  // Audio player listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentResult]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackRate;
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('يرجى إدخال النص المراد تحويله إلى صوت');
      return;
    }

    if (!hasEnoughCredits) {
      setError(`رصيدك الحالي (${balanceCredits.toLocaleString()} نقطة) غير كافٍ. تحتاج إلى ${estimatedCredits.toLocaleString()} نقطة.`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await api.createGeneration({
        voiceId: selectedVoice.id,
        text: text.trim(),
        settings: {
          speed: speed,
          stability: stability / 100,
          style: styleExaggeration / 100,
          format: 'wav'
        }
      });

      setCurrentResult(response.generation);
      setRecentGenerations(prev => [response.generation, ...prev]);
      setIsPlaying(false);
      setCurrentTime(0);
      onGenerationComplete(response.generation, response.newBalanceCredits);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err?.message || 'فشل توليد الصوت. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Preset Chips matching image 1 "Get started with"
  const promptPresets = [
    {
      id: 'story',
      label: 'سرد قصة',
      icon: BookOpen,
      text: 'في ليلة مقمرة بين كثبان الصحراء الذهبية، هبّت نسائم دافئة تحمل معها حكايات الأجداد وأسرار القوافل التي عبرت هذا الطريق منذ آلاف السنين، ليبقى الأثر شاهداً على عظمة الزمان.'
    },
    {
      id: 'joke',
      label: 'إلقاء نكتة مرحة',
      icon: Smile,
      text: 'سأل المعلم طالباً: ما هو تعريف الصمت التام؟ فأجاب الطالب بابتسامة واثقة: هو أعلى نبرة صوت تصدرها عندما يسألك والدك أمام الضيوف أين ذهبت نقودك!'
    },
    {
      id: 'ad',
      label: 'تسجيل إعلان ترويجي',
      icon: Volume2,
      text: 'مع تطبيقنا المالي الجديد، أصبحت إدارة مدفوعاتك واستثماراتك أسهل من أي وقت مضى. أمان مصرفي فائق، وسرعة في كل معاملة. حمّل التطبيق الآن واستمتع بمكافآت حصرية!'
    },
    {
      id: 'languages',
      label: 'التحدث بلهجات متعددة',
      icon: Globe,
      text: 'مرحباً بكم من الرياض، وأهلاً وسهلاً من دبي والقاهرة وبيروت وتونس! بصوت واحد وثقة لا حدود لها، نجمع العالم العربي على إيقاع الابتكار والجمال.'
    },
    {
      id: 'drama',
      label: 'مشهد درامي سينمائي',
      icon: Film,
      text: 'انظر إلى تلك الأضواء الخافتة في الأفق البعيد.. لم يتبقَ أمامنا سوى فرصة واحدة لنثبت للجميع أننا لم نستسلم ولن نتراجع خطوة واحدة إلى الوراء!'
    },
    {
      id: 'gaming',
      label: 'شخصية ألعاب إلكترونية',
      icon: Gamepad2,
      text: 'انتبه يا بطل! البوابة الشمالية تحت الحصار والعدو يقترب من القلعة.. جهز دروعك واشحذ طاقتك، المعركة الحاسمة تبدأ الآن!'
    },
    {
      id: 'podcast',
      label: 'مقدمة بودكاست',
      icon: Radio,
      text: 'أهلاً بكم مستمعينا الكرام في حلقة جديدة ومثيرة من بودكاست "أفق المعرفة". اليوم نغوص معاً في أعماق الذكاء الاصطناعي وكيف يعيد تشكيل العالم من حولنا.'
    },
    {
      id: 'meditation',
      label: 'جلسة تأمل واسترخاء',
      icon: Sparkles,
      text: 'خذ نفساً عميقاً وبطيئاً.. املأ رئتيك بالهواء النقي، واشعر بالهدوء والسكينة يتسللان إلى كل خلية في جسدك مع كل شهيق وزفير هادئ.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      
      {/* RENDER BASED ON MODE */}
      {currentMode === 'visitor' ? (
        /* VISITOR VIEW (Images 2, 3, 4, 5, 6) */
        <TextToSpeechVisitorLanding
          onOpenLogin={onOpenLogin || (() => {})}
          onOpenSignup={onOpenSignup || (() => {})}
          onTryStudio={() => setCurrentMode('studio')}
        />
      ) : (
        /* LOGGED-IN STUDIO VIEW (Image 1) */
        <div className="min-h-[calc(100vh-41px)] flex flex-col bg-white">
          
          {/* Top App Header Bar matching Image 1 */}
          <header className="h-14 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 bg-white shrink-0">
            {/* Left side: View Title + Search */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  نص إلى صوت (Text to Speech)
                </h1>
              </div>

              {/* Search input (⌘ K) */}
              <div className="hidden sm:flex items-center relative w-64 md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="البحث في كل شيء... ⌘ K"
                  className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Right side: Top Actions (Feedback, Docs, Ask, Folders, Bell, Profile) */}
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => alert('شكراً لملاحظاتك! يمكنك إرسال أي مقترح وسيقوم فريقنا بمراجعته.')}
                className="hidden md:inline-flex px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                ملاحظات (Feedback)
              </button>
              
              <button 
                onClick={() => alert('دليل التوثيق: يدعم محرك قيمة v3 التشكيل العربي الكامل والوسوم العاطفية.')}
                className="hidden md:inline-flex px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                التوثيق (Docs)
              </button>

              <button 
                onClick={() => alert('مساعد الذكاء الاصطناعي: كيف يمكنني مساعدتك في صياغة نصك الصوتي اليوم؟')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-700" />
                <span>اسأل (Ask)</span>
              </button>

              <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

              {/* Folder / My Audio */}
              <button
                onClick={onNavigateToMyAudio}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
                title="مجلداتي وتسجيلاتي"
              >
                <Folder className="w-4 h-4" />
              </button>

              {/* Notifications */}
              <button
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center relative transition-colors"
                title="الإشعارات"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-1.5 left-1.5" />
              </button>

              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs">
                {currentCompany?.name ? currentCompany.name[0] : 'ق'}
              </div>
            </div>
          </header>

          {/* Main Studio Split Layout: Text Editor (Left in LTR / Right in RTL) + Settings Sidebar (Right in LTR / Left in RTL) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
            
            {/* MAIN TEXT EDITOR PANE (8 Cols) */}
            <main className="lg:col-span-8 p-4 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-slate-200 bg-white">
              
              {/* Text Input Area */}
              <div className="flex-1 flex flex-col min-h-[300px]">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="ابدأ بكتابة النص هنا أو الصق أي نص ترغب في تحويله إلى صوت عربي واقعي فائق النقاء..."
                  className="w-full flex-1 p-4 sm:p-6 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 bg-transparent resize-none focus:outline-none leading-relaxed"
                  dir="rtl"
                />

                {/* Error Banner if any */}
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button 
                      onClick={() => setError(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Audio Result Player (If generated) */}
                {currentResult && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-orange-200 shadow-sm">
                    <audio ref={audioRef} src={currentResult.audioUrl} preload="metadata" />
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Play / Pause + Time */}
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={handleTogglePlay}
                          className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 transition-all"
                        >
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-[-0.5px]" />}
                        </button>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{selectedVoice.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">جاهز</span>
                          </div>
                          <span className="text-xs text-slate-500 font-mono">
                            {Math.floor(currentTime)}:{(Math.floor(currentTime % 60) < 10 ? '0' : '') + Math.floor(currentTime % 60)} / {Math.floor(duration)}:{(Math.floor(duration % 60) < 10 ? '0' : '') + Math.floor(duration % 60)}
                          </span>
                        </div>
                      </div>

                      {/* Seekbar */}
                      <div className="w-full sm:flex-1 max-w-md">
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full accent-orange-500 cursor-pointer"
                        />
                      </div>

                      {/* Rate and Download */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <select
                          value={playbackRate}
                          onChange={(e) => handleRateChange(Number(e.target.value))}
                          className="text-xs font-mono py-1 px-2 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="0.75">0.75x</option>
                          <option value="1.0">1.0x</option>
                          <option value="1.25">1.25x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2.0">2.0x</option>
                        </select>

                        <a
                          href={currentResult.audioUrl}
                          download={`qeema-${selectedVoice.name}.wav`}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-colors"
                          title="تحميل الملف الصوتي"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section of Editor Pane: "Get started with" chips + Generate Bar */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                
                {/* Get started with chips matching Image 1 */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-400">ابدأ مع نماذج مقترحة (Get started with):</span>
                  <div className="flex flex-wrap gap-2">
                    {promptPresets.map((preset) => {
                      const Icon = preset.icon;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setText(preset.text)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-xs text-slate-700 transition-all shadow-2xs group"
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-700" />
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Bar: Character Count + Generate Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="font-mono font-medium">
                      {cleanLength.toLocaleString()} / 5,000 حرف
                    </span>
                    <span className="h-3 w-[1px] bg-slate-200" />
                    <span className="flex items-center gap-1 text-slate-600">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>التكلفة المتوقعة: <strong className="font-mono text-slate-900">{estimatedCredits.toLocaleString()}</strong> نقطة</span>
                    </span>
                    <span className="h-3 w-[1px] bg-slate-200" />
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      الرصيد المتاح: {balanceCredits.toLocaleString()}
                    </span>
                  </div>

                  {/* Generate Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !text.trim()}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-ink hover:bg-brand-ink/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>جاري التوليد العصبي...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-orange-400" />
                          <span>توليد الصوت (Generate speech)</span>
                          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">Ctrl+Enter</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </main>

            {/* RIGHT SETTINGS SIDEBAR (4 Cols) - Matching Image 1 */}
            <aside className="lg:col-span-4 bg-slate-50/50 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-6">
              
              <div className="space-y-6">
                
                {/* Tabs: Settings | History */}
                <div className="flex items-center gap-6 border-b border-slate-200 pb-2">
                  <button
                    onClick={() => setSidebarTab('settings')}
                    className={`text-xs font-bold pb-2 relative transition-colors ${
                      sidebarTab === 'settings'
                        ? 'text-slate-950 border-b-2 border-slate-950 -mb-[9px]'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    الإعدادات (Settings)
                  </button>

                  <button
                    onClick={() => setSidebarTab('history')}
                    className={`text-xs font-bold pb-2 relative transition-colors flex items-center gap-1.5 ${
                      sidebarTab === 'history'
                        ? 'text-slate-950 border-b-2 border-slate-950 -mb-[9px]'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <span>السجل (History)</span>
                    {recentGenerations.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-mono">
                        {recentGenerations.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Content: Settings or History */}
                {sidebarTab === 'settings' ? (
                  <div className="space-y-6">
                    
                    {/* Promo Banner: Try Voice Design for v3 (Image 1 top right) */}
                    {showV3Banner && (
                      <div className="p-4 rounded-2xl bg-gradient-to-l from-emerald-600 via-teal-700 to-slate-900 text-white relative shadow-sm overflow-hidden">
                        <button
                          onClick={() => setShowV3Banner(false)}
                          className="absolute top-2.5 left-2.5 text-white/60 hover:text-white transition-colors"
                          aria-label="إغلاق"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/20">
                            <Sparkles className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div className="space-y-1 pr-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs">جرّب محرك قيمة v3 الجديد</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">V3</span>
                            </div>
                            <p className="text-[11px] text-white/80 leading-relaxed">
                              صمم نبرات وأصوات تعبيرية بالغة الدقة تدعم التشكيل وحركات الإعراب بدقة كاملة.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Voice Selector Card (Image 1) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">الصوت (Voice):</label>
                      <button
                        onClick={() => setIsVoicePickerOpen(true)}
                        className="w-full p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between text-right shadow-2xs group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-700 flex items-center justify-center shrink-0">
                            <Volume2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>{selectedVoice.name}</span>
                              <span className="text-xs">{catalogItem?.flag || '🇸🇦'}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">{selectedVoice.dialect || 'لهجة عربية معتمدة'}</p>
                          </div>
                        </div>

                        <ChevronLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-transform" />
                      </button>
                    </div>

                    {/* Model Selector Card (Image 1) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">النموذج (Model):</label>
                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-mono font-bold">
                              {selectedModel === 'v3' ? 'V3' : 'V2'}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {selectedModel === 'v3' ? 'قيمة ستوديو v3 (الأكثر تعبيراً)' : 'قيمة متعدد اللهجات v2'}
                            </span>
                          </div>
                          
                          {/* Toggle Model */}
                          <button
                            onClick={() => setSelectedModel(selectedModel === 'v3' ? 'v2' : 'v3')}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                          >
                            {selectedModel === 'v3' ? 'v3 نشط' : 'الترقية لـ v3'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {selectedModel === 'v3' 
                            ? 'أحدث نموذج عصبي للأصوات العربية التعبيرية مع التحكم بالأنفاس والمشاعر.' 
                            : 'النموذج الأكثر استقراراً للسرد الطويل والتقارير الإخبارية.'}
                        </p>
                      </div>
                    </div>

                    {/* Sliders Section (Image 1) */}
                    <div className="space-y-5 pt-2">
                      
                      {/* Speed Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">السرعة (Speed)</span>
                          <span className="text-xs font-mono text-slate-500">{speed.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.70"
                          max="1.50"
                          step="0.05"
                          value={speed}
                          onChange={(e) => setSpeed(Number(e.target.value))}
                          className="w-full accent-slate-900 cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>أبطأ (Slower)</span>
                          <span>أسرع (Faster)</span>
                        </div>
                      </div>

                      {/* Stability Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">الاستقرار (Stability)</span>
                          <span className="text-xs font-mono text-slate-500">{stability}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stability}
                          onChange={(e) => setStability(Number(e.target.value))}
                          className="w-full accent-slate-900 cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>أكثر تنوعاً وتفاعلاً (More variable)</span>
                          <span>أكثر ثباتاً وهدوءاً (More stable)</span>
                        </div>
                      </div>

                      {/* Similarity Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">التطابق والشبه (Similarity)</span>
                          <span className="text-xs font-mono text-slate-500">{similarity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={similarity}
                          onChange={(e) => setSimilarity(Number(e.target.value))}
                          className="w-full accent-slate-900 cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>منخفض (Low)</span>
                          <span>مرتفع (High)</span>
                        </div>
                      </div>

                      {/* Style Exaggeration Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">المبالغة في الأداء (Style Exaggeration)</span>
                          <span className="text-xs font-mono text-slate-500">{styleExaggeration}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={styleExaggeration}
                          onChange={(e) => setStyleExaggeration(Number(e.target.value))}
                          className="w-full accent-slate-900 cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>طبيعي (None)</span>
                          <span>درامي مكثف (Exaggerated)</span>
                        </div>
                      </div>

                    </div>

                  </div>
                ) : (
                  /* History Tab Content */
                  <div className="space-y-3">
                    {recentGenerations.length === 0 ? (
                      <div className="text-center py-12 space-y-2">
                        <FileAudio className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">لا توجد تسجيلات حديثة</p>
                        <p className="text-[11px] text-slate-400">أي مقطع تقوم بتوليده سيظهر هنا للرجوع إليه وتحميله.</p>
                      </div>
                    ) : (
                      recentGenerations.map((gen) => (
                        <div key={gen.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{gen.voiceName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(gen.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-600 line-clamp-2 text-[11px]">{gen.text}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 font-mono">{gen.durationSeconds}s</span>
                            <a
                              href={gen.audioUrl}
                              download={`generation-${gen.id}.wav`}
                              className="text-orange-700 hover:text-orange-700 font-bold text-[11px] flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>تحميل</span>
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>

              {/* Bottom Pro Tip */}
              <div className="pt-4 border-t border-slate-200 text-center">
                <button
                  onClick={onOpenTopUp}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-white text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>شحن الرصيد الإضافي</span>
                </button>
              </div>

            </aside>

          </div>

          {/* VOICE PICKER MODAL */}
          {isVoicePickerOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">اختر صوت الذكاء الاصطناعي</h3>
                    <p className="text-xs text-slate-500">تصفح الأصوات المتاحة حسب اللهجة ونمط الإلقاء</p>
                  </div>
                  <button
                    onClick={() => setIsVoicePickerOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search & Filter */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      value={voiceSearchQuery}
                      onChange={(e) => setVoiceSearchQuery(e.target.value)}
                      placeholder="ابحث باسم الصوت أو اللهجة..."
                      className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Voices List */}
                <div className="p-4 overflow-y-auto space-y-2 flex-1">
                  {aiVoices
                    .filter(v => 
                      v.name.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
                      v.dialect?.toLowerCase().includes(voiceSearchQuery.toLowerCase())
                    )
                    .map((voice) => {
                      const isSelected = voice.id === selectedVoiceId;
                      const catItem = AI_VOICES_CATALOG.find(c => c.id === voice.id || c.name === voice.name);
                      return (
                        <div
                          key={voice.id}
                          onClick={() => {
                            setSelectedVoiceId(voice.id);
                            setIsVoicePickerOpen(false);
                          }}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50/70 shadow-2xs' 
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-700 flex items-center justify-center font-bold text-sm">
                              {catItem?.flag || '🎙️'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{voice.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                  {voice.dialect}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {catItem?.subtitle || voice.styleLabel || 'صوت ذكي فائق الواقعية'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <Check className="w-4 h-4 text-orange-700 shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
