import { Voice, DialectKey, VoiceType } from '../../types';

export type AssistantLanguage = 'ar' | 'en';
export type AssistantMode = 'voice' | 'text';
export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'connecting' | 'error';

export type AssistantCardType =
  | 'voice_list'
  | 'pricing'
  | 'licensing'
  | 'contact_sales'
  | 'navigation'
  | 'how_it_works';

export interface PricingPlanCard {
  id: string;
  nameAr: string;
  nameEn: string;
  priceUsd: number;
  period: string;
  credits: number;
  highlight?: boolean;
  features: string[];
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  cardType?: AssistantCardType;
  cardData?: {
    voices?: Voice[];
    plans?: PricingPlanCard[];
    targetView?: string;
    targetTab?: string;
    ctaLabel?: string;
    details?: string[];
  };
  suggestedReplies?: string[];
  quota?: {
    dailyLimit: number;
    used: number;
    remaining: number;
    resetsAt: string;
  };
}

export interface VoiceSearchParams {
  query?: string;
  dialect?: DialectKey | 'all';
  gender?: 'male' | 'female' | 'all';
  useCase?: string;
  style?: string;
  tone?: string;
  type?: VoiceType | 'all';
  country?: string;
  language?: string;
}

export type AssistantAnalyticsEventName =
  | 'assistant_opened'
  | 'assistant_closed'
  | 'voice_mode_started'
  | 'text_mode_started'
  | 'conversation_started'
  | 'voice_search'
  | 'voice_preview_played'
  | 'voice_selected'
  | 'pricing_requested'
  | 'booking_started'
  | 'sales_contact_requested';
