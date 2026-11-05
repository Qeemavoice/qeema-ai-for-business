export type ActiveView = 
  | 'home' 
  | 'client-dashboard'
  | 'talent-dashboard'
  | 'claim'
  | 'ai-voice-setup'
  | 'human-marketplace'
  | 'voice-library'
  | 'generate'
  | 'my-audio'
  | 'usage'
  | 'billing'
  | 'admin'
  | 'how-it-works'
  | 'blog'
  | 'training'
  | 'about'
  | 'contact'
  | 'instant-studio' 
  | 'branded-voice' 
  | 'industries' 
  | 'voice-data' 
  | 'changelog'
  | 'customer-stories'
  | 'voice-clone'
  | 'talent-profile'
  | 'talent-earnings'
  | 'chatbot';

export type TalentNavKey = 
  | 'overview' 
  | 'projects' 
  | 'studio' 
  | 'twin'
  | 'earnings'
  | 'profile'
  | 'contracts'
  | 'demos' 
  | 'auditions' 
  | 'rates' 
  | 'specs';

export type IndustryKey = 'banking' | 'tech' | 'agencies' | 'media' | 'elearning';

export type DialectKey = 'all' | 'gulf' | 'levantine' | 'egyptian' | 'maghrebi' | 'fusha';

export type VoiceType = 'human' | 'ai';

export interface Company {
  id: string;
  name: string;
  industry: string;
  country: string;
  createdAt: string;
  planId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: 'admin' | 'member' | 'viewer';
  avatar?: string;
  createdAt: string;
  accountType?: 'client' | 'talent';
  /** Platform staff: may open the admin dashboard */
  isPlatformAdmin?: boolean;
  /** Narrator record of a talent account */
  narratorId?: string;
}

export interface Voice {
  id: string;
  type: VoiceType;
  name: string;
  nameEn?: string;
  gender: 'male' | 'female';
  language: string;
  dialect: DialectKey;
  dialectLabel: string;
  style: string;
  styleLabel: string;
  useCases: string[];
  provider: string;
  previewUrl: string;
  isActive: boolean;
  isFeatured?: boolean;
  avatar: string;
  humanTalentId?: string;
  bookingsCount?: number;
  usageCount?: string;
  trustYears?: string;
  pricing?: string;
  trustTooltip?: string;
  extraAccentsCount?: number;
  flag?: string;
  accent?: string;
  category?: string;
  turnaround?: string;
  isHuman?: boolean;
  isVerified?: boolean;
  glassGradient?: string;
  subtitle?: string;
  description?: string;
}

