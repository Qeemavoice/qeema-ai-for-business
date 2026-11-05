import { Router, Request, Response } from 'express';
import { collections } from '../db/collections';
import { db } from '../db/store';
import { finalPrice } from '../../shared/pricing';
import { narratorState } from './narrators';

const DEFAULT_PRICE_PER_MINUTE_USD = 40; // same default as bookings (clientBookings.ts)

export const collectionsRouter = Router();

collectionsRouter.get('/:name', (req: Request, res: Response) => {
  const name = req.params.name;
  if (!collections.has(name)) return res.status(404).json({ error: 'المجموعة غير موجودة' });
  res.json({ items: collections.list(name) });
});

/** «إدارة المشرفين»: a supervisor must already have an account with that email; the row is bound to it. */
const bindAdmin = (body: any): string | null => {
  if (body.email === undefined) return null;
  const u = Array.from(db.users.values()).find(x => x.email.toLowerCase() === String(body.email).trim().toLowerCase());
  if (!u) return 'لا يوجد حساب بهذا البريد. اطلب من المشرف إنشاء حساب في الموقع أولاً ثم أضفه هنا.';
  body.userId = u.id;
  return null;
};

collectionsRouter.post('/:name', (req: Request, res: Response) => {
  const name = req.params.name;
  if (!collections.has(name)) return res.status(404).json({ error: 'المجموعة غير موجودة' });
  if (name === 'admins') { const err = bindAdmin(req.body || {}); if (err) return res.status(400).json({ error: err }); }
  res.json({ item: collections.create(name, req.body || {}) });
});

collectionsRouter.put('/:name/:id', (req: Request, res: Response) => {
  const name = req.params.name;
  if (!collections.has(name)) return res.status(404).json({ error: 'المجموعة غير موجودة' });
  if (name === 'admins') { const err = bindAdmin(req.body || {}); if (err) return res.status(400).json({ error: err }); }
  const item = collections.update(name, req.params.id, req.body || {});
  if (!item) return res.status(404).json({ error: 'العنصر غير موجود' });
  res.json({ item });
});

collectionsRouter.delete('/:name/:id', (req: Request, res: Response) => {
  const name = req.params.name;
  if (!collections.has(name)) return res.status(404).json({ error: 'المجموعة غير موجودة' });
  if (!collections.remove(name, req.params.id)) return res.status(404).json({ error: 'العنصر غير موجود' });
  res.json({ ok: true });
});

/** Public read: published articles written in the dashboard (only those with content) for /ar/blogs */
/** Services, dialects and categories as edited in the dashboard (footer, library filters, forms) */
export const publicSiteListsHandler = (_req: Request, res: Response) => {
  const active = (r: any) => !r.status || r.status === 'active';
  res.json({
    services: collections.list('services').filter(active).map(s => ({ title: s.title, slug: s.slug })),
    dialects: collections.list('dialects').filter(active).map(d => ({ key: d.name, flag: d.flag || '', type: d.type || 'لهجة' })),
    categories: collections.list('categories').filter(active).map(c => c.name)
  });
};

export const publicArticlesHandler = (_req: Request, res: Response) => {
  res.json({ items: collections.list('articles').filter(a => a.status === 'published' && a.title && String(a.content || '').trim()) });
};

/** Public read: published voice production templates (نماذج الإنتاج الصوتي) */
export const publicVoiceTemplatesHandler = (_req: Request, res: Response) => {
  res.json({ items: collections.list('voiceTemplates').filter(t => t.status === 'published').sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999)) });
};

/** Public read: page header texts edited in the dashboard (نصوص الصفحات) */
export const publicPageTextsHandler = (_req: Request, res: Response) => {
  res.json({ items: collections.list('pageTexts') });
};

/** Public read: published success stories for /ar/our-works */
export const publicStoriesHandler = (_req: Request, res: Response) => {
  // `website` is for the dashboard only: never sent to visitors
  res.json({ items: collections.list('stories').filter(s => s.status === 'published').map(({ website, ...s }) => s) });
};

/** Public read: one CMS page (privacy / terms / about) */
export const publicPageHandler = (req: Request, res: Response) => {
  const page = collections.list('pages').find(p => p.id === req.params.key && p.status === 'published');
  if (!page) return res.status(404).json({ error: 'الصفحة غير موجودة' });
  res.json({ page });
};

/** Public read: published guides for /ar/guides */
export const publicGuidesHandler = (_req: Request, res: Response) => {
  res.json({ items: collections.list('guides').filter(g => g.status === 'published') });
};

/** Public read: active human voice samples with the FINAL client price (narrator price + platform commission). */
/**
 * Library voices: the dashboard «الأصوات» collection plus every narrator sample the admins approved
 * (narrator dashboard → «العينات» → admin «العينات» → published). Suspended narrators are left out.
 */
export const libraryVoices = (): any[] => {
  const st = narratorState();
  const narrators = new Map<string, any>((st.narrators || []).map((n: any) => [n.id, n]));
  const fromNarrators = (st.voiceSamples || [])
    .filter((s: any) => s.status === 'published' && narrators.get(s.narratorId)?.status !== 'suspended')
    .map((s: any) => {
      const n = narrators.get(s.narratorId) || {};
      return {
        id: `ns-${s.id}`, narratorId: s.narratorId, talentId: s.narratorId,
        name: n.displayName || '', talentName: n.displayName || '', sampleName: s.title, subtitle: s.title,
        previewUrl: s.audioUrl, dialect: s.dialect, accent: s.dialect, language: 'العربية', flag: '',
        category: s.category, categories: [s.category], tags: [s.category],
        narratorPriceUsd: Number(s.pricePerMinute ?? n.rates?.perMinuteUsd) || 0,
        isVerified: n.humanBadge === 'verified', isHuman: true, gender: 'male', status: 'active', createdAt: s.createdAt
      };
    });
  return [...collections.list('humanVoices').filter(v => v.status === 'active'), ...fromNarrators];
};

export const publicHumanVoicesHandler = (_req: Request, res: Response) => {
  const pct = db.systemSettings.platformCommissionPercent;
  res.json({
    commissionPercent: pct,
    // public pages show the clip name only: never the narrator's name
    items: libraryVoices().map(v => ({ ...v, name: v.sampleName || v.category || 'عينة صوتية', talentName: '', finalPriceUsd: finalPrice(Number(v.narratorPriceUsd) || DEFAULT_PRICE_PER_MINUTE_USD, pct) }))
  });
};

/** Public read: approved client reviews of one library voice */
export const publicVoiceReviewsHandler = (req: Request, res: Response) => {
  const reviews = Array.from(db.humanBookings.values())
    .filter(b => b.sampleId === req.params.id && b.review?.status === 'approved')
    .map(b => ({ rating: b.review!.rating, createdAt: b.review!.createdAt })) // texts stay internal (admin only)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const avg = reviews.length ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10 : 0;
  res.json({ reviews, average: avg, count: reviews.length });
};
