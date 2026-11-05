import React from 'react';
import { AI_VOICES_ENABLED } from '../../shared/features';
import { User, Sparkles, Copy, MessageSquare, Mic } from 'lucide-react';
import { OrbMode } from './VoiceOrb';

export interface ProductTab {
  id: OrbMode;
  label: string;
  badge?: string;
  icon: React.ElementType;
  description: string;
}

export const PRODUCT_TABS: ProductTab[] = [
  {
    id: 'human',
    label: 'الأصوات البشرية',
    badge: '1,000+ معلق',
    icon: User,
    description: 'أصوات معلقين محترفين معتمدين من مختلف أنحاء العالم العربي للتسجيلات الصوتية والهوية المؤسسية.'
  },
  {
    id: 'ai',
    label: 'أصوات AI',
    badge: 'فوري',
    icon: Sparkles,
    description: 'نماذج ذكاء اصطناعي صوتية متقدمة (Qeema Neural HD و Multilingual v2) بنبرات واقعية ومخارج حروف متقنة.'
  },
  {
    id: 'tts',
    label: 'أستوديو TTS',
    badge: 'توليد فوري',
    icon: MessageSquare,
    description: 'استوديو نطق فائق الدقة للنصوص والكتب والمحتوى بلهجات عربية متعددة مضبوطة التشكيل.'
  }
];

interface ProductSwitcherProps {
  activeTab: OrbMode;
  onSelectTab: (tabId: OrbMode) => void;
}

export const ProductSwitcher: React.FC<ProductSwitcherProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4" dir="rtl">
      {/* Scrollable Container on Mobile, Flex on Desktop */}
      <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1.5 bg-slate-900/4 border border-slate-200/80 rounded-2xl p-2 backdrop-blur-md">
        {PRODUCT_TABS.filter(tab => tab.id !== 'ai' || AI_VOICES_ENABLED).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer select-none relative ${
                isActive
                  ? 'bg-white text-slate-950 shadow-md shadow-slate-900/8 border border-slate-200/80 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-brand-text' : 'text-slate-400'
                }`}
              />
              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-brand-text'
                      : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
