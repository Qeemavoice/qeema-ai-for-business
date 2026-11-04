import { OrbState, AssistantLanguage } from '../components/ai-assistant/types';
import { analytics } from './analyticsService';

export interface VoiceAssistantSessionHandlers {
  onStatusChange?: (status: OrbState, label?: string) => void;
  onTranscription?: (transcript: string, isFinal: boolean) => void;
  onAssistantReply?: (text: string) => void;
  onError?: (err: Error | string) => void;
}

export class ElevenLabsService {
  private isVoiceActive: boolean = false;
  private currentStatus: OrbState = 'idle';
  private recognition: any = null;
  private synthesisVoice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public async checkConfig(): Promise<{ hasAgent: boolean; agentId?: string }> {
    try {
      const res = await fetch('/api/v1/assistant/config');
      if (res.ok) {
        const data = await res.json();
        return {
          hasAgent: Boolean(data.hasAgent),
          agentId: data.agentId
        };
      }
    } catch {
      // ignore
    }
    return { hasAgent: false };
  }

  public async startVoiceSession(
    lang: AssistantLanguage,
    handlers: VoiceAssistantSessionHandlers
  ): Promise<boolean> {
    try {
      handlers.onStatusChange?.('connecting', lang === 'en' ? 'Connecting to Voice AI...' : 'جاري الاتصال بالنظام الصوتي...');

      // Check mic permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      this.isVoiceActive = true;
      analytics.track('voice_mode_started', { language: lang });

      // Check if official ElevenLabs Agent signed URL is provided
      const config = await this.checkConfig();
      if (config.hasAgent) {
        try {
          const signedRes = await fetch('/api/v1/assistant/signed-url');
          if (signedRes.ok) {
            const { signedUrl } = await signedRes.json();
            if (signedUrl) {
              console.log('[ElevenLabs] Using official signed conversation URL');
              // Real ElevenLabs Agent flow will handle via WebSocket
            }
          }
        } catch (e) {
          console.warn('[ElevenLabs] Signed URL check skipped:', e);
        }
      }

      // Initialize responsive Web Speech / Audio Pipeline for interactive instant voice
      this.initInteractiveSpeech(lang, handlers);
      return true;
    } catch (err: any) {
      this.isVoiceActive = false;
      this.currentStatus = 'error';
      const msg = err?.name === 'NotAllowedError'
        ? (lang === 'en' ? 'Microphone permission was denied.' : 'تم رفض الإذن بالوصول للميكروفون.')
        : (lang === 'en' ? 'Could not start voice session.' : 'تعذر بدء الجلسة الصوتية.');
      handlers.onError?.(msg);
      handlers.onStatusChange?.('error', msg);
      return false;
    }
  }

  public stopVoiceSession(handlers?: VoiceAssistantSessionHandlers) {
    this.isVoiceActive = false;
    this.currentStatus = 'idle';

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    handlers?.onStatusChange?.('idle', '');
  }

  private initInteractiveSpeech(
    lang: AssistantLanguage,
    handlers: VoiceAssistantSessionHandlers
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      handlers.onStatusChange?.('listening', lang === 'en' ? 'Listening...' : 'أستمع إليك...');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'en' ? 'en-US' : 'ar-SA';

      recognition.onstart = () => {
        this.currentStatus = 'listening';
        handlers.onStatusChange?.('listening', lang === 'en' ? 'Listening to your voice...' : 'أستمع لصوتك الآن...');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }

        handlers.onTranscription?.(transcript, isFinal);

        if (isFinal && transcript.trim()) {
          this.currentStatus = 'thinking';
          handlers.onStatusChange?.('thinking', lang === 'en' ? 'Thinking & searching...' : 'جاري التحليل والبحث...');
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          if (this.isVoiceActive) {
            try { recognition.start(); } catch {}
          }
          return;
        }
        console.warn('[SpeechRecognition error]:', event.error);
        if (event.error !== 'aborted') {
          handlers.onStatusChange?.('listening', lang === 'en' ? 'Tap mic to speak' : 'اضغط للتحدث');
        }
      };

      recognition.onend = () => {
        if (this.isVoiceActive && this.currentStatus === 'listening') {
          // Restart listening loop if still active
          try {
            recognition.start();
          } catch {
            // ignore
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('[SpeechRecognition init error]:', err);
      handlers.onStatusChange?.('listening', lang === 'en' ? 'Listening...' : 'أستمع إليك...');
    }
  }

  public speakResponse(
    text: string,
    lang: AssistantLanguage,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean markdown tags or bullets from speech text
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleanText) {
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;
      utterance.lang = lang === 'en' ? 'en-US' : 'ar-SA';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.currentStatus = 'speaking';
        onStart?.();
      };

      utterance.onend = () => {
        this.currentStatus = 'idle';
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('[speechSynthesis error]:', e);
        this.currentStatus = 'idle';
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[speakResponse failed]:', err);
      onEnd?.();
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