export interface Generation {
  id: string;
  companyId: string;
  userId: string;
  voiceId: string;
  voiceName: string;
  voiceType: VoiceType;
  dialect: DialectKey;
  text: string;
  textChars: number;
  settings: {
    speed: number;
    stability?: number;
    style?: number;
    pitch?: number;
    format?: string;
  };
  provider: string;
  model: string;
  audioUrl: string;
  durationSeconds: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  creditsConsumed: number;
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  companyId: string;
  userId: string;
  delta: number;
  balanceAfter: number;
  reason: 'signup_bonus' | 'generation' | 'admin_grant' | 'refund' | 'purchase';
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface UsageMetrics {
  totalGenerations: number;
  totalCharacters: number;
  totalCredits: number;
  totalAudioMinutes: number;
  topVoiceName: string;
}

// Plans are defined once in shared/plans.ts
export type { PlanDefinition as Plan } from '../shared/plans';

export interface VoiceArtist {
  id: string;
  name: string;
  code: string; // e.g. QV-1042
  avatar: string;
  gender: 'male' | 'female';
  dialect: string;
  dialectKey: DialectKey;
  region: string;
  role: string;
  bio: string;
  verified: boolean;
  sampleFrequency: string; // e.g. '48kHz FLAC Studio'
  tone: string;
  sampleQuote: string;
}

export interface DialectStat {
  key: DialectKey;
  name: string;
  region: string;
  estimatedCount: number;
  confirmed: boolean;
  characteristics: string[];
  highlightArtists: string[];
  sampleAudioText: string;
}

export interface ChangelogItem {
  id: string;
  category: 'core' | 'views' | 'components' | 'pending';
  title: string;
  route?: string;
  status: 'completed_local' | 'in_review' | 'needs_confirmation';
  files: string[];
  description: string;
  impact: string;
}

export interface AuditReport {
  overallScore: number;
  dialectAccuracy: number;
  acousticClarity: number;
  emotionalMatch: number;
  sampleFrequency: string;
  verificationHash: string;
  testedDuration: string;
  date: string;
}

export interface HumanBooking {
  id: string;
  companyId: string;
  companyName: string;
  talentId: string;
  talentName: string;
  scriptText: string;
  deadlineDays: number;
  usageLicense: 'commercial_ads' | 'internal_corporate' | 'broadcast_tv' | 'elearning';
  notes?: string;
  priceUsd: number;
  talentPayoutUsd: number;
  paymentModel: 'direct_escrow_100';
  status: 'pending' | 'in_studio' | 'delivered' | 'approved' | 'canceled';
  deliverableAudioUrl?: string;
  review?: { rating: number; text: string; author: string; createdAt: string; status: 'pending' | 'approved' | 'rejected' };
  /** Library sample the client booked (for publishing approved reviews on its page) */
  sampleId?: string;
  /** Added by the server for the client's bookings list */
  sampleName?: string;
  dialect?: string;
  delivery?: string;
  charCount?: number;
  durationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TalentPayout {
  talentId: string;
  talentName: string;
  avatar: string;
  dialect: string;
  completedBookingsCount: number;
  totalEarningsUsd: number;
  paidOutUsd: number;
  pendingBalanceUsd: number;
  iban: string;
  bankName: string;
  status: 'active' | 'payout_scheduled' | 'settled';
  lastPayoutDate?: string;
}

export interface SystemSettings {
  platformCommissionPercent: number;
  elevenLabsStatus: 'operational' | 'degraded' | 'offline';
  geminiAiStatus: 'operational' | 'degraded' | 'offline';
  cdnStorageStatus: 'operational' | 'degraded' | 'offline';
  maintenanceMode: boolean;
  creditRatePer10kCharsUsd: number;
  paymentEscrowModel: 'direct_100_percent';
  defaultCurrency?: string;
  stripeFeePercent?: number;
}

// -------------------------------------------------------------
// Narrator Profile Claiming & "صوتي الذكي" (Voice Cloning) Data Models
// -------------------------------------------------------------

export type NarratorStatus = 'unclaimed' | 'invited' | 'active' | 'suspended';

export type AIVoiceStatus = 
  | 'not_started' 
  | 'kyc_pending' 
  | 'contract_signed' 
  | 'recording'
  | 'processing' 
  | 'preview_ready' 
  | 'published' 
  | 'paused' 
  | 'notice_period' 
  | 'removed';

export type UseCase = 
  | 'ads' 
  | 'corporate' 
  | 'elearning' 
  | 'ivr' 
  | 'documentary' 
  | 'podcast' 
  | 'social' 
  | 'audiobook'
  | 'political' 
  | 'religious' 
  | 'adult' 
  | 'gambling' 
  | 'impersonation';

export interface Narrator {
  id: string;
  displayName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  dialects: string[];            // e.g. ['سعودي نجدي', 'فصحى']
  country?: string;
  /** «معلق بشري» badge: granted or withdrawn by the admin team only; the narrator can only request it */
  humanBadge?: 'none' | 'pending' | 'verified';
  /** What the narrator submitted for the badge request (the admin reviews it) */
  humanVerification?: { selfieUrl: string; voiceUrl: string; text: string; submittedAt: string };
  status: NarratorStatus;
  claimToken?: string;
  claimTokenExpiresAt?: string;  // 7 days
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  bio?: string;
  rates?: {
    standardCommercialUsd: number;
    perWordRateUsd: number;
    hourlyLiveDirectingUsd: number;
    /** The narrator's OWN price per minute (USD). The client sees this + the platform commission. */
    perMinuteUsd?: number;
  };
  sampleAudioUrl?: string;
  /** Internal notes written by the admin team (never shown to the narrator) */
  adminNotes?: { id: string; text: string; at: string }[];
  createdAt?: string;
}

export interface VoiceContract {
  id: string;
  narratorId: string;
  version: string;
  allowedUseCases: UseCase[];    // ads, corporate, elearning, ivr, documentary, podcast, social, audiobook
  blockedUseCases: UseCase[];    // political, religious, adult, gambling, impersonation (always blocked)
  noticePeriodDays: 30 | 180 | 365 | 730;
  revenueSharePercent: number;   // derived from notice period: 30d -> 25%, 180d -> 35%, 365d -> 45%, 730d -> 50%
  signedAt: string;
  signatureName: string;
  ipAddress: string;
}

export interface AIVoice {
  id: string;
  narratorId: string;
  contractId: string;
  elevenLabsVoiceId?: string;    // returned by backend
  dialect: string;
  status: AIVoiceStatus;
  consentRecordingUrl: string;   // the spoken consent sentence
  sampleRecordingUrls: string[];
  previewUrls: string[];         // 5 generated previews for narrator approval
  publishedAt?: string;
  disableAt?: string;            // set when notice period starts
  clonedAt?: string;
  qualityMetrics?: {
    durationSeconds: number;
    clippingDetected: boolean;
    noiseScore: 'excellent' | 'acceptable' | 'high_noise';
    isClean: boolean;
  };
}

export interface UsageEvent {
  id: string;
  aiVoiceId: string;
  clientId: string;
  clientName?: string;
  useCase: UseCase;
  characters: number;
  grossAmount: number;
  narratorEarning: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  narratorId: string;
  action: string;
  payload: Record<string, any>;
  at: string;
  ip?: string;
  hash?: string;
}

export type VoiceSampleStatus = 'pending_review' | 'published' | 'rejected' | 'hidden';

export interface VoiceSample {
  id: string;
  narratorId: string;
  title: string;
  category: string;
  dialect: string;
  audioUrl: string;
  durationSec: number;
  pricePerMinute?: number;
  status: VoiceSampleStatus;
  rejectionReason?: string;
  /** Codes from shared/sampleRules.ts REJECTION_REASONS */
  rejectionCodes?: string[];
  /** true when the system rejected it automatically (duration / format) */
  autoRejected?: boolean;
  /** uploaded file format, e.g. 'mp3' | 'wav' */
  format?: string;
  sizeMb?: number;
  reviewedAt?: string;
  createdAt: string;
}

/** A narrator's voice in «مكتبة الأصوات» (read-only; server: NarratorController::libraryVoices) */
export interface LibraryVoice {
  id: string;
  narratorId: string;
  title: string;
  category: string;
  dialect: string;
  language: string;
  gender: 'male' | 'female';
  audioUrl: string;
  /** the narrator's own price per minute for this voice (0 = not set, the narrator's rate applies) */
  narratorPriceUsd: number;
  /** what the client pays per minute (narrator price + platform commission) */
  finalPriceUsd: number;
  bookingsCount: number;
  listensCount: number;
  createdAt: string;
}

export type NarratorNotificationType = 'sample_rejected' | 'sample_approved' | 'account' | 'info';

export interface NarratorNotification {
  id: string;
  narratorId: string;
  type: NarratorNotificationType;
  title: string;
  body: string;
  reasons?: string[];
  sampleId?: string;
  read: boolean;
  createdAt: string;
}

export type VoiceOverBookingStatus = 'in_progress' | 'completed' | 'paid';

export interface VoiceOverBooking {
  id: string;
  narratorId: string;
  projectTitle: string;
  date: string;
  status: VoiceOverBookingStatus;
  amount: number;
  createdAt: string;
  /** Set when the admin reviewed a client booking and forwarded it to the narrator */
  bookingRef?: string;
  scriptText?: string;
  deadlineDays?: number;
  usageLicense?: string;
  notes?: string;
}



