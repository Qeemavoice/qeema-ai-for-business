export type ActiveView =
  | 'home'
  | 'client-dashboard'
  | 'human-marketplace'
  | 'voice-library'
  | 'tts'
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
  | 'voice-clone';

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
  trustedClientsCount?: number;
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

export interface Plan {
  id: string;
  name: string;
  nameAr: string;
  monthlyCredits: number;
  priceUsd: number;
  features: string[];
}

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
  status: 'pending' | 'in_studio' | 'delivered' | 'approved';
  deliverableAudioUrl?: string;
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
}
