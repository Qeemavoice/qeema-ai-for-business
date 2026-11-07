import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { api } from '../lib/api';
import { defaultSitePage, type SitePage, type SitePageKey } from '../data/sitePages';

/** CMS page content edited from the dashboard (الصفحات), with the built-in default as fallback. */
export const useSitePage = (key: SitePageKey): SitePage => {
  const [page, setPage] = useState<SitePage>(() => defaultSitePage(key));
  // the route (slug) is fixed by the site, the CMS only edits the text; an empty CMS intro keeps the built-in one
  useEffect(() => { api.getSitePage(key).then(p => p && setPage(d => ({ ...d, ...p, slug: d.slug, intro: p.intro || d.intro }))).catch(() => {}); }, [key]);
  return page;
};

/** Text page (terms of use, privacy policy) rendered from the CMS. */
export const SitePageView: React.FC<{ pageKey: SitePageKey; badge: string }> = ({ pageKey, badge }) => {
  const page = useSitePage(pageKey);
  useSeo(STATIC_SEO_ROUTES[page.slug]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[{ name: 'الرئيسية', item: '/ar' }, { name: page.title, item: page.slug }]} />
      </div>

      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand-text text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">{page.title}</h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{page.intro}</p>
          <p className="text-xs text-slate-400 font-mono">آخر تحديث: {page.updatedAt}</p>
        </div>
      </section>

      <section className="py-12">
        <article
          className="rich-content max-w-4xl mx-auto px-6 sm:px-12 py-8 sm:py-12 bg-white rounded-3xl border border-slate-200 text-sm text-slate-700 leading-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </section>
    </div>
  );
};
