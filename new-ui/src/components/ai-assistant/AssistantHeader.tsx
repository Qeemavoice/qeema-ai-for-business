import React from 'react';
import { X, Maximize2, Minimize2, Sparkles, Bot } from 'lucide-react';
import { AssistantLanguage, AssistantMode } from './types';
import { LanguageSelector } from './LanguageSelector';

interface AssistantHeaderProps {
  language: AssistantLanguage;
  onLanguageChange: (lang: AssistantLanguage) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  mode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  language,
  onLanguageChange,
  isExpanded,
  onToggleExpand,
  onClose,
  mode,
  onModeChange
}) => {
  const isEn = language === 'en';

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-md shrink-0 rounded-t-3xl">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-orange-950 p-0.5 flex items-center justify-center shadow-xs">
          <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-text" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              {isEn ? 'QeemaVoice' : 'قيمة فويس'}
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-brand-text border border-orange-100">
              {isEn ? 'Assistant' : 'مساعد ذكي'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {isEn ? 'Your intelligent voice assistant' : 'مساعدك الذكي في قيمة فويس'}
          </p>
        </div>
      </div>

      {/* Right Controls: Mode Toggle, Language, Expand, Close */}
      <div className="flex items-center gap-2">
        <LanguageSelector
          language={language}
          onLanguageChange={onLanguageChange}
        />

        {/* Expand / Collapse button for desktop */}
        <button
          onClick={onToggleExpand}
          className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          title={isExpanded ? (isEn ? 'Minimize' : 'تصغير') : (isEn ? 'Expand' : 'تكبير')}
          aria-label={isExpanded ? 'Minimize panel' : 'Expand panel'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          title={isEn ? 'Close' : 'إغلاق'}
          aria-label="Close Assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
