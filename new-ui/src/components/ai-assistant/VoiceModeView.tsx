import React from 'react';
import { Mic, MicOff, MessageSquare, AlertCircle, RefreshCw, Volume2, Sparkles } from 'lucide-react';
import { AssistantVoiceOrb } from './AssistantVoiceOrb';
import { OrbState, AssistantLanguage } from './types';

interface VoiceModeViewProps {
  orbState: OrbState;
  statusLabel: string;
  transcript: string;
  lastAssistantSpeech: string;
  isSessionActive: boolean;
  language: AssistantLanguage;
  onToggleVoiceSession: () => void;
  onSwitchToText: () => void;
  onRetry: () => void;
  errorMessage?: string | null;
}

export const VoiceModeView: React.FC<VoiceModeViewProps> = ({
  orbState,
  statusLabel,
  transcript,
  lastAssistantSpeech,
  isSessionActive,
  language,
  onToggleVoiceSession,
  onSwitchToText,
  onRetry,
  errorMessage
}) => {
  const isEn = language === 'en';

  return (
    <div
      className="flex-1 flex flex-col items-center justify-between p-6 relative overflow-hidden"
      style={{ direction: isEn ? 'ltr' : 'rtl' }}
    >
      {/* Top Notice */}
      <div className="text-center space-y-1">
        <h4 className="text-sm font-bold text-slate-900">
          {isEn ? 'Conversational Voice Mode' : 'المحادثة الصوتية التفاعلية'}
        </h4>
        <p className="text-xs text-slate-500 max-w-xs">
          {isEn
            ? 'Speak naturally to search Arabic voices, check pricing, and get instant answers.'
            : 'تحدث بصوتك مباشرة للبحث عن الأصوات واللهجات، والاستفسار عن الباقات.'}
        </p>
      </div>

      {/* Center Voice Orb */}
      <div className="my-auto flex flex-col items-center justify-center relative">
        <AssistantVoiceOrb
          state={orbState}
          size="lg"
          onClick={onToggleVoiceSession}
          statusText={statusLabel}
        />

        {/* Dynamic Transcript Bubble */}
        {(transcript || lastAssistantSpeech) && (
          <div className="mt-6 max-w-xs bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 shadow-md animate-fade-in text-center">
            {transcript ? (
              <p className="text-xs text-slate-700 italic font-medium">
                "{transcript}"
              </p>
            ) : (
              <p className="text-xs text-brand-text font-semibold">
                {lastAssistantSpeech}
              </p>
            )}
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700 max-w-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={onRetry}
              className="p-1 hover:bg-red-100 rounded-lg text-red-800 transition-colors"
              title={isEn ? 'Retry' : 'إعادة المحاولة'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Voice Controls */}
      <div className="w-full flex flex-col items-center gap-4 mt-auto pt-4">
        {/* Main Microphone Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleVoiceSession}
            className={`relative p-4 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 ${
              isSessionActive
                ? 'bg-brand text-white shadow-orange-500/30 scale-105 animate-pulse'
                : 'bg-brand-ink text-white hover:bg-brand-ink/90 shadow-slate-900/20'
            }`}
            title={
              isSessionActive
                ? (isEn ? 'Stop Speaking' : 'إيقاف التحدث')
                : (isEn ? 'Tap to Speak' : 'اضغط للتحدث')
            }
            aria-label="Toggle Microphone"
          >
            {isSessionActive ? <Mic className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex items-center justify-between w-full px-2 text-xs text-slate-500">
          <span className="text-[11px] font-medium">
            {isSessionActive
              ? (isEn ? 'Listening to your voice...' : 'أستمع إليك الآن...')
              : (isEn ? 'Tap microphone to speak' : 'اضغط على الميكروفون للتحدث')}
          </span>

          <button
            type="button"
            onClick={onSwitchToText}
            className="flex items-center gap-1.5 text-slate-700 hover:text-brand-text font-bold transition-colors bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200/60"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isEn ? 'Text Chat' : 'المحادثة النصية'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
