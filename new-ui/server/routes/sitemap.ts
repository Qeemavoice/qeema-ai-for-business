import { Request, Response } from 'express';
import { collections } from '../db/collections';
import { COMMERCIAL_SERVICES } from '../../src/data/commercialServicesData';
import { BLOG_POSTS } from '../../src/data/blogData';
import { STORIES } from '../../src/data/stories';

const SITE = 'https://qeemavoice.com';

/** Public, indexable pages only (dashboards, claim and studio pages stay out) */
const STATIC_PAGES: [string, number, string][] = [
  ['/ar', 1.0, 'daily'],
  ['/ar/voices', 0.9, 'daily'],
  ['/ar/voice-models', 0.9, 'weekly'],
  ['/ar/text-to-speech', 0.9, 'weekly'],
  ['/ar/pricing', 0.8, 'weekly'],
  ['/ar/our-works', 0.7, 'weekly'],
  ['/ar/blogs', 0.7, 'daily'],
  ['/ar/guides', 0.6, 'monthly'],
  ['/ar/guides/join-qeema-voice', 0.5, 'monthly'],
  ['/ar/categories', 0.6, 'monthly'],
  ['/ar/booking-steps', 0.6, 'monthly'],
  ['/ar/faqs', 0.6, 'monthly'],
  ['/ar/contact-us', 0.5, 'yearly'],
  ['/ar/p/about-us', 0.5, 'yearly'],
  ['/ar/p/revisions-policy', 0.3, 'yearly'],
  ['/ar/p/terms-of-use', 0.2, 'yearly'],
  ['/ar/p/privacy-policy', 0.2, 'yearly'],
];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Arabic slugs are percent-encoded so every URL is valid ASCII
const loc = (path: string) => esc(SITE + path.split('/').map(p => encodeURIComponent(decodeURIComponent(p))).join('/'));
const day = (d?: string) => (d && !isNaN(Date.parse(d)) ? new Date(d).toISOString().slice(0, 10) : undefined);

export function buildSitemap(): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = new Map<string, { priority: number; freq: string; lastmod?: string }>();
  const add = (path: string, priority: number, freq: string, lastmod?: string) => { if (!urls.has(path)) urls.set(path, { priority, freq, lastmod }); };

  STATIC_PAGES.forEach(([p, pr, f]) => add(p, pr, f));
  // Service, model, dialect and TTS landing pages
  Object.values(COMMERCIAL_SERVICES).forEach((s: any) => s.route && add(s.route, s.route.startsWith('/ar/voice-models/') ? 0.8 : 0.8, 'monthly'));
  // Blog: built-in posts + published dashboard articles
  BLOG_POSTS.forEach(p => add(`/ar/blogs/details/${p.slug}`, 0.6, 'monthly', day(p.dateModified)));
  collections.list('articles').filter(a => a.status === 'published' && a.title && String(a.content || '').trim())
    .forEach(a => add(`/ar/blogs/details/${a.id}-${String(a.title).trim().replace(/[\s/\\?#%]+/g, '-')}`, 0.6, 'monthly', day(a.date)));
  // Success stories (dashboard copy, built-in list as fallback)
  const stories = collections.list('stories').filter(s => s.status === 'published');
  (stories.length ? stories : STORIES).forEach((s: any) => add(`/ar/our-works/${s.id}`, 0.6, 'monthly'));
  // Human voice sample pages (active voices of the library)
  collections.list('humanVoices').filter(v => v.status === 'active')
    .forEach(v => add(`/ar/booking/${v.id}-${String(v.sampleName || v.name || 'voice').trim().replace(/\s+/g, '-')}`, 0.5, 'weekly'));

  const body = [...urls].map(([path, u]) =>
    `  <url>\n    <loc>${loc(path)}</loc>\n    <lastmod>${u.lastmod || today}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority.toFixed(1)}</priority>\n  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export const sitemapHandler = (_req: Request, res: Response) => {
  res.type('application/xml').send(buildSitemap());
};

export const robotsHandler = (_req: Request, res: Response) => {
  res.type('text/plain').send(
    'User-agent: *\nAllow: /\nDisallow: /ar/admin\nDisallow: /ar/dashboard\nDisallow: /ar/account\nDisallow: /ar/talent-\nDisallow: /ar/claim\nDisallow: /claim/\nDisallow: /ar/generate\nDisallow: /api/\n\n' +
    `Sitemap: ${SITE}/sitemap.xml\n`
  );
};
