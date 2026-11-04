import { VoiceProvider, SynthesizeParams, SynthesizeResponse } from './VoiceProvider';
import { ElevenLabsProvider } from './ElevenLabsProvider';
import { QeemaAcousticProvider } from './QeemaAcousticProvider';

export class ProviderManager {
  private static instance: ProviderManager;
  private providers: Map<string, VoiceProvider> = new Map();

  private constructor() {
    this.providers.set('elevenlabs', new ElevenLabsProvider());
    this.providers.set('qeema_acoustic', new QeemaAcousticProvider());
  }

  public static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  /**
   * Rule: 1 Credit = 1 Character
   */
  public estimateCredits(text: string): number {
    return Math.max(1, text.trim().length);
  }

  public async synthesize(params: SynthesizeParams): Promise<SynthesizeResponse> {
    const preferredName = params.voice.provider;
    const provider = this.providers.get(preferredName) || this.providers.get('elevenlabs') || this.providers.get('qeema_acoustic')!;
    
    const startTime = Date.now();
    const result = await provider.synthesize(params);
    const latency = Date.now() - startTime;

    console.log(`[ProviderManager] Synthesized ${params.text.length} chars in ${latency}ms via ${result.provider} (${result.model})`);
    return result;
  }
}
