import React from 'react';
import { Globe } from 'lucide-react';
import { AssistantLanguage } from './types';

interface LanguageSelectorProps {
  language: AssistantLanguage;
  onLanguageChange: (lang: AssistantLanguage) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
  className = ''
}) => {
  return (
    <div className={`inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 ${className}`}>
      <button
        type="button"
        onClick={() => onLanguageChange('ar')}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
          language === 'ar'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        aria-label="Switch to Arabic"
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => onLanguageChange('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
          language === 'en'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
};
