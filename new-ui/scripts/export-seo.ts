/**
 * Writes the SEO data the Laravel host injects server-side (title/description/canonical per route, sitemap
 * entries of the static data): usage `tsx scripts/export-seo.ts <out.json>`.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { STATIC_SEO_ROUTES, BASE_SITE_URL, DEFAULT_OG_IMAGE } from '../src/seo/seoConfig';
import { COMMERCIAL_SERVICES } from '../src/data/commercialServicesData';
import { BLOG_POSTS } from '../src/data/blogData';
import { STORIES } from '../src/data/stories';

const out = process.argv[2] || 'seo.json';
const routes: Record<string, any> = {};
for (const [path, cfg] of Object.entries(STATIC_SEO_ROUTES)) {
  routes[path] = { title: cfg.title, description: cfg.description, ogImage: cfg.ogImage, noindex: cfg.noindex, keywords: cfg.keywords };
}
// «نماذج الإنتاج الصوتي» and service pages: the title and description CommercialServiceTemplate sets
for (const sv of Object.values(COMMERCIAL_SERVICES) as any[]) {
  if (sv.route && !routes[sv.route]) routes[sv.route] = { title: sv.title, description: sv.description };
}
// built-in success stories (a dashboard copy of a story replaces it on the server: SpaController::dynamicSeo)
for (const st of STORIES) {
  routes[`/ar/our-works/${st.id}`] = { title: `${st.brand} | قصص النجاح | قيمة فويس`,
    description: st.heroSubtitle || 'تجارب وقصص نجاح كبرى الشركات والجهات الحكومية العربية في التعليق الصوتي والرد الآلي والدوبلاج مع قيمة فويس.' };
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

// Laravel build: the site is served from /new-ui/ but its media keep their root paths (/stories, /logo-motion, /assets/aistudio, /qv-chat):
// copy them next to the host's public/ and point the chat widget back to the root path.
const outDir = path.dirname(out);
const hostPublic = path.resolve(outDir, '..');
if (path.basename(outDir) === 'new-ui' && fs.existsSync(path.join(hostPublic, 'index.php'))) {
  for (const dir of ['assets', 'stories', 'logo-motion', 'qv-chat', 'guides']) {
    const src = path.resolve(__dirname, '..', 'public', dir);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(hostPublic, dir), { recursive: true });
  }
  const index = path.join(outDir, 'index.html');
  fs.writeFileSync(index, fs.readFileSync(index, 'utf8').replace(/"\/new-ui\/qv-chat\//g, '"/qv-chat/'));
  console.log(`media synced to ${hostPublic}`);
}
