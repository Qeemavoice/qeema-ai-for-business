import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { collections } from '../db/collections';
import { getAuthenticatedContext, currentUser, requireUser } from './auth';
import { finalPrice, narratorShareOf } from '../../shared/pricing';
import type { HumanBooking } from '../types';

/** Client-side endpoints: own bookings (review + invoice data) and feedback to the admins. */
export const clientRouter = Router();

const CHARS_PER_MINUTE = 100;
const DEFAULT_PRICE_PER_MINUTE_USD = 40;
const MAX_EXPRESS_MINUTES = 5;
const DELIVERY: Record<string, { days: number; surchargePct: number }> = {
  '48h': { days: 2, surchargePct: 0 }, '24h': { days: 1, surchargePct: 10 }, '6h': { days: 1, surchargePct: 15 }
};
const LICENSES = ['commercial_ads', 'internal_corporate', 'broadcast_tv', 'elearning', 'ivr', 'global_license'];

/** What the client may see of a booking: no payout, no contact details, no reviewer name. */
const clientView = (b: HumanBooking) => {
  const voice = collections.list('humanVoices').find(v => v.id === b.sampleId);
  const chars = b.charCount ?? Array.from(b.scriptText || '').length;
  return {
    id: b.id, status: b.status, scriptText: b.scriptText, notes: b.notes, usageLicense: b.usageLicense,
    deadlineDays: b.deadlineDays, delivery: b.delivery, priceUsd: b.priceUsd, createdAt: b.createdAt, updatedAt: b.updatedAt,
    talentName: b.talentName, sampleId: b.sampleId, sampleName: voice?.sampleName || '', dialect: voice?.dialect || '',
    charCount: chars, durationMinutes: b.durationMinutes ?? Math.max(1, Math.ceil(chars / CHARS_PER_MINUTE)),
    deliverableAudioUrl: b.deliverableAudioUrl,
    review: b.review ? { rating: b.review.rating, text: b.review.text, createdAt: b.review.createdAt, status: b.review.status } : undefined
  };
};

clientRouter.get('/bookings', requireUser, (req: Request, res: Response) => {
  const { company } = getAuthenticatedContext(req);
  const bookings = Array.from(db.humanBookings.values())
    .filter(b => b.companyId === company.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(clientView);
  res.json({ bookings, company: { id: company.id, name: company.name, country: company.country } });
});

/** The booking form: the request enters as "pending" and the admins review it. The price is recomputed here. */
clientRouter.post('/bookings', (req: Request, res: Response) => {
  // Guests can book too (contact details are required below); signed-in clients see it in their dashboard
  const company = currentUser(req) ? getAuthenticatedContext(req).company : { id: 'guest', name: String(req.body.customerName || 'زائر').slice(0, 120) };
  const scriptText = String(req.body.scriptText || '').trim();
  if (!scriptText) return res.status(400).json({ error: 'اكتب نص المشروع' });
  const sampleId = String(req.body.sampleId || '');
  const voice = collections.list('humanVoices').find(v => v.id === sampleId);
  const usageLicense = LICENSES.includes(req.body.usageLicense) ? req.body.usageLicense : 'commercial_ads';
  const contact = { name: String(req.body.customerName || '').slice(0, 120), email: String(req.body.customerEmail || '').slice(0, 160), whatsapp: String(req.body.customerWhatsapp || '').slice(0, 40) };
  if (!contact.name || !contact.email || contact.whatsapp.replace(/\D/g, '').length < 8) return res.status(400).json({ error: 'أدخل الاسم والبريد ورقم واتساب صحيح' });

  const chars = Array.from(scriptText).length;
  const durationMinutes = Math.max(1, Math.ceil(chars / CHARS_PER_MINUTE));
  const isLong = durationMinutes > MAX_EXPRESS_MINUTES;
  const delivery = isLong ? 'custom' : (DELIVERY[req.body.delivery] ? String(req.body.delivery) : '48h');
  const opt = DELIVERY[delivery] || { days: 0, surchargePct: 0 };
  const perMinute = voice ? finalPrice(Number(voice.narratorPriceUsd) || DEFAULT_PRICE_PER_MINUTE_USD, db.systemSettings.platformCommissionPercent) : DEFAULT_PRICE_PER_MINUTE_USD;
  const base = durationMinutes * perMinute;
  const priceUsd = Math.round((base + (base * opt.surchargePct) / 100) * 100) / 100;

  const nextNum = Math.max(9000, ...Array.from(db.humanBookings.keys()).map(k => Number(String(k).replace(/\D/g, '')) || 0)) + 1;
  const now = new Date().toISOString();
  const booking: HumanBooking = {
    id: `BOK-${nextNum}`, companyId: company.id, companyName: company.name,
    talentId: voice?.talentId || voice?.id || sampleId, talentName: voice?.talentName || voice?.name || '',
    sampleId: sampleId || undefined, scriptText, deadlineDays: opt.days, delivery,
    usageLicense, notes: String(req.body.notes || '').slice(0, 500),
    charCount: chars, durationMinutes, priceUsd,
    talentPayoutUsd: narratorShareOf(priceUsd, db.systemSettings.platformCommissionPercent), paymentModel: 'direct_escrow_100',
    status: 'pending', customerContact: contact, createdAt: now, updatedAt: now
  };
  db.humanBookings.set(booking.id, booking);
  db.auditLogs.unshift({ id: `log-${Date.now()}`, companyId: company.id, actor: 'client', action: `BOOKING_CREATED: ${booking.id}`, createdAt: now });
  res.json({ success: true, booking: clientView(booking) });
});

clientRouter.post('/bookings/:id/review', requireUser, (req: Request, res: Response) => {
  const { company, user } = getAuthenticatedContext(req);
  const booking = db.humanBookings.get(req.params.id);
  if (!booking || booking.companyId !== company.id) return res.status(404).json({ error: 'المشروع غير موجود' });
  if (booking.status !== 'delivered' && booking.status !== 'approved') {
    return res.status(400).json({ error: 'يمكن تقييم المشروع بعد تسليم التسجيل' });
  }
  const rating = Math.round(Number(req.body.rating));
  const text = String(req.body.text || '').trim().slice(0, 1000);
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'التقييم يجب أن يكون من 1 إلى 5 نجوم' });
  booking.review = { rating, text, author: user.name, createdAt: new Date().toISOString(), status: 'pending' }; // published only after admin approval
  db.auditLogs.unshift({ id: `log-${Date.now()}`, companyId: company.id, actor: user.id, action: `BOOKING_REVIEWED: ${booking.id} (${rating}/5)`, createdAt: new Date().toISOString() });
  res.json({ success: true, booking: clientView(booking) });
});

clientRouter.post('/feedback', requireUser, (req: Request, res: Response) => {
  const { company, user } = getAuthenticatedContext(req);
  const rating = Math.round(Number(req.body.rating));
  const message = String(req.body.message || '').trim().slice(0, 1000);
  if (!(rating >= 1 && rating <= 5) || message.length < 3) return res.status(400).json({ error: 'يرجى اختيار التقييم وكتابة الملاحظة' });
  const item = collections.create('feedback', {
    companyName: company.name, userName: user.name, email: user.email,
    topic: String(req.body.topic || 'ملاحظة عامة').slice(0, 60),
    rating, stars: '★'.repeat(rating) + '☆'.repeat(5 - rating),
    message, status: 'unread', date: new Date().toISOString().slice(0, 10)
  });
  res.json({ success: true, id: item.id });
});
