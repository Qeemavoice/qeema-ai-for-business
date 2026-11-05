import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  ArrowLeft, 
  Sparkles, 
  Share2, 
  BookOpen, 
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, BLOG_POSTS, BlogPostItem } from '../data/blogData';
import { useSeo } from '../seo/useSeo';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BASE_SITE_URL } from '../seo/seoConfig';
import { useDashboardPosts } from '../lib/dashboardArticles';

export const BlogDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts: dashPosts, loaded } = useDashboardPosts();
  const decodedSlug = (() => { try { return decodeURIComponent(slug || ''); } catch { return slug || ''; } })();
  // Built-in posts first (their URLs never change), then articles written in the dashboard
  const article = getArticleBySlug(slug || '')
    ?? dashPosts.find(p => p.slug === decodedSlug || decodedSlug.startsWith(`${p.recordId}-`));

  // Truncate description to 155 chars for SEO snippet
  const rawDesc = article?.shortDescription || '';
  // Dashboard "الوسم الوصفي: الوصف" wins when filled; otherwise the short description, truncated
  const metaDesc = article?.metaDescription?.trim()
    ? article.metaDescription.trim()
    : (rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}...` : rawDesc);

  // Title formatting rule: title = عنوان المقال + " | قيمة فويس" (unless already ends with it)
  const fullTitle = article 
    ? (article.title.endsWith('قيمة فويس') ? article.title : `${article.title} | قيمة فويس`)
    : 'المقال غير موجود | قيمة فويس';

  // Apply dynamic SEO
  useSeo({
    path: `/ar/blogs/details/${slug || ''}`,
    title: fullTitle,
    h1: article?.h1 || 'مدونة قيمة فويس',
    description: metaDesc,
    ogType: 'article',
    ogImage: article?.image && !article.image.startsWith('data:') ? article.image : undefined,
    keywords: article?.keywords,
    noindex: !article && loaded,
    breadcrumbs: article ? [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'المدونة', item: '/ar/blogs' },
      { name: article.title, item: `/ar/blogs/details/${article.slug}` }
    ] : undefined
  });

  // Inject Article schema into JSON-LD
  useEffect(() => {
    if (!article) return;
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      ...(article.image && !article.image.startsWith('data:') ? { 'image': [article.image] } : {}),
      'datePublished': article.datePublished,
      'dateModified': article.dateModified,
      'author': {
        '@type': 'Person',
        'name': article.author
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'قيمة فويس',
        'logo': {
          '@type': 'ImageObject',
          'url': `${BASE_SITE_URL}/assets/logo.png`
        }
      },
      'description': metaDesc,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${BASE_SITE_URL}/ar/blogs/details/${article.slug}`
      }
    };

    let script = document.getElementById('qeema-article-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'qeema-article-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(articleSchema, null, 2);

    return () => {
      const el = document.getElementById('qeema-article-jsonld');
      if (el) el.remove();
    };
  }, [article, metaDesc]);

  // A dashboard article may still be loading: don't flash "not found"
  if (!article && !loaded) return <div className="min-h-screen bg-white" />;

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] py-20 text-center space-y-4" dir="rtl">
        <h1 className="text-2xl font-bold text-slate-900">عذراً، المقال المطلوب غير موجود</h1>
        <p className="text-xs text-slate-600">ربما تم تغيير الرابط أو نقل المقال.</p>
        <div className="pt-4 flex justify-center gap-4">
          <Link to="/ar/blogs" className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold">
            العودة للمدونة
          </Link>
          <Link to="/ar" className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold">
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const related = getRelatedArticles(article.slug, 3);
  const midpoint = Math.max(1, Math.floor(article.content.length / 2));
  const firstHalf = article.content.slice(0, midpoint);
  const secondHalf = article.content.slice(midpoint);

  return (
    <article className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Visible Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'المدونة', item: '/ar/blogs' },
          { name: article.title, item: `/ar/blogs/details/${article.slug}` }
        ]} />
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="font-bold text-brand-text bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
            {article.category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{article.date}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{article.readTime}</span>
          </span>
        </div>

        {/* Strict Single H1 */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-snug">
          {article.h1}
        </h1>

        <div className="flex items-center gap-3 pt-2 text-xs text-slate-600">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{article.author}</div>
            <div className="text-[11px] text-slate-400">فريق التحرير في قيمة فويس</div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm mt-6">
          <img
            src={article.headerImage || article.image}
            alt={article.title}
            width="1200"
            height="675"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* Article Body with Midpoint Commercial CTA Box */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* First Half Paragraphs */}
        <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-5 font-normal">
          {article.contentHtml
            // Written by admins in the dashboard's rich text editor (same trust as the CMS pages)
            ? <div className="rich-content" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
            : firstHalf.map((p, idx) => (
              <p key={idx} className="leading-8 text-slate-700">
                {p}
              </p>
            ))}
        </div>

        {/* Section 6.A: Mid-Article Commercial Box CTA (يربط إلى الصفحة التجارية المناسبة) */}
        <div className="my-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 shadow-sm text-right space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-text">
            <Sparkles className="w-4 h-4" />
            <span>حلول قيمة فويس للأعمال</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {article.targetCommercialTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {article.targetCommercialSubtitle}
          </p>

          <div className="pt-2">
            <Link
              to={article.targetCommercialRoute}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shadow-md shadow-brand/25 transition"
            >
              <span>اكتشف المزيد واحجز الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Second Half Paragraphs */}
        <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-5 font-normal">
          {secondHalf.map((p, idx) => (
            <p key={`second-${idx}`} className="leading-8 text-slate-700">
              {p}
            </p>
          ))}
        </div>

        {/* Tags */}
        <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500">الكلمات الدلالية:</span>
          {article.tags.map(t => (
            <span key={t} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
              {t}
            </span>
          ))}
        </div>

        {/* End of Article Commercial CTA Box */}
        <div className="my-10 p-8 rounded-3xl bg-slate-900 text-white space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand/20 text-brand-text flex items-center justify-center mx-auto">
            <Volume2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {article.targetCommercialTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            استمع لمئات النماذج الصوتية المعتمدة وتواصل مع مستشاري الإنتاج الصوتي لتنفيذ عملك بأعلى جودة.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={article.targetCommercialRoute}
              className="px-7 py-3 rounded-2xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shadow-lg shadow-brand/25 transition"
            >
              الانتقال إلى صفحة الخدمة
            </Link>
            <Link
              to="/ar/voices"
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition"
            >
              استعراض مكتبة الأصوات
            </Link>
          </div>
        </div>

      </main>

      {/* Section 6.B: مقالات ذات صلة (3 links at bottom of article) */}
      <aside className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-slate-200 mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            مقالات ذات صلة
          </h2>
          <Link to="/ar/blogs" className="text-xs font-bold text-brand-text hover:underline">
            عرض كافة المقالات ←
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map(item => (
            <Link
              key={item.id}
              to={`/ar/blogs/details/${item.slug}`}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  width="400"
                  height="225"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-text bg-orange-50 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-brand-text transition-colors line-clamp-2 mt-1">
                    {item.title}
                  </h3>
                </div>
                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  {item.date}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>

    </article>
  );
};
