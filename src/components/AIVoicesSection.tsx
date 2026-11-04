import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Sliders, 
  PenTool, 
  Link as LinkIcon, 
  Upload, 
  Moon, 
  Snowflake, 
  Heart, 
  Search, 
  Activity, 
  BookOpen, 
  Smile, 
  MessageSquare, 
  Hash, 
  GraduationCap, 
  Megaphone,
  RotateCcw,
  Volume2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  FileText
} from 'lucide-react';

interface VoiceItem {
  id: string;
  name: string;
  title: string; // اسم المقطع الصوتي (يُعرض بدل اسم المعلق)
  nameEn: string;
  categoryKey: string;
  categoryLabel: string;
  dialect: string;
  flag: string;
  gender: 'male' | 'female';
  avatarGradient: string;
  previewQuote: string;
  audioSampleUrl: string;
}

interface AIVoicesSectionProps {
  onOpenStudio?: (params?: { text: string; voiceId: string }) => void;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  isLoggedIn?: boolean;
}

const CATEGORIES = [
  { key: 'popular', label: 'الأكثر شعبية', icon: Activity, count: '12 صوت' },
  { key: 'narration', label: 'سرد وروايات', icon: BookOpen, count: '18 صوت' },
  { key: 'characters', label: 'شخصيات ودوبلاج', icon: Smile, count: '15 صوت' },
  { key: 'conversational', label: 'حوارية وتفاعلية', icon: MessageSquare, count: '14 صوت' },
  { key: 'social', label: 'سوشيال ميديا وريلز', icon: Hash, count: '22 صوت' },
  { key: 'educational', label: 'تعليم وتدريب', icon: GraduationCap, count: '16 صوت' },
  { key: 'ads', label: 'إعلانات وترفيه', icon: Megaphone, count: '20 صوت' },
];

