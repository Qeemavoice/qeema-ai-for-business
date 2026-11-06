export interface AIVoiceItem {
  id: string;
  name: string;
  nameEn: string;
  subtitle: string;
  dialect: string;
  dialectLabel: string;
  flag: string;
  gender: 'male' | 'female';
  glassGradient: string;
  category: string;
  sampleQuote: string;
  previewUrl: string;
  isVerified: boolean;
  tag: string;
  sampleFrequency: string;
}

// لا نعرض أو نخزن أي أصوات اصطناعية حالياً.
export const AI_VOICES_CATALOG: AIVoiceItem[] = [];
