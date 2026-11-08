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

const norm = (s: string) => s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ً-ْ]/g, '');
const STOP = new Set(['في', 'من', 'الى', 'على', 'عن', 'مع', 'او', 'ثم', 'هذا', 'هذه', 'التي', 'الذي', 'كيف', 'لكل', 'بين', 'عند', 'صوت', 'صوتي', 'الصوتي', 'الصوت', 'تعليق', 'التعليق', 'قيمه', 'فويس']);
const words = (s: string) => norm(s).split(/[^؀-ۿa-zA-Z0-9]+/)
  .map(w => w.replace(/^(وال|بال|لل|ال|و)(?=..)/, '')).filter(w => w.length >= 3 && !STOP.has(w));

/** Real articles ordered by how much they share with the topic (main words count three times the extra words), the least related last.
 * ponytail: plain word overlap with light Arabic normalising; swap for tags set in the dashboard if ranking needs to be exact. */
export const rankRelated = (all: BlogPostItem[], main: string, extra = '', n = 3): BlogPostItem[] => {
  const strong = new Set(words(main)), weak = new Set(words(extra));
  const hit = (s: string, w: number) => words(s).reduce((a, x) => a + (strong.has(x) ? 3 * w : weak.has(x) ? w : 0), 0);
  const score = (p: BlogPostItem) => hit(p.title, 3) + hit(`${p.category} ${p.tags.join(' ')}`, 2) + hit(p.shortDescription, 1);
  return all.map(p => ({ p, s: score(p) })).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.p);
};
