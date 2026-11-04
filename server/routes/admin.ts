import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { collections } from '../db/collections';
import { Voice, HumanBooking, Company, Generation } from '../types';

export const adminRouter = Router();

// GET Admin Overview
adminRouter.get('/overview', (req: Request, res: Response) => {
  const companies = Array.from(db.companies.values()).map(c => ({
    ...c,
    balance: db.getCompanyBalance(c.id),
    generationsCount: Array.from(db.generations.values()).filter(g => g.companyId === c.id).length
  }));

  const allGenerations = Array.from(db.generations.values());
  const allUsage = Array.from(db.usageRecords.values());
  const totalSystemCost = allUsage.reduce((acc, u) => acc + (u.costUsd || 0), 0);
  const totalCharsGenerated = allGenerations.reduce((acc, g) => acc + (g.textChars || 0), 0);
  
  const allBookings = Array.from(db.humanBookings.values());
  const totalBookingsRevenueUsd = allBookings.reduce((acc, b) => acc + (b.priceUsd || 0), 0);
  const totalTalentPayoutsUsd = allBookings.reduce((acc, b) => acc + (b.talentPayoutUsd || 0), 0);
  const platformBookingMarginUsd = totalBookingsRevenueUsd - totalTalentPayoutsUsd;

  const pendingBookingsCount = allBookings.filter(b => b.status === 'pending' || b.status === 'in_studio').length;

  res.json({
    companies,
    voicesCount: db.voices.size,
    aiVoicesCount: Array.from(db.voices.values()).filter(v => v.type === 'ai').length,
    humanVoicesCount: Array.from(db.voices.values()).filter(v => v.type === 'human').length,
    totalGenerations: allGenerations.length,
    totalCharsGenerated,
    totalSystemCostUsd: Number(totalSystemCost.toFixed(4)),
    totalBookingsRevenueUsd,
    totalTalentPayoutsUsd,
    platformBookingMarginUsd,
    pendingBookingsCount,
    systemSettings: db.systemSettings,
    recentLogs: db.auditLogs.slice(0, 30),
    recentGenerations: [...allGenerations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 15).map(generationRow)
  });
});

// GET All Bookings
adminRouter.get('/bookings', (req: Request, res: Response) => {
  const bookings = Array.from(db.humanBookings.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ bookings });
});

// Update Booking Status
adminRouter.post('/bookings/:id/status', (req: Request, res: Response) => {
  const { status, deliverableUrl } = req.body;
  const validStatuses: HumanBooking['status'][] = ['pending', 'in_studio', 'delivered', 'approved'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'حالة الطلب غير صالحة' });
  }

  const updated = db.updateBookingStatus(req.params.id, status, deliverableUrl);
  if (!updated) {
    return res.status(404).json({ error: 'طلب الحجز غير موجود' });
  }

  res.json({
    success: true,
    booking: updated,
    message: `تم تحديث حالة الحجز ${updated.id} إلى: ${status}`
  });
});

// GET Talent Payouts Ledger
adminRouter.get('/payouts', (req: Request, res: Response) => {
  const payouts = Array.from(db.talentPayouts.values());
  const totalPendingUsd = payouts.reduce((acc, p) => acc + p.pendingBalanceUsd, 0);
  const totalPaidOutUsd = payouts.reduce((acc, p) => acc + p.paidOutUsd, 0);

  res.json({
    payouts,
    totalPendingUsd,
    totalPaidOutUsd
  });
});

// Process Talent Payout
adminRouter.post('/payouts/:talentId/process', (req: Request, res: Response) => {
  const { amount } = req.body;
  const updated = db.processTalentPayout(req.params.talentId, amount ? Number(amount) : undefined);

  if (!updated) {
    return res.status(404).json({ error: 'سجل المعلق غير موجود' });
  }

  res.json({
    success: true,
    payout: updated,
    message: `تم تسجيل تسوية المستحقات للمعلق ${updated.talentName} بنجاح`
  });
});

// Toggle Voice Active/Inactive
adminRouter.post('/voices/:id/toggle', (req: Request, res: Response) => {
  const voice = db.voices.get(req.params.id);
  if (!voice) {
    return res.status(404).json({ error: 'الصوت غير موجود' });
  }

  voice.isActive = !voice.isActive;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    companyId: 'system',
    actor: 'admin',
    action: `VOICE_TOGGLE: ${voice.name} -> ${voice.isActive ? 'ACTIVE' : 'INACTIVE'}`,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    voiceId: voice.id,
    isActive: voice.isActive,
    message: `تم تحديث حالة الصوت: ${voice.name} إلى ${voice.isActive ? 'مفعل' : 'معطل'}`
  });
});

