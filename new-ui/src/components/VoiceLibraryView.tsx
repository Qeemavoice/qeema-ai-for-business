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
import { LiquidLogo, variantFor } from './LiquidLogo';
import { Voice, DialectKey } from '../types';
import { B2BProjectRequestModal } from './B2BProjectRequestModal';
import { openTalentSignup } from '../lib/talentJoin';
import { VoiceProfileDrawer } from './VoiceProfileDrawer';
import { openAssistant } from '../lib/assistantEvents';

export type { UnifiedVoiceItem } from '../data/humanVoices';
import type { UnifiedVoiceItem } from '../data/humanVoices';
export { HUMAN_VOICE_SAMPLES, VOICE_CATEGORY_FILTERS } from '../data/humanVoices';
import { VOICE_CATEGORY_FILTERS } from '../data/humanVoices';
import { dialectOf } from '../data/dialects';
import { useSiteLists } from '../lib/siteLists';
import { AI_VOICES_ENABLED } from '../../shared/features';
import { useHumanVoices, realSampleUrl } from '../lib/humanVoices';

interface VoiceLibraryViewProps {
  voices: Voice[];
  initialTab?: 'human' | 'ai' | 'my-voices';
  onSelectForGeneration: (voice: any) => void;
  onSelectForBooking: (voice: any) => void;
  onOpenDemo?: () => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
  /** Rendered between the voices and the enterprise banner (the site page puts the production templates here) */
  afterVoices?: React.ReactNode;
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
    <span className={`w-0.5 rounded-full bg-brand transition-all duration-200 ${isPlaying ? 'h-3 animate-pulse' : 'h-2'}`} />
    <span className={`w-0.5 rounded-full bg-brand transition-all duration-200 ${isPlaying ? 'h-4 animate-bounce' : 'h-3.5'}`} style={{ animationDelay: '100ms' }} />
    <span className={`w-0.5 rounded-full bg-brand transition-all duration-200 ${isPlaying ? 'h-2.5 animate-pulse' : 'h-1.5'}`} style={{ animationDelay: '200ms' }} />
    <span className={`w-0.5 rounded-full bg-brand transition-all duration-200 ${isPlaying ? 'h-3.5 animate-bounce' : 'h-3'}`} style={{ animationDelay: '300ms' }} />
  </div>
);

/**
 * Glassmorphic Color Gradient Orb component
 */