const VOICES_DATA: VoiceItem[] = [
  {
    id: 'haytham',
    title: 'حكايات من التاريخ',
    name: 'هيثم',
    nameEn: 'Haytham',
    categoryKey: 'narration',
    categoryLabel: 'سرد وروايات',
    dialect: 'فصحى معيارية',
    flag: '🌍',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #0f172a 0%, #1e293b 60%, #020617 100%)',
    previewQuote: 'في كل زاوية من التاريخ حكاية تنتظر من يرويها بنبض حي وأصالة لا تنتهي.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'
  },
  {
    id: 'meisam',
    title: 'على ضفاف الرافدين',
    name: 'ميثم',
    nameEn: 'Meisam',
    categoryKey: 'narration',
    categoryLabel: 'سرد وروايات',
    dialect: 'عراقي فصيح',
    flag: '🇮🇶',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #991b1b 0%, #7f1d1d 60%, #450a0a 100%)',
    previewQuote: 'على ضفاف الرافدين نسجت أعظم الحضارات سطور المجد وخلود الكلمة.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3'
  },
  {
    id: 'rima',
    title: 'مساعدك الشخصي',
    name: 'ريما م.',
    nameEn: 'Rima M',
    categoryKey: 'conversational',
    categoryLabel: 'حوارية وتفاعلية',
    dialect: 'خليجي معاصر',
    flag: '🇸🇦',
    gender: 'female',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #ea580c 0%, #c2410c 60%, #7c2d12 100%)',
    previewQuote: 'أهلاً بك! كيف يمكنني مساعدتك في تسهيل جدول أعمالك اليوم بكل سلاسة؟',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3'
  },
  {
    id: 'hazem',
    title: 'يسعدني خدمتك',
    name: 'حازم',
    nameEn: 'Hazem',
    categoryKey: 'conversational',
    categoryLabel: 'حوارية وتفاعلية',
    dialect: 'سعودي نجدي',
    flag: '🇸🇦',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #8b5cf6 0%, #6d28d9 60%, #4c1d95 100%)',
    previewQuote: 'يسعدني التواصل معك، كل خدماتنا مهيأة لدعم نجاحك ورفع كفاءة أعمالك.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2871/2871-preview.mp3'
  },
  {
    id: 'mazen',
    title: 'أناقة التفاصيل',
    name: 'مازن لاوند',
    nameEn: 'Mazen Lawand',
    categoryKey: 'ads',
    categoryLabel: 'إعلانات وترفيه',
    dialect: 'شامي سوري',
    flag: '🇸🇾',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #065f46 0%, #047857 60%, #022c22 100%)',
    previewQuote: 'الأناقة تبدأ بتفاصيل صغيرة تصنع الفارق الأكبر في كل لحظة تعيشها.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'
  },
  {
    id: 'seham',
    title: 'عرض لفترة محدودة',
    name: 'سهام',
    nameEn: 'Seham',
    categoryKey: 'ads',
    categoryLabel: 'إعلانات وترفيه',
    dialect: 'مصري أبيض',
    flag: '🇪🇬',
    gender: 'female',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #f59e0b 0%, #d97706 60%, #78350f 100%)',
    previewQuote: 'العرض الحصري لفترة محدودة، سجّل الآن وخلي مشروعك ينطلق لأعلى مستوى!',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
  },
  {
    id: 'mohammed',
    title: 'يلا شباب',
    name: 'محمد',
    nameEn: 'Mohammed',
    categoryKey: 'social',
    categoryLabel: 'سوشيال ميديا وريلز',
    dialect: 'سعودي معاصر',
    flag: '🇸🇦',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #0284c7 0%, #0369a1 60%, #0c4a6e 100%)',
    previewQuote: 'تخيل تقدر تنجز مونتاج أسبوع كامل بساعة واحدة! تابع الفيديو لتعرف السر.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3'
  },
  {
    id: 'bilal',
    title: 'تطبيقات تسهّل حياتك',
    name: 'بلال أ.',
    nameEn: 'Bilal A',
    categoryKey: 'social',
    categoryLabel: 'سوشيال ميديا وريلز',
    dialect: 'مغاربي رشيق',
    flag: '🇲🇦',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #10b981 0%, #059669 60%, #064e3b 100%)',
    previewQuote: 'نشارككم اليوم أفضل التطبيقات اللي هتسهل حياتكم الرقمية من أول تجربة.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3'
  },
  {
    id: 'hany',
    title: 'أساسيات معالجة اللغة',
    name: 'هاني',
    nameEn: 'Hany',
    categoryKey: 'educational',
    categoryLabel: 'تعليم وتدريب',
    dialect: 'فصحى معيارية',
    flag: '🌍',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #2563eb 0%, #1d4ed8 60%, #172554 100%)',
    previewQuote: 'تعتبر الخوارزميات العصبية حجر الأساس في تطوير معالجة اللغات الطبيعية الحديثة.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'
  },
  {
    id: 'maged',
    title: 'الذكاء الاصطناعي خطوة بخطوة',
    name: 'ماجد مجدي',
    nameEn: 'Maged Magdy',
    categoryKey: 'educational',
    categoryLabel: 'تعليم وتدريب',
    dialect: 'مصري هادئ',
    flag: '🇪🇬',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #db2777 0%, #be185d 60%, #831843 100%)',
    previewQuote: 'خطوة بخطوة هنشرح مفهوم الذكاء الاصطناعي وكيفية تطبيقه في مجالاتك اليومية.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3'
  },
  {
    id: 'jawad',
    title: 'استعادة قلعة الأجداد',
    name: 'جواد',
    nameEn: 'Jawad',
    categoryKey: 'characters',
    categoryLabel: 'شخصيات ودوبلاج',
    dialect: 'فصحى درامية',
    flag: '🌍',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #4338ca 0%, #3730a3 60%, #1e1b4b 100%)',
    previewQuote: 'أيها الفرسان، لقد حانت اللحظة التي انتظرناها طويلاً لاستعادة قلعة الأجداد!',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3'
  },
  {
    id: 'saud',
    title: 'سباق وادي الرمال',
    name: 'سعود',
    nameEn: 'Saud',
    categoryKey: 'characters',
    categoryLabel: 'شخصيات ودوبلاج',
    dialect: 'سعودي حماسي',
    flag: '🇸🇦',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #d97706 0%, #b45309 60%, #78350f 100%)',
    previewQuote: 'جهزوا المركبات! السباق الأكبر في وادي الرمال سينطلق مع بزوغ شمس الغد.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2871/2871-preview.mp3'
  },
  // Extra voices for 3-page pagination:
  {
    id: 'tariq_ai',
    title: 'اليوم الوطني السعودي',
    name: 'طارق الشمري',
    nameEn: 'Tariq AI',
    categoryKey: 'narration',
    categoryLabel: 'سرد وروايات',
    dialect: 'سعودي وقور',
    flag: '🇸🇦',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #1e3a8a 0%, #172554 60%, #030712 100%)',
    previewQuote: 'نبتكر حلول الغد بثقة اليوم، لأن طموحنا يعانق عنان السماء في أرض العطاء.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'
  },
  {
    id: 'sara_ai',
    title: 'أهلاً بك في منصتنا',
    name: 'سارة الدوسري',
    nameEn: 'Sara AI',
    categoryKey: 'conversational',
    categoryLabel: 'حوارية وتفاعلية',
    dialect: 'حجازي ناعم',
    flag: '🇸🇦',
    gender: 'female',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #be123c 0%, #9f1239 60%, #4c0519 100%)',
    previewQuote: 'مرحباً بك في منصتنا، كيف يمكننا جعل تجربتك اليوم أكثر تميزاً وإلهاماً؟',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
  },
  {
    id: 'nour_ai',
    title: 'راحة بال تامة',
    name: 'نور الهدى',
    nameEn: 'Nour AI',
    categoryKey: 'ads',
    categoryLabel: 'إعلانات وترفيه',
    dialect: 'مصري تسويقي',
    flag: '🇪🇬',
    gender: 'female',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #c2410c 0%, #9a3412 60%, #431407 100%)',
    previewQuote: 'كل تفصيلة صغيرة في منتجنا مصممة عشان تديك راحة بال تامة وجودة تدوم.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3'
  },
  {
    id: 'karim_ai',
    title: 'ياسمين دمشق',
    name: 'كريم المنصور',
    nameEn: 'Karim AI',
    categoryKey: 'narration',
    categoryLabel: 'سرد وروايات',
    dialect: 'شامي مخملي',
    flag: '🇸🇾',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #7c3aed 0%, #6d28d9 60%, #2e1065 100%)',
    previewQuote: 'بين أزقة دمشق القديمة، كان نسيم الياسمين يعزف نغمات لا تنتهي من الحنين.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3'
  },
  {
    id: 'sofia_ai',
    title: 'أزياء مغربية فاخرة',
    name: 'صوفيا المراكشي',
    nameEn: 'Sofia AI',
    categoryKey: 'ads',
    categoryLabel: 'إعلانات وترفيه',
    dialect: 'مغاربي فاخر',
    flag: '🇲🇦',
    gender: 'female',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #0f766e 0%, #115e59 60%, #042f2e 100%)',
    previewQuote: 'حين تجتمع المهارة المغربية العريقة مع أرقى خطوط الموضة العالمية.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'
  },
  {
    id: 'faisal_ai',
    title: 'ريادة عالمية',
    name: 'فيصل النيوم',
    nameEn: 'Faisal AI',
    categoryKey: 'popular',
    categoryLabel: 'الأكثر شعبية',
    dialect: 'سعودي معاصر',
    flag: '🇸🇦',
    gender: 'male',
    avatarGradient: 'radial-gradient(circle at 35% 35%, #0369a1 0%, #0284c7 60%, #082f49 100%)',
    previewQuote: 'الذكاء الاصطناعي الصوتي هو بوصلة التطور للشركات الساعية للريادة العالمية.',
    audioSampleUrl: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3'
  }
];

