import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, CheckCircle2, Mic2, Sparkles, FileText } from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { GUIDES, type GuideCard } from '../data/guides';
import { api } from '../lib/api';
import { GuideCover, GuidePriceBadge } from './GuideCover';
import { usePageText } from '../lib/pageTexts';

/** A free guide links straight to its file (/uploads/... or a full URL): open it as a file in a new tab, not as a site page (that showed 404) */
const GuideLink: React.FC<{ to: string; className?: string; 'aria-label'?: string; children: React.ReactNode }> = ({ to, children, ...rest }) =>
  /^(https?:)?\/\/|^\/uploads\/|\.pdf($|\?)/i.test(to)
    ? <a href={to} target="_blank" rel="noopener" {...rest}>{children}</a>
    : <Link to={to} {...rest}>{children}</Link>;

export const GuidesPage: React.FC = () => {
  const pageText = usePageText('guides');
  useSeo(STATIC_SEO_ROUTES['/ar/guides']);

  // Published guides managed from the dashboard (الأدلة); the built-in list is the fallback
  const [guides, setGuides] = useState<GuideCard[]>(GUIDES);
  useEffect(() => {
    api.getPublishedGuides().then(items => {
      if (!items.length) return;
      setGuides(items.map((g: any): GuideCard => ({
        slug: g.slug || g.id,
        title: g.title,
        desc: g.description || '',
        link: g.link || (g.file ? g.file : `/ar/guides/${g.slug || g.id}`),
        cover: g.cover || '',
        priceUsd: g.type === 'free' ? null : Number(g.price) || 0,
        gradient: g.gradient || 'linear-gradient(135deg,#FFA513 0%,#B83A00 100%)'
      })));
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'الأدلة', item: '/ar/guides' }
        ]} />
      </div>

      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">

          {/* Strict Single H1 */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            {pageText.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            {pageText.intro}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((g, idx) => (
              <div key={idx} className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
                <GuideLink to={g.link} aria-label={g.title}>
                  <GuideCover guide={g} className="h-44" />
                </GuideLink>
                <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-brand-text bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                      دليل إرشادي معتمد
                    </span>
                    <GuidePriceBadge priceUsd={g.priceUsd} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {g.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {g.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <GuideLink
                    to={g.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text hover:underline"
                  >
                    <span>{g.priceUsd === null ? 'قراءة الدليل بالكامل' : 'تفاصيل الدليل'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </GuideLink>
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
