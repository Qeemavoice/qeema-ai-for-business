import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Voice } from '../types';
import { useSeo } from '../seo/useSeo';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { VoiceLibraryView, buildSampleSlug } from '../components/VoiceLibraryView';
import { VoiceTemplatesGrid } from '../components/VoiceTemplatesGrid';
import { usePageText } from '../lib/pageTexts';
import { Link } from 'react-router-dom';

interface VoicesPageProps {
  voices: Voice[];
  onSelectForBooking?: (voice: Voice) => void;
  onOpenDemo?: () => void;
  isLoggedIn?: boolean;
}

const CATEGORIES_MAP: Record<string, string> = {
  '1-إعلانات': 'إعلانات تجارية',
  '2-وثائقي': 'وثائقي ورسمي',
  '3-دوبلاج': 'دوبلاج وكرتون',
  '4-كتب-صوتية': 'كتب صوتية',
  '5-بودكاست': 'بودكاست',
  '6-رد-آلي': 'رد آلي IVR'
};

export const VoicesPage: React.FC<VoicesPageProps> = ({ 
  voices, 
  onSelectForBooking,
  onOpenDemo,
  isLoggedIn = true 
}) => {
  const [searchParams] = useSearchParams();
  const templatesText = usePageText('voice-templates');
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category') || '';
  const categoryName = CATEGORIES_MAP[categoryParam] || '';

  // Dynamic Title & H1 based on category parameter as required by SEO Spec
  const pageTitle = categoryName 
    ? `أصوات ${categoryName}: عينات تعليق صوتي | قيمة فويس`
    : 'مكتبة الأصوات: عينات تعليق صوتي رجالي ونسائي | قيمة فويس';
  const pageH1 = categoryName 
    ? `أصوات ${categoryName}`
    : 'مكتبة أصوات المعلقين العرب';
  const pageDesc = 'استمع لعينات أكثر من 1000 معلق صوتي عربي، رجالي ونسائي، بالفصحى والسعودية والإماراتية والمصرية وكل اللهجات، واختر الصوت المناسب لمشروعك.';

  // 1. Centralized SEO with Category Preserved in Canonical
  useSeo({
    path: '/ar/voices',
    title: pageTitle,
    h1: pageH1,
    description: pageDesc,
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { 
        name: categoryName ? `أصوات ${categoryName}` : 'مكتبة الأصوات', 
        item: `/ar/voices${categoryParam ? `?category=${categoryParam}` : ''}` 
      }
    ]
  });

  // Each voice sample has its own booking page
  const handleBooking = (voice: any) => {
    navigate(`/ar/booking/${buildSampleSlug(voice)}`);
  };

  const handleGeneration = (voice: any) => {
    navigate('/ar/text-to-speech');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs for SEO and navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { 
            name: categoryName ? `أصوات ${categoryName}` : 'مكتبة الأصوات', 
            item: `/ar/voices${categoryParam ? `?category=${categoryParam}` : ''}` 
          }
        ]} />
      </div>

      {/* SEO Headline Area with Strict Single H1 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            {pageH1}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            {pageDesc}
          </p>
        </div>
      </div>

      {/* The Restored High-Density Interactive Voice Library */}
      <VoiceLibraryView
        voices={voices}
        initialTab="human"
        onSelectForBooking={handleBooking}
        onSelectForGeneration={handleGeneration}
        onOpenDemo={onOpenDemo}
        isLoggedIn={isLoggedIn}
        afterVoices={(
      <section className="mt-8 space-y-5">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-black text-slate-950">{templatesText.title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">{templatesText.intro}</p>
          </div>
          <Link to="/ar/voice-models" className="text-xs font-bold text-brand-text hover:underline">عرض كل النماذج ←</Link>
        </div>
        <VoiceTemplatesGrid />
      </section>
        )}
      />
    </div>
  );
};
