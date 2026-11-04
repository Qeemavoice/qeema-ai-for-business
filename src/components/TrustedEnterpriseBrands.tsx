import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { STORIES, recordToStory, type Story } from '../data/stories';

const MAX_LOGOS = 20;

/** Client logo, or the brand's first letter on its colour until a logo is uploaded from the dashboard. */
const StoryLogo: React.FC<{ story: Story }> = ({ story }) => story.logoUrl ? (
  <img src={story.logoUrl} alt={`شعار ${story.brand}`} loading="lazy" className="max-h-12 max-w-full object-contain" />
) : (
  <div className="w-12 h-12 rounded-xl text-white text-lg font-black flex items-center justify-center" style={{ backgroundColor: story.brandColor }}>
    {story.brand.trim().charAt(0)}
  </div>
);

/** Home page «قصص النجاح»: the published stories managed from the dashboard, each logo opening its story. */
export const TrustedEnterpriseBrands: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    api.getPublishedStories()
      .then(items => setStories(items.length ? items.map(recordToStory) : STORIES))
      .catch(() => setStories(STORIES));
  }, []);

  if (!stories.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
            قصص النجاح
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            شركات ومؤسسات عربية وثقت في قيمة فويس لإنتاج أصواتها
          </p>
        </div>

        <Link
          to="/ar/our-works"
          className="self-start sm:self-auto px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 text-xs font-bold transition-all shadow-xs hover:border-slate-300 flex items-center gap-2 group"
        >
          <span>اقرأ قصص النجاح</span>
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-brand-text" />
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {stories.slice(0, MAX_LOGOS).map(story => (
            <Link
              key={story.id}
              to={`/ar/our-works/${story.id}`}
              title={`قصة نجاح ${story.brand}`}
              className="group flex flex-col items-center justify-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-center"
            >
              <div className="h-12 w-full flex items-center justify-center">
                <StoryLogo story={story} />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-brand-text transition-colors">{story.brand}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