// Update Voice details (e.g. bookingsCount, name, isActive, isFeatured)
adminRouter.post('/voices/:id/update', (req: Request, res: Response) => {
  const voice = db.voices.get(req.params.id);
  if (!voice) {
    return res.status(404).json({ error: 'الصوت غير موجود' });
  }

  const { bookingsCount, isActive, name, isFeatured } = req.body;
  if (bookingsCount !== undefined) {
    voice.bookingsCount = Number(bookingsCount);
  }
  if (isActive !== undefined) {
    voice.isActive = Boolean(isActive);
  }
  if (name !== undefined) {
    voice.name = String(name);
  }
  if (isFeatured !== undefined) {
    voice.isFeatured = Boolean(isFeatured);
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    companyId: 'system',
    actor: 'admin',
    action: `VOICE_UPDATED: ${voice.name} -> bookingsCount=${voice.bookingsCount ?? 'none'}`,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    voice,
    message: `تم تحديث بيانات الصوت ${voice.name} بنجاح`
  });
});

// Create New Voice in Catalog
adminRouter.post('/voices/create', (req: Request, res: Response) => {
  const { name, nameEn, type, gender, dialect, dialectLabel, style, styleLabel, provider, previewUrl, avatar, hasAiTwin } = req.body;

  if (!name || !dialectLabel || !previewUrl) {
    return res.status(400).json({ error: 'يرجى إدخال الحقول الإلزامية للصوت' });
  }

  const newVoiceId = `voice-${type}-${Date.now()}`;
  const newVoice: Voice = {
    id: newVoiceId,
    type: type || 'ai',
    name,
    nameEn: nameEn || name,
    gender: gender || 'male',
    language: 'ar',
    dialect: dialect || 'gulf',
    dialectLabel,
    style: style || 'commercial',
    styleLabel: styleLabel || 'رسمي واحترافي',
    useCases: ['ads', 'corporate', 'social_media'],
    provider: provider || (type === 'human' ? 'human_marketplace' : 'elevenlabs'),
    previewUrl,
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    isActive: true,
    isFeatured: false,
    createdAt: new Date().toISOString()
  };

  db.voices.set(newVoice.id, newVoice);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    companyId: 'system',
    actor: 'admin',
    action: `VOICE_CREATED: ${newVoice.name} (${newVoice.type})`,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    voice: newVoice,
    message: `تمت إضافة الصوت الجديد ${newVoice.name} بنجاح`
  });
});

// Update Company Plan
adminRouter.post('/companies/:id/update-plan', (req: Request, res: Response) => {
  const { planId } = req.body;
  const company = db.companies.get(req.params.id);
  if (!company) {
    return res.status(404).json({ error: 'الشركة غير موجودة' });
  }

  company.planId = planId;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    companyId: company.id,
    actor: 'admin',
    action: `COMPANY_PLAN_CHANGED: ${company.name} -> ${planId}`,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    company,
    message: `تم ترقية باقة الشركة ${company.name} بنجاح`
  });
});

// Grant Credits to a company
adminRouter.post('/credits/grant', (req: Request, res: Response) => {
  const { companyId, amountCredits, reason } = req.body;
  if (!companyId || !db.companies.has(companyId)) {
    return res.status(404).json({ error: 'الشركة غير موجودة' });
  }

  const amount = Number(amountCredits);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'يرجى إدخال عدد نقاط صالح' });
  }

  const newBalance = db.addCredits(
    companyId,
    'admin-user',
    amount,
    'admin_grant',
    reason || `منحة إدارية استثنائية (+${amount.toLocaleString()} نقطة)`
  );

  res.json({
    success: true,
    companyId,
    amountGranted: amount,
    newBalance,
    message: `تم إضافة ${amount.toLocaleString()} نقطة للشركة بنجاح`
  });
});

