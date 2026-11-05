import { VoiceProvider, SynthesizeParams, SynthesizeResponse } from './VoiceProvider';
import { QeemaAcousticProvider } from './QeemaAcousticProvider';
import { Voice } from '../types';

export class ElevenLabsProvider implements VoiceProvider {
  public name = 'elevenlabs';
  private fallbackProvider = new QeemaAcousticProvider();

  async isAvailable(): Promise<boolean> {
    const key = process.env.ELEVENLABS_API_KEY;
    return Boolean(key && key.trim().length > 5);
  }

  async getVoices(): Promise<Voice[]> {
    return [];
  }

  async getVoice(): Promise<Voice | null> {
    return null;
  }

  async synthesize(params: SynthesizeParams): Promise<SynthesizeResponse> {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    // If key is absent, use high-fidelity acoustic provider
    if (!apiKey || apiKey.trim().length < 5) {
      console.log('[ElevenLabsProvider] No API key configured. Falling back to Qeema Acoustic Engine.');
      return this.fallbackProvider.synthesize(params);
    }

    try {
      const voiceId = params.voice.providerVoiceId || '21m00Tcm4TlvDq8ikWAM'; // Default ElevenLabs voice ID
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: params.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: params.settings.stability ?? 0.5,
            similarity_boost: params.settings.style ?? 0.75,
            speed: params.settings.speed ?? 1.0,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[ElevenLabsProvider] API returned status ${response.status}. Falling back to internal engine.`);
        return this.fallbackProvider.synthesize(params);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      const chars = params.text.length;
      const durationSeconds = Number(Math.max(1.5, chars / 14).toFixed(2));

      return {
        audioBuffer,
        mimeType: 'audio/mpeg',
        durationSeconds,
        provider: 'elevenlabs',
        model: 'eleven_multilingual_v2',
        costUsd: Number(((chars / 1000) * 0.015).toFixed(4)),
      };
    } catch (err) {
      console.error('[ElevenLabsProvider] Error during synthesis:', err);
      return this.fallbackProvider.synthesize(params);
    }
  }
}
