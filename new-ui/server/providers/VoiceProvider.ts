import { Voice, GenerationSettings } from '../types';

export interface SynthesizeParams {
  text: string;
  voice: Voice;
  settings: GenerationSettings;
  companyId: string;
  userId: string;
}

export interface SynthesizeResponse {
  audioBuffer: Buffer;
  mimeType: string;
  durationSeconds: number;
  provider: string;
  model: string;
  costUsd: number;
}

export interface VoiceProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  getVoices(): Promise<Voice[]>;
  getVoice(voiceId: string): Promise<Voice | null>;
  synthesize(params: SynthesizeParams): Promise<SynthesizeResponse>;
}