// Update System Settings
adminRouter.post('/system/settings', (req: Request, res: Response) => {
  const { platformCommissionPercent, maintenanceMode, creditRatePer10kCharsUsd } = req.body;

  if (platformCommissionPercent !== undefined) {
    db.systemSettings.platformCommissionPercent = Number(platformCommissionPercent);
  }
  if (maintenanceMode !== undefined) {
    db.systemSettings.maintenanceMode = Boolean(maintenanceMode);
  }
  if (creditRatePer10kCharsUsd !== undefined) {
    db.systemSettings.creditRatePer10kCharsUsd = Number(creditRatePer10kCharsUsd);
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    companyId: 'system',
    actor: 'admin',
    action: `SYSTEM_SETTINGS_UPDATED`,
    metadata: db.systemSettings as unknown as Record<string, unknown>,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    settings: db.systemSettings,
    message: 'تم تحديث إعدادات المنصة بنجاح'
  });
});


// ── Customers (account follow-up) ────────────────────────────────────────────
const customerSummary = (c: Company) => {
  const members = Array.from(db.users.values()).filter(u => u.companyId === c.id);
  const gens = Array.from(db.generations.values()).filter(g => g.companyId === c.id);
  const bookings = Array.from(db.humanBookings.values()).filter(b => b.companyId === c.id);
  const txs = db.creditTransactions.filter(t => t.companyId === c.id);
  const lastActivity = [c.createdAt, ...gens.map(g => g.createdAt), ...bookings.map(b => b.updatedAt), ...txs.map(t => t.createdAt)]
    .sort().pop();
  return {
    ...c,
    status: c.status || 'active',
    contactEmail: c.contactEmail || members.find(m => m.role === 'admin')?.email || members[0]?.email || '',
    ownerName: members.find(m => m.role === 'admin')?.name || members[0]?.name || '',
    balance: db.getCompanyBalance(c.id),
    membersCount: members.length,
    generationsCount: gens.length,
    charsUsed: gens.reduce((a, g) => a + (g.textChars || 0), 0),
    bookingsCount: bookings.length,
    activeBookingsCount: bookings.filter(b => b.status === 'pending' || b.status === 'in_studio').length,
    bookingsSpentUsd: bookings.reduce((a, b) => a + (b.priceUsd || 0), 0),
    purchasedCredits: txs.filter(t => t.reason === 'purchase').reduce((a, t) => a + t.delta, 0),
    lastActivityAt: lastActivity
  };
};

adminRouter.get('/customers', (_req: Request, res: Response) => {
  const customers = Array.from(db.companies.values()).map(customerSummary)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ customers });
});

adminRouter.get('/customers/:id', (req: Request, res: Response) => {
  const c = db.companies.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'العميل غير موجود' });
  const byDate = <T extends { createdAt: string }>(a: T, b: T) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  res.json({
    customer: customerSummary(c),
    members: Array.from(db.users.values()).filter(u => u.companyId === c.id),
    bookings: Array.from(db.humanBookings.values()).filter(b => b.companyId === c.id).sort(byDate),
    transactions: db.creditTransactions.filter(t => t.companyId === c.id).sort(byDate),
    generations: Array.from(db.generations.values()).filter(g => g.companyId === c.id).sort(byDate).slice(0, 30),
    notes: [...(c.notes || [])].sort(byDate)
  });
});

adminRouter.post('/customers/:id/status', (req: Request, res: Response) => {
  const c = db.companies.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'العميل غير موجود' });
  const { status } = req.body;
  if (status !== 'active' && status !== 'suspended') return res.status(400).json({ error: 'حالة غير صالحة' });
  c.status = status;
  db.auditLogs.unshift({ id: `log-${Date.now()}`, companyId: c.id, actor: 'admin', action: `CUSTOMER_${status.toUpperCase()}: ${c.name}`, createdAt: new Date().toISOString() });
  res.json({ success: true, customer: customerSummary(c) });
});

adminRouter.post('/customers/:id/notes', (req: Request, res: Response) => {
  const c = db.companies.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'العميل غير موجود' });
  const text = String(req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'الملاحظة فارغة' });
  const note = { id: `note-${Date.now()}`, text, author: 'admin', createdAt: new Date().toISOString() };
  c.notes = [note, ...(c.notes || [])];
  res.json({ success: true, note });
});

// ── TTS studio: every generation on the platform ─────────────────────────────
const generationRow = (g: Generation) => {
  const usage = db.usageRecords.get(g.id);
  return {
    ...g,
    companyName: db.companies.get(g.companyId)?.name || g.companyId,
    userName: db.users.get(g.userId)?.name || g.userId,
    costUsd: usage?.costUsd ?? 0
  };
};