const GlassyVoiceOrb: React.FC<{
  voiceId: string;
  isPlaying: boolean;
  isVerified?: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ voiceId, isPlaying, isVerified = true, onTogglePlay, size = 'sm' }) => {
  const px = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <div className="relative shrink-0 select-none">
      <button
        type="button"
        onClick={onTogglePlay}
        className="relative block cursor-pointer group transition-transform duration-200 active:scale-95"
        style={{ width: px, height: px }}
        aria-label={isPlaying ? 'إيقاف العينة' : 'تشغيل العينة'}
      >
        <LiquidLogo variant={variantFor(voiceId)} size={px} live={isPlaying} playing={isPlaying} />
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-white text-slate-950 shadow-md opacity-100'
                : 'bg-white/90 text-slate-950 shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100'
            }`}
          >
            {isPlaying ? <Pause className={`${iconSize} fill-current`} /> : <Play className={`${iconSize} fill-current mr-0.5`} />}
          </span>
        </span>
      </button>

      {isVerified && (
        <div
          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-xs z-10"
          title="معلق صوتي موثق ومعتمد تجارياً"
        >
          <Check className="w-2 h-2 text-white stroke-[3.5]" />
        </div>
      )}
    </div>
  );
};

/** Builds the URL slug of a voice sample's booking page */
export const buildSampleSlug = (voice: { id: string; sampleName?: string; name: string }) =>
  `${voice.id}-${encodeURIComponent((voice.sampleName || voice.name || 'voice').trim().replace(/\s+/g, '-'))}`;

// Human voice samples catalog (shared with the per-sample booking page)

/**
 * getShortDialect: reduces a detailed accent string (e.g. "سعودي نجدي / فصحى")
 * to a single short dialect label (e.g. "سعودي").
 */
export const getShortDialect = (accent: string, flag?: string): string => dialectOf(accent, flag) || accent.split('/')[0].trim();

export const VoiceLibraryView: React.FC<VoiceLibraryViewProps> = ({
  voices,
  initialTab = 'human',
  onSelectForGeneration,
  onSelectForBooking,
  onOpenDemo,
  isLoggedIn = false,
  onRequireAuth,
  afterVoices
}) => {
  // Top-level tabs: Default to 'human' (Human Voices as primary product)
  type MainTab = 'human' | 'ai' | 'my-voices';
  const allowedTab = (t?: MainTab): MainTab => (t === 'ai' && !AI_VOICES_ENABLED ? 'human' : t || 'human');
  const [activeMainTab, setActiveMainTab] = useState<'human' | 'ai' | 'my-voices'>(allowedTab(initialTab as MainTab));

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(allowedTab(initialTab as MainTab));
    }
  }, [initialTab]);

  // Sub-navigation and filters
  const [subTab, setSubTab] = useState<'explore' | 'my-voices'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('category')) || 'all');
  const [selectedDialect, setSelectedDialect] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSpeed, setSelectedSpeed] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'usage' | 'name'>('popularity');

  // Image 4 Advanced Filter States
  const [filterQuality, setFilterQuality] = useState<'studio' | 'any'>('any');
  const [filterGender, setFilterGender] = useState<'male' | 'female' | 'neutral' | 'any'>('any');
  const [filterAge, setFilterAge] = useState<'young' | 'middle' | 'old' | 'any'>('any');
  const [filterNoticePeriod, setFilterNoticePeriod] = useState<'30d' | '90d' | '1y' | '2y' | 'infinity' | 'any'>('any');
  const [filterCustomRates, setFilterCustomRates] = useState<'include' | 'exclude'>('include');
  const [filterLiveModeration, setFilterLiveModeration] = useState<'include' | 'exclude'>('include');
  
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

  // Favorites (المفضلة): stored on the signed-in account
  const [savedVoiceIds, setSavedVoiceIds] = useState<Set<string>>(new Set());
  const favoritesLoaded = useRef(false);
  useEffect(() => {
    if (!isLoggedIn) { setSavedVoiceIds(new Set()); favoritesLoaded.current = false; return; }
    fetch('/api/v1/auth/favorites').then(r => (r.ok ? r.json() : null)).then(d => {
      if (d?.ids) setSavedVoiceIds(new Set(d.ids));
      favoritesLoaded.current = true;
    }).catch(() => {});
  }, [isLoggedIn]);
  useEffect(() => {
    if (!isLoggedIn || !favoritesLoaded.current) return;
    fetch('/api/v1/auth/favorites', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array.from(savedVoiceIds) }) }).catch(() => {});
  }, [savedVoiceIds, isLoggedIn]);

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
  const humanSamples = useHumanVoices();
  const humanTalentsCatalog: UnifiedVoiceItem[] = useMemo(() => {

    // If backend voices exist, sync bookingsCount or merge dynamically
    return humanSamples.map(item => {
      const matchedBackend = voices?.find(v => v.id === item.id || v.name === item.name || v.name === item.talentName);
      if (matchedBackend && matchedBackend.bookingsCount !== undefined) {
        return {
          ...item,
          bookingsCount: matchedBackend.bookingsCount
        };
      }
      return item;
    });
  }, [voices, humanSamples]);

  // =========================================================================
  // 2. AI VOICES CATALOG (Supporting Product — Sample/Character centered naming)
  // STRICT RULE: No human talent names shown!
  // =========================================================================
  const aiVoicesCatalog: UnifiedVoiceItem[] = useMemo(() => [
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
      category: 'إعلانات',
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
      category: 'برومو',
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
      category: 'وثائقيات',
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
      category: 'إعلانات',
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
      category: 'رد آلي',
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
      category: 'كتب وروايات',
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
      category: 'إعلانات',
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

  // Determine active catalog
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

  // Categories list matching exact taxonomy from Image 2
  // Categories and dialects come from the dashboard (التصنيفات / اللهجات واللغات)
  const siteLists = useSiteLists();
  const categoryFilters = [{ key: 'all', label: 'الكل' }, ...siteLists.categories.map(c => ({ key: c, label: c }))];

  // Dialects shown on the human voices page (used by the project request modal)
  const humanDialectOptions = siteLists.dialects.map(d => ({ key: d.key, label: `${d.flag} ${d.key}` }));


  // Dialect dropdown (same list on the home page and in the dashboard)
  const dialectOptions = [{ key: 'all', label: 'الكل' }, ...humanDialectOptions];

  // Filter and Sort voices
  const filteredVoices = useMemo(() => {
    return currentCatalog.filter(voice => {
      // Sub-tab "المفضلة"
      if (subTab === 'my-voices' && !savedVoiceIds.has(voice.id)) {
        return false;
      }

      // Quality filter (Image 4)
      if (filterQuality === 'studio' && !voice.isVerified) {
        return false;
      }

      // Gender filter (Image 4)
      if (filterGender !== 'any') {
        if (filterGender === 'male' && voice.gender !== 'male') return false;
        if (filterGender === 'female' && voice.gender !== 'female') return false;
      }

      // Age filter (Image 4)
      if (filterAge !== 'any') {
        if (filterAge === 'young' && !(voice.ageRange?.includes('20') || voice.ageRange?.includes('شبابي'))) return false;
        if (filterAge === 'middle' && !(voice.ageRange?.includes('30') || voice.ageRange?.includes('متوسط'))) return false;
        if (filterAge === 'old' && !(voice.ageRange?.includes('40') || voice.ageRange?.includes('وقور') || voice.ageRange?.includes('ناضج'))) return false;
      }

      // Category filter (Exact match or tag match from Image 2)
      if (selectedCategory !== 'all') {
        const matchesCategory = 
          voice.category === selectedCategory || 
          voice.category.includes(selectedCategory) ||
          (voice.tags && voice.tags.some(t => t === selectedCategory || t.includes(selectedCategory) || selectedCategory.includes(t))) ||
          voice.subtitle.includes(selectedCategory) ||
          (voice.sampleName && voice.sampleName.includes(selectedCategory));
        if (!matchesCategory) return false;
      }

      // Dialect filter
      if (selectedDialect !== 'all' && dialectOf(voice.accent, voice.flag) !== selectedDialect) {
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
  }, [
    currentCatalog, 
    subTab, 
    savedVoiceIds, 
    selectedCategory, 
    selectedDialect, 
    activeMainTab, 
    filterQuality, 
    filterGender, 
    filterAge, 
    filterNoticePeriod, 
    filterCustomRates, 
    filterLiveModeration, 
    searchQuery, 
    sortBy,
    similarFilterVoice
  ]);

  // Render 50 voices at a time («استمع للمزيد من الأصوات» adds 50); back to 50 whenever the filters change
  const PAGE_SIZE = 50;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [
    currentCatalog, subTab, selectedCategory, selectedDialect, activeMainTab, filterQuality, filterGender, filterAge,
    filterNoticePeriod, filterCustomRates, filterLiveModeration, searchQuery, sortBy, similarFilterVoice
  ]);
  const visibleVoices = filteredVoices.slice(0, visibleCount);

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

    // Speech synthesis only while the voice has no sample uploaded in the dashboard
    if (!realSampleUrl(voice.previewUrl) && 'speechSynthesis' in window) {
      const textToSpeak = voice.quote || `هذا نموذج تجريبي لصوت ${voice.name} على منصة قيمة فويس بجودة استوديو ثمانية وأربعين كيلو هرتز.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    audioRef.current.src = voice.previewUrl;
    audioRef.current.play().catch(() => {
      setPlayingVoiceId(null);
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
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-28" dir="rtl">
      
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
                  activeMainTab === 'human' ? 'bg-brand text-white shadow-xs' : 'bg-slate-100 text-slate-500'
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
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand rounded-full" />
                )}
              </button>

              {/* خيار 2: أصوات AI — hidden until launch (shared/features.ts) */}
              {AI_VOICES_ENABLED && (
<div className="relative flex items-center">
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
              </div>
              )}

              {/* خيار 3: المفضلة (المحفوظة) */}
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
                <span>المفضلة ({savedVoiceIds.size})</span>
                
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
              <div className="max-w-2xl lg:max-w-none min-w-0 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-brand-text text-xs font-bold border border-orange-200">
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>سوق الأصوات البشرية الاحترافي للشركات والوكالات</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  أصوات بشرية حقيقية لمشاريعك
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed xl:whitespace-nowrap">
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
                    <Volume2 className="w-4 h-4 text-brand-text shrink-0" />
                    <span className="text-xs font-bold text-slate-800">تسجيل احترافي 48kHz</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <button
                  onClick={() => setIsB2BProjectModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-sm shadow-md transition-all cursor-pointer group"
                >
                  <Briefcase className="w-4 h-4 text-brand-text group-hover:scale-110 transition-transform" />
                  <span>احجز صوتاً لمشروعك</span>
                </button>

                <button
                  onClick={() => openAssistant()}
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
              <Sparkles className="w-4 h-4 text-brand-text" />
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
        
        {/* Search and Filters Box */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          {/* Top bar with quick actions (Earnings / Add Talent) */}
          <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              {activeMainTab === 'human' ? 'مكتبة الأصوات البشرية المعتمدة' : 'استكشاف نماذج الأصوات (AI)'}
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              ({filteredVoices.length} صوت متاح)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeMainTab === 'human' ? (
              <button
                onClick={openTalentSignup}
                className="px-3 py-1.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-brand-text" />
                <span>+ انضم كمعلق صوتي</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCreateVoiceModal(true)}
                className="px-3 py-1.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-text" />
                <span>+ Create Voice</span>
              </button>
            )}

            </div>
          </div>

        {/* ========================================================================= */}
        {/* IMAGE 3 ROW 1: Search library voices... + Filters Button + Sort Button     */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search library voices..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-11 py-2.5 bg-white hover:bg-slate-50/50 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-400 shadow-2xs"
            />
            {/* Scan / shortcut icon on the far left */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Scan className="w-4 h-4" />
            </div>
          </div>

          {/* Filters Button (Image 3 & Image 4) */}
          <div className="relative">
            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs whitespace-nowrap cursor-pointer ${
                showFiltersModal || (filterQuality !== 'any' || filterGender !== 'any' || filterAge !== 'any' || filterNoticePeriod !== 'any')
                  ? 'bg-brand-ink text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>الفلاتر</span>
              {(filterQuality !== 'any' || filterGender !== 'any' || filterAge !== 'any' || filterNoticePeriod !== 'any' || filterCustomRates !== 'include' || filterLiveModeration !== 'include') && (
                <span className="w-2 h-2 rounded-full bg-brand" />
              )}
            </button>
          </div>

          {/* Sort Button (Image 3) */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center justify-center p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-700 transition-all shadow-2xs cursor-pointer"
              title="ترتيب النتائج"
            >
              <ArrowUpDown className="w-4 h-4 text-slate-600" />
            </button>

            {showSortDropdown && (
              <div 
                onMouseLeave={() => setShowSortDropdown(false)}
                className="absolute left-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in text-xs"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ترتيب حسب
                </div>
                <button
                  onClick={() => { setSortBy('popularity'); setShowSortDropdown(false); }}
                  className={`w-full text-right px-3 py-2 rounded-xl transition-colors font-medium cursor-pointer ${
                    sortBy === 'popularity' ? 'bg-orange-50 text-brand-text font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  الأكثر طلباً
                </button>
                <button
                  onClick={() => { setSortBy('usage'); setShowSortDropdown(false); }}
                  className={`w-full text-right px-3 py-2 rounded-xl transition-colors font-medium cursor-pointer ${
                    sortBy === 'usage' ? 'bg-orange-50 text-brand-text font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  الأعلى استماعاً
                </button>
                <button
                  onClick={() => { setSortBy('name'); setShowSortDropdown(false); }}
                  className={`w-full text-right px-3 py-2 rounded-xl transition-colors font-medium cursor-pointer ${
                    sortBy === 'name' ? 'bg-orange-50 text-brand-text font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  الترتيب الأبجدي
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* IMAGE 3 ROW 2: Language Button ⌵ | Category Pills from Image 2             */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 py-1 min-w-0">
          
          {/* Language Dropdown Button */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowDialectDropdown(!showDialectDropdown)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                selectedDialect !== 'all'
                  ? 'bg-brand-ink text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>
                اللهجة: {selectedDialect === 'all' ? 'الكل' : selectedDialect}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
            </button>

            {showDialectDropdown && (
              <div 
                onMouseLeave={() => setShowDialectDropdown(false)}
                className="absolute right-0 mt-1 w-60 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in"
              >
                {dialectOptions.map(opt => {
                  const isActive = selectedDialect === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setSelectedDialect(opt.key);
                        setShowDialectDropdown(false);
                      }}
                      className={`w-full text-right px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isActive ? 'bg-orange-50 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-brand-text" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Thin Vertical Divider | */}
          <div className="h-6 w-px bg-slate-200 shrink-0 mx-0.5" />

          {/* Category Pills from Image 2 (Horizontal Scrolling) */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto no-scrollbar">
            {categoryFilters.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-brand-ink text-white font-bold shadow-2xs border border-slate-900'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* AI Tab Complete Filters Extension (if activeMainTab === 'ai') */}
        {activeMainTab === 'ai' && (
          <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs animate-in fade-in">
            <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>فلاتر الذكاء الاصطناعي الكاملة:</span>
            </span>

            {/* Gender Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
              <button
                onClick={() => setSelectedGender('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedGender === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                كافة الأصوات
              </button>
              <button
                onClick={() => setSelectedGender('male')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedGender === 'male' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                رجالي
              </button>
              <button
                onClick={() => setSelectedGender('female')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedGender === 'female' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                نسائي
              </button>
            </div>

            {/* Speed Option */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>السرعة:</span>
              <select
                value={selectedSpeed}
                onChange={e => setSelectedSpeed(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
              >
                <option value="all">الكل (طبيعي)</option>
                <option value="0.9">هادئ (0.9x)</option>
                <option value="1.0">معياري (1.0x)</option>
                <option value="1.2">سريع (1.2x)</option>
              </select>
            </div>

            {/* Reset AI filters */}
            {(selectedGender !== 'all' || selectedSpeed !== 'all') && (
              <button
                onClick={() => { setSelectedGender('all'); setSelectedSpeed('all'); }}
                className="text-slate-500 hover:text-slate-900 text-[11px] font-bold pr-2 mr-auto"
              >
                إلغاء فلاتر AI
              </button>
            )}
          </div>
        )}

      </div>

        {/* Results Counter & Filter Status */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1 pt-1">
          {/* Count shown for AI / favorites only (removed from the human library on request) */}
          {activeMainTab !== 'human' && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
              {filteredVoices.length}
            </span>
            <span className="text-slate-600 font-normal">
              {activeMainTab === 'my-voices' ? 'صوت في قائمتك المفضلة' : 'نموذج صوت ذكي'}
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
          )}

          <div className="text-[11px] text-slate-500 font-normal hidden sm:block mr-auto">
            {activeMainTab === 'human'
              ? 'حقوق تجارية كاملة • تسليم خلال 24–48 ساعة'
              : 'جاهز للتوليد الفوري في استوديو النصوص'}
          </div>
        </div>

        {/* Similar Voices Banner */}
        {similarFilterVoice && (
          <div className="p-3 bg-orange-50/90 border border-orange-200 rounded-2xl flex items-center justify-between text-xs text-slate-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-text shrink-0" />
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
        {/* 5. VOICE CARDS LISTING — High-Density Sleek Single-Line Row Layout        */}
        {/* ========================================================================= */}
        <div className="space-y-1.5" dir="rtl">
          {visibleVoices.map(voice => {
            const isPlaying = playingVoiceId === voice.id;
            const isSaved = savedVoiceIds.has(voice.id);
            const isHoveredLicense = hoveredLicenseVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                className={`group relative bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl px-3 py-1.5 sm:py-2 transition-all duration-150 shadow-2xs hover:shadow-xs min-h-[52px] flex flex-wrap xl:flex-nowrap items-center justify-between gap-2.5 overflow-visible ${
                  isPlaying ? 'ring-2 ring-slate-900 bg-slate-50/80 border-slate-900' : ''
                }`}
              >
                {/* 1. Right Section: Glassy Orb + Talent Name + Verified + Style/Bio (Single Line) */}
                <div className="flex items-center gap-2.5 min-w-0 shrink-0 lg:shrink-1">
                  
                  {/* Glassy Color Orb with Play/Pause Button */}
                  <GlassyVoiceOrb
                    voiceId={voice.id}
                    isPlaying={isPlaying}
                    isVerified={voice.isVerified}
                    size="sm"
                    onTogglePlay={(e) => {
                      e.stopPropagation();
                      handleTogglePlay(voice);
                    }}
                  />

                  {/* Name & Primary Badges on Single Line */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 
                      onClick={() => setSelectedProfileVoice(voice)}
                      className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-brand-text cursor-pointer transition-colors whitespace-nowrap"
                    >
                      {voice.isHuman ? (voice.sampleName || voice.name) : voice.name}
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

                    {/* Sample Name instead of description */}
                    {!voice.isHuman && voice.sampleName && (
                      <span className="text-[11px] text-slate-700 font-medium truncate max-w-[140px] xl:max-w-[200px] hidden lg:inline-block pr-1 border-r border-slate-200/80">
                        {voice.sampleName}
                      </span>
                    )}
                  </div>

                </div>

                {/* 2. Middle Section: Compact Metadata Badges (Single Horizontal Line) */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                  
                  {/* Language & Flag */}
                  <div className="flex items-center gap-1 text-slate-700 text-[11px] font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 shrink-0">
                    <span>{voice.flag}</span>
                    <span className="hidden md:inline">{voice.language || 'العربية'}</span>
                  </div>

                  {/* Accent / Dialect */}
                  <div className="text-slate-600 text-[11px] font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 shrink-0">
                    <span>{getShortDialect(voice.accent, voice.flag)}</span>
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

                  {/* Usage / Clients Stats */}
                  <div 
                    className="relative group/usage flex items-center gap-1 text-slate-600 text-[11px] bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 whitespace-nowrap transition-colors cursor-help shrink-0"
                  >
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="font-mono font-medium">{voice.usageCount || '48.2K'}</span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/usage:flex flex-col z-50 w-72 max-w-[90vw] p-3 bg-slate-950 text-white rounded-xl shadow-2xl border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 text-right font-sans tracking-normal whitespace-normal">
                      <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5 text-xs">
                        <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{voice.isHuman ? 'عملاء وثقوا بالصوت' : 'استخدامات النموذج'}</span>
                      </div>
                      <div className="text-white text-xs leading-relaxed font-normal">
                        {voice.isHuman 
                          ? 'عدد العملاء والشركات الذين وثقوا بهذا الصوت'
                          : 'عدد العملاء الذين استخدموا هذا الصوت'}
                      </div>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 rotate-45 border-r border-b border-slate-700"></div>
                    </div>
                  </div>

                  {/* Booking Count for Human Voices */}
                  {voice.isHuman && (
                    <div 
                      className="relative group/bookings flex items-center gap-1 text-slate-700 text-[11px] bg-orange-50/90 hover:bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-200/80 whitespace-nowrap transition-colors cursor-help shrink-0"
                    >
                      <Briefcase className="w-3 h-3 text-brand-text shrink-0" />
                      <span className="font-mono font-bold text-slate-900">{voice.bookingsCount || 142}</span>
                      <span className="text-[10px] text-orange-950 font-medium">حجز</span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bookings:flex flex-col z-50 w-72 max-w-[90vw] p-3 bg-slate-950 text-white rounded-xl shadow-2xl border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 text-right font-sans tracking-normal whitespace-normal">
                        <div className="font-bold text-orange-400 mb-1 flex items-center gap-1.5 text-xs">
                          <Briefcase className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span>حجوزات الاستوديو المكتملة</span>
                        </div>
                        <div className="text-white text-xs leading-relaxed font-normal">
                          تم حجز هذا الصوت البشري {voice.bookingsCount || 142} مرة بنجاح لتسجيل مشاريع تجارية وإعلامية.
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
                <div className="flex items-center gap-1.5 shrink-0 text-xs">
                  
                  {/* CTA Button */}
                  {voice.isHuman ? (
                    <div className="flex items-center gap-2">
                      {voice.pricing && (
                        <span className="text-[11px] font-mono font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {voice.pricing}
                        </span>
                      )}
                      <button
                        onClick={() => onSelectForBooking(voice)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-brand hover:bg-brand-orange text-white text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap group/btn"
                      >
                        <span>احجز الصوت</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectForGeneration(voice)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap group/btn"
                    >
                      <Plus className="w-3 h-3 text-brand-text group-hover/btn:scale-110 transition-transform" />
                      <span>توليد</span>
                    </button>
                  )}

                  {/* Waveform Button */}
                  <button
                    onClick={() => handleTogglePlay(voice)}
                    className={`p-1 rounded-lg border transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-orange-50 border-orange-200 text-brand-text'
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
                          <Layers className="w-3.5 h-3.5 text-brand-text" />
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

        {filteredVoices.length > visibleCount && (
          <div className="pt-4 text-center space-y-2">
            <button
              type="button"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900 text-sm font-bold shadow-2xs transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-brand-text" />
              استمع للمزيد من الأصوات
            </button>
            <p className="text-[11px] text-slate-400">يعرض {visibleVoices.length.toLocaleString('en-US')} من {filteredVoices.length.toLocaleString('en-US')} صوت</p>
          </div>
        )}

        {/* Empty State */}
        {filteredVoices.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <Volume2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">لم يتم العثور على أصوات مطابقة لمعايير البحث</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              جرب تغيير كلمات البحث أو إعادة ضبط خيارات اللهجة والتصنيف للاطلاع على بقية الأصوات.
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
                className="px-5 py-2.5 rounded-xl bg-brand-ink text-white text-xs font-bold hover:bg-brand-ink/90 transition-colors cursor-pointer"
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
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-brand-text flex items-center justify-center">
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-yellow to-amber-400 flex items-center justify-center text-white shrink-0 shadow-md">
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
              className="px-5 py-3 rounded-2xl bg-brand hover:bg-brand-orange text-white font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ساعدني في اختيار صوت</span>
            </button>
          </div>
        </div>

        {afterVoices}

        {/* ========================================================================= */}
        {/* 8. B2B PROJECT REQUEST BANNER                                             */}
        {/* ========================================================================= */}
        <div className="mt-8 bg-orange-50/70 border border-orange-200/80 rounded-3xl p-6 sm:p-8 text-right">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-brand-text text-[11px] font-bold">
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
                className="px-5 py-3 rounded-2xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                اطلب صوتًا لمشروعك
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
        dialectOptions={humanDialectOptions}
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

      {/* Advanced Filters Modal (Exact Match to Image 4) */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div dir="rtl" className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
            
            {/* Header with Title and Close */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-800" />
                <h3 className="font-bold text-sm text-slate-900">الفلاتر</h3>
              </div>
              <button 
                onClick={() => setShowFiltersModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Rows (Matching Image 4) */}
            <div className="space-y-4 text-xs text-right">
              
              {/* 1. Quality: [ Studio | Any ] */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="font-semibold text-slate-900 text-xs">الجودة</span>
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 justify-self-start">
                  <button
                    onClick={() => setFilterQuality('any')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterQuality === 'any'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFilterQuality('studio')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterQuality === 'studio'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    استوديو
                  </button>
                </div>
              </div>

              {/* 2. Gender: [ Male | Female | Neutral | Any ] */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="font-semibold text-slate-900 text-xs">الجنس</span>
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 justify-self-start">
                  <button
                    onClick={() => setFilterGender('any')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterGender === 'any'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFilterGender('male')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterGender === 'male'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    ذكر
                  </button>
                  <button
                    onClick={() => setFilterGender('female')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterGender === 'female'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    أنثى
                  </button>
                </div>
              </div>

              {/* 3. Age: [ Young | Middle Aged | Old | Any ] */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="font-semibold text-slate-900 text-xs">العمر</span>
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 justify-self-start">
                  <button
                    onClick={() => setFilterAge('any')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterAge === 'any'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFilterAge('young')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterAge === 'young'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    شاب
                  </button>
                  <button
                    onClick={() => setFilterAge('middle')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterAge === 'middle'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    متوسط العمر
                  </button>
                  <button
                    onClick={() => setFilterAge('old')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterAge === 'old'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    كبير السن
                  </button>
                </div>
              </div>

              {activeMainTab !== 'human' && (
              <>
              {/* 4. Notice period ⓘ: [ 30d | 90d | 1y | 2y | ∞ | Any ] */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <div className="flex items-center gap-1 font-semibold text-slate-900 text-xs">
                  <span>فترة الإشعار</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 justify-self-start">
                  {(['any', '30d', '90d', '1y', '2y', 'infinity'] as const).map(item => (
                    <button
                      key={item}
                      onClick={() => setFilterNoticePeriod(item)}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                        filterNoticePeriod === item
                          ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 font-medium'
                      }`}
                    >
                      {({'30d':'30 يوم','90d':'90 يوم','1y':'سنة','2y':'سنتان','infinity':'∞','any':'الكل'} as Record<string,string>)[item]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Custom rates ⓘ: [ Exclude | Include ] */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <div className="flex items-center gap-1 font-semibold text-slate-900 text-xs">
                  <span>أسعار مخصصة</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 justify-self-start">
                  <button
                    onClick={() => setFilterCustomRates('include')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterCustomRates === 'include'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    تضمين
                  </button>
                  <button
                    onClick={() => setFilterCustomRates('exclude')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterCustomRates === 'exclude'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    استبعاد
                  </button>
                </div>
              </div>
              </>
              )}

              {/* 6. Live moderation ⓘ: [ Exclude | Include ] */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <div className="flex items-center gap-1 font-semibold text-slate-900 text-xs">
                  <span>جلسة تسجيل مباشر</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 justify-self-start">
                  <button
                    onClick={() => setFilterLiveModeration('include')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterLiveModeration === 'include'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    تضمين
                  </button>
                  <button
                    onClick={() => setFilterLiveModeration('exclude')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterLiveModeration === 'exclude'
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    استبعاد
                  </button>
                </div>
              </div>

            </div>

            {/* Clear All Filters Button (Image 4 bottom center) */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  setFilterQuality('any');
                  setFilterGender('any');
                  setFilterAge('any');
                  setFilterNoticePeriod('any');
                  setFilterCustomRates('include');
                  setFilterLiveModeration('include');
                  setSelectedCategory('all');
                  setSelectedDialect('all');
                  setSelectedGender('all');
                  setShowFiltersModal(false);
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>مسح كل الفلاتر</span>
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
              className="px-4 py-2.5 rounded-xl bg-brand-ink text-white font-bold text-xs hover:bg-brand-ink/90 transition-colors w-full"
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
                <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand-text flex items-center justify-center">
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
                className="px-5 py-2 rounded-xl bg-brand-ink text-white font-bold text-xs hover:bg-brand-ink/90 transition-colors"
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
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-brand-text flex items-center justify-center">
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
                className="px-5 py-2 rounded-xl bg-brand-ink text-white font-bold text-xs hover:bg-brand-ink/90 transition-colors"
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
