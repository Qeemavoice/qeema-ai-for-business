import { Router, Request, Response } from 'express';
import { collections } from '../db/collections';

/** Public (no login) endpoints: the site's forms land in the admin dashboard, and FAQs are read from it. */
export const publicFormsRouter = Router();

const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const today = () => new Date().toISOString().slice(0, 10);

const SERVICE_LABELS: Record<string, string> = {
  'voice-over': 'تعليق صوتي', ivr: 'رد آلي IVR', dubbing: 'دوبلاج', podcast: 'بودكاست', audiobook: 'كتب صوتية', demo: 'طلب عرض توضيحي للشركات', other: 'أخرى'
};

// «تواصل معنا» -> admin «الرسائل البريدية»
publicFormsRouter.post('/contact', (req: Request, res: Response) => {
  const name = text(req.body.name, 100);
  const email = text(req.body.email, 120);
  const message = text(req.body.message, 3000);
  if (!name || !emailOk(email) || message.length < 3) return res.status(400).json({ error: 'يرجى إدخال الاسم والبريد الإلكتروني والرسالة' });
  const service = text(req.body.serviceType, 40);
  const extra = [text(req.body.company, 100) && `الشركة: ${text(req.body.company, 100)}`, text(req.body.phone, 40) && `الهاتف: ${text(req.body.phone, 40)}`].filter(Boolean).join(' • ');
  const item = collections.create('messages', {
    name, email, subject: SERVICE_LABELS[service] || service || 'استفسار عام',
    message: extra ? `${message}\n\n${extra}` : message, status: 'unread', date: today()
  });
  res.json({ success: true, id: item.id });
});

// «انضم كمعلق صوتي» (/ar/jobs) -> admin «الوظائف» (طلبات التقديم)
publicFormsRouter.post('/join', (req: Request, res: Response) => {
  const name = text(req.body.name, 100);
  const email = text(req.body.email, 120);
  if (!name || !emailOk(email)) return res.status(400).json({ error: 'يرجى إدخال الاسم والبريد الإلكتروني' });
  const item = collections.create('jobs', {
    name, email, phone: text(req.body.phone, 40), country: text(req.body.country, 60),
    jobTitle: 'انضمام كمعلق صوتي', experienceYears: Number(req.body.experienceYears) || 0,
    coverLetter: text(req.body.coverLetter, 3000), status: 'new', date: today()
  });
  res.json({ success: true, id: item.id });
});

// Posted jobs (admin «الوظائف»): the site shows the «الوظائف» link only when there is at least one
publicFormsRouter.get('/jobs', (_req: Request, res: Response) => {
  res.json({ items: collections.list('jobPostings').map(({ id, title }) => ({ id, title })) });
});

// FAQs page <- admin «الأسئلة الشائعة»
publicFormsRouter.get('/faqs', (_req: Request, res: Response) => {
  res.json({ items: collections.list('faqs').filter(f => f.status === 'published') });
});