// Narrators' earnings from TTS studio uses (admin earnings breakdown)
adminRouter.get('/narrator-earnings', (_req: Request, res: Response) => {
  res.json({ earnings: Array.from(db.narratorEarnings.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

adminRouter.get('/generations', (_req: Request, res: Response) => {
  const generations = Array.from(db.generations.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(generationRow);
  res.json({ generations });
});

// ── Settings pages (currency, fees, payment gateway, SMTP, maintenance) ──────
const SECRET_FIELDS: Record<string, string[]> = { stripe: ['liveSecretKey', 'testSecretKey'], smtp: ['password'] };
const mask = (v: string) => (v ? `••••${v.slice(-4)}` : '');

/** Secrets are never sent back: only a masked hint ("••••abcd"). */
const publicIntegrations = () => {
  const out: Record<string, any> = {};
  for (const [group, values] of Object.entries(db.integrations)) {
    out[group] = { ...values };
    for (const f of SECRET_FIELDS[group] || []) { out[group][f] = ''; out[group][`${f}Hint`] = mask((values as any)[f]); }
  }
  return out;
};

adminRouter.get('/settings', (_req: Request, res: Response) => {
  res.json({ settings: db.systemSettings, integrations: publicIntegrations() });
});

adminRouter.post('/settings', (req: Request, res: Response) => {
  const { settings = {}, integrations = {} } = req.body || {};
  const s = db.systemSettings;
  if (settings.platformCommissionPercent !== undefined) {
    const v = Number(settings.platformCommissionPercent);
    if (!(v >= 0 && v <= 100)) return res.status(400).json({ error: 'نسبة رسوم المنصة يجب أن تكون بين 0 و 100' });
    s.platformCommissionPercent = v;
  }
  if (settings.stripeFeePercent !== undefined) {
    const v = Number(settings.stripeFeePercent);
    if (!(v >= 0 && v <= 100)) return res.status(400).json({ error: 'نسبة رسوم سترايب يجب أن تكون بين 0 و 100' });
    s.stripeFeePercent = v;
  }
  if (settings.defaultCurrency) s.defaultCurrency = String(settings.defaultCurrency).toUpperCase().slice(0, 3);
  if (settings.maintenanceMode !== undefined) s.maintenanceMode = Boolean(settings.maintenanceMode);
  if (settings.creditRatePer10kCharsUsd !== undefined) s.creditRatePer10kCharsUsd = Number(settings.creditRatePer10kCharsUsd);

  const changedGroups: string[] = [];
  for (const group of Object.keys(db.integrations) as (keyof typeof db.integrations)[]) {
    const incoming = integrations[group];
    if (!incoming) continue;
    const target = db.integrations[group] as Record<string, any>;
    for (const [k, v] of Object.entries(incoming)) {
      if (!(k in target)) continue;
      // empty secret = keep the stored one
      if ((SECRET_FIELDS[group] || []).includes(k) && (v === '' || v === undefined)) continue;
      target[k] = typeof target[k] === 'number' ? Number(v) : typeof target[k] === 'boolean' ? Boolean(v) : String(v ?? '').trim();
    }
    changedGroups.push(group);
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`, companyId: 'system', actor: 'admin',
    action: `SETTINGS_UPDATED${changedGroups.length ? ` (${changedGroups.join(', ')})` : ''}`,
    metadata: { ...s } as unknown as Record<string, unknown>,
    createdAt: new Date().toISOString()
  });
  res.json({ success: true, settings: s, integrations: publicIntegrations() });
});

// ── Voice reviews (client ratings of booked voices, published after approval) ─
const sampleName = (id?: string) => (id && collections.list('humanVoices').find(v => v.id === id)?.sampleName) || '';

adminRouter.get('/reviews', (_req: Request, res: Response) => {
  const reviews = Array.from(db.humanBookings.values())
    .filter(b => b.review)
    .map(b => ({ bookingId: b.id, sampleId: b.sampleId, sampleName: sampleName(b.sampleId) || b.talentName, talentName: b.talentName, companyName: b.companyName, ...b.review! }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ reviews });
});

adminRouter.post('/reviews/:bookingId', (req: Request, res: Response) => {
  const b = db.humanBookings.get(req.params.bookingId);
  if (!b?.review) return res.status(404).json({ error: 'التقييم غير موجود' });
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'حالة غير صالحة' });
  b.review.status = status;
  db.auditLogs.unshift({ id: `log-${Date.now()}`, companyId: b.companyId, actor: 'admin', action: `REVIEW_${status.toUpperCase()}: ${b.id}`, createdAt: new Date().toISOString() });
  res.json({ success: true, review: b.review });
});
