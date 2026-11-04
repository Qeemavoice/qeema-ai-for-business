import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { getAuthenticatedContext } from './auth';

export const billingRouter = Router();

// GET billing details, current plan, invoices
billingRouter.get('/', (req: Request, res: Response) => {
  const { company, user, balance } = getAuthenticatedContext(req);

  const currentPlan = db.plans.find(p => p.id === company.planId) || db.plans[0];
  const invoices = db.creditTransactions
    .filter(tx => tx.companyId === company.id && tx.delta > 0)
    .map(tx => ({
      id: `INV-${tx.id.slice(0, 8).toUpperCase()}`,
      date: tx.createdAt,
      description: tx.description,
      creditsAdded: tx.delta,
      amountUsd: tx.reason === 'signup_bonus' ? 0 : (currentPlan.priceUsd ?? 0),
      status: 'paid',
      downloadUrl: '#'
    }));

  res.json({
    company,
    currentPlan,
    availablePlans: db.plans,
    balanceCredits: balance,
    invoices
  });
});

// POST change/upgrade plan
billingRouter.post('/change-plan', (req: Request, res: Response) => {
  const { company, user } = getAuthenticatedContext(req);
  const { planId } = req.body;

  const targetPlan = db.plans.find(p => p.id === planId);
  if (!targetPlan) {
    return res.status(404).json({ error: 'الخطة غير متوفرة' });
  }

  // Custom (sales-led) plans can't be activated from the dashboard
  if (targetPlan.isCustom) {
    return res.status(400).json({ error: 'باقة الشركات بتسعير مخصص، تواصل مع فريق المبيعات لتفعيلها' });
  }

  company.planId = targetPlan.id;

  // Grant the monthly plan credits (free plan grants none)
  const newBalance = targetPlan.monthlyCredits > 0
    ? db.addCredits(
        company.id,
        user.id,
        targetPlan.monthlyCredits,
        'purchase',
        `تجديد/ترقية الاشتراك إلى ${targetPlan.nameAr} (+${targetPlan.monthlyCredits.toLocaleString('en-US')} حرف)`
      )
    : db.getCompanyBalance(company.id);

  res.json({
    success: true,
    company,
    currentPlan: targetPlan,
    newBalanceCredits: newBalance,
    message: `تم الترقية بنجاح إلى ${targetPlan.nameAr}`
  });
});
