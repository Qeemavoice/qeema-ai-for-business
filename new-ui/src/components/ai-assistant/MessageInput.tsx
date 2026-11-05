import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { AssistantLanguage } from './types';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onActivateVoice: () => void;
  showVoiceButton?: boolean;
  isThinking?: boolean;
  language?: AssistantLanguage;
  placeholder?: string;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onActivateVoice,
  showVoiceButton = true,
  isThinking = false,
  language = 'ar',
  placeholder,
  className = ''
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isEn = language === 'en';
  const defaultPlaceholder = isEn
    ? 'Ask anything or search for voices...'
    : 'اكتب سؤالك أو ابحث عن صوت معين...';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() || isThinking) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className={`p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 rounded-b-3xl ${className}`}>
      <div className="relative flex items-center bg-slate-50 border border-slate-200/90 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 rounded-2xl p-1.5 transition-all shadow-2xs">
        {/* Left Voice Mic Quick Trigger */}
        {showVoiceButton && (
        <button
          type="button"
          onClick={onActivateVoice}
          className="p-2 rounded-xl text-slate-500 hover:text-brand-text hover:bg-orange-50 transition-all flex items-center justify-center shrink-0"
          title={isEn ? 'Start Voice Conversation' : 'تحدث بالصوت'}
          aria-label="Start Voice Conversation"
        >
          <Mic className="w-4 h-4" />
        </button>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          disabled={isThinking}
          className="w-full bg-transparent resize-none outline-hidden px-2 py-1.5 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 max-h-28 overflow-y-auto leading-relaxed"
          style={{ direction: isEn ? 'ltr' : 'rtl' }}
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || isThinking}
          className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 ${
            text.trim() && !isThinking
              ? 'bg-brand text-white shadow-xs hover:bg-brand-orange active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          title={isEn ? 'Send message' : 'إرسال الرسالة'}
          aria-label="Send message"
        >
          {isThinking ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className={`w-4 h-4 ${!isEn ? 'rotate-180' : ''}`} />
          )}
        </button>
      </div>
    </div>
  );
};
