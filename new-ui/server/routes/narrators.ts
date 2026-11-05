import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { currentUser, isAdmin } from './auth';
import { sendMail } from '../mailer';
import { INITIAL_NARRATORS, INITIAL_AI_VOICES, INITIAL_CONTRACTS, INITIAL_USAGE_EVENTS, INITIAL_AUDIT_LOGS, INITIAL_VOICE_SAMPLES, INITIAL_VOICE_OVER_BOOKINGS } from '../../src/data/narratorSeed';
import { db } from '../db/store';
import { collections } from '../db/collections';

export const narratorsRouter = Router();

// ---------- Narrator dashboards data (server copy is the source of truth) ----------
const KEYS = ['narrators', 'aiVoices', 'contracts', 'usageEvents', 'auditLogs', 'voiceSamples', 'voiceOverBookings', 'notifications'] as const;
type Key = typeof KEYS[number];

export const narratorState = (): Record<string, any> => state();
const state = () => {
  if (!db.narratorState) {
    db.narratorState = JSON.parse(JSON.stringify({
      narrators: INITIAL_NARRATORS, aiVoices: INITIAL_AI_VOICES, contracts: INITIAL_CONTRACTS,
      usageEvents: INITIAL_USAGE_EVENTS, auditLogs: INITIAL_AUDIT_LOGS, voiceSamples: INITIAL_VOICE_SAMPLES,
      voiceOverBookings: INITIAL_VOICE_OVER_BOOKINGS, notifications: []
    }));
  }
  return db.narratorState!;
};

const ownerOf = (key: Key, item: any, st: any): string | undefined =>
  key === 'narrators' ? item.id
    : key === 'usageEvents' ? Object.values(st.aiVoices || {}).find((v: any) => v.id === item.aiVoiceId)?.['narratorId' as any]
    : item.narratorId;

/** Which narrator this request may act for: 'all' for admins, a narrator id for its owner, or null */
function actorFor(req: Request): 'all' | string | null {
  const user = currentUser(req);
  if (isAdmin(user)) return 'all';
  if (user?.narratorId) return user.narratorId;
  // Invited narrator opening the claim link (before having an account)
  const claim = String(req.headers['x-claim-token'] || req.query.claim || '');
  if (claim) return state().narrators.find((n: any) => n.claimToken === claim)?.id || null;
  return null;
}

/** Only the parts of the data that belong to one narrator */
const sliceFor = (id: string) => {
  const st = state();
  const out: any = {};
  for (const k of KEYS) {
    const v = st[k];
    out[k] = Array.isArray(v) ? v.filter((i: any) => ownerOf(k, i, st) === id)
      : Object.fromEntries(Object.entries(v || {}).filter(([, i]: any) => ownerOf(k, i, st) === id));
  }
  return out;
};

/** Fields only the admin team may change */
function protect(key: Key, mine: any, old: any) {
  if (key === 'narrators') {
    if (!old) return { ...mine, status: 'active', kycStatus: 'none', humanBadge: mine.humanBadge === 'pending' ? 'pending' : 'none', adminNotes: [] };
    // Claiming an invitation activates the account; suspension stays the admin's decision
    const claimed = (old.status === 'invited' || old.status === 'unclaimed') && mine.status === 'active';
    const out = { ...mine, status: claimed ? 'active' : old.status, kycStatus: old.kycStatus, adminNotes: old.adminNotes, claimToken: old.claimToken, claimTokenExpiresAt: old.claimTokenExpiresAt };
    // A new email is accepted only after the code sent to it was confirmed
    if ((mine.email || '').toLowerCase() !== (old.email || '').toLowerCase()) {
      if (verifiedEmails.get(old.id) === (mine.email || '').toLowerCase()) verifiedEmails.delete(old.id);
      else out.email = old.email;
    }
    // The narrator may only request the «معلق بشري» badge; granting / withdrawing is the admin's
    if (old.humanBadge === 'verified' || mine.humanBadge === 'verified') { out.humanBadge = old.humanBadge; out.humanVerification = old.humanVerification; }
    return out;
  }
  if (key === 'voiceSamples') {
    if (!old) return { ...mine, status: mine.autoRejected ? 'rejected' : 'pending_review', reviewedAt: undefined };
    return { ...mine, status: old.status, rejectionReason: old.rejectionReason, rejectionCodes: old.rejectionCodes, reviewedAt: old.reviewedAt };
  }
  return mine;
}

