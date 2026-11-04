import { Router, Request, Response } from 'express';
import { DEFAULT_PLAN_ID, SIGNUP_BONUS_CREDITS } from '../../shared/plans';
import { db } from '../db/store';
import crypto from 'crypto';

export const authRouter = Router();

import type { NextFunction } from 'express';
import type { User } from '../types';
import { saveDb } from '../db/persist';
import { verifiedClaims } from './narrators';

// ---------- passwords & sessions ----------
export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
};
const checkPassword = (password: string, stored?: string) => {
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  const a = Buffer.from(hash, 'hex');
  const b = crypto.scryptSync(password, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const SESSION_DAYS = 30;
const newSession = (userId: string) => {
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.set(token, { userId, createdAt: new Date().toISOString() });
  saveDb();
  return token;
};
/** What the browser may see of a user */
export const publicUser = (u: User) => {
  const { passwordHash, ...rest } = u;
  return rest;
};
const tokenOf = (req: Request) => {
  const h = String(req.headers.authorization || '');
  return h.startsWith('Bearer ') ? h.slice(7) : '';
};
/** The signed-in user of this request, if any */
export function currentUser(req: Request): User | undefined {
  const s = db.sessions.get(tokenOf(req));
  if (!s) return undefined;
  if (Date.now() - Date.parse(s.createdAt) > SESSION_DAYS * 864e5) { db.sessions.delete(tokenOf(req)); return undefined; }
  return db.users.get(s.userId);
}
export const requireUser = (req: Request, res: Response, next: NextFunction) =>
  currentUser(req) ? next() : res.status(401).json({ error: 'يلزم تسجيل الدخول' });
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const u = currentUser(req);
  if (!u) return res.status(401).json({ error: 'يلزم تسجيل دخول الإدارة' });
  if (!u.isPlatformAdmin) return res.status(403).json({ error: 'هذه الصفحة لفريق إدارة قيمة فويس فقط' });
  next();
};

/** Signed-in user and their company. Only platform admins may act on another company (x-company-id). */
export function getAuthenticatedContext(req: Request) {
  const user = currentUser(req)!;
  const asked = req.headers['x-company-id'] as string;
  const company = (user?.isPlatformAdmin && asked && db.companies.get(asked)) || db.companies.get(user?.companyId) || Array.from(db.companies.values())[0];
  const balance = db.getCompanyBalance(company.id);
  return { company, user, balance };
}

// Current authenticated user & company
/** Voice library favourites (المفضلة), kept on the account. */
authRouter.get('/favorites', requireUser, (req: Request, res: Response) => {
  res.json({ ids: currentUser(req)!.savedVoiceIds || [] });
});
authRouter.put('/favorites', requireUser, (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
  if (!ids) return res.status(400).json({ error: 'قائمة غير صالحة' });
  const user = currentUser(req)!;
  user.savedVoiceIds = Array.from(new Set(ids.filter((x: unknown) => typeof x === 'string' && x.length <= 120))).slice(0, 500) as string[];
  res.json({ ids: user.savedVoiceIds });
});

authRouter.get('/me', (req: Request, res: Response) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'يلزم تسجيل الدخول' });
  const { company, balance } = getAuthenticatedContext(req);
  res.json({
    user: publicUser(user),
    company,
    balanceCredits: balance,
    availableCompanies: user.isPlatformAdmin ? Array.from(db.companies.values()) : [company],
  });
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const findByEmail = (email: string) => Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());

