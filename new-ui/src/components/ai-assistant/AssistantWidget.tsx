// NOTE: no longer mounted — the site uses public/qv-chat/qv-chat.js (مساعد قيمة) instead.
import React, { useState } from 'react';
import { Sparkles, Mic, X } from 'lucide-react';
import { AssistantPanel } from './AssistantPanel';
import { analytics } from '../../services/analyticsService';
import { Voice } from '../../types';

interface AssistantWidgetProps {
  availableVoices: Voice[];
  onNavigateTo: (view: string, tab?: string) => void;
  onSelectVoice?: (voice: Voice) => void;
  onOpenDemo?: () => void;
}

export const AssistantWidget: React.FC<AssistantWidgetProps> = ({
  availableVoices,
  onNavigateTo,
  onSelectVoice,
  onOpenDemo
}) => {
  const [isOpen, setIsOpen] = useState(false);


  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      analytics.track('assistant_opened');
    } else {
      analytics.track('assistant_closed');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    analytics.track('assistant_closed');
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-full shadow-xl hover:shadow-2xl border border-white/15 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Open QeemaVoice AI Assistant"
            title="QeemaVoice AI — مساعدك الذكي"
          >
            {/* Ambient Radial Pulse Glow */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-yellow via-amber-500 to-purple-600 opacity-40 group-hover:opacity-75 blur-sm transition-opacity duration-300 animate-pulse pointer-events-none" />

            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-brand-yellow to-amber-400 text-white shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>

            <div className="relative flex flex-col items-start pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-white">قيمة فويس</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">مساعدك الذكي</span>
            </div>
          </button>
        </div>
      )}

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Main Assistant Panel Modal / Floating Card */}
      <AssistantPanel
        isOpen={isOpen}
        onClose={handleClose}
        availableVoices={availableVoices}
        onNavigateTo={(view, tab) => {
          onNavigateTo(view, tab);
        }}
        onSelectVoice={onSelectVoice}
        onOpenDemo={onOpenDemo}
      />
    </>
  );
};
