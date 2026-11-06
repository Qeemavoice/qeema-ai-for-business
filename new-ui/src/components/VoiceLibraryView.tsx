import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic2,
  Search,
  Play,
  Pause,
  SlidersHorizontal,
  ArrowUpDown,
  Users,
  FileText,
  Plus,
  PlusCircle,
  MoreVertical,
  Volume2,
  Info,
  Check,
  ChevronDown,
  ChevronRight,
  Wallet,
  Download,
  Star,
  Radio,
  X,
  Upload,
  ShieldCheck,
  Scan,
  MessageSquare,
  MessageCircle,
  AudioLines,
  Calendar,
  Layers,
  Sparkle,
  Hourglass,
  Link,
  Copy,
  Clock,
  Briefcase,
  Zap,
  Globe2,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Square
} from 'lucide-react';
import { Voice, DialectKey } from '../types';
import { B2BProjectRequestModal } from './B2BProjectRequestModal';
import { VoiceProfileDrawer } from './VoiceProfileDrawer';

export interface UnifiedVoiceItem {
  id: string;
  name: string;                // For Human: Talent Name (e.g. "محمد العتيبي"); For AI: Sample Name (e.g. "إعلان تقني حماسي")
  talentName?: string;         // Explicit talent name if human
  sampleName?: string;         // Explicit sample/performance title
  subtitle: string;
  description?: string;
  gender: 'male' | 'female';
  ageRange?: '20-30 سنة' | '30-40 سنة' | '40-50 سنة' | 'شبابي' | 'متوسط' | 'ناضج وقور';
  language: string;
  flag: string;
  accent: string;
  extraAccentsCount: number;
  license: string;
  licenseTooltip: string;
  usageCount: string;
  trustedClientsCount?: number;
  bookingsCount?: number;
  category: string;
  categoryKey: string;
  glassGradient: string;
  previewUrl: string;
  isVerified: boolean;
  isHuman: boolean;
  pricing?: string;
  quote?: string;
  turnaround?: string;
  hasAiTwin?: boolean;
  aiTwinId?: string;
  trustYears?: string;
  trustTooltip?: string;
  tags?: string[];
}

interface VoiceLibraryViewProps {
  voices: Voice[];
  initialTab?: 'human' | 'ai' | 'my-voices';
  onSelectForGeneration: (voice: any) => void;
  onSelectForBooking: (voice: any) => void;
  onOpenDemo?: () => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
}

/**
 * RetentionNoticeIcon:
 * Reproduces the 2-year retention icon for AI voices (Archive box/folder with clock)
 */
export const RetentionNoticeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Box / Folder outline */}
    <path
      d="M2 3.5C2 2.67 2.67 2 3.5 2H6.5L8 3.5H12.5C13.33 3.5 14 4.17 14 5V6"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 3.5V11.5C2 12.33 2.67 13 3.5 13H6"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Clock overlapping circle */}
    <circle
      cx="11"
      cy="10.5"
      r="3.5"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="white"
    />
    <path
      d="M11 8.8V10.5L12.2 11.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * TrustBadgeIcon:
 * Shield with verification checkmark indicating trust history
 */
const TrustBadgeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M8 1.5L2.5 3.8V7.5C2.5 11 5 13.8 8 14.5C11 13.8 13.5 11 13.5 7.5V3.8L8 1.5Z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 8L7.2 9.7L10.8 6"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * AudioWaveIcon:
 * Interactive 4-bar equalizer wave matching the UI design
 */
const AudioWaveIcon: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
  <div className="flex items-center gap-0.5 h-4 px-1 select-none" title={isPlaying ? "جاري الاستماع" : "استماع صوتي سريع"}>
    <span className={`w-0.5 rounded-full bg-[#FF5500] transition-all duration-200 ${isPlaying ? 'h-3 animate-pulse' : 'h-2'}`} />
    <span className={`w-0.5 rounded-full bg-[#FF5500] transition-all duration-200 ${isPlaying ? 'h-4 animate-bounce' : 'h-3.5'}`} style={{ animationDelay: '100ms' }} />
    <span className={`w-0.5 rounded-full bg-[#FF5500] transition-all duration-200 ${isPlaying ? 'h-2.5 animate-pulse' : 'h-1.5'}`} style={{ animationDelay: '200ms' }} />
    <span className={`w-0.5 rounded-full bg-[#FF5500] transition-all duration-200 ${isPlaying ? 'h-3.5 animate-bounce' : 'h-3'}`} style={{ animationDelay: '300ms' }} />
  </div>
);

/**
 * Glassmorphic Color Gradient Orb component
 */
