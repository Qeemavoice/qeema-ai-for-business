import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ChevronLeft, 
  Sparkles, 
  Tag, 
  User 
} from 'lucide-react';
import { BLOG_POSTS, BlogPostItem } from '../data/blogData';
import { useDashboardPosts } from '../lib/dashboardArticles';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { usePageText } from '../lib/pageTexts';

export const BlogsPage: React.FC = () => {
  const pageText = usePageText('blogs');
  // 1. Centralized SEO
  useSeo(STATIC_SEO_ROUTES['/ar/blogs']);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [params, setParams] = useSearchParams();
  // the category row scrolls sideways on small screens: an arrow on its left shows there are more categories
  const catsRef = useRef<HTMLDivElement>(null);
  const [moreCats, setMoreCats] = useState(false);
  const checkCats = () => {
    const el = catsRef.current;
    if (el) setMoreCats(el.scrollWidth - el.clientWidth - Math.abs(el.scrollLeft) > 4);
  };
  useEffect(() => { checkCats(); window.addEventListener('resize', checkCats); return () => window.removeEventListener('resize', checkCats); }, []);

  const categories = [
    { id: 'all', label: 'كافة المقالات' },
    { id: 'دوبلاج وكرتون', label: 'دوبلاج وكرتون' },
    { id: 'أسرار التعليق الصوتي', label: 'أسرار التعليق الصوتي' },
    { id: 'إرشادات الإنتاج', label: 'إرشادات الإنتاج' },
    { id: 'أسعار وتكاليف', label: 'أسعار وتكاليف' },
    { id: 'كتب صوتية', label: 'كتب صوتية' },
    { id: 'بودكاست', label: 'بودكاست' },
    { id: 'لهجات وثقافة', label: 'لهجات وثقافة' },
    { id: 'ذكاء اصطناعي وتقنية', label: 'ذكاء اصطناعي وتقنية' }
  ];

  // Dashboard articles first (newest), then the built-in posts
  const { posts: dashPosts } = useDashboardPosts();
  const filteredPosts = [...dashPosts, ...BLOG_POSTS].filter(post => {
    const matchesCat = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.includes(searchQuery) || 
      post.shortDescription.includes(searchQuery) ||
      post.tags.some(t => t.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  // 30 articles a page; the page number lives in the address (?page=2) so it can be shared and the back button works
  const PER_PAGE = 30;
  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / PER_PAGE));
  const page = Math.min(pageCount, Math.max(1, Number(params.get('page')) || 1));
  const shownPosts = filteredPosts.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const goToPage = (n: number) => { setParams(n > 1 ? { page: String(n) } : {}); window.scrollTo(0, 0); };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'المدونة', item: '/ar/blogs' }
        ]} />
      </div>

      {/* Hero Header */}
      <section className="pt-4 pb-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Strict Single H1 */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            {pageText.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pageText.intro}
          </p>

          {/* Search & Categories */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ابحث في المقالات والدروس..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (page > 1) setParams({}); }}
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-brand focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>

            <div className="relative w-full min-w-0">
            <div ref={catsRef} onScroll={checkCats} className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); if (page > 1) setParams({}); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {moreCats && (
              <button
                type="button"
                aria-label="المزيد من التصنيفات"
                onClick={() => catsRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                className="absolute left-0 top-0 bottom-2 sm:bottom-0 flex items-center pl-0.5 pr-6 bg-gradient-to-r from-white via-white/90 to-transparent cursor-pointer"
              >
                <span className="w-7 h-7 rounded-full bg-brand-ink text-white flex items-center justify-center shadow-md">
                  <ChevronLeft className="w-4 h-4" />
                </span>
              </button>
            )}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-sm text-slate-500">لم نجد مقالات تطابق بحثك.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-xs font-bold text-brand-text hover:underline"
              >
                إعادة ضبط البحث
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shownPosts.map(post => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <Link to={`/ar/blogs/details/${post.slug}`} className="block overflow-hidden aspect-video bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      width="600"
                      height="338"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-brand-text bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime}</span>
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-text transition-colors line-clamp-2 leading-snug">
                        <Link to={`/ar/blogs/details/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {post.shortDescription}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{post.date}</span>
                      <Link
                        to={`/ar/blogs/details/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-text hover:text-brand-text"
                      >
                        <span>قراءة المقال</span>
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="صفحات المدونة" className="mt-12 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => goToPage(n)}
                  aria-current={n === page ? 'page' : undefined}
                  className={`min-w-10 h-10 px-3 rounded-xl text-sm font-bold font-mono border transition cursor-pointer ${
                    n === page ? 'bg-brand-ink text-white border-brand-ink' : 'bg-white text-slate-700 border-slate-200 hover:border-brand'
                  }`}
                >
                  {n}
                </button>
              ))}
            </nav>
          )}
        </div>
      </section>

      {/* Bottom Internal Linking Callout to Voices & Services */}
      <section className="pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-right">
              <h3 className="text-lg font-bold text-slate-900">هل ترغب في تطبيق هذه المعايير على عملك الصوتي القادم؟</h3>
              <p className="text-xs text-slate-600">
                استمع لعينات المعلقين العرب المحترفين في كافة المجالات واحجز الصوت المثالي لمشروعك.
              </p>
            </div>
            <Link
              to="/ar/voices"
              className="px-6 py-3 rounded-2xl bg-brand hover:bg-brand-orange text-white font-bold text-xs shadow-md shadow-brand/25 transition shrink-0"
            >
              استكشف مكتبة الأصوات
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