/** Apply a narrator's own changes; everything else stays as on the server */
function mergeOwned(incoming: any, id: string) {
  const st = state();
  for (const k of KEYS) {
    if (k === 'usageEvents' || k === 'voiceOverBookings') continue; // written by the platform / admin only
    const srv = st[k], inc = incoming?.[k];
    if (!inc) continue;
    if (Array.isArray(srv)) {
      const mine = (inc as any[]).filter(i => i && ownerOf(k, i, st) === id);
      if (k === 'auditLogs') { // append-only
        st[k] = [...mine.filter(i => !srv.some((x: any) => x.id === i.id)), ...srv];
        continue;
      }
      const kept = srv.filter((i: any) => ownerOf(k, i, st) !== id);
      st[k] = [...mine.map(i => protect(k, i, srv.find((x: any) => x.id === i.id))), ...kept];
    } else {
      const out: any = {};
      for (const [key, i] of Object.entries(srv || {})) if (ownerOf(k, i, st) !== id) out[key] = i;
      for (const [key, i] of Object.entries(inc || {})) if (i && ownerOf(k, i, st) === id) out[key] = protect(k, i, srv?.[key]);
      st[k] = out;
    }
  }
}


// ---------- Email verification codes (claim link, email change) ----------
const OTP_MINUTES = 10;
const otps = new Map<string, { hash: string; expires: number; attempts: number }>();
/** Claim links whose code was confirmed, and confirmed new emails per narrator */
export const verifiedClaims = new Set<string>();
const verifiedEmails = new Map<string, string>();
const sha = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const maskEmail = (e: string) => e.replace(/^(.)[^@]*(@.*)$/, '$1***$2');

/** Where the code goes for this request */
function otpTarget(req: Request): { key: string; email: string } | { error: string; status: number } {
  if (req.body.purpose === 'claim') {
    const token = String(req.headers['x-claim-token'] || '');
    const n = state().narrators.find((x: any) => x.claimToken === token);
    if (!n) return { error: 'رابط التفعيل غير صالح', status: 404 };
    if (!n.email) return { error: 'لا يوجد بريد مسجّل لهذا المعلق. تواصل مع فريق قيمة فويس.', status: 400 };
    return { key: `claim:${token}`, email: n.email };
  }
  const user = currentUser(req);
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!user?.narratorId) return { error: 'يلزم تسجيل الدخول', status: 401 };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'البريد الإلكتروني غير صحيح', status: 400 };
  return { key: `email:${user.narratorId}:${email}`, email };
}

narratorsRouter.post('/otp/send', async (req: Request, res: Response) => {
  const t = otpTarget(req);
  if ('error' in t) return res.status(t.status).json({ error: t.error });
  const code = String(crypto.randomInt(100000, 1000000));
  otps.set(t.key, { hash: sha(code), expires: Date.now() + OTP_MINUTES * 60000, attempts: 0 });
  try {
    await sendMail(t.email, 'رمز التحقق من قيمة فويس', `رمز التحقق الخاص بك: ${code}\nصالح لمدة ${OTP_MINUTES} دقائق. إذا لم تطلب هذا الرمز فتجاهل الرسالة.`);
    res.json({ success: true, sentTo: maskEmail(t.email) });
  } catch (err: any) {
    otps.delete(t.key);
    res.status(503).json({ error: err?.message || 'تعذر إرسال رمز التحقق' });
  }
});

narratorsRouter.post('/otp/verify', (req: Request, res: Response) => {
  const t = otpTarget(req);
  if ('error' in t) return res.status(t.status).json({ error: t.error });
  const entry = otps.get(t.key);
  if (!entry || entry.expires < Date.now()) return res.status(400).json({ error: 'انتهت صلاحية الرمز، اطلب رمزاً جديداً' });
  if (++entry.attempts > 5) { otps.delete(t.key); return res.status(429).json({ error: 'محاولات كثيرة، اطلب رمزاً جديداً' }); }
  if (entry.hash !== sha(String(req.body.code || '').trim())) return res.status(400).json({ error: 'رمز التحقق غير صحيح' });
  otps.delete(t.key);
  if (t.key.startsWith('claim:')) verifiedClaims.add(t.key.slice(6));
  else verifiedEmails.set(t.key.split(':')[1], t.email);
  res.json({ success: true });
});