const GlassyVoiceOrb: React.FC<{
  gradient: string;
  isPlaying: boolean;
  isVerified?: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ gradient, isPlaying, isVerified = true, onTogglePlay, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 rounded-xl' : size === 'lg' ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-2xl';
  const radiusClass = size === 'sm' ? 'rounded-xl' : 'rounded-2xl';
  const buttonSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <div className="relative shrink-0 select-none">
      <div
        onClick={onTogglePlay}
        className={`relative ${sizeClass} cursor-pointer group transition-all duration-200 active:scale-95 flex items-center justify-center overflow-hidden border border-white/50 shadow-xs`}
        style={{
          background: gradient,
          boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.45), 0 3px 8px rgba(0, 0, 0, 0.16)'
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/50 pointer-events-none ${radiusClass}`} />
        <div className={`absolute inset-[1.5px] ${radiusClass} border border-white/25 pointer-events-none`} />

        <div
          className={`${buttonSize} rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-black text-white shadow-md scale-100 opacity-100'
              : 'bg-black/65 sm:bg-black/35 text-white opacity-90 sm:opacity-0 group-hover:opacity-100 sm:hover:bg-black/80'
          }`}
        >
          {isPlaying ? (
            <Pause className={`${iconSize} fill-white text-white`} />
          ) : (
            <Play className={`${iconSize} fill-white text-white mr-0.5`} />
          )}
        </div>
      </div>

      {isVerified && (
        <div
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-xs z-10"
          title="معلق صوتي موثق ومعتمد تجارياً"
        >
          <Check className="w-2 h-2 text-white stroke-[3.5]" />
        </div>
      )}
    </div>
  );
};

export const VoiceLibraryView: React.FC<VoiceLibraryViewProps> = ({
  voices,
  initialTab = 'human',
  onSelectForGeneration,
  onSelectForBooking,
  onOpenDemo,
  isLoggedIn = false,
  onRequireAuth
}) => {
  // Top-level tabs: Default to 'human' (Human Voices as primary product)
  const [activeMainTab, setActiveMainTab] = useState<'human' | 'ai' | 'my-voices'>(initialTab || 'human');

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  // Sub-navigation and filters
  const [subTab, setSubTab] = useState<'explore' | 'my-voices'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDialect, setSelectedDialect] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSpeed, setSelectedSpeed] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'usage' | 'name'>('popularity');

  // Modals & Drawers state
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDialectDropdown, setShowDialectDropdown] = useState(false);
  const [activeMenuVoiceId, setActiveMenuVoiceId] = useState<string | null>(null);
  const [selectedProfileVoice, setSelectedProfileVoice] = useState<UnifiedVoiceItem | null>(null);
  const [isB2BProjectModalOpen, setIsB2BProjectModalOpen] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showCreateVoiceModal, setShowCreateVoiceModal] = useState(false);
  const [showJoinTalentModal, setShowJoinTalentModal] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [hoveredLicenseVoiceId, setHoveredLicenseVoiceId] = useState<string | null>(null);

  // 3-Dots Menu interactive states
  const [copiedItem, setCopiedItem] = useState<{ voiceId: string; type: 'link' | 'id' } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [similarFilterVoice, setSimilarFilterVoice] = useState<UnifiedVoiceItem | null>(null);

  // Audio Playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Favorites saved state
  const [savedVoiceIds, setSavedVoiceIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('qeema_saved_voices');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
    return new Set();
  });

  useEffect(() => {
    try {
      localStorage.setItem('qeema_saved_voices', JSON.stringify(Array.from(savedVoiceIds)));
    } catch {
      // ignore
    }
  }, [savedVoiceIds]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // =========================================================================
  // 1. HUMAN VOICES CATALOG (Primary Product — Talent centered naming)
  // =========================================================================
  const humanTalentsCatalog: UnifiedVoiceItem[] = useMemo(() => {
    const rawTalents: UnifiedVoiceItem[] = [
      {
        id: 'human-sample-1',
        name: 'محمد.ع',
        talentName: 'محمد.ع',
        sampleName: 'إعلان مؤسسي ووثائقي فاخر',
        subtitle: 'خامة جهورية وقورة بنبرة مؤسسية عميقة، مخارج حروف فخمة تناسب الأفلام الوثائقية والخطابات الكبرى.',
        description: 'معلق صوتي سعودي معتمد بخبرة تزيد عن 8 سنوات في التعليق الإخباري والوثائقي والإعلانات الحكومية الكبرى.',
        gender: 'male',
        ageRange: '30-40 سنة',
        language: 'العربية',
        flag: '🇸🇦',
        accent: 'سعودي نجدي / فصحى',
        extraAccentsCount: 14,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '48.2K',
        bookingsCount: 184,
        category: 'وثائقي ورسمي',
        categoryKey: 'documentary',
        glassGradient: 'radial-gradient(circle at 30% 30%, #1e3a8a 0%, #1e1b4b 60%, #020617 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $45 / دقيقة',
        turnaround: '⚡ تسليم خلال 24 ساعة',
        quote: 'نبتكر حلول الغد بثقة اليوم، لأن طموحنا لا يعرف المستحيل في أرض العطاء.',
        hasAiTwin: true,
        aiTwinId: 'ai-faisal-saudi',
        trustYears: '6y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد في المنصة والإنتاج الإعلامي منذ 6 سنوات، مع سجل متميز في المشاريع الوطنية والوثائقية.',
        tags: ['وثائقي', 'Corporate', 'إعلانات']
      },
      {
        id: 'human-sample-2',
        name: 'سارة.خ',
        talentName: 'سارة.خ',
        sampleName: 'حوار تفاعلي للتقنية وتطبيقات SaaS',
        subtitle: 'نبرة تفاعلية شابة مفعمة بالحيوية والألفة، خامة متوازنة للمساعدين الأذكياء ومراكز الاتصال والبودكاست.',
        description: 'صوت إعلاني وحواري خليجي رائد، نبرة حديثة تمنح علامتك التجارية دفئاً ومصداقية استثنائية.',
        gender: 'female',
        ageRange: '20-30 سنة',
        language: 'العربية',
        flag: '🇸🇦',
        accent: 'خليجي معاصر / حجازي',
        extraAccentsCount: 16,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '62.4K',
        bookingsCount: 236,
        category: 'فيديو شركة',
        categoryKey: 'corporate',
        glassGradient: 'radial-gradient(circle at 35% 30%, #f43f5e 0%, #9f1239 60%, #4c0519 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $40 / دقيقة',
        turnaround: '⚡ تسليم خلال 24 ساعة',
        quote: 'أهلاً بك في منصتك، كيف يمكنني مساعدتك في تسهيل أعمالك اليوم؟',
        hasAiTwin: true,
        aiTwinId: 'ai-sara-khaleeji',
        trustYears: '5y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 5 سنوات في تطبيقات التقنية ومراكز الاتصال والبودكاست.',
        tags: ['فيديو شركة', 'تقنية', 'بودكاست']
      },
      {
        id: 'human-sample-3',
        name: 'عبدالرحمن.ش',
        talentName: 'عبدالرحمن.ش',
        sampleName: 'سرد قصصي وروايات وبودكاست تاريخي',
        subtitle: 'نبرة مخملية آسرة تتقن مخارج الحروف الشامية والفصحى السينمائية، خامة مثالية للروايات والإنتاج الصوتي الضخم.',
        description: 'فنان صوتي وراوي كتب صوتية محترف، قدم أكثر من 40 كتاباً صوتياً وبرامج بودكاست تاريخية مرموقة.',
        gender: 'male',
        ageRange: '40-50 سنة',
        language: 'العربية',
        flag: '🇸🇾',
        accent: 'شامي سوري / فصحى',
        extraAccentsCount: 15,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '39.1K',
        bookingsCount: 142,
        category: 'سرد وكتب صوتية',
        categoryKey: 'narration',
        glassGradient: 'radial-gradient(circle at 30% 30%, #8b5cf6 0%, #6d28d9 60%, #2e1065 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $50 / دقيقة',
        turnaround: 'خلال 48 ساعة',
        quote: 'في كل زاوية من دمشق العتيقة، كان ينساب عبير الياسمين ليروي سيرة لا تنتهي.',
        hasAiTwin: false,
        trustYears: '7y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 7 سنوات في الروايات والأعمال الدرامية والكتب الصوتية الكبرى.',
        tags: ['سرد وكتب صوتية', 'بودكاست', 'وثائقي']
      },
      {
        id: 'human-sample-4',
        name: 'نور.إ',
        talentName: 'نور.إ',
        sampleName: 'إعلانات السوشيال ميديا والحملات الرقمية',
        subtitle: 'إيقاع مصري عفوي محبب ودافئ، قدرة استثنائية على الإقناع ورفع معدلات التحويل في منصات التواصل والريلز.',
        description: 'معلقة صوتية مصرية متخصصة في الإعلانات الترويجية المعاصرة وتوليد التفاعل في الحملات الرقمية.',
        gender: 'female',
        ageRange: '20-30 سنة',
        language: 'العربية',
        flag: '🇪🇬',
        accent: 'مصري أبيض / إعلاني',
        extraAccentsCount: 12,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '74.8K',
        bookingsCount: 195,
        category: 'سوشيال ميديا',
        categoryKey: 'social',
        glassGradient: 'radial-gradient(circle at 30% 30%, #f97316 0%, #c2410c 60%, #431407 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $35 / دقيقة',
        turnaround: '⚡ تسليم خلال 24 ساعة',
        quote: 'جاهز تبدأ مشوارك الصح؟ مع خدمتنا الجديدة هتوفر وقتك وفلوسك بضغطة زر واحدة!',
        hasAiTwin: true,
        aiTwinId: 'ai-nour-egypt',
        trustYears: '6y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 6 سنوات في الحملات الإعلانية الرقمية وعروض السوشيال ميديا.',
        tags: ['سوشيال ميديا', 'إعلان', 'ريلز']
      },
      {
        id: 'human-sample-5',
        name: 'كريم.م',
        talentName: 'كريم.م',
        sampleName: 'إعلان العلامات الفاخرة والسيارات',
        subtitle: 'صوت ناضج يجمع بين الأناقة المغاربية والدقة الصوتية الرفيعة بالعربية والفرنسية، مخصص للمنتجات الفاخرة.',
        description: 'خامة صوتية فريدة تجمع بين اللغتين العربية والفرنسية لنخبة العلامات التجارية والسيارات الفارهة.',
        gender: 'male',
        ageRange: '30-40 سنة',
        language: 'العربية',
        flag: '🇲🇦',
        accent: 'مغاربي مهذب / فرنسي',
        extraAccentsCount: 11,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '28.6K',
        bookingsCount: 128,
        category: 'إعلان',
        categoryKey: 'commercial',
        glassGradient: 'radial-gradient(circle at 30% 30%, #10b981 0%, #047857 60%, #064e3b 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $55 / دقيقة',
        turnaround: 'خلال 48 ساعة',
        quote: 'حين تجتمع الحرفية مع التكنولوجيا، تولد تجربة استثنائية لا تُنسى.',
        hasAiTwin: false,
        trustYears: '8y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 8 سنوات في إعلانات العلامات التجارية الفاخرة والمؤتمرات الدولية.',
        tags: ['إعلان', 'Luxury', 'عالمي']
      },
      {
        id: 'human-sample-6',
        name: 'فيصل.د',
        talentName: 'فيصل.د',
        sampleName: 'أفلام وطنية وثائقية ومشاريع كبرى',
        subtitle: 'خامة صوتية رخيمة مخصصة للأفلام الوثائقية الرسمية، الفعاليات الوطنية، وافتتاح المشاريع الضخمة.',
        description: 'صوت جهوري أصيل قدم العشرات من الأفلام الوثائقية والافتتاحات الرسمية والمؤتمرات الاقتصادية.',
        gender: 'male',
        ageRange: '40-50 سنة',
        language: 'العربية',
        flag: '🇸🇦',
        accent: 'سعودي وقور',
        extraAccentsCount: 17,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '55.3K',
        bookingsCount: 175,
        category: 'وثائقي ورسمي',
        categoryKey: 'documentary',
        glassGradient: 'radial-gradient(circle at 30% 30%, #2563eb 0%, #1d4ed8 60%, #172554 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $60 / دقيقة',
        turnaround: '⚡ تسليم خلال 24 ساعة',
        quote: 'رؤية طموحة، وعزم لا يلين، نبني معاً مجد أمتنا للأجيال القادمة.',
        hasAiTwin: true,
        aiTwinId: 'ai-faisal-saudi',
        trustYears: '6y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 6 سنوات في الأفلام الوثائقية الرسمية والفعاليات الكبرى.',
        tags: ['وثائقي', 'رسمي', 'وطني']
      },
      {
        id: 'human-sample-7',
        name: 'مريم.ن',
        talentName: 'مريم.ن',
        sampleName: 'أنظمة الرد الآلي IVR وتدريب مؤسسي',
        subtitle: 'نبرة صوتية رصينة وواضحة للمنصات التعليمية، أنظمة الرد الآلي التفاعلية، والأدلة الإرشادية.',
        description: 'صوت إماراتي رسمي رصين، صوت معتمد لعدة بنوك خليجية ومؤسسات طيران ومراكز خدمة العملاء.',
        gender: 'female',
        ageRange: '30-40 سنة',
        language: 'العربية',
        flag: '🇦🇪',
        accent: 'خليجي إماراتي / فصحى',
        extraAccentsCount: 13,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '31.9K',
        bookingsCount: 210,
        category: 'IVR',
        categoryKey: 'ivr',
        glassGradient: 'radial-gradient(circle at 30% 30%, #0284c7 0%, #0369a1 60%, #0c4a6e 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $40 / دقيقة',
        turnaround: '⚡ تسليم خلال 24 ساعة',
        quote: 'شكراً لاتصالكم، لمعرفة تفاصيل حسابكم أو التحدث لخدمة العملاء يرجى الضغط على رقم 1.',
        hasAiTwin: false,
        trustYears: '5y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 5 سنوات في أنظمة الرد الآلي المتقدمة والتدريب المؤسسي.',
        tags: ['IVR', 'تعليمي وتدريب', 'بنوك']
      },
      {
        id: 'human-sample-8',
        name: 'طارق.ص',
        talentName: 'طارق.ص',
        sampleName: 'تمثيل صوتي ودوبلاج سينمائي وكرتوني',
        subtitle: 'مرونة صوتية استثنائية في تجسيد الشخصيات الكرتونية والدوبلاج الدرامي وإعلانات الراديو الحيوية.',
        description: 'ممثل صوتي مبدع يتميز بتغيير الطبقات الصوتية وتجسيد شخصيات كرتونية وإعلانات راديو كوميدية وحيوية.',
        gender: 'male',
        ageRange: '30-40 سنة',
        language: 'العربية',
        flag: '🇰🇼',
        accent: 'كويتي / فصحى درامية',
        extraAccentsCount: 18,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '44.7K',
        bookingsCount: 96,
        category: 'دوبلاج',
        categoryKey: 'dubbing',
        glassGradient: 'radial-gradient(circle at 30% 30%, #eab308 0%, #ca8a04 60%, #713f12 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $45 / دقيقة',
        turnaround: 'خلال 48 ساعة',
        quote: 'مغامرة جديدة تنتظرنا في أعماق الغابة السحرية، هل أنتم مستعدون؟',
        hasAiTwin: false,
        trustYears: '6y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 6 سنوات في الدوبلاج السينمائي والشخصيات الكرتونية وإعلانات الراديو.',
        tags: ['دوبلاج', 'شخصيات', 'راديو']
      },
      {
        id: 'human-sample-9',
        name: 'أحمد.هـ',
        talentName: 'أحمد.هـ',
        sampleName: 'إعلان تجاري حماسي وإذاعي',
        subtitle: 'نبرة مصرية قوية مفعمة بالطاقة والاقناع، مخارج فصحى وإعلانية واضحة ومؤثرة.',
        description: 'صوت إعلاني معتمد لحملات كبرى في الخليج ومصر، متخصص في العروض الترويجية والإعلانات الإذاعية.',
        gender: 'male',
        ageRange: '30-40 سنة',
        language: 'العربية',
        flag: '🇪🇬',
        accent: 'مصري أبيض / إعلاني',
        extraAccentsCount: 14,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '68.2K',
        bookingsCount: 168,
        category: 'إعلان',
        categoryKey: 'commercial',
        glassGradient: 'radial-gradient(circle at 30% 30%, #dc2626 0%, #991b1b 60%, #450a0a 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $38 / دقيقة',
        turnaround: '⚡ تسليم خلال 24 ساعة',
        quote: 'عروض الموسم بدأت، لا تفوت أقوى الخصومات قبل نفاد الكمية!',
        hasAiTwin: false,
        trustYears: '6y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 6 سنوات في الإعلانات التجارية والحملات الكبرى.',
        tags: ['إعلان', 'إذاعي', 'عروض']
      },
      {
        id: 'human-sample-10',
        name: 'ليلى.ح',
        talentName: 'ليلى.ح',
        sampleName: 'بودكاست حواري وإعلانات أزياء وأناقة',
        subtitle: 'نبرة لبنانية أنيقة دافئة، مثالية لمنتجات التجميل، المقابلات الثقافية، والبودكاست التفاعلي.',
        description: 'مذيعة ومعلقة صوتية متميزة في تقديم البرامج الراقية والمحتوى الإبداعي لعلامات الجمال والأزياء.',
        gender: 'female',
        ageRange: '20-30 سنة',
        language: 'العربية',
        flag: '🇱🇧',
        accent: 'لبناني معاصر / فصحى',
        extraAccentsCount: 15,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '51.4K',
        bookingsCount: 114,
        category: 'بودكاست',
        categoryKey: 'podcast',
        glassGradient: 'radial-gradient(circle at 30% 30%, #ec4899 0%, #be185d 60%, #500724 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $48 / دقيقة',
        turnaround: '⚡ تسليم خلال 24 ساعة',
        quote: 'الأناقة ليست مجرد مظهر، بل هي أسلوب حياة يعكس تفاصيلك الفريدة.',
        hasAiTwin: false,
        trustYears: '5y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 5 سنوات في البرامج الإذاعية وعروض الأزياء والبودكاست.',
        tags: ['بودكاست', 'أناقة', 'إعلان']
      },
      {
        id: 'human-sample-11',
        name: 'ماجد.ق',
        talentName: 'ماجد.ق',
        sampleName: 'سرد تراثي وثائقي وشعر فصيح',
        subtitle: 'نبرة جنوبية أصيلة مع إتقان رفيع للقصائد والتاريخ والتراث العربي الأصيل.',
        description: 'صوت جهوري تراثي قدم العشرات من الملاحم الشعرية والبرامج التراثية في المملكة والخليج.',
        gender: 'male',
        ageRange: '30-40 سنة',
        language: 'العربية',
        flag: '🇸🇦',
        accent: 'سعودي جنوبي / فصحى',
        extraAccentsCount: 12,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '36.8K',
        bookingsCount: 88,
        category: 'وثائقي ورسمي',
        categoryKey: 'documentary',
        glassGradient: 'radial-gradient(circle at 30% 30%, #475569 0%, #1e293b 60%, #0f172a 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $45 / دقيقة',
        turnaround: 'خلال 48 ساعة',
        quote: 'من قمم السروات إلى سهول نجد، تروي الأرض حكاية المجد والشموخ.',
        hasAiTwin: false,
        trustYears: '6y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 6 سنوات في البرامج التراثية والأفلام الوثائقية.',
        tags: ['وثائقي', 'تراث', 'قصائد']
      },
      {
        id: 'human-sample-12',
        name: 'هدى.ز',
        talentName: 'هدى.ز',
        sampleName: 'سوشيال ميديا وشروحات تقنية مبسطة',
        subtitle: 'نبرة حجازية عذبة وواضحة جداً، تمنح الفيديوهات التعليمية والتقنية سلاسة وبساطة.',
        description: 'معلقة صوتية سعودية شابة متخصصة في تبسيط المفاهيم التقنية وإعلانات التطبيقات الذكية.',
        gender: 'female',
        ageRange: '20-30 سنة',
        language: 'العربية',
        flag: '🇸🇦',
        accent: 'سعودي حجازي / فصحى',
        extraAccentsCount: 14,
        license: 'ترخيص تجاري شامل',
        licenseTooltip: 'عينة صوتية مسجلة باستوديو معتمد، مع حقوق ترخيص تجاري وحماية ملكية فكرية.',
        usageCount: '65.9K',
        bookingsCount: 153,
        category: 'سوشيال ميديا',
        categoryKey: 'social',
        glassGradient: 'radial-gradient(circle at 30% 30%, #06b6d4 0%, #0891b2 60%, #164e63 100%)',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isVerified: true,
        isHuman: true,
        pricing: 'يبدأ من $35 / دقيقة',
        turnaround: '⚡ تسليم خلال 24 ساعة',
        quote: 'بخطوات بسيطة وسريعة تقدر تدير كل طلباتك وتتابع تقدم أعمالك من جوالك!',
        hasAiTwin: false,
        trustYears: '4y',
        trustTooltip: 'هذا الصوت موثوق ومعتمد منذ 4 سنوات في إعلانات السوشيال ميديا وتطبيقات الويب.',
        tags: ['سوشيال ميديا', 'تقنية', 'تعليمي']
      }
    ];

    const gradients = [
      'radial-gradient(circle at 30% 30%, #1e3a8a 0%, #1e1b4b 60%, #020617 100%)',
      'radial-gradient(circle at 35% 30%, #f43f5e 0%, #9f1239 60%, #4c0519 100%)',
      'radial-gradient(circle at 30% 30%, #8b5cf6 0%, #6d28d9 60%, #2e1065 100%)',
      'radial-gradient(circle at 30% 30%, #0891b2 0%, #155e75 60%, #083344 100%)'
    ];

    const flagForDialect = (dialect: Voice['dialect']) => {
      if (dialect === 'egyptian') return '🇪🇬';
      if (dialect === 'levantine') return '🇯🇴';
      if (dialect === 'maghrebi') return '🇲🇦';
      if (dialect === 'fusha') return '🌍';
      return '🇸🇦';
    };

    // Production data only: every displayed human voice comes from Laravel/MySQL.
    return (voices || [])
      .filter(voice => voice.type === 'human')
      .map((voice, index): UnifiedVoiceItem => ({
        id: voice.id,
        name: voice.name,
        talentName: voice.name,
        sampleName: voice.styleLabel || 'عينة صوتية احترافية',
        subtitle: voice.subtitle || `${voice.dialectLabel} • ${voice.styleLabel || 'تعليق صوتي'}`,
        description: voice.description,
        gender: voice.gender,
        language: voice.language || 'العربية',
        flag: voice.flag || flagForDialect(voice.dialect),
        accent: voice.accent || voice.dialectLabel || 'العربية',
        extraAccentsCount: voice.extraAccentsCount || 0,
        license: 'ترخيص تجاري حسب الطلب',
        licenseTooltip: 'تفاصيل الترخيص والاستخدام التجاري تُحدد ضمن طلب الحجز.',
        usageCount: voice.usageCount || '0',
        trustedClientsCount: voice.trustedClientsCount,
        bookingsCount: voice.bookingsCount || 0,
        category: voice.category || voice.styleLabel || 'تعليق صوتي',
        categoryKey: voice.style || 'voice-over',
        glassGradient: voice.glassGradient || gradients[index % gradients.length],
        previewUrl: voice.previewUrl || '',
        isVerified: voice.isVerified !== false,
        isHuman: true,
        pricing: voice.pricing,
        turnaround: voice.turnaround || 'موعد التسليم حسب المشروع',
        trustYears: voice.trustYears,
        trustTooltip: voice.trustTooltip || 'معلق صوتي معتمد في منصة قيمة فويس.',
        tags: voice.useCases || []
      }));
  }, [voices]);

  // =========================================================================
  // 2. AI VOICES CATALOG (Supporting Product — Sample/Character centered naming)
  // STRICT RULE: No human talent names shown!
  // =========================================================================
  const retiredAiVoicesCatalog: UnifiedVoiceItem[] = useMemo(() => [
    {
      id: 'ai-sample-1',
      name: 'إعلان تقني حماسي',
      sampleName: 'إعلان تقني حماسي',
      subtitle: 'صوت رجالي خليجي، حماسي وواثق، مناسب للإعلانات الرقمية والتطبيقات الحديثة.',
      description: 'نموذج ذكاء اصطناعي صوتي فائق الدقة، إيقاع سريع وجذاب مصمم لحملات الاستحواذ والريلز.',
      gender: 'male',
      ageRange: 'شبابي',
      language: 'العربية',
      flag: '🇸🇦',
      accent: 'سعودي معاصر',
      extraAccentsCount: 16,
      license: 'ترخيص تجاري (2y)',
      licenseTooltip: 'نموذج مرخص للاستخدام التجاري في التوليد الصوتي.',
      usageCount: '112.4K',
      category: 'إعلان',
      categoryKey: 'commercial',
      glassGradient: 'radial-gradient(circle at 30% 30%, #f97316 0%, #c2410c 60%, #431407 100%)',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      isVerified: true,
      isHuman: false,
      pricing: '1 نقطة / حرف (TTS)',
      trustYears: '2y',
      quote: 'تطبيقك الجديد في متناول يدك بضغطة زر واحدة وبكل سهولة وسرعة.',
      tags: ['إعلان', 'تقني', 'سريع']
    },
    {
      id: 'ai-sample-2',
      name: 'مساعد ذكي تفاعلي',
      sampleName: 'مساعد ذكي تفاعلي',
      subtitle: 'نبرة تفاعلية شابة مفعمة بالحيوية والألفة، مناسبة للمساعدين الأذكياء وخدمة العملاء الآلية.',
      description: 'نموذج AI مخصص للردود التفاعلية الفورية، نطق دقيق للحروف ومخارج واضحة ومريحة للمستمع.',
      gender: 'female',
      ageRange: 'شبابي',
      language: 'العربية',
      flag: '🇸🇦',
      accent: 'خليجي وحجازي',
      extraAccentsCount: 14,
      license: 'ترخيص تجاري (2y)',
      licenseTooltip: 'نموذج مرخص للاستخدام التجاري في التوليد الصوتي.',
      usageCount: '98.6K',
      category: 'فيديو شركة',
      categoryKey: 'corporate',
      glassGradient: 'radial-gradient(circle at 35% 30%, #be123c 0%, #881337 60%, #4c0519 100%)',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      isVerified: true,
      isHuman: false,
      pricing: '1 نقطة / حرف (TTS)',
      trustYears: '2y',
      quote: 'أهلاً بك، كيف يمكنني مساعدتك في تسهيل عملياتك الرقمية اليوم؟',
      tags: ['تفاعلي', 'SaaS', 'خدمة عملاء']
    },
    {
      id: 'ai-sample-3',
      name: 'سرد وثائقي مهيب',
      sampleName: 'سرد وثائقي مهيب',
      subtitle: 'خامة جهورية وقورة بنبرة مؤسسية عميقة، مخارج حروف فخمة للأفلام الوثائقية والكتب.',
      description: 'توليد صوتي يحاكي الرواية الوثائقية السينمائية بأعلى نقاء صوتي (48kHz).',
      gender: 'male',
      ageRange: 'ناضج وقور',
      language: 'العربية',
      flag: '🇸🇦',
      accent: 'فصحى معيارية / سعودي',
      extraAccentsCount: 15,
      license: 'ترخيص تجاري (2y)',
      licenseTooltip: 'نموذج مرخص للاستخدام التجاري في التوليد الصوتي.',
      usageCount: '87.1K',
      category: 'وثائقي ورسمي',
      categoryKey: 'documentary',
      glassGradient: 'radial-gradient(circle at 30% 30%, #1e3a8a 0%, #172554 60%, #030712 100%)',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      isVerified: true,
      isHuman: false,
      pricing: '1 نقطة / حرف (TTS)',
      trustYears: '2y',
      quote: 'هنا بدأت حكاية الحضارة، حيث تلاقت عزيمة الإنسان مع نداء الأرض.',
      tags: ['وثائقي', 'فصحى', 'مهيب']
    },
    {
      id: 'ai-sample-4',
      name: 'ريلز وسوشيال عفوي',
      sampleName: 'ريلز وسوشيال عفوي',
      subtitle: 'إيقاع مصري عفوي دافئ وسريع، جذاب للإعلانات الرقمية والفيديوهات القصيرة.',
      description: 'نموذج AI مصري يحقق تفاعلاً عالياً وموثوقية لدى المستهلك في حملات السوشيال ميديا.',
      gender: 'female',
      ageRange: 'شبابي',
      language: 'العربية',
      flag: '🇪🇬',
      accent: 'مصري أبيض',
      extraAccentsCount: 12,
      license: 'ترخيص تجاري (2y)',
      licenseTooltip: 'نموذج مرخص للاستخدام التجاري في التوليد الصوتي.',
      usageCount: '135.2K',
      category: 'سوشيال ميديا',
      categoryKey: 'social',
      glassGradient: 'radial-gradient(circle at 30% 30%, #c2410c 0%, #9a3412 60%, #431407 100%)',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      isVerified: true,
      isHuman: false,
      pricing: '1 نقطة / حرف (TTS)',
      trustYears: '2y',
      quote: 'عايز تكبر مشروعك وتوصل لكل عملائك في أسرع وقت؟ الحل بسيط جداً!',
      tags: ['سوشيال ميديا', 'عفوي', 'ريلز']
    },
    {
      id: 'ai-sample-5',
      name: 'خدمة عملاء IVR احترافي',
      sampleName: 'خدمة عملاء IVR احترافي',
      subtitle: 'نبرة خليجية رسمية متزنة وواضحة جداً للبنوك والمطارات ومراكز الاتصال الهاتفية.',
      description: 'نموذج مخصص لبناء شجرات الرد الآلي IVR والمحادثات الصوتية المؤتمتة.',
      gender: 'female',
      ageRange: 'متوسط',
      language: 'العربية',
      flag: '🇦🇪',
      accent: 'خليجي إماراتي / فصحى',
      extraAccentsCount: 13,
      license: 'ترخيص تجاري (2y)',
      licenseTooltip: 'نموذج مرخص للاستخدام التجاري في التوليد الصوتي.',
      usageCount: '76.4K',
      category: 'IVR',
      categoryKey: 'ivr',
      glassGradient: 'radial-gradient(circle at 30% 30%, #0369a1 0%, #075985 60%, #082f49 100%)',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      isVerified: true,
      isHuman: false,
      pricing: '1 نقطة / حرف (TTS)',
      trustYears: '2y',
      quote: 'أهلاً بكم في المصرف، لإتمام معاملاتكم البنكية يرجى اختيار اللغة المفضلة.',
      tags: ['IVR', 'بنوك', 'خدمة عملاء']
    },
    {
      id: 'ai-sample-6',
      name: 'بودكاست حواري دافئ',
      sampleName: 'بودكاست حواري دافئ',
      subtitle: 'نبرة شامية ناعمة ودافئة للمقابلات الحوارية والمقالات الصوتية الإنسانية.',
      description: 'صوت ذكي بتنغيم سلس وإحساس دافئ يناسب الاستماع الطويل دون إجهاد أذن المستمع.',
      gender: 'male',
      ageRange: 'متوسط',
      language: 'العربية',
      flag: '🇸🇾',
      accent: 'شامي سوري / فصحى',
      extraAccentsCount: 14,
      license: 'ترخيص تجاري (2y)',
      licenseTooltip: 'نموذج مرخص للاستخدام التجاري في التوليد الصوتي.',
      usageCount: '64.2K',
      category: 'بودكاست',
      categoryKey: 'podcast',
      glassGradient: 'radial-gradient(circle at 30% 30%, #7c3aed 0%, #5b21b6 60%, #2e1065 100%)',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      isVerified: true,
      isHuman: false,
      pricing: '1 نقطة / حرف (TTS)',
      trustYears: '2y',
      quote: 'في كل قصة نرويها، نكتشف جانباً جديداً من تجاربنا وطموحاتنا الإنسانية.',
      tags: ['بودكاست', 'حواري', 'دافئ']
    },
    {
      id: 'ai-sample-7',
      name: 'قصص وكتب مسموعة',
      sampleName: 'قصص وكتب مسموعة',
      subtitle: 'نبرة فصحى معيارية رنانة تناسب الروايات الأدبية والكتب الفكرية والتعليمية.',
      description: 'قراءة متأنية ومتقنة لأدق قواعد التشكيل اللغوي ومخارج الحروف الفصيحة.',
      gender: 'male',
      ageRange: 'ناضج وقور',
      language: 'العربية',
      flag: '🇸🇦',
      accent: 'فصحى معيارية',
      extraAccentsCount: 18,
      license: 'ترخيص تجاري (2y)',
      licenseTooltip: 'نموذج مرخص للاستخدام التجاري في التوليد الصوتي.',
      usageCount: '92.5K',
      category: 'سرد وكتب صوتية',
      categoryKey: 'narration',
      glassGradient: 'radial-gradient(circle at 30% 30%, #059669 0%, #047857 60%, #064e3b 100%)',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      isVerified: true,
      isHuman: false,
      pricing: '1 نقطة / حرف (TTS)',
      trustYears: '2y',
      quote: 'كانت الليالي تمضي في هدوء تام، والصفحات تحكي عن أزمنة غابرة لا تُنسى.',
      tags: ['سرد وكتب صوتية', 'فصحى', 'أدبي']
    },
    {
      id: 'ai-sample-8',
      name: 'موشن جرافيك شبابي',
      sampleName: 'موشن جرافيك شبابي',
      subtitle: 'إيقاع مصري سريع وعصري يناسب فيديوهات الموشن جرافيك والشروحات السريعة.',
      description: 'نبرة ترويجية شبابية عالية التفاعل تجذب انتباه المشاهد من الثواني الأولى.',
      gender: 'female',
      ageRange: 'شبابي',
      language: 'العربية',
      flag: '🇪🇬',
      accent: 'مصري معاصر',
      extraAccentsCount: 15,
      license: 'ترخيص تجاري (2y)',
      licenseTooltip: 'نموذج مرخص للاستخدام التجاري في التوليد الصوتي.',
      usageCount: '104.3K',
      category: 'سوشيال ميديا',
      categoryKey: 'social',
      glassGradient: 'radial-gradient(circle at 30% 30%, #e11d48 0%, #be123c 60%, #4c0519 100%)',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      isVerified: true,
      isHuman: false,
      pricing: '1 نقطة / حرف (TTS)',
      trustYears: '2y',
      quote: 'شاهد معنا كيف تتحول فكرتك إلى واقع ملموس في دقائق معدودة فقط!',
      tags: ['موشن', 'سوشيال ميديا', 'سريع']
    }
  ], []);

  // لا نعرض أي صوت AI تجريبي قبل وصول كتالوج TTS الحقيقي من الخادم.
  const aiVoicesCatalog: UnifiedVoiceItem[] = [];

  // Determine active catalog
  const savedVoiceCount = useMemo(() => {
    const availableIds = new Set([
      ...humanTalentsCatalog.map(voice => voice.id),
      ...aiVoicesCatalog.map(voice => voice.id)
    ]);
    return Array.from(savedVoiceIds).filter(id => availableIds.has(id)).length;
  }, [humanTalentsCatalog, aiVoicesCatalog, savedVoiceIds]);

  const currentCatalog = useMemo(() => {
    if (activeMainTab === 'human') {
      return humanTalentsCatalog;
    }
    if (activeMainTab === 'ai') {
      return aiVoicesCatalog;
    }
    // 'my-voices' combines saved from both
    const combined = [...humanTalentsCatalog, ...aiVoicesCatalog];
    return combined.filter(v => savedVoiceIds.has(v.id));
  }, [activeMainTab, humanTalentsCatalog, aiVoicesCatalog, savedVoiceIds]);

  // Categories list matching requested taxonomy
  const categoryFilters = [
    { key: 'all', label: 'الكل' },
    { key: 'إعلان', label: 'إعلان 📢' },
    { key: 'فيديو شركة', label: 'فيديو شركة 🏢' },
    { key: 'وثائقي', label: 'وثائقي 🎙️' },
    { key: 'تعليمي وتدريب', label: 'تعليمي وتدريب 🎓' },
    { key: 'بودكاست', label: 'بودكاست 🎧' },
    { key: 'IVR', label: 'IVR وبنوك 📞' },
    { key: 'سوشيال ميديا', label: 'سوشيال ميديا ⚡' },
    { key: 'دوبلاج', label: 'دوبلاج 🎭' },
    { key: 'سرد وكتب صوتية', label: 'سرد وكتب صوتية 📖' }
  ];

  // Arabic dialects list
  const dialectOptions = [
    { key: 'all', label: 'كافة اللهجات العربية' },
    { key: 'سعودي', label: '🇸🇦 سعودي ونجدي وحجازي' },
    { key: 'خليجي', label: '🇦🇪 خليجي وإماراتي وكويتي' },
    { key: 'مصري', label: '🇪🇬 مصري أبيض وإعلاني' },
    { key: 'شامي', label: '🇸🇾 شامي وسوري ولبناني' },
    { key: 'مغاربي', label: '🇲🇦 مغاربي وتونسي' },
    { key: 'فصحى', label: '🌍 فصحى معيارية رنانة' }
  ];

  // Filter and Sort voices
  const filteredVoices = useMemo(() => {
    return currentCatalog.filter(voice => {
      // Saved favorites only.
      if (subTab === 'my-voices' && !savedVoiceIds.has(voice.id)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory = voice.category === selectedCategory ||
                                voice.categoryKey === selectedCategory ||
                                voice.tags?.includes(selectedCategory);
        if (!matchesCategory) return false;
      }
      // Dialect filter
      if (selectedDialect !== 'all') {
        if (!voice.accent.includes(selectedDialect)) {
          return false;
        }
      }
      // Gender filter
      if (selectedGender !== 'all' && voice.gender !== selectedGender) {
        return false;
      }
      // Search query (Intelligent multi-field match)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = voice.name.toLowerCase().includes(q);
        const matchTalent = voice.talentName?.toLowerCase().includes(q);
        const matchSample = voice.sampleName?.toLowerCase().includes(q);
        const matchSub = voice.subtitle.toLowerCase().includes(q);
        const matchAccent = voice.accent.toLowerCase().includes(q);
        const matchCategory = voice.category.toLowerCase().includes(q);
        const matchTags = voice.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchTalent && !matchSample && !matchSub && !matchAccent && !matchCategory && !matchTags) {
          return false;
        }
      }
      // Similar voice filter
      if (similarFilterVoice) {
        if (voice.id === similarFilterVoice.id) {
          return true;
        }
        const isSameCategory = voice.category === similarFilterVoice.category;
        const mainAccent = similarFilterVoice.accent.split(/[\s/]/)[0];
        const isSameAccent = mainAccent && voice.accent.includes(mainAccent);
        if (!isSameAccent && !isSameCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ar');
      }
      if (sortBy === 'usage') {
        const parseK = (str: string) => parseFloat(str.replace(/[^0-9.]/g, '')) * (str.includes('M') ? 1000 : 1);
        return parseK(b.usageCount) - parseK(a.usageCount);
      }
      return 0;
    });
  }, [currentCatalog, subTab, savedVoiceIds, selectedCategory, selectedDialect, selectedGender, searchQuery, sortBy, similarFilterVoice]);

  // Handle Play/Pause Audio preview
  const handleTogglePlay = (voice: UnifiedVoiceItem) => {
    if (playingVoiceId === voice.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingVoiceId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setPlayingVoiceId(voice.id);

    const playSpeechFallback = () => {
      if (!('speechSynthesis' in window)) {
        setPlayingVoiceId(null);
        return;
      }
      const textToSpeak = voice.quote || `هذا نموذج تجريبي لصوت ${voice.name} على منصة قيمة فويس بجودة استوديو ثمانية وأربعين كيلو هرتز.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    if (!voice.previewUrl) {
      playSpeechFallback();
      return;
    }

    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = voice.previewUrl;
    audioRef.current.play().catch(() => {
      playSpeechFallback();
    });
    audioRef.current.onended = () => {
      setPlayingVoiceId(null);
    };
  };

  // Toggle save voice
  const toggleSaveVoice = (e: React.MouseEvent, voiceId: string) => {
    e.stopPropagation();
    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth();
      return;
    }
    setSavedVoiceIds(prev => {
      const next = new Set(prev);
      if (next.has(voiceId)) {
        next.delete(voiceId);
      } else {
        next.add(voiceId);
      }
      return next;
    });
  };

  // 3-Dots actions
  const handleCopyVoiceLink = (e: React.MouseEvent, voice: UnifiedVoiceItem) => {
    e.stopPropagation();
    const link = `${window.location.origin}/#voice-${voice.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link);
    }
    setCopiedItem({ voiceId: voice.id, type: 'link' });
    setToastMessage(`تم نسخ رابط صوت (${voice.name}) بنجاح`);
    setTimeout(() => setCopiedItem(null), 3000);
    setTimeout(() => setToastMessage(null), 3500);
    setActiveMenuVoiceId(null);
  };

  const handleCopyVoiceId = (e: React.MouseEvent, voice: UnifiedVoiceItem) => {
    e.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(voice.id);
    }
    setCopiedItem({ voiceId: voice.id, type: 'id' });
    setToastMessage(`تم نسخ معرّف الصوت: ${voice.id}`);
    setTimeout(() => setCopiedItem(null), 3000);
    setTimeout(() => setToastMessage(null), 3500);
    setActiveMenuVoiceId(null);
  };

  const handleShowSimilarVoices = (e: React.MouseEvent, voice: UnifiedVoiceItem) => {
    e.stopPropagation();
    setActiveMenuVoiceId(null);
    setSimilarFilterVoice(voice);
    setToastMessage(`يتم الآن عرض الأصوات المشابهة لـ: ${voice.name}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-slate-900 pb-28" dir="rtl">

      {/* ========================================================================= */}
      {/* 1. TOP TAB NAVIGATION — Human Voices is visually dominant and Primary     */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pt-3 pb-0.5">

            {/* The 3 main tabs: Human Voices (Primary) -> AI Voices (Secondary) -> My Voices */}
            <div className="flex items-center gap-4 sm:gap-8">

              {/* خيار 1: أصوات بشرية (المنتج الرئيسي — VISUALLY DOMINANT) */}
              <button
                onClick={() => {
                  setActiveMainTab('human');
                  setSubTab('explore');
                  setSimilarFilterVoice(null);
                }}
                className={`relative pb-3 text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'human'
                    ? 'text-slate-950 font-black'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  activeMainTab === 'human' ? 'bg-[#FF5500] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Mic2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-1.5">
                    <span>أصوات بشرية</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300/60">
                      معلقون معتمدون
                    </span>
                  </div>
                </div>

                {activeMainTab === 'human' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#FF5500] rounded-full" />
                )}
              </button>

              {/* أصوات AI مخفية حتى ربط الأصوات الحقيقية الجديدة. */}
              {false && <div className="relative flex items-center">
                <button
                  onClick={() => {
                    setActiveMainTab('ai');
                    setSubTab('explore');
                    setSimilarFilterVoice(null);
                  }}
                  className={`relative pb-3 text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer ${
                    activeMainTab === 'ai'
                      ? 'text-slate-950 font-black'
                      : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    activeMainTab === 'ai' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex flex-col text-right">
                    <div className="flex items-center gap-1.5">
                      <span>أصوات AI</span>
                      <span className="text-[10px] text-slate-400 font-normal">نماذج مساعدة</span>
                    </div>
                  </div>

                  {activeMainTab === 'ai' && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-900 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                  onMouseEnter={() => setShowInfoTooltip(true)}
                  onMouseLeave={() => setShowInfoTooltip(false)}
                  className="mb-3 mr-1 text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded-full cursor-pointer"
                  title="تراخيص نماذج الذكاء الاصطناعي"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {showInfoTooltip && (
                  <div className="absolute top-10 right-28 z-50 w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 animate-in fade-in zoom-in-95">
                    <div className="font-bold mb-1 text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>نماذج ذكاء اصطناعي مرخصة</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      نماذج صوتية سريعة للتجربة والتوليد الفوري بجودة 48kHz، مدربة بعقود قانونية تحفظ حقوق المعلق الصوتي.
                    </p>
                  </div>
                )}
              </div>}

              {/* Saved favorites */}
              <button
                onClick={() => {
                  setActiveMainTab('my-voices');
                  setSubTab('my-voices');
                  setSimilarFilterVoice(null);
                }}
                className={`relative pb-3 text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'my-voices'
                    ? 'text-slate-950 font-black'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  activeMainTab === 'my-voices' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Star className="w-4 h-4" />
                </div>
                <span title="الأصوات التي حفظتها من المكتبة للرجوع إليها لاحقاً">المفضلة ({savedVoiceCount})</span>

                {activeMainTab === 'my-voices' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>

            </div>

            {/* Quick Trust Stat Indicator */}
            <div className="hidden lg:flex items-center gap-3 pb-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">1,000+</span>
                <span>معلق بشري معتمد</span>
              </span>
              <span className="text-slate-300">•</span>
              <span>جودة استوديو 48kHz</span>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO / VALUE PROPOSITION SECTION FOR HUMAN VOICES                      */}
      {/* ========================================================================= */}
      {activeMainTab === 'human' && (
        <div className="bg-gradient-to-b from-white to-[#F9F6F0] border-b border-slate-200/80 pt-8 pb-7">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              {/* Text & Value Proposition */}
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-[#FF5500] text-xs font-bold border border-orange-200">
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>سوق الأصوات البشرية الاحترافي للشركات والوكالات</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  أصوات بشرية حقيقية لمشاريعك
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  اختر من أصوات معلقين محترفين وموثقين بمختلف اللهجات والأساليب، واحصل على الصوت المناسب لعلامتك التجارية.
                </p>

                {/* 4 Trust / Value Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <Users className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">1,000+ معلق بشري</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <Globe2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">لهجات عربية متعددة</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">حقوق استخدام تجاري</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <Volume2 className="w-4 h-4 text-[#FF5500] shrink-0" />
                    <span className="text-xs font-bold text-slate-800">تسجيل احترافي 48kHz</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <button
                  onClick={() => setIsB2BProjectModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer group"
                >
                  <Briefcase className="w-4 h-4 text-[#FF5500] group-hover:scale-110 transition-transform" />
                  <span>احجز صوتاً لمشروعك</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('search-discovery-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>ساعدني في اختيار الصوت</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Helper Banner for AI Tab */}
      {activeMainTab === 'ai' && (
        <div className="bg-slate-900 text-white py-4 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5500]" />
              <span className="font-semibold">نماذج أصوات ذكاء اصطناعي مكملة للاختبار السريع والتوليد الآلي الفوري</span>
            </div>
            <button
              onClick={() => setActiveMainTab('human')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>تحتاج أداءً بشرياً أكثر طبيعية؟ اكتشف الأصوات البشرية</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SEARCH & DISCOVERY SECTION                                             */}
      {/* ========================================================================= */}
      <div id="search-discovery-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">

        {/* Search Header and Search Box */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                ما نوع الصوت الذي تبحث عنه؟
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ابحث بالمعلق، اللهجة، الاستخدام، النبرة أو أسلوب الأداء
              </p>
            </div>

            {/* Quick Actions (Earnings / Join Talent) */}
            <div className="flex items-center gap-2">
              {activeMainTab === 'human' ? (
                <button
                  onClick={() => setShowJoinTalentModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-600" />
                  <span>انضم كمعلق صوتي</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateVoiceModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>طلب هوية صوتية خاصة</span>
                </button>
              )}

              <button
                onClick={() => setShowEarningsModal(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wallet className="w-3.5 h-3.5 text-slate-500" />
                <span>العوائد والأرباح</span>
              </button>
            </div>
          </div>

          {/* Search Inputs Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeMainTab === 'human'
                    ? 'ابحث بالمعلق (مثال: محمد.ع)، اللهجة، الاستخدام، النبرة أو أسلوب الأداء...'
                    : 'ابحث باسم العينة (مثال: إعلان تقني)، اللهجة، أو الاستخدام...'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dialect Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDialectDropdown(!showDialectDropdown)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium transition-all shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {selectedDialect === 'all' ? 'اللهجة العربية' : dialectOptions.find(d => d.key === selectedDialect)?.label.split(' ')[1] || 'اللهجة'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showDialectDropdown && (
                <div
                  onMouseLeave={() => setShowDialectDropdown(false)}
                  className="absolute left-0 sm:right-0 mt-1 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in"
                >
                  {dialectOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setSelectedDialect(opt.key);
                        setShowDialectDropdown(false);
                      }}
                      className={`w-full text-right px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedDialect === opt.key ? 'bg-orange-50 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedDialect === opt.key && <Check className="w-3.5 h-3.5 text-[#FF5500]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowFiltersModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium transition-all shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>تصفية متقدمة</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium transition-all shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {sortBy === 'popularity' ? 'الأكثر طلباً' : sortBy === 'usage' ? 'الأعلى استماعاً' : 'الترتيب الأبجدي'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 mr-1" />
              </button>

              {showSortDropdown && (
                <div
                  onMouseLeave={() => setShowSortDropdown(false)}
                  className="absolute left-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in"
                >
                  <button
                    onClick={() => { setSortBy('popularity'); setShowSortDropdown(false); }}
                    className="w-full text-right px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    الأكثر طلباً
                  </button>
                  <button
                    onClick={() => { setSortBy('usage'); setShowSortDropdown(false); }}
                    className="w-full text-right px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    الأعلى استماعاً
                  </button>
                  <button
                    onClick={() => { setSortBy('name'); setShowSortDropdown(false); }}
                    className="w-full text-right px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    الترتيب الأبجدي
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 4. USE-CASE DISCOVERY HORIZONTAL CHIPS                                    */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 mb-2">
              اكتشف حسب نوع المشروع والاستخدام:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              {categoryFilters.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Results Counter & Filter Status */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
              {filteredVoices.length}
            </span>
            <span className="text-slate-600 font-normal">
              {activeMainTab === 'human'
                ? 'معلق صوتي بشري متاح للمشاريع'
                : activeMainTab === 'my-voices'
                ? 'صوت في قائمتك المفضلة'
                : 'نموذج صوت ذكي'}
            </span>
            {selectedCategory !== 'all' && (
              <span className="text-slate-500 font-normal mr-2">
                • التصنيف: <strong className="text-slate-900">{categoryFilters.find(c => c.key === selectedCategory)?.label}</strong>
              </span>
            )}
            {selectedDialect !== 'all' && (
              <span className="text-slate-500 font-normal mr-1">
                • اللهجة: <strong className="text-slate-900">{dialectOptions.find(d => d.key === selectedDialect)?.label}</strong>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-normal hidden sm:block">
            {activeMainTab === 'human'
              ? 'حقوق تجارية كاملة • تسليم خلال 24–48 ساعة'
              : 'جاهز للتوليد الفوري في استوديو النصوص'}
          </div>
        </div>

        {/* Similar Voices Banner */}
        {similarFilterVoice && (
          <div className="p-3 bg-orange-50/90 border border-orange-200 rounded-2xl flex items-center justify-between text-xs text-slate-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF5500] shrink-0" />
              <span>
                يتم الآن عرض الأصوات المشابهة لـ: <strong className="font-bold text-slate-950">{similarFilterVoice.name}</strong>
                <span className="text-slate-500 mr-1.5">({similarFilterVoice.accent} • {similarFilterVoice.category})</span>
              </span>
            </div>
            <button
              onClick={() => setSimilarFilterVoice(null)}
              className="px-2.5 py-1 bg-white hover:bg-orange-100 text-orange-900 rounded-xl text-[11px] font-bold border border-orange-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <X className="w-3 h-3" />
              <span>إلغاء التصفية</span>
            </button>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 select-none">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. VOICE CARDS LISTING — Responsive compact row layout                    */}
        {/* ========================================================================= */}
        <div className="space-y-1.5" dir="rtl">
          {filteredVoices.map(voice => {
            const isPlaying = playingVoiceId === voice.id;
            const isSaved = savedVoiceIds.has(voice.id);
            const isHoveredLicense = hoveredLicenseVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                className={`group relative bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl px-3 py-2 transition-all duration-150 shadow-2xs hover:shadow-xs min-h-[52px] flex flex-wrap items-center gap-x-3 gap-y-2 overflow-visible ${
                  activeMenuVoiceId === voice.id ? 'z-40' : ''
                } ${
                  isPlaying ? 'ring-2 ring-slate-900 bg-slate-50/80 border-slate-900' : ''
                }`}
              >
                {/* 1. Right Section: Glassy Orb + Talent Name + Verified + Style/Bio (Single Line) */}
                <div className="flex items-center gap-2.5 min-w-[min(100%,16rem)] flex-1">

                  {/* Glassy Color Orb with Play/Pause Button */}
                  <GlassyVoiceOrb
                    gradient={voice.glassGradient}
                    isPlaying={isPlaying}
                    isVerified={voice.isVerified}
                    size="sm"
                    onTogglePlay={(e) => {
                      e.stopPropagation();
                      handleTogglePlay(voice);
                    }}
                  />

                  {/* Name & Primary Badges on Single Line */}
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <h3
                      onClick={() => setSelectedProfileVoice(voice)}
                      className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-[#FF5500] cursor-pointer transition-colors whitespace-nowrap"
                    >
                      {voice.name}
                    </h3>

                    {/* Verified Badge */}
                    {voice.isVerified && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium whitespace-nowrap shrink-0"
                        title={voice.isHuman ? 'معلق موثق ومعتمد' : 'نموذج مرخص وموثق'}
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        <span className="hidden sm:inline">{voice.isHuman ? 'موثق' : 'مرخص'}</span>
                      </span>
                    )}

                    {/* Fast turnaround if human */}
                    {voice.isHuman && voice.turnaround && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 font-medium whitespace-nowrap shrink-0"
                        title="سرعة التسليم والتنفيذ"
                      >
                        <Zap className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span className="max-w-44 truncate" title={voice.turnaround}>{voice.turnaround}</span>
                      </span>
                    )}

                    {/* Subtitle / Sample Style truncated on same line */}
                    {(voice.subtitle || voice.description) && (
                      <span className="text-[11px] text-slate-400 truncate max-w-[120px] xl:max-w-[180px] 2xl:max-w-xs hidden lg:inline-block pr-1 border-r border-slate-200/80">
                        {voice.subtitle || voice.description}
                      </span>
                    )}
                  </div>

                </div>

                {/* 2. Middle Section: Compact Metadata Badges (Single Horizontal Line) */}
                <div className="order-3 flex w-full min-w-0 flex-wrap items-center gap-1.5 text-xs sm:gap-2 xl:order-none xl:w-auto xl:flex-1 xl:justify-center">

                  {/* Language & Flag */}
                  <div className="flex items-center gap-1 text-slate-700 text-[11px] font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 shrink-0">
                    <span>{voice.flag}</span>
                    <span className="hidden md:inline">{voice.language || 'العربية'}</span>
                  </div>

                  {/* Accent / Dialect */}
                  <div className="text-slate-600 text-[11px] font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 shrink-0">
                    <span>{voice.accent}</span>
                  </div>

                  {/* Additional accents counter badge */}
                  {voice.extraAccentsCount ? (
                    <div className="relative group/accents text-slate-500 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-full border border-slate-200/80 whitespace-nowrap cursor-help transition-colors shrink-0">
                      <span className="font-mono">+{voice.extraAccentsCount}</span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/accents:flex flex-col z-50 w-72 max-w-[90vw] p-3 bg-slate-950 text-white rounded-xl shadow-2xl border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 text-right font-sans tracking-normal whitespace-normal">
                        <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5 text-xs">
                          <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>أصوات إضافية</span>
                        </div>
                        <div className="text-white text-xs leading-relaxed font-normal">
                          يحتوي هذا الملف على {voice.extraAccentsCount} مقطعاً صوتياً إضافياً بنبرات واستخدامات متنوعة.
                        </div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 rotate-45 border-r border-b border-slate-700"></div>
                      </div>
                    </div>
                  ) : null}

                  {/* Trust Duration (Human) or Retention Warning (AI) */}
                  {voice.isHuman ? (
                    <div
                      className="relative group/trust flex items-center gap-1 text-slate-600 text-[11px] bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 whitespace-nowrap transition-colors cursor-help shrink-0"
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="font-mono font-medium">{voice.trustYears || '6y'}</span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/trust:flex flex-col z-50 w-80 max-w-[90vw] p-3 bg-slate-950 text-white rounded-xl shadow-2xl border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 text-right font-sans tracking-normal whitespace-normal">
                        <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>موثوقية وسجل خبرة</span>
                        </div>
                        <div className="text-white text-xs leading-relaxed font-normal">
                          {voice.trustTooltip || `هذا الصوت موثوق ومعتمد في المنصة والإنتاج الإعلامي منذ ${voice.trustYears || '6 سنوات'}.`}
                        </div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 rotate-45 border-r border-b border-slate-700"></div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="relative group/retention flex items-center gap-1 text-slate-700 text-[11px] bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 whitespace-nowrap transition-colors cursor-help shrink-0"
                    >
                      <RetentionNoticeIcon className="w-3 h-3 text-slate-600" />
                      <span className="font-mono font-medium">{voice.trustYears || '2y'}</span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/retention:flex flex-col z-50 w-80 max-w-[90vw] p-3 bg-slate-950 text-white rounded-xl shadow-2xl border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 text-right font-sans tracking-normal whitespace-normal">
                        <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5 text-xs">
                          <RetentionNoticeIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>سياسة إتاحة الصوت بعد الحذف</span>
                        </div>
                        <div className="text-white text-xs leading-relaxed font-normal">
                          إذا قام صاحب هذا الصوت بحذفه من مكتبة الأصوات، فلن يكون متاحاً لك بعد سنتين ({voice.trustYears || '2y'}).
                        </div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 rotate-45 border-r border-b border-slate-700"></div>
                      </div>
                    </div>
                  )}

                  {/* Trusted clients count comes from completed orders in the API. */}
                  {voice.isHuman && voice.trustedClientsCount !== undefined && (
                    <div
                      className="relative group/usage flex items-center gap-1 text-slate-600 text-[11px] bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 whitespace-nowrap transition-colors cursor-help shrink-0"
                    >
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="font-mono font-medium">{voice.trustedClientsCount}</span>

                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/usage:flex flex-col z-50 w-72 max-w-[90vw] p-3 bg-slate-950 text-white rounded-xl shadow-2xl border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 text-right font-sans tracking-normal whitespace-normal">
                        <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5 text-xs">
                          <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>عملاء وثقوا بالصوت</span>
                        </div>
                        <div className="text-white text-xs leading-relaxed font-normal">
                          عدد العملاء المختلفين الذين أكملوا طلب تسجيل بهذا الصوت.
                        </div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 rotate-45 border-r border-b border-slate-700"></div>
                      </div>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="flex items-center gap-1 text-slate-700 text-[11px] font-medium bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 whitespace-nowrap shrink-0">
                    <Square className="w-2.5 h-2.5 text-slate-400" />
                    <span>{voice.category}</span>
                  </div>

                </div>

                {/* 3. Left Section: Action Buttons on the Same Line */}
                <div className="ms-auto flex shrink-0 items-center gap-1.5 text-xs">

                  {/* CTA Button */}
                  {voice.isHuman ? (
                    <button
                      onClick={() => onSelectForBooking(voice)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap group/btn"
                    >
                      <Plus className="w-3 h-3 text-[#FF5500] group-hover/btn:scale-110 transition-transform" />
                      <span>احجز الصوت</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectForGeneration(voice)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap group/btn"
                    >
                      <Plus className="w-3 h-3 text-[#FF5500] group-hover/btn:scale-110 transition-transform" />
                      <span>توليد</span>
                    </button>
                  )}

                  {/* Waveform Button */}
                  <button
                    onClick={() => handleTogglePlay(voice)}
                    className={`p-1 rounded-lg border transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-orange-50 border-orange-200 text-[#FF5500]'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-500 hover:text-slate-800'
                    }`}
                    title={isPlaying ? 'إيقاف المعاينة' : 'تشغيل العينة'}
                  >
                    <AudioWaveIcon isPlaying={isPlaying} />
                  </button>

                  {/* Save to Favorites */}
                  <button
                    onClick={(e) => toggleSaveVoice(e, voice.id)}
                    className={`p-1 rounded-lg transition-colors cursor-pointer border ${
                      isSaved
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-slate-50 text-slate-400 hover:text-slate-900 border-slate-200/80 hover:bg-slate-100'
                    }`}
                    title={isSaved ? 'محفوظ في المفضلة' : 'أضف للمفضلة'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                  </button>

                  {/* Three Dots Menu ⋮ */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuVoiceId(activeMenuVoiceId === voice.id ? null : voice.id);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {activeMenuVoiceId === voice.id && (
                      <div
                        onMouseLeave={() => setActiveMenuVoiceId(null)}
                        className="absolute left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 text-right animate-in fade-in zoom-in-95 text-xs select-none"
                      >
                        <button
                          onClick={() => {
                            setSelectedProfileVoice(voice);
                            setActiveMenuVoiceId(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-800 text-right flex items-center gap-2 transition-colors cursor-pointer font-medium"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>عرض الملف التعريفي الكامل</span>
                        </button>

                        <button
                          onClick={(e) => handleCopyVoiceLink(e, voice)}
                          className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-800 text-right flex items-center justify-between transition-colors cursor-pointer font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <Link className="w-3.5 h-3.5 text-slate-500" />
                            <span>نسخ رابط الصوت</span>
                          </div>
                          {copiedItem?.voiceId === voice.id && copiedItem?.type === 'link' && (
                            <span className="text-[10px] text-emerald-600 font-bold">تم!</span>
                          )}
                        </button>

                        <button
                          onClick={(e) => handleCopyVoiceId(e, voice)}
                          className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-800 text-right flex items-center justify-between transition-colors cursor-pointer font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>نسخ معرّف الصوت</span>
                          </div>
                          {copiedItem?.voiceId === voice.id && copiedItem?.type === 'id' && (
                            <span className="text-[10px] text-emerald-600 font-bold">تم!</span>
                          )}
                        </button>

                        <button
                          onClick={(e) => handleShowSimilarVoices(e, voice)}
                          className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-800 text-right flex items-center gap-2 transition-colors cursor-pointer font-medium"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#FF5500]" />
                          <span>عرض أصوات مشابهة</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredVoices.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <Volume2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {activeMainTab === 'my-voices' ? 'لم تحفظ أي صوت في المفضلة بعد' : 'لم يتم العثور على أصوات مطابقة لمعايير البحث'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {activeMainTab === 'my-voices'
                ? 'اضغط على رمز النجمة في بطاقة أي صوت لحفظه هنا. تُحفظ القائمة حالياً على هذا المتصفح فقط.'
                : 'جرب تغيير كلمات البحث أو إعادة ضبط خيارات اللهجة والتصنيف للاطلاع على بقية الأصوات.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDialect('all');
                  setSelectedGender('all');
                  setSubTab('explore');
                  setSimilarFilterVoice(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. SOCIAL PROOF / WHY HUMAN VOICE SECTION                                 */}
        {/* ========================================================================= */}
        {activeMainTab === 'human' && (
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                لماذا تختار صوتًا بشريًا من قيمة فويس؟
              </h3>
              <p className="text-xs text-slate-500">
                ضمان الجودة والاحترافية للمشاريع الكبرى والعلامات التجارية الرائدة
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-right">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Mic2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">أداء بشري حقيقي</h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  مشاعر وتفاعل طبيعي يمنح علامتك التجارية مصداقية وأصالة لا تضاهى.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-right">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">معلقون موثقون</h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  جودة يمكن الاعتماد عليها مسجلة باستوديوهات عزل معتمدة 48kHz.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-right">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">ترخيص تجاري واضح</h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  استخدم الصوت لمشاريعك وإعلاناتك بثقة قانونية وحماية تامة للملكية.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-right">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#FF5500] flex items-center justify-center">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">لهجات عربية متنوعة</h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  اختر النبرة واللهجة الأقرب لجمهورك المستهدف من الخليج إلى المحيط.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. AI ASSISTANT CONCIERGE HELP SECTION (Helping users find HUMAN voices)  */}
        {/* ========================================================================= */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-right">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-amber-400 flex items-center justify-center text-white shrink-0 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white">
                  لا تعرف أي صوت يناسب مشروعك؟
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  دع مساعد قيمة فويس الذكي يرشح لك أنسب المعلقين البشريين حسب لهجة النص، المجال، والجمهور المستهدف.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                // Trigger floating AI assistant button or scroll
                const aiBtn = document.querySelector('button[aria-label="Open QeemaVoice AI Assistant"]') as HTMLButtonElement;
                if (aiBtn) {
                  aiBtn.click();
                } else {
                  setIsB2BProjectModalOpen(true);
                }
              }}
              className="px-5 py-3 rounded-2xl bg-[#FF5500] hover:bg-[#E04800] text-white font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ساعدني في اختيار صوت</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 8. B2B PROJECT REQUEST BANNER                                             */}
        {/* ========================================================================= */}
        <div className="mt-8 bg-orange-50/70 border border-orange-200/80 rounded-3xl p-6 sm:p-8 text-right">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF5500] text-[11px] font-bold">
                <Briefcase className="w-3 h-3" />
                <span>خدمة الشركات والمؤسسات</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                لديك مشروع كبير أو حملة إعلانية متكاملة؟
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                أخبرنا بما تحتاج وسنساعدك في اختيار وترشيح الأصوات وتنسيق جلسات الاستوديو مع عروض أسعار تنافسية مخصصة للشركات.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsB2BProjectModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                اطلب صوتًا لمشروعك
              </button>
              <button
                onClick={() => setIsB2BProjectModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                اطلب عرضًا لمشروعك
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 9. MODALS & DRAWERS (Project Request, Voice Profile, Filters, Earnings)   */}
      {/* ========================================================================= */}

      {/* B2B Project Request Modal */}
      <B2BProjectRequestModal
        isOpen={isB2BProjectModalOpen}
        onClose={() => setIsB2BProjectModalOpen(false)}
      />

      {/* Voice Profile Drawer */}
      <VoiceProfileDrawer
        voice={selectedProfileVoice}
        isOpen={!!selectedProfileVoice}
        onClose={() => setSelectedProfileVoice(null)}
        isPlaying={playingVoiceId === selectedProfileVoice?.id}
        onTogglePlay={(voice) => handleTogglePlay(voice)}
        onBookVoice={(voice) => {
          setSelectedProfileVoice(null);
          onSelectForBooking(voice);
        }}
        onUseForGeneration={(voice) => {
          setSelectedProfileVoice(null);
          onSelectForGeneration(voice);
        }}
        isSaved={selectedProfileVoice ? savedVoiceIds.has(selectedProfileVoice.id) : false}
        onToggleSave={(voiceId) => {
          setSavedVoiceIds(prev => {
            const next = new Set(prev);
            if (next.has(voiceId)) next.delete(voiceId);
            else next.add(voiceId);
            return next;
          });
        }}
      />

      {/* Advanced Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-sm text-slate-900">خيارات التصفية المتقدمة</h3>
              </div>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs mb-6">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">نوع الصوت</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveMainTab('human')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-colors ${
                      activeMainTab === 'human' ? 'bg-orange-50 border-[#FF5500] text-[#FF5500]' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    أصوات بشرية (معتمدون)
                  </button>
                  {false && <button
                    onClick={() => setActiveMainTab('ai')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-colors ${
                      activeMainTab === 'ai' ? 'bg-slate-100 border-slate-900 text-slate-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    أصوات AI (نماذج)
                  </button>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">اللهجة العربية</label>
                <select
                  value={selectedDialect}
                  onChange={e => setSelectedDialect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                >
                  {dialectOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">الجنس</label>
                <select
                  value={selectedGender}
                  onChange={e => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                >
                  <option value="all">كافة الأصوات (رجالي ونسائي)</option>
                  <option value="male">رجالي فقط</option>
                  <option value="female">نسائي فقط</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">التصنيف والاستخدام</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                >
                  {categoryFilters.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDialect('all');
                  setSelectedGender('all');
                  setShowFiltersModal(false);
                }}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold"
              >
                إعادة ضبط
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Earnings & Royalties Modal */}
      {showEarningsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">عوائد وأرباح الأصوات</h3>
                  <p className="text-[11px] text-slate-500">نظام اقتسام العوائد العادل للمعلقين الشركاء</p>
                </div>
              </div>
              <button
                onClick={() => setShowEarningsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mb-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="font-bold text-slate-900 mb-1">للمعلقين الصوتيين البشريين:</div>
                <p className="text-[11px] leading-relaxed">
                  احصل على عوائد مباشرة ومضمونة في كل مرة يُحجز فيها صوتك لجلسات الاستوديو أو استخدام توأمك الصوتي.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-center">
                  <div className="text-[10px] text-amber-700 font-bold mb-1">نسبة التوأم الصوتي</div>
                  <div className="text-lg font-black text-amber-900 font-mono">0.005 $ / حرف</div>
                </div>
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-center">
                  <div className="text-[10px] text-emerald-700 font-bold mb-1">جلسات الاستوديو المباشرة</div>
                  <div className="text-lg font-black text-emerald-900 font-mono">85% صافي</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowEarningsModal(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors w-full"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Join Talent Modal */}
      {showJoinTalentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center">
                  <Mic2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">الانضمام لسوق المعلقين المعتمد</h3>
                  <p className="text-[11px] text-slate-500">انضم لنخبة 1,000+ معلق صوتي بشري واكسب عوائد مجزية</p>
                </div>
              </div>
              <button
                onClick={() => setShowJoinTalentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs mb-6">
              <div>
                <label className="block font-bold text-slate-800 mb-1">الاسم الكامل / الاسم الفني *</label>
                <input
                  type="text"
                  placeholder="مثال: عبد الرحمن الشريف..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">اللهجة الرئيسية *</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none">
                    <option>سعودي نجدي / حجازي</option>
                    <option>خليجي معاصر</option>
                    <option>مصري أبيض</option>
                    <option>شامي سوري</option>
                    <option>مغاربي</option>
                    <option>فصحى معيارية</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">تجهيز الاستوديو *</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none">
                    <option>استوديو احترافي معزول 48kHz</option>
                    <option>ميكروفون احترافي + كارت صوت</option>
                    <option>استوديو خارجي معتمد</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">رابط عينات سابقة أو بورتفوليو *</label>
                <input
                  type="text"
                  placeholder="رابط SoundCloud، Drive، أو بورتفوليو..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowJoinTalentModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  alert('شكراً لتقديمك! سيتواصل معك فريق الاعتماد الصوتي لمراجعة العينات وتوقيع العقد التجاري.');
                  setShowJoinTalentModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                إرسال طلب الانضمام
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom AI Model Modal */}
      {showCreateVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#FF5500] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">طلب هوية صوتية خاصة وموثقة للمؤسسات</h3>
                  <p className="text-[11px] text-slate-500">تدريب استوديوهي معتمد بنظام حماية الملكية الفكرية</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateVoiceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>سياسة الخصوصية وحماية الأصوات:</strong> يتم تدريب النماذج الصوتية المؤسسية في استوديوهاتنا عبر عقود تراخيص موثقة مع المعلقين أو لممثلي علامتك التجارية حصراً.
            </div>

            <div className="space-y-4 text-xs mb-6">
              <div>
                <label className="block font-bold text-slate-800 mb-1">اسم المؤسسة أو العلامة التجارية</label>
                <input
                  type="text"
                  placeholder="مثال: شركة الاتصالات السعودية، بنك الراجحي..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">طبيعة الاستخدام</label>
                <input
                  type="text"
                  placeholder="مثال: مجيب آلي ذكي، إعلانات تلفزيونية ورقمية، منصة تدريب..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateVoiceModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  alert('تم استلام طلب الهوية الصوتية المؤسسية بنجاح. سيتواصل معك مستشار الإنتاج الصوتي خلال 24 ساعة.');
                  setShowCreateVoiceModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                إرسال طلب التدريب المؤسسي
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