const SAMPLE_PROMPTS = [
  {
    icon: Moon,
    title: 'اقرأ لي قصة قبل النوم',
    text: 'في قديم الزمان، بين تلال الرمال الذهبية وتحت سماء تتلألأ بالنجوم، كانت هناك واحة هادئة تروي أسرار القوافل العابرة بسلام وهدوء...'
  },
  {
    icon: Snowflake,
    title: 'خذني في رحلة وثائقية',
    text: 'تمتد سهول الجليد في القطب الشمالي على مد البصر، حيث تصمت الرياح لتعلن ولادة فجر قطبي ساحر لا يغيب عن الأفق...'
  },
  {
    icon: Heart,
    title: 'استرجع ذكرى دافئة',
    text: 'أذكر رائحة القهوة بالهيل في صباحات العيد، وضحكات الأهل التي كانت تملأ أرجاء البيت دفئاً وطمأنينة لا تُمحى من الذاكرة أبداً...'
  },
  {
    icon: Search,
    title: 'اكشف غموض قضية مثيرة',
    text: 'في ليلة خريفية ماطرة، انطفأت أنوار الميناء فجأة، واختفت الشحنة الغامضة دون أن تترك أثراً سوى مفتاح برونزي قديم محفور عليه رمز مجهول...'
  }
];

