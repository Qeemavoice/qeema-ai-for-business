import React from 'react';
import { Search, Compass, CreditCard, HelpCircle, Mic, Users, Sparkles } from 'lucide-react';
import { AssistantLanguage } from './types';

interface QuickActionsProps {
  language: AssistantLanguage;
  onSelectAction: (intentText: string) => void;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  language,
  onSelectAction,
  className = ''
}) => {
  const isEn = language === 'en';

  const actions = isEn
    ? [
        { icon: Search, label: 'Find a Voice', query: 'Help me find a suitable Arabic voice for my project' },
        { icon: Compass, label: 'Explore Dialects', query: 'What Arabic dialects and regional accents do you support?' },
        { icon: CreditCard, label: 'Pricing & Plans', query: 'What are the pricing plans and credit packages?' },
        { icon: HelpCircle, label: 'How it Works', query: 'How does the QeemaVoice platform work?' },
        { icon: Users, label: 'Contact Sales', query: 'I want to talk to enterprise sales and support' }
      ]
    : [
        { icon: Search, label: 'ابحث عن صوت مناسب', query: 'ابحث لي عن صوت مناسب لمشروعي الإعلاني' },
        { icon: Compass, label: 'استكشف اللهجات العربية', query: 'ما هي اللهجات العربية المتوفرة في المنصة؟' },
        { icon: CreditCard, label: 'الأسعار والباقات', query: 'ما هي أسعار الباقات وخيارات شحن الرصيد؟' },
        { icon: HelpCircle, label: 'كيف تعمل المنصة؟', query: 'كيف تعمل منصة قيمة للذكاء الصوتي؟' },
        { icon: Users, label: 'تواصل مع المبيعات', query: 'أريد التواصل مع فريق مبيعات الشركات' }
      ];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
        <span>{isEn ? 'Quick Actions' : 'استفسارات سريعة مقترحة'}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectAction(act.query)}
              className="group flex items-center gap-2 p-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-orange-300 rounded-2xl text-left transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-[0.98] text-right"
              style={{ textAlign: isEn ? 'left' : 'right' }}
            >
              <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#FF5500] transition-colors" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 line-clamp-1">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
