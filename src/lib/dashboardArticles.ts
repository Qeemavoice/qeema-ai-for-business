import { useEffect, useSyncExternalStore } from 'react';
import type { BlogPostItem } from '../data/blogData';
import { fmtDate } from './format';

/** Articles written in the dashboard (المقالات) turned into blog posts; the built-in posts stay in blogData.ts. */
const toPost = (a: any): BlogPostItem => {
  const words = String(a.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const dt = a.date && !isNaN(new Date(a.date).getTime()) ? new Date(a.date) : new Date();
  const keywords = String(a.keywords || '').trim();
  return {
    id: 100000 + (Number(String(a.id).replace(/\D/g, '')) || 0),
    recordId: a.id,
    slug: `${a.id}-${String(a.title).trim().replace(/[\s/\\?#%]+/g, '-')}`,
    title: a.title, h1: a.title,
    shortDescription: a.shortDescription || '',
    category: a.category || '',
    date: fmtDate(dt), datePublished: dt.toISOString(), dateModified: dt.toISOString(),
    readTime: `${Math.max(1, Math.round(words / 200))} دقائق قراءة`,
    author: 'فريق قيمة فويس',
    image: a.coverImage || a.innerImage || '',
    headerImage: a.innerImage || a.coverImage || '',
    tags: keywords ? keywords.split(/[,،]/).map(k => k.trim()).filter(Boolean) : [],
    content: [], contentHtml: a.content,
    metaDescription: a.metaDescription || '', keywords,
    targetCommercialRoute: '/ar/voices',
    targetCommercialTitle: 'هل تبحث عن تعليق صوتي احترافي لمشروعك؟',
    targetCommercialSubtitle: 'اختر من مكتبة الأصوات البشرية المحترفة بكل اللهجات، واستمع للعينات قبل الحجز.',
    relatedSlugs: []
  };
};

let posts: BlogPostItem[] = [];
let loaded = false;
let requested = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

const load = () => {
  if (requested) return;
  requested = true;
  fetch('/api/v1/articles')
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(({ items }) => { posts = items.map(toPost); })
    .catch(() => {})
    .finally(() => { loaded = true; emit(); });
};

export const useDashboardPosts = (): { posts: BlogPostItem[]; loaded: boolean } => {
  useEffect(load, []);
  const p = useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => posts);
  const l = useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => loaded);
  return { posts: p, loaded: l };
};
