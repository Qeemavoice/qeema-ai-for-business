import React from 'react';
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
    label: 'أصوات بشرية',
    badge: '1,000+ صوت',
    icon: User,
    description: 'أصوات معلقين محترفين من مختلف أنحاء العالم العربي للتسجيلات الصوتية والهوية الصوتية.'
  },
  {
    id: 'ai',
    label: 'أصوات AI',
    badge: 'فوري',
    icon: Sparkles,
    description: 'توليد صوت عربي بالذكاء الاصطناعي بنبرات واقعية ومخارج حروف متقنة خلال ثوانٍ.'
  },
  {
    id: 'twins',
    label: 'التوائم الصوتية',
    badge: 'Voice Twins',
    icon: Copy,
    description: 'إنشاء نسخة ذكية متطابقة من صوتك لإنتاج المحتوى الصوتي المستمر بدقة فائقة.'
  },
  {
    id: 'tts',
    label: 'نص إلى صوت',
    icon: MessageSquare,
    description: 'محرك نطق فائق الدقة للنصوص والكتب الصوتية والأنظمة التفاعلية.'
  },
  {
    id: 'cloning',
    label: 'استنساخ الصوت',
    icon: Mic,
    description: 'استنساخ صوتي رقمي سريع مرخص للشركات وصناع المحتوى من عينة تسجيل موجزة.'
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
        {PRODUCT_TABS.filter(tab => tab.id === 'human').map((tab) => {
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
                  isActive ? 'text-[#FF5500]' : 'text-slate-400'
                }`}
              />
              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-[#FF5500]'
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
