/**
 * Writes the SEO data the Laravel host injects server-side (title/description/canonical per route, sitemap
 * entries of the static data): usage `tsx scripts/export-seo.ts <out.json>`.
 */
import fs from 'fs';
import { STATIC_SEO_ROUTES, BASE_SITE_URL, DEFAULT_OG_IMAGE } from '../src/seo/seoConfig';
import { COMMERCIAL_SERVICES } from '../src/data/commercialServicesData';
import { BLOG_POSTS } from '../src/data/blogData';
import { STORIES } from '../src/data/stories';

const out = process.argv[2] || 'seo.json';
const routes: Record<string, any> = {};
for (const [path, cfg] of Object.entries(STATIC_SEO_ROUTES)) {
  routes[path] = { title: cfg.title, description: cfg.description, ogImage: cfg.ogImage, noindex: cfg.noindex, keywords: cfg.keywords };
}
for (const p of BLOG_POSTS) {
  routes[`/ar/blogs/details/${p.slug}`] = { title: `${p.title} | قيمة فويس`, description: p.metaDescription || p.shortDescription, keywords: p.keywords };
}
const data = {
  site: BASE_SITE_URL,
  defaultOgImage: DEFAULT_OG_IMAGE,
  routes,
  serviceRoutes: Object.values(COMMERCIAL_SERVICES).map((s: any) => s.route).filter(Boolean),
  blogPosts: BLOG_POSTS.map(p => ({ slug: p.slug, dateModified: p.dateModified })),
  stories: STORIES.map(s => s.id),
};
fs.writeFileSync(out, JSON.stringify(data, null, 1));
console.log(`seo.json: ${Object.keys(routes).length} routes -> ${out}`);
