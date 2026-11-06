import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bookmark, Calendar, Clock, Loader2, Search, Share2 } from 'lucide-react';
import { ActiveView } from '../types';

interface CommunityBlogViewProps { onNavigate: (view: ActiveView) => void; }
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string | null;
  date: string | null;
  readMinutes: number;
  tags: string[];
  bodyHtml?: string | null;
  videoUrl?: string | null;
}

const articleDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
  : '';

export const CommunityBlogView: React.FC<CommunityBlogViewProps> = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('qeema_saved_articles') || '[]')); }
    catch { return new Set(); }
  });

  useEffect(() => {
    let active = true;
    fetch('/api/v1/articles?limit=100', { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (!active) return;
        const items = Array.isArray(data.articles) ? data.articles : [];
        setPosts(items);
        const articleId = window.location.hash.replace('#article-', '');
        if (articleId) {
          const found = items.find((post: BlogPost) => post.id === articleId);
          if (found) void openPost(found);
        }
      })
      .catch(() => active && setError('تعذر تحميل المقالات حالياً.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter((post) => [post.title, post.summary, ...post.tags].some((value) => value?.toLowerCase().includes(query)));
  }, [posts, searchQuery]);

  const openPost = async (post: BlogPost) => {
    setDetailLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/v1/articles/${post.id}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSelectedPost(data.article);
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}#article-${post.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('تعذر فتح المقال.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closePost = () => {
    setSelectedPost(null);
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
  };

  const toggleSaved = (postId: string) => setSavedPostIds((previous) => {
    const next = new Set(previous);
    next.has(postId) ? next.delete(postId) : next.add(postId);
    localStorage.setItem('qeema_saved_articles', JSON.stringify(Array.from(next)));
    return next;
  });

  const sharePost = async (post: BlogPost) => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'blog');
    url.hash = `article-${post.id}`;
    if (navigator.share) await navigator.share({ title: post.title, text: post.summary, url: url.toString() });
    else await navigator.clipboard.writeText(url.toString());
  };

  if (selectedPost) {
    const saved = savedPostIds.has(selectedPost.id);
    return <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8" dir="rtl">
      <button onClick={closePost} className="mb-6 flex items-center gap-2 text-sm font-bold text-[#FF5500]"><ArrowLeft className="h-4 w-4 rotate-180" /> العودة إلى المقالات</button>
      {selectedPost.image && <img src={selectedPost.image} alt={selectedPost.title} className="h-64 w-full rounded-3xl object-cover sm:h-96" />}
      <div className="space-y-6 py-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500"><span>{articleDate(selectedPost.date)}</span><span>•</span><span>{selectedPost.readMinutes} دقائق قراءة</span></div>
        <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{selectedPost.title}</h1>
        <p className="text-lg leading-8 text-slate-600">{selectedPost.summary}</p>
        <div className="flex items-center justify-between border-y border-slate-200 py-4"><span className="text-sm font-bold text-slate-700">فريق قيمة فويس</span><div className="flex gap-2"><button onClick={() => toggleSaved(selectedPost.id)} className={`rounded-xl border p-2 ${saved ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-500'}`}><Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} /></button><button onClick={() => sharePost(selectedPost)} className="rounded-xl border border-slate-200 p-2 text-slate-500"><Share2 className="h-4 w-4" /></button></div></div>
        <div className="article-content text-base leading-9 text-slate-700" dangerouslySetInnerHTML={{ __html: selectedPost.bodyHtml || '' }} />
        {selectedPost.tags.length > 0 && <div className="flex flex-wrap gap-2 pt-4">{selectedPost.tags.map((tag) => <span key={tag} className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600">#{tag}</span>)}</div>}
      </div>
    </article>;
  }

  return <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8" dir="rtl">
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end"><div><span className="rounded-full border border-[#FF5500]/20 bg-[#FF5500]/10 px-2.5 py-1 text-xs font-bold text-[#FF5500]">مدونة قيمة فويس</span><h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">المقالات ودراسات الصوت العربي</h1><p className="mt-1 text-sm text-slate-500">المقالات المنشورة في الموقع الأساسي، محدثة مباشرة من لوحة الإدارة.</p></div><label className="relative w-full md:w-80"><Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ابحث في المقالات..." className="w-full rounded-xl border border-slate-200 py-2.5 pr-9 pl-3 text-xs outline-none focus:border-[#FF5500]" /></label></div>
    {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
    {loading ? <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-[#FF5500]" /></div> : <div className="grid grid-cols-1 gap-8 md:grid-cols-2">{filteredPosts.map((post) => <article key={post.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="h-52 bg-gradient-to-br from-slate-900 to-orange-950">{post.image && <img src={post.image} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}</div><div className="space-y-3 p-6"><div className="flex items-center gap-3 text-[11px] text-slate-400"><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{articleDate(post.date)}</span><span>•</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readMinutes} دقائق</span></div><h2 className="text-lg font-black leading-snug text-slate-900">{post.title}</h2><p className="line-clamp-3 text-sm leading-7 text-slate-600">{post.summary}</p><button disabled={detailLoading} onClick={() => openPost(post)} className="flex items-center gap-1 text-xs font-black text-[#FF5500] disabled:opacity-50">قراءة المقال <ArrowLeft className="h-3.5 w-3.5" /></button></div></article>)}</div>}
    {!loading && filteredPosts.length === 0 && <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">لا توجد مقالات منشورة مطابقة.</div>}
  </div>;
};
