import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CustomerStoriesView } from '../components/CustomerStoriesView';
import { STORIES, recordToStory, type Story } from '../data/stories';
import { api } from '../lib/api';
import { usePageText } from '../lib/pageTexts';

export const OurWorksPage: React.FC = () => {
  const pageText = usePageText('our-works');
  // /ar/our-works lists client logos; /ar/our-works/:storyId shows one story
  const { storyId } = useParams<{ storyId: string }>();
  // SEO from the dashboard copy of the story (built-in list until it loads)
  const [saved, setSaved] = useState<Story | undefined>();
  useEffect(() => {
    if (!storyId) return;
    api.getPublishedStories().then(items => {
      const rec = items.find(i => i.id === storyId);
      setSaved(rec ? recordToStory(rec) : undefined);
    }).catch(() => {});
  }, [storyId]);
  const story = storyId ? (saved || STORIES.find(s => s.id === storyId)) : undefined;
  const path = storyId ? `/ar/our-works/${storyId}` : '/ar/our-works';
  const crumbs = [
    { name: 'الرئيسية', item: '/ar' },
    { name: 'قصص النجاح', item: '/ar/our-works' },
    ...(storyId ? [{ name: story?.brand || 'قصة نجاح', item: path }] : [])
  ];

  useSeo({
    path,
    title: story ? `${story.brand} | قصص النجاح | قيمة فويس` : 'قصص النجاح والعملاء | قيمة فويس',
    h1: story?.title || 'قصص النجاح',
    description: story?.heroSubtitle || 'تجارب وقصص نجاح كبرى الشركات والجهات الحكومية العربية في التعليق الصوتي والرد الآلي والدوبلاج مع قيمة فويس.',
    ogType: storyId ? 'article' : 'website',
    breadcrumbs: crumbs
  });

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs for SEO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={crumbs} />
      </div>

      {/* SEO Header Section with Single Strict H1 (the story page has its own H1) */}
      {!storyId && <header className="py-10 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="space-y-2">

            {/* Strict Single H1 */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              {pageText.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              {pageText.intro}
            </p>
          </div>
        </div>
      </header>}

      {/* Pure Customer Stories Showcase */}
      <section className="py-10">
        <CustomerStoriesView key={storyId || 'list'} storyId={storyId} />
      </section>

    </div>
  );
};
