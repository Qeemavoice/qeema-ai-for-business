import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { PLANS } from '../../shared/plans';
import { getAuthenticatedContext } from './auth';

export const creditsRouter = Router();

// GET credit balance and ledger transactions
creditsRouter.get('/', (req: Request, res: Response) => {
  const { company, user, balance } = getAuthenticatedContext(req);

  const transactions = db.creditTransactions
    .filter(tx => tx.companyId === company.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    balanceCredits: balance,
    unitRule: '1 Credit = 1 Arabic/English Character',
    company: {
      id: company.id,
      name: company.name,
      planId: company.planId
    },
    transactions
  });
});

// POST top-up credit pack
creditsRouter.post('/topup', (req: Request, res: Response) => {
  const { company, user } = getAuthenticatedContext(req);
  const { packId, paymentMethod = 'card' } = req.body;

  // Packs = the paid plans on the pricing page (shared/plans.ts)
  const plan = PLANS.find(p => p.id === packId && p.priceUsd && p.monthlyCredits);
  if (!plan) return res.status(400).json({ error: 'الباقة المختارة غير متاحة' });
  const selected = { credits: plan.monthlyCredits, price: plan.priceUsd!, name: `باقة ${plan.nameAr}` };
  company.planId = plan.id;

  const newBalance = db.addCredits(
    company.id,
    user.id,
    selected.credits,
    'purchase',
    `شحن رصيد: ${selected.name} (${selected.price} USD عبر ${paymentMethod})`,
    `pay-${Date.now()}`
  );

  res.json({
    success: true,
    addedCredits: selected.credits,
    newBalanceCredits: newBalance,
    message: `تم إضافة ${selected.credits.toLocaleString()} نقطة إلى محفظة الشركة بنجاح.`
  });
});
