import React from 'react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { VoiceTemplatesGrid } from '../components/VoiceTemplatesGrid';
import { usePageText } from '../lib/pageTexts';

export const VoiceTemplatesPage: React.FC = () => {
  const pageText = usePageText('voice-templates');
  useSeo(STATIC_SEO_ROUTES['/ar/voice-models']);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'مكتبة الأصوات', item: '/ar/voices' },
          { name: 'نماذج الإنتاج الصوتي', item: '/ar/voice-models' }
        ]} />
      </div>

      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">{pageText.title}</h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">{pageText.intro}</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VoiceTemplatesGrid />
        </div>
      </section>
    </div>
  );
};