/** New account: company (credits wallet) + user; clients get the signup bonus */
function createAccount(data: { name: string; email: string; password?: string; company?: string; accountType: 'client' | 'talent' }) {
  const companyId = `comp-${crypto.randomBytes(4).toString('hex')}`;
  const userId = `usr-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  db.companies.set(companyId, {
    id: companyId, name: data.company || data.name, industry: 'Corporate Business',
    country: 'المملكة العربية السعودية', createdAt: now, planId: DEFAULT_PLAN_ID
  } as any);
  const user: User = {
    id: userId, email: data.email.toLowerCase(), name: data.name, companyId, role: 'admin', createdAt: now,
    accountType: data.accountType, passwordHash: data.password ? hashPassword(data.password) : undefined
  };
  db.users.set(userId, user);
  if (data.accountType === 'client') {
    db.addCredits(companyId, userId, SIGNUP_BONUS_CREDITS, 'signup_bonus', `رصيد ترحيبي مجاني (${SIGNUP_BONUS_CREDITS.toLocaleString('en-US')} حرف)`);
  }
  saveDb();
  return user;
}

authRouter.post('/signup', (req: Request, res: Response) => {
  const name = String(req.body.name || '').trim().slice(0, 120);
  const email = String(req.body.email || '').trim().slice(0, 160);
  const password = String(req.body.password || '');
  const accountType = req.body.accountType === 'talent' ? 'talent' : 'client';
  if (!name) return res.status(400).json({ error: 'اكتب الاسم الكامل' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
  if (password.length < 8) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
  if (findByEmail(email)) return res.status(409).json({ error: 'هذا البريد مسجّل مسبقاً، سجّل الدخول بدلاً من ذلك' });
  const user = createAccount({ name, email, password, accountType, company: String(req.body.company || '').trim().slice(0, 120) || undefined });
  res.json({ token: newSession(user.id), user: publicUser(user) });
});

authRouter.post('/login', (req: Request, res: Response) => {
  const user = findByEmail(String(req.body.email || '').trim());
  if (!user || !checkPassword(String(req.body.password || ''), user.passwordHash)) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }
  res.json({ token: newSession(user.id), user: publicUser(user) });
});

/** Google sign-in: the access token is checked with Google itself before trusting the email */
authRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${String(req.body.accessToken || '')}` } });
    if (!r.ok) return res.status(401).json({ error: 'تعذر التحقق من حساب Google' });
    const g = await r.json();
    if (!g.email || g.email_verified === false) return res.status(401).json({ error: 'بريد Google غير موثّق' });
    const user = findByEmail(g.email) || createAccount({ name: g.name || g.email.split('@')[0], email: g.email, accountType: req.body.accountType === 'talent' ? 'talent' : 'client' });
    res.json({ token: newSession(user.id), user: publicUser(user) });
  } catch {
    res.status(502).json({ error: 'تعذر الاتصال بخدمة Google' });
  }
});

/** Invited narrator finishing the claim link: creates (or links) the talent account for that narrator */
authRouter.post('/claim', async (req: Request, res: Response) => {
  const token = String(req.body.claimToken || '');
  const narrator = (db.narratorState?.narrators || []).find((n: any) => n.claimToken === token);
  if (!narrator) return res.status(404).json({ error: 'رابط التفعيل غير صالح' });
  if (narrator.claimTokenExpiresAt && Date.parse(narrator.claimTokenExpiresAt) < Date.now()) return res.status(410).json({ error: 'انتهت صلاحية رابط التفعيل' });
  if (!verifiedClaims.has(token)) return res.status(403).json({ error: 'أكّد رمز التحقق المرسل إلى بريدك أولاً' });
  let email = String(narrator.email || '');
  let name = String(narrator.displayName || '');
  if (req.body.googleAccessToken) {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${String(req.body.googleAccessToken)}` } }).catch(() => null);
    const g = r && r.ok ? await r.json() : null;
    if (!g?.email) return res.status(401).json({ error: 'تعذر التحقق من حساب Google' });
    email = g.email; name = name || g.name;
  } else if (String(req.body.password || '').length < 8) {
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
  }
  if (!email) return res.status(400).json({ error: 'لا يوجد بريد مسجّل لهذا المعلق' });
  const existing = findByEmail(email);
  if (existing && existing.narratorId && existing.narratorId !== narrator.id) return res.status(409).json({ error: 'هذا البريد مرتبط بمعلق آخر' });
  const user = existing || createAccount({ name, email, password: req.body.password ? String(req.body.password) : undefined, accountType: 'talent' });
  user.accountType = 'talent';
  user.narratorId = narrator.id;
  if (req.body.password && !existing) user.passwordHash = hashPassword(String(req.body.password));
  verifiedClaims.delete(token);
  res.json({ token: newSession(user.id), user: publicUser(user) });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  db.sessions.delete(tokenOf(req));
  saveDb();
  res.json({ success: true });
});

/** Platform admin account from ADMIN_EMAIL / ADMIN_PASSWORD (.env.local); password is re-synced on every start */
export function ensureAdminAccount() {
  const email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD;
  if (!email || !password) { console.warn('[auth] ADMIN_EMAIL / ADMIN_PASSWORD not set: the admin dashboard cannot be opened'); return; }
  const user = findByEmail(email) || createAccount({ name: 'إدارة قيمة فويس', email, accountType: 'client' });
  user.isPlatformAdmin = true;
  user.passwordHash = checkPassword(password, user.passwordHash) ? user.passwordHash : hashPassword(password);
  saveDb();
}

// Switch company for testing/demonstration
authRouter.post('/switch-company', requireAdmin, (req: Request, res: Response) => {
  const { companyId } = req.body;
  if (!companyId || !db.companies.has(companyId)) {
    return res.status(404).json({ error: 'الشركة غير موجودة' });
  }

  const company = db.companies.get(companyId)!;
  // find first user belonging to this company
  const user = Array.from(db.users.values()).find(u => u.companyId === companyId) || {
    id: `usr-${companyId}`,
    email: `contact@${companyId}.com`,
    name: 'مسؤول الشركة',
    companyId: company.id,
    role: 'admin' as const,
    createdAt: new Date().toISOString()
  };

  const balance = db.getCompanyBalance(company.id);
  res.json({
    user,
    company,
    balanceCredits: balance,
  });
});
