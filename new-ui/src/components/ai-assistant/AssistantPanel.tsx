import React, { useState, useEffect, useRef } from 'react';
import { AssistantLanguage, AssistantMessage } from './types';
import { AssistantHeader } from './AssistantHeader';
import { TextModeView } from './TextModeView';
import { MessageInput } from './MessageInput';
import { assistantService } from '../../services/assistantService';
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Messages State
  const [messages, setMessages] = useState<AssistantMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('qeema-assistant-messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isThinking, setIsThinking] = useState(false);

  // Audio Preview state for voice cards (ensures only 1 audio plays at a time)
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Initialize conversation greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initial = assistantService.getInitialGreeting(language);
      setMessages([initial]);
      analytics.track('conversation_started', { language });
      analytics.track('text_mode_started', { language });
    }
  }, [isOpen, language, messages.length]);

  useEffect(() => {
    try {
      sessionStorage.setItem('qeema-assistant-messages', JSON.stringify(messages.slice(-30)));
    } catch {
      // Storage may be unavailable in private browsing; the live conversation still works.
    }
  }, [messages]);

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

  // Stop audio previews when the panel closes.
  useEffect(() => {
    if (!isOpen) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPlayingVoiceId(null);
    }
  }, [isOpen]);

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

    try {
      const reply = await assistantService.sendMessage(
        text.trim(),
        [...messages, userMsg],
        language,
        availableVoices
      );
      setMessages(prev => [...prev, reply]);

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
        />

        {/* Text assistant is the supported launch experience. */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">{isEn ? 'Text assistant' : 'المساعد الكتابي'}</span>
          <span className="text-[11px] font-semibold text-slate-400">{isEn ? 'Voice chat unavailable' : 'المحادثة الصوتية غير متاحة حالياً'}</span>
        </div>

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

        <MessageInput
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
            language={language}
        />
      </div>
    </div>
  );
};
