import React, { useState, useEffect, useRef } from 'react';
import { Mic, MessageSquare, Sparkles } from 'lucide-react';
import { AssistantLanguage, AssistantMode, AssistantMessage, OrbState } from './types';
import { AssistantHeader } from './AssistantHeader';
import { VoiceModeView } from './VoiceModeView';
import { TextModeView } from './TextModeView';
import { MessageInput } from './MessageInput';
import { assistantService } from '../../services/assistantService';
import { elevenLabsService } from '../../services/elevenLabsService';
import { analytics } from '../../services/analyticsService';
import { Voice } from '../../types';

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availableVoices: Voice[];
  onNavigateTo: (view: string, tab?: string) => void;
  onSelectVoice?: (voice: Voice) => void;
  onOpenDemo?: () => void;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  isOpen,
  onClose,
  availableVoices,
  onNavigateTo,
  onSelectVoice,
  onOpenDemo
}) => {
  const [language, setLanguage] = useState<AssistantLanguage>('ar');
  const [mode, setMode] = useState<AssistantMode>('text');
  const [isExpanded, setIsExpanded] = useState(false);

  // Messages State
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Voice Mode State
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [voiceStatusLabel, setVoiceStatusLabel] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [lastAssistantSpeech, setLastAssistantSpeech] = useState<string>('');
  const [isVoiceSessionActive, setIsVoiceSessionActive] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Audio Preview state for voice cards (ensures only 1 audio plays at a time)
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Initialize conversation greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initial = assistantService.getInitialGreeting(language);
      setMessages([initial]);
      analytics.track('conversation_started', { language });
    }
  }, [isOpen, language, messages.length]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Stop voice session & audio on close
  useEffect(() => {
    if (!isOpen) {
      if (isVoiceSessionActive) {
        elevenLabsService.stopVoiceSession();
        setIsVoiceSessionActive(false);
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPlayingVoiceId(null);
    }
  }, [isOpen, isVoiceSessionActive]);

  const handleLanguageChange = (newLang: AssistantLanguage) => {
    setLanguage(newLang);
    const greeting = assistantService.getInitialGreeting(newLang);
    setMessages([greeting]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    setVoiceError(null);

    try {
      const reply = await assistantService.sendMessage(
        text.trim(),
        [...messages, userMsg],
        language,
        availableVoices
      );
      setMessages(prev => [...prev, reply]);

      // If in voice mode or user used voice input, speak reply
      if (mode === 'voice') {
        setLastAssistantSpeech(reply.text);
        setOrbState('speaking');
        setVoiceStatusLabel(language === 'en' ? 'Speaking...' : 'جاري الرد...');
        elevenLabsService.speakResponse(
          reply.text,
          language,
          () => {
            setOrbState('speaking');
            setVoiceStatusLabel(language === 'en' ? 'Speaking...' : 'جاري الرد...');
          },
          () => {
            setOrbState('idle');
            setVoiceStatusLabel(language === 'en' ? 'Tap mic to speak' : 'اضغط للتحدث');
          }
        );
      }
    } catch (err: any) {
      console.error('[Assistant Error]:', err);
      const errMsg: AssistantMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: language === 'en'
          ? 'Sorry, I encountered an issue processing your request. Please try again.'
          : 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Toggle Single Voice Preview
  const handleTogglePlayVoice = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPlayingVoiceId(null);
      return;
    }

    const voice = availableVoices.find(v => v.id === voiceId);
    if (!voice) return;

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }

    const audio = new Audio(voice.previewUrl || '/api/v1/storage/audio/sample');
    audioPreviewRef.current = audio;
    setPlayingVoiceId(voiceId);

    audio.play().catch(e => {
      console.warn('[Audio Preview play error]:', e);
      setPlayingVoiceId(null);
    });

    audio.onended = () => {
      setPlayingVoiceId(null);
    };

    audio.onerror = () => {
      setPlayingVoiceId(null);
    };
  };

  // Voice Mode session handling
  const handleToggleVoiceSession = async () => {
    if (isVoiceSessionActive) {
      elevenLabsService.stopVoiceSession();
      setIsVoiceSessionActive(false);
      setOrbState('idle');
      setVoiceStatusLabel('');
      setTranscript('');
      return;
    }

    setVoiceError(null);
    setIsVoiceSessionActive(true);

    const started = await elevenLabsService.startVoiceSession(language, {
      onStatusChange: (status, label) => {
        setOrbState(status);
        if (label) setVoiceStatusLabel(label);
      },
      onTranscription: (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim()) {
          handleSendMessage(text);
          setTranscript('');
        }
      },
      onError: (err) => {
        setVoiceError(typeof err === 'string' ? err : err.message);
        setIsVoiceSessionActive(false);
        setOrbState('error');
      }
    });

    if (!started) {
      setIsVoiceSessionActive(false);
    }
  };

  if (!isOpen) return null;

  const isEn = language === 'en';

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-[600px] md:h-[760px]'
          : 'inset-2 md:inset-auto md:bottom-6 md:right-6 md:w-[440px] md:h-[680px]'
      }`}
      style={{ direction: isEn ? 'ltr' : 'rtl' }}
      role="dialog"
      aria-modal="true"
      aria-label="QeemaVoice AI Assistant"
    >
      {/* Outer Card with Glassy Premium Aesthetics */}
      <div className="w-full h-full flex flex-col bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden ring-1 ring-slate-900/5">
        {/* Header */}
        <AssistantHeader
          language={language}
          onLanguageChange={handleLanguageChange}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          onClose={onClose}
          mode={mode}
          onModeChange={setMode}
        />

        {/* Main Content View (Voice Mode vs Text Mode) */}
        {mode === 'voice' ? (
          <VoiceModeView
            orbState={orbState}
            statusLabel={voiceStatusLabel}
            transcript={transcript}
            lastAssistantSpeech={lastAssistantSpeech}
            isSessionActive={isVoiceSessionActive}
            language={language}
            onToggleVoiceSession={handleToggleVoiceSession}
            onSwitchToText={() => setMode('text')}
            onRetry={handleToggleVoiceSession}
            errorMessage={voiceError}
          />
        ) : (
          <TextModeView
            messages={messages}
            language={language}
            isThinking={isThinking}
            playingVoiceId={playingVoiceId}
            onTogglePlayVoice={handleTogglePlayVoice}
            onSelectVoice={onSelectVoice}
            onSelectAction={handleSendMessage}
            onNavigateTo={onNavigateTo}
            onOpenDemo={onOpenDemo}
          />
        )}

        {/* Bottom Message Input for Text Mode */}
        {mode === 'text' && (
          <MessageInput
            onSendMessage={handleSendMessage}
            onActivateVoice={() => {}}
            showVoiceButton={false}
            isThinking={isThinking}
            language={language}
          />
        )}
      </div>
    </div>
  );
};