// GET /api/v1/narrators/state: all data for admins, own data for a narrator
narratorsRouter.get('/state', (req: Request, res: Response) => {
  const who = actorFor(req);
  if (!who) {
    // A talent account without a narrator record yet gets an empty slice (it creates its record on first save)
    if (currentUser(req)?.accountType === 'talent') return res.json(Object.fromEntries(KEYS.map(k => [k, ['aiVoices', 'contracts'].includes(k) ? {} : []])));
    return res.status(401).json({ error: 'يلزم تسجيل الدخول' });
  }
  res.json(who === 'all' ? state() : sliceFor(who));
});

// PUT /api/v1/narrators/state: admins replace; a narrator merges only their own records
narratorsRouter.put('/state', (req: Request, res: Response) => {
  const body = req.body || {};
  const user = currentUser(req);
  let who = actorFor(req);
  // First save of a new talent account: adopt the narrator record that carries the account's email
  if (!who && user?.accountType === 'talent') {
    const fresh = (body.narrators || []).find((n: any) => n?.email && n.email.toLowerCase() === user.email.toLowerCase() && !state().narrators.some((x: any) => x.id === n.id));
    if (fresh) { user.narratorId = fresh.id; who = fresh.id; }
  }
  if (!who) return res.status(401).json({ error: 'يلزم تسجيل الدخول' });
  if (who === 'all') {
    for (const k of KEYS) if (body[k] !== undefined) state()[k] = body[k];
  } else {
    mergeOwned(body, who);
  }
  res.json({ success: true, narratorId: who === 'all' ? undefined : who });
});

function ownerOnly(req: Request, res: Response, next: NextFunction) {
  const who = actorFor(req);
  return who === 'all' || who === req.params.id ? next() : res.status(403).json({ error: 'غير مصرح' });
}

// GET /api/v1/narrators/:id/studio-voices: the narrator's voices approved by the admin for the TTS studio (read-only)
// ---------- Invitation links (made on the server: random, unguessable, emailed) ----------
const INVITE_DAYS = 7;
const siteOrigin = (req: Request) => process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

/** New claim token for a narrator who has not activated yet; emails the link when SMTP is set. */
async function issueInvite(n: any, req: Request): Promise<{ link: string; emailed: boolean }> {
  n.claimToken = crypto.randomBytes(24).toString('hex');
  n.claimTokenExpiresAt = new Date(Date.now() + INVITE_DAYS * 86400000).toISOString();
  if (n.status !== 'active') n.status = 'invited';
  const link = `${siteOrigin(req)}/claim/${n.claimToken}`;
  let emailed = false;
  if (n.email) {
    try {
      await sendMail(n.email, 'دعوة لتفعيل حسابك في قيمة فويس',
        `مرحباً ${n.displayName || ''}،\nتمت دعوتك لتفعيل حسابك كمعلق صوتي في قيمة فويس.\nرابط التفعيل (صالح ${INVITE_DAYS} أيام):\n${link}`);
      emailed = true;
    } catch { /* SMTP not set: the admin copies the link */ }
  }
  return { link, emailed };
}

const adminOnly = (req: Request, res: Response, next: NextFunction) =>
  actorFor(req) === 'all' ? next() : res.status(403).json({ error: 'للإدارة فقط' });

// Admin «إرسال دعوة» for one narrator
narratorsRouter.post('/:id/invite', adminOnly, async (req: Request, res: Response) => {
  const n = state().narrators.find((x: any) => x.id === req.params.id);
  if (!n) return res.status(404).json({ error: 'المعلق غير موجود' });
  if (n.status === 'active') return res.status(400).json({ error: 'الحساب مفعّل بالفعل' });
  const r = await issueInvite(n, req);
  res.json({ narrator: n, ...r });
});

// Admin «إرسال الدعوات» for every narrator who never got one
narratorsRouter.post('/invite-all', adminOnly, async (req: Request, res: Response) => {
  const list = state().narrators.filter((n: any) => n.status === 'unclaimed');
  let emailed = 0;
  for (const n of list) if ((await issueInvite(n, req)).emailed) emailed++;
  res.json({ count: list.length, emailed });
});