export const AIVoicesSection: React.FC<AIVoicesSectionProps> = ({
  onOpenStudio,
  onOpenLogin,
  onOpenSignup,
  isLoggedIn = false
}) => {
  // Navigation State: 'select' (State 1) or 'generate' (State 2)
  const [stage, setStage] = useState<'select' | 'generate'>('select');

  // Selected Category & Language
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ar-all');

  // Selected Voice
  const [selectedVoice, setSelectedVoice] = useState<VoiceItem>(VOICES_DATA[0]);

  // Audio Playback state for voice row previews
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Pagination (6 voices per page)
  const [page, setPage] = useState<number>(1);
  const pageSize = 6;

  // Textarea input and active mode tab ('text' | 'link' | 'file')
  const [inputTab, setInputTab] = useState<'text' | 'link' | 'file'>('text');
  const [inputText, setInputText] = useState<string>(
    'اكتب نصك هنا مع إمكانية إضافة وسوم التعبير الصوتي مثل [ضحك] أو [همس] أو [تنهد] لتحويلها إلى كلام معبّر وفائق الواقعية...'
  );

  // Link / file input state
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkStatus, setLinkStatus] = useState<'idle' | 'invalid' | 'ready'>('idle');
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [fileNote, setFileNote] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generation playback state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingGenerated, setIsPlayingGenerated] = useState(false);

  // Filter voices based on selected category & language
  const filteredVoices = VOICES_DATA.filter(voice => {
    if (selectedCategory === 'popular') return true;
    return voice.categoryKey === selectedCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredVoices.length / pageSize));
  const currentVoices = filteredVoices.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  // Play preview of a voice
  const handleToggleVoiceAudio = (e: React.MouseEvent, voice: VoiceItem) => {
    e.stopPropagation();

    if (playingVoiceId === voice.id) {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }

    if (audioPreviewRef.current) audioPreviewRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    setPlayingVoiceId(voice.id);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(voice.previewQuote);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      const audio = new Audio(voice.audioSampleUrl);
      audioPreviewRef.current = audio;
      audio.play().catch(() => setPlayingVoiceId(null));
      audio.onended = () => setPlayingVoiceId(null);
    }
  };

  // Select voice & transition to Generate Speech view (Stage 2)
  const handleUseVoice = (voice: VoiceItem) => {
    setSelectedVoice(voice);
    setStage('generate');
    // If text was still default placeholder, fill with the voice quote or standard prompt
    if (inputText.includes('اكتب نصك هنا مع إمكانية إضافة وسوم')) {
      setInputText(voice.previewQuote);
    }
  };

  // Handle Instant Speech Generation (Free visitor preview)
  const handleGenerateSpeech = () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setIsPlayingGenerated(false);

    setTimeout(() => {
      setIsGenerating(false);
      setIsPlayingGenerated(true);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(inputText);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.98;
        utterance.onend = () => setIsPlayingGenerated(false);
        utterance.onerror = () => setIsPlayingGenerated(false);
        window.speechSynthesis.speak(utterance);
      } else {
        const audio = new Audio(selectedVoice.audioSampleUrl);
        audioPreviewRef.current = audio;
        audio.play().catch(e => console.log('Audio error:', e));
        audio.onended = () => setIsPlayingGenerated(false);
      }
    }, 600);
  };

  const handleStopGeneratedSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setIsPlayingGenerated(false);
  };

  const handleSubmitLink = () => {
    const raw = linkUrl.trim();
    if (!raw) { setLinkStatus('invalid'); return; }
    try {
      const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (!u.hostname.includes('.')) throw new Error('bad host');
      setLinkUrl(u.toString());
      setLinkStatus('ready');
    } catch {
      setLinkStatus('invalid');
    }
  };

  const handlePickFile = (file: File | null) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'txt', 'epub', 'docx'].includes(ext)) {
      setPickedFile(null);
      setFileNote('نوع الملف غير مدعوم. الأنواع المدعومة: PDF، TXT، EPUB، DOCX.');
      return;
    }
    setPickedFile(file);
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = () => {
        setInputText(String(reader.result || '').slice(0, 5000));
        setInputTab('text');
        setPickedFile(null);
        setFileNote('');
      };
      reader.readAsText(file);
    } else {
      setFileNote('لاستخراج النص من هذا النوع افتحه في الاستوديو الاحترافي.');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" dir="rtl" id="tts-studio">
      
      {/* Studio Outer Card - Clean Minimalist B2B Architecture matching screenshot */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-slate-900 transition-all">
        <div className="flex flex-col lg:flex-row min-h-[620px]">

          {/* ========================================================================= */}
          {/* COLUMN 1 (RIGHT in RTL): Hero Intro / Category Selection (State 1)        */}
          {/* OR Voice List Sidebar when in State 2 (Generate Speech)                  */}
          {/* ========================================================================= */}
          {stage === 'select' ? (
            /* STATE 1: Left column in LTR, Right column in RTL */
            <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-slate-200/90">
              <div className="space-y-6">

                {/* Main Headline */}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  تحويل النص إلى كلام بأصوات AI واقعية تماثل أصوات البشر
                </h2>

                {/* Action Buttons: Log in with Google & Convert Text to Speech */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={onOpenSignup || onOpenLogin}
                    className="px-5 py-3 rounded-full bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-sm cursor-pointer"
                  >
                    {/* Multi-colored Google 'G' icon */}
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>تسجيل الدخول بواسطة Google</span>
                  </button>

                  <button
                    onClick={() => {
                      setStage('generate');
                    }}
                    className="px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-300 transition-all cursor-pointer shadow-xs"
                  >
                    تحويل النص إلى كلام
                  </button>
                </div>

                {/* Categories Navigation Header & Language Dropdown */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    مختارة خصيصاً لمجال استخدامك
                  </span>

                  {/* Language Selector Dropdown matching screenshot */}
                  <div className="relative">
                    <button
                      className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>العربية 🇸🇦</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Categories Vertical List matching screenshot */}
                <div className="space-y-1 pt-1">
                  {CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat.key;
                    const IconComponent = cat.icon;

                    return (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span>{cat.label}</span>
                        </div>

                        {isSelected && (
                          <ChevronLeft className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Free Visitor Notice */}
              <div className="pt-4 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>متاح للتجربة الحية المباشرة لجميع الزوار بدون قيود أولية.</span>
              </div>
            </div>
          ) : (
            /* STATE 2 (In Stage = 'generate'): Left column in LTR, Right in RTL shows voice list + back button */
            <div className="w-full lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-slate-200/90 bg-slate-50/50">
              <div>
                {/* Back to categories button */}
                <button
                  onClick={() => setStage('select')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 mb-6 group cursor-pointer transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  <span>العودة للتصنيفات</span>
                </button>

                {/* Voice List with Selected Voice Checked */}
                <div className="space-y-1.5">
                  {currentVoices.map(voice => {
                    const isSelected = selectedVoice.id === voice.id;
                    const isPlaying = playingVoiceId === voice.id;

                    return (
                      <div
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice)}
                        className={`group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-slate-100/90 text-slate-900 font-bold border border-slate-300/80 shadow-xs'
                            : 'hover:bg-slate-100/60 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Play / Avatar Orb */}
                          <div
                            onClick={(e) => handleToggleVoiceAudio(e, voice)}
                            className="w-8 h-8 rounded-full flex items-center justify-center relative shrink-0 shadow-xs cursor-pointer overflow-hidden group/orb"
                            style={{ background: isSelected ? '#000' : voice.avatarGradient }}
                            title="استماع لنموذج الصوت"
                          >
                            {isSelected && !isPlaying && (
                              <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5 relative z-10" />
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/orb:opacity-100 transition-opacity flex items-center justify-center">
                              {isPlaying ? (
                                <Pause className="w-3.5 h-3.5 text-white fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                              )}
                            </div>
                            {isPlaying && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Pause className="w-3.5 h-3.5 text-white fill-current" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-sm truncate block">{voice.title}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-normal">
                            {voice.categoryLabel}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-slate-900 stroke-[2.5]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination matching screenshot */}
              <div className="pt-6 flex items-center justify-between border-t border-slate-200/80 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="font-mono text-xs">
                  {page}/{totalPages}
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COLUMN 2 (LEFT in RTL): Voice Browsing List (State 1)                     */}
          {/* OR Text-to-Speech Editor & Generation Studio (State 2)                    */}
          {/* ========================================================================= */}
          {stage === 'select' ? (
            /* STATE 1: Right column in LTR, Left column in RTL */
            <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-between bg-slate-50/30">
              <div>
                {/* Breadcrumbs Header */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
                  <span className="text-slate-900 font-bold">اختر صوتاً</span>
                  <span className="text-slate-400 font-mono">›</span>
                  <span
                    onClick={() => setStage('generate')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                  >
                    توليد الكلام
                  </span>
                </div>

                {/* Voices List with Avatar, Name, Category & 'Use Voice' button */}
                <div className="space-y-2.5">
                  {currentVoices.map(voice => {
                    const isSelected = selectedVoice.id === voice.id;
                    const isPlaying = playingVoiceId === voice.id;

                    return (
                      <div
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice)}
                        className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all select-none border border-transparent ${
                          isSelected
                            ? 'bg-slate-100/90 border-slate-200 shadow-xs'
                            : 'hover:bg-slate-100/60'
                        }`}
                      >
                        {/* Right: Avatar + Play button + Name */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Colorful Artistic Orb Avatar matching screenshot */}
                          <div
                            onClick={(e) => handleToggleVoiceAudio(e, voice)}
                            className="w-10 h-10 rounded-full flex items-center justify-center relative shrink-0 shadow-xs cursor-pointer overflow-hidden group/orb"
                            style={{ background: voice.avatarGradient }}
                            title="استماع لنموذج الصوت"
                          >
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/orb:opacity-100 transition-opacity flex items-center justify-center">
                              {isPlaying ? (
                                <Pause className="w-4 h-4 text-white fill-current" />
                              ) : (
                                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                              )}
                            </div>
                            {isPlaying && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Pause className="w-4 h-4 text-white fill-current" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {voice.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span>{voice.flag}</span>
                              <span>{voice.dialect}</span>
                            </div>
                          </div>
                        </div>

                        {/* Left: Category Label + 'Use Voice' Button */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                            {voice.categoryLabel}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseVoice(voice);
                            }}
                            className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer shadow-xs ${
                              isSelected
                                ? 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200'
                                : 'bg-white group-hover:bg-slate-900 group-hover:text-white text-slate-700 border border-slate-200'
                            }`}
                          >
                            استخدم هذا الصوت
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination & Bottom Link matching screenshot */}
              <div className="pt-8 space-y-4">
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-mono text-xs text-slate-500">
                    {page}/{totalPages}
                  </span>
                </div>

                <div className="text-center pt-1">
                  <button
                    onClick={() => {
                      if (onOpenStudio) onOpenStudio();
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-950 inline-flex items-center gap-1.5 group cursor-pointer transition-colors"
                  >
                    <span>استكشف كافة الأصوات (1,000+ صوت عربي)</span>
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STATE 2: Editor Column (Right in LTR, Left in RTL) matching screenshot */
            <div className="w-full lg:w-3/5 p-6 sm:p-10 flex flex-col justify-between bg-white">
              <div className="space-y-6">
                
                {/* Input Mode Tabs: [Enter text] [Paste link] [Upload file] */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInputTab('text')}
                    className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      inputTab === 'text'
                        ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 border border-transparent'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>إدخال نص</span>
                  </button>

                  <button
                    onClick={() => setInputTab('link')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      inputTab === 'link'
                        ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 border border-transparent'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>لصق رابط</span>
                  </button>

                  <button
                    onClick={() => setInputTab('file')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      inputTab === 'file'
                        ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 border border-transparent'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع ملف</span>
                  </button>
                </div>

                {inputTab === 'text' && (
                  <>
                {/* Main Textarea matching screenshot */}
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                    className="w-full text-slate-800 placeholder-slate-400 text-sm sm:text-base border-0 focus:outline-none resize-none leading-relaxed p-0 bg-transparent"
                    placeholder="Type your text with audio tags like [laughs] to turn into expressive speech..."
                  />
                </div>

                {/* Prompt Suggestions matching screenshot ('Get started with') */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-semibold text-slate-500">
                    ابدأ مع نماذج جاهزة:
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROMPTS.map((prompt, idx) => {
                      const IconComponent = prompt.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => setInputText(prompt.text)}
                          className="px-3.5 py-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                        >
                          <IconComponent className="w-3.5 h-3.5 text-slate-500" />
                          <span>{prompt.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                  </>
                )}

                {/* Paste link panel */}
                {inputTab === 'link' && (
                  <div className="min-h-[300px] flex flex-col items-center justify-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                      <LinkIcon className="w-6 h-6" />
                    </div>
                    <div className="w-full max-w-md flex items-center gap-3">
                      <input
                        type="text"
                        dir="ltr"
                        value={linkUrl}
                        onChange={(e) => { setLinkUrl(e.target.value); setLinkStatus('idle'); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitLink(); }}
                        placeholder="الصق رابطاً هنا..."
                        className="flex-1 min-w-0 px-5 py-4 rounded-2xl border border-dashed border-slate-300 bg-transparent text-center text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
                      />
                      <button
                        type="button"
                        onClick={handleSubmitLink}
                        disabled={!linkUrl.trim()}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          linkUrl.trim() ? 'bg-brand-ink text-white hover:bg-brand-ink/90' : 'bg-slate-300 text-white cursor-not-allowed'
                        }`}
                        title="إرسال الرابط"
                      >
                        <CornerDownLeft className="w-5 h-5" />
                      </button>
                    </div>
                    {linkStatus === 'invalid' && (
                      <p className="text-xs text-rose-600">الرابط غير صالح، تأكد من كتابته بشكل صحيح.</p>
                    )}
                    {linkStatus === 'ready' && (
                      <div className="text-center space-y-2">
                        <p className="text-xs text-emerald-700 font-semibold">تم حفظ الرابط. افتحه في الاستوديو لاستخراج النص وتحويله إلى صوت.</p>
                        <button
                          type="button"
                          onClick={() => onOpenStudio && onOpenStudio({ text: linkUrl, voiceId: selectedVoice.id })}
                          className="px-4 py-2 rounded-full bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold cursor-pointer"
                        >
                          فتح في الاستوديو
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload file panel */}
                {inputTab === 'file' && (
                  <div className="min-h-[300px] flex flex-col items-center justify-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.epub,.docx"
                      className="hidden"
                      onChange={(e) => { handlePickFile(e.target.files?.[0] || null); e.target.value = ''; }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handlePickFile(e.dataTransfer.files?.[0] || null); }}
                      className={`w-full max-w-xl py-14 rounded-3xl border border-dashed flex flex-col items-center gap-3 transition-colors cursor-pointer ${
                        isDragging ? 'border-slate-500 bg-slate-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900">اضغط لاختيار ملف للرفع</div>
                      <div className="text-xs text-slate-400 tracking-wide" dir="ltr">PDF, TXT, EPUB, DOCX</div>
                    </button>
                    {pickedFile && (
                      <div className="text-center space-y-2">
                        <p className="text-xs text-slate-700 font-semibold" dir="auto">{pickedFile.name}</p>
                        <p className="text-xs text-slate-500">{fileNote}</p>
                        <button
                          type="button"
                          onClick={() => onOpenStudio && onOpenStudio({ text: '', voiceId: selectedVoice.id })}
                          className="px-4 py-2 rounded-full bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold cursor-pointer"
                        >
                          فتح في الاستوديو
                        </button>
                      </div>
                    )}
                    {!pickedFile && fileNote && <p className="text-xs text-rose-600">{fileNote}</p>}
                  </div>
                )}

              </div>

              {/* Bottom Action Bar: Generate Speech button */}
              <div className="pt-8 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                
                {/* Free preview badge for guests */}
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>المقطع المختار: <strong>{selectedVoice.title}</strong> ({selectedVoice.dialect})</span>
                </div>

                <div className={`flex items-center gap-3 ${inputTab !== 'text' ? 'hidden' : ''}`}>
                  {isPlayingGenerated ? (
                    <button
                      onClick={handleStopGeneratedSpeech}
                      className="px-6 py-3 rounded-full bg-brand-ink text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                      <span>إيقاف التشغيل</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateSpeech}
                      disabled={isGenerating || !inputText.trim()}
                      className={`px-7 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        isGenerating
                          ? 'bg-slate-600 text-white cursor-wait'
                          : 'bg-slate-700 hover:bg-brand-ink text-white'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>جارٍ التوليد...</span>
                        </>
                      ) : (
                        <span>توليد الكلام (Generate speech)</span>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (onOpenStudio) {
                        onOpenStudio({ text: inputText, voiceId: selectedVoice.id });
                      }
                    }}
                    className="p-3 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="فتح في الاستوديو الاحترافي المتقدم"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
