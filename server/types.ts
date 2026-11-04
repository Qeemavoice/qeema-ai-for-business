export type VoiceType = 'human' | 'ai';
export type DialectCode = 'gulf' | 'egyptian' | 'levantine' | 'maghrebi' | 'fusha';
export type VoiceGender = 'male' | 'female';
export type VoiceStyle = 'commercial' | 'documentary' | 'corporate' | 'storytelling' | 'conversational' | 'energetic' | 'calm';
export type VoiceUseCase = 'ads' | 'elearning' | 'ivr' | 'social_media' | 'presentations' | 'podcasts' | 'dubbing' | 'documentary' | 'corporate';

export interface Company {
  id: string;
  name: string;
  industry: string;
  country: string;
  createdAt: string;
  planId: string;
  /** Admin-side account follow-up */
  status?: 'active' | 'suspended';
  contactEmail?: string;
  phone?: string;
  notes?: CustomerNote[];
  /** Client dashboard «المشاريع» */
  projects?: { id: string; title: string; description: string; dialect: string; status: 'active' | 'done'; createdAt: string }[];
  /** Client dashboard «فريق العمل» invitations */
  teamInvites?: { id: string; name: string; email: string; invitedAt: string; emailed: boolean }[];
}

export interface CustomerNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: string;
  avatar?: string;
  /** scrypt "salt:hash"; never sent to the browser */
  passwordHash?: string;
  accountType?: 'client' | 'talent';
  /** Platform staff: may open the admin dashboard */
  isPlatformAdmin?: boolean;
  /** Narrator record owned by this account (talent accounts) */
  narratorId?: string;
  /** Voices the client saved to المفضلة in the voice library */
  savedVoiceIds?: string[];
}

export interface Session {
  userId: string;
  createdAt: string;
}

export interface Voice {
  id: string;
  type: VoiceType;
  name: string;
  nameEn?: string;
  gender: VoiceGender;
  language: string; // 'ar'
  dialect: DialectCode;
  dialectLabel: string; // e.g. 'سعودي نجدي' or 'مصري قاهري'
  style: VoiceStyle;
  styleLabel: string; // e.g. 'إعلاني ورنان'
  useCases: VoiceUseCase[];
  provider: 'elevenlabs' | 'vertex_ai' | 'qeema_acoustic' | 'human_marketplace';
  providerVoiceId?: string;
  previewUrl: string;
  isActive: boolean;
  isFeatured?: boolean;
  avatar: string;
  humanTalentId?: string;
  /** TTS studio voice owned by a narrator: he earns narratorSharePercent of each use (set by the admin) */
  narratorId?: string;
  narratorSharePercent?: number;
  bookingsCount?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/** What a narrator earns from one TTS generation made with his voice (computed when the generation completes). */
export interface NarratorEarning {
  id: string;
  narratorId: string;
  voiceId: string;
  voiceName: string;
  generationId: string;
  companyId: string;
  chars: number;
  /** Cash value of the credits consumed, at the customer's plan price per credit (0 on free plans) */
  grossUsd: number;
  sharePercent: number;
  narratorUsd: number;
  platformUsd: number;
  createdAt: string;
}

export interface GenerationSettings {
  speed: number;       // 0.5 - 2.0
  stability?: number;  // 0.0 - 1.0
  style?: number;      // 0.0 - 1.0
  pitch?: number;      // -10 to +10
  format?: 'mp3' | 'wav';
}

export interface Generation {
  id: string;
  companyId: string;
  userId: string;
  voiceId: string;
  voiceName: string;
  voiceType: VoiceType;
  dialect: DialectCode;
  text: string;
  textChars: number;
  settings: GenerationSettings;
  provider: string;
  model: string;
  audioUrl: string;
  storagePath: string;
  durationSeconds: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  creditsConsumed: number;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  companyId: string;
  userId: string;
  generationId: string;
  feature: 'tts' | 'dubbing' | 'cloning';
  provider: string;
  model: string;
  inputUnits: number; // characters
  outputUnits: number; // audio seconds
  creditsConsumed: number;
  costUsd: number;
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  companyId: string;
  userId: string;
  delta: number; // positive or negative
  balanceAfter: number;
  reason: 'signup_bonus' | 'generation' | 'admin_grant' | 'refund' | 'purchase';
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  actor: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Plans are defined once in shared/plans.ts
export type { PlanDefinition as Plan } from '../shared/plans';

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
  /** Client's rating of the delivered project */
  review?: { rating: number; text: string; author: string; createdAt: string; status: 'pending' | 'approved' | 'rejected' };
  /** Library sample the client booked (for publishing approved reviews on its page) */
  sampleId?: string;
  /** Delivery option picked at booking: '48h' | '24h' | '6h' | 'custom' (long projects) */
  delivery?: string;
  charCount?: number;
  durationMinutes?: number;
  /** Contact details typed in the booking form: for the admins only, never returned to the client list */
  customerContact?: { name: string; email: string; whatsapp: string };
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
  platformCommissionPercent: number; // % added on top of the narrator price (30)
  elevenLabsStatus: 'operational' | 'degraded' | 'offline';
  geminiAiStatus: 'operational' | 'degraded' | 'offline';
  cdnStorageStatus: 'operational' | 'degraded' | 'offline';
  maintenanceMode: boolean;
  creditRatePer10kCharsUsd: number; // e.g. $4.00 per 10k chars
  paymentEscrowModel: 'direct_100_percent';
  defaultCurrency: string;      // ISO code, e.g. 'USD'
  stripeFeePercent: number;     // payment gateway fee (%)
}

/** Payment gateway + mail server credentials. Kept apart from SystemSettings so secrets never reach audit logs. */
export interface IntegrationSettings {
  stripe: {
    enabled: boolean; displayName: string; testMode: boolean;
    livePublishableKey: string; liveSecretKey: string;
    testPublishableKey: string; testSecretKey: string;
  };
  smtp: {
    driver: 'smtp'; fromName: string; fromAddress: string; host: string; port: number;
    username: string; password: string; encryption: 'SSL' | 'TLS' | 'none';
  };
}