// Expired link page «طلب رابط جديد»: same answer whether or not the address exists
narratorsRouter.post('/claim-link', async (req: Request, res: Response) => {
  const q = String(req.body?.contact || '').trim().toLowerCase();
  const n = q.length >= 5 && state().narrators.find((x: any) => x.status !== 'active' && ((x.email || '').toLowerCase() === q || (x.phone || '').replace(/\D/g, '') === q.replace(/\D/g, '')));
  if (n) await issueInvite(n, req);
  res.json({ success: true, message: 'إذا كانت البيانات مسجلة لدينا، أرسلنا رابط تفعيل جديداً إلى بريدك الإلكتروني المسجل.' });
});

// «طلب مراجعة يدوية» from the claim page -> admin «الرسائل البريدية»
narratorsRouter.post('/manual-review', (req: Request, res: Response) => {
  const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const name = clip(req.body?.fullName, 100), phone = clip(req.body?.newPhone, 40);
  if (!name || phone.replace(/\D/g, '').length < 8) return res.status(400).json({ error: 'أدخل الاسم ورقم جوال صحيح' });
  const ref = `MAN-${crypto.randomInt(100000, 1000000)}`;
  collections.create('messages', {
    name, email: '', subject: 'طلب تفعيل يدوي لحساب معلق',
    message: `المرجع: ${ref}\nالجوال الجديد: ${phone}\n${clip(req.body?.notes, 1000)}`, status: 'unread', date: new Date().toISOString().slice(0, 10)
  });
  res.json({ success: true, referenceNumber: ref });
});

/** Payout and emergency-stop requests from the narrator dashboard land in the admin «الرسائل البريدية». */
narratorsRouter.post('/:id/requests', ownerOnly, (req: Request, res: Response) => {
  const n = state().narrators.find((x: any) => x.id === req.params.id);
  if (!n) return res.status(404).json({ error: 'المعلق غير موجود' });
  const type = req.body?.type;
  const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  let subject: string, message: string;
  if (type === 'payout') {
    const amount = Math.round(Number(req.body.amountUsd) * 100) / 100;
    if (!(amount > 0)) return res.status(400).json({ error: 'أدخل مبلغاً صحيحاً' });
    subject = 'طلب سحب أرباح معلق';
    message = `المعلق ${n.displayName} (${n.id}) يطلب سحب $${amount}\nطريقة الاستلام: ${clip(req.body.method, 60) || 'غير محددة'}`;
  } else if (type === 'emergency') {
    subject = 'طلب إيقاف استثنائي لصوت معلق';
    message = `المعلق ${n.displayName} (${n.id}) يطلب إيقاف صوته فوراً\nالسبب: ${clip(req.body.reason, 200)}\n${clip(req.body.details, 2000)}`;
  } else return res.status(400).json({ error: 'نوع طلب غير معروف' });
  const item = collections.create('messages', { name: n.displayName, email: n.email || '', subject, message, status: 'unread', date: new Date().toISOString().slice(0, 10) });
  res.json({ success: true, id: item.id });
});

narratorsRouter.get('/:id/studio-voices', ownerOnly, (req: Request, res: Response) => {
  const voices = Array.from(db.voices.values())
    .filter(v => v.type === 'ai' && v.isActive && v.narratorId === req.params.id)
    .map(v => ({ id: v.id, name: v.name, gender: v.gender, dialectLabel: v.dialectLabel, styleLabel: v.styleLabel, previewUrl: v.previewUrl, avatar: v.avatar, sharePercent: v.narratorSharePercent ?? 0 }));
  res.json({ voices });
});

// GET /api/v1/narrators/:id/earnings: what the narrator earned from uses of his studio voices (his own events only, no customer names)
narratorsRouter.get('/:id/earnings', ownerOnly, (req: Request, res: Response) => {
  const events = Array.from(db.narratorEarnings.values())
    .filter(e => e.narratorId === req.params.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(e => ({ id: e.id, voiceName: e.voiceName, chars: e.chars, narratorUsd: e.narratorUsd, createdAt: e.createdAt }));
  const month = new Date().toISOString().slice(0, 7);
  const sum = (list: typeof events) => Math.round(list.reduce((a, e) => a + e.narratorUsd, 0) * 100) / 100;
  res.json({ events, totalUsd: sum(events), monthUsd: sum(events.filter(e => e.createdAt.startsWith(month))) });
});
