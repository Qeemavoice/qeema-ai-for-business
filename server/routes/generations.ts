import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { getAuthenticatedContext } from './auth';
import { ProviderManager } from '../providers/ProviderManager';
import { Generation, GenerationSettings } from '../types';
import crypto from 'crypto';
import { PLANS } from '../../shared/plans';

const round4 = (n: number) => Math.round(n * 10000) / 10000;
/** Cash value of one credit (= one character) on the customer's plan; free / custom plans have none. */
const creditPriceUsd = (planId?: string) => {
  const plan = PLANS.find(p => p.id === planId);
  return plan && plan.priceUsd && plan.monthlyCredits ? plan.priceUsd / plan.monthlyCredits : 0;
};

export const generationsRouter = Router();
const providerManager = ProviderManager.getInstance();

// POST: Generate Speech (AI TTS)
generationsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { company, user, balance } = getAuthenticatedContext(req);
    const { voiceId, text, settings = {} } = req.body;

    // 1. Validate Input
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'يرجى إدخال النص المطلوب تحويله إلى صوت' });
    }

    const cleanText = text.trim();
    const charsCount = cleanText.length;

    if (charsCount < 2) {
      return res.status(400).json({ error: 'النص قصير جداً. يرجى إدخال كلمتين على الأقل.' });
    }

    if (charsCount > 5000) {
      return res.status(400).json({ error: 'الحد الأقصى للتوليد في المرة الواحدة هو 5,000 حرف.' });
    }

    // 2. Validate Voice
    const voice = db.voices.get(voiceId);
    if (!voice) {
      return res.status(404).json({ error: 'الصوت المحدد غير موجود' });
    }

    if (voice.type !== 'ai') {
      return res.status(400).json({ 
        error: 'الصوت المختار هو صوت بشري من السوق. للأصوات البشرية يرجى إرسال طلب حجز مباشر.',
        action: 'book_human' 
      });
    }

    // 3. Pre-flight Balance & Credit Calculation
    // Rule: 1 Credit = 1 Character
    const requiredCredits = providerManager.estimateCredits(cleanText);

    if (balance < requiredCredits) {
      return res.status(402).json({
        error: `رصيد الشركة غير كافٍ. يتطلب هذا النص ${requiredCredits} نقطة، ورصيدك الحالي هو ${balance} نقطة.`,
        requiredCredits,
        currentBalance: balance,
        suggestedAction: 'topup_credits'
      });
    }

    // 4. Synthesize Audio via Provider Abstraction
    const generationSettings: GenerationSettings = {
      speed: Number(settings.speed) || 1.0,
      stability: Number(settings.stability) || 0.7,
      style: Number(settings.style) || 0.5,
      pitch: Number(settings.pitch) || 0,
      format: settings.format === 'wav' ? 'wav' : 'mp3'
    };

    const synthResult = await providerManager.synthesize({
      text: cleanText,
      voice,
      settings: generationSettings,
      companyId: company.id,
      userId: user.id
    });

    // 5. Store Audio in Cloud/Secure Storage
    const generationId = `gen-${crypto.randomUUID()}`;
    const filename = `${generationId}.${synthResult.mimeType.includes('wav') ? 'wav' : 'mp3'}`;

    db.audioFiles.set(generationId, {
      buffer: synthResult.audioBuffer,
      mimeType: synthResult.mimeType,
      filename
    });

    const audioUrl = `/api/v1/storage/audio/${generationId}`;

    // 6. Deduct Credits from Ledger (Atomically)
    const deductionSuccess = db.deductCredits(
      company.id,
      user.id,
      requiredCredits,
      generationId,
      `توليد صوت ذكاء اصطناعي (${voice.name}) — ${charsCount} حرف`
    );

    if (!deductionSuccess) {
      return res.status(402).json({ error: 'تعذر خصم الرصيد بسبب رصيد غير كافٍ' });
    }

    // 7. Save Generation Record
    const generation: Generation = {
      id: generationId,
      companyId: company.id,
      userId: user.id,
      voiceId: voice.id,
      voiceName: voice.name,
      voiceType: voice.type,
      dialect: voice.dialect,
      text: cleanText,
      textChars: charsCount,
      settings: generationSettings,
      provider: synthResult.provider,
      model: synthResult.model,
      audioUrl,
      storagePath: `supabase-storage://qeema-audio/${filename}`,
      durationSeconds: synthResult.durationSeconds,
      status: 'completed',
      creditsConsumed: requiredCredits,
      createdAt: new Date().toISOString()
    };

    db.generations.set(generationId, generation);

    // 8. Record Usage
    db.usageRecords.set(generationId, {
      id: crypto.randomUUID(),
      companyId: company.id,
      userId: user.id,
      generationId,
      feature: 'tts',
      provider: synthResult.provider,
      model: synthResult.model,
      inputUnits: charsCount,
      outputUnits: synthResult.durationSeconds,
      creditsConsumed: requiredCredits,
      costUsd: synthResult.costUsd,
      createdAt: generation.createdAt
    });

    // 9. The voice's owner earns his share of what the customer paid for these credits
    if (voice.narratorId) {
      const grossUsd = round4(requiredCredits * creditPriceUsd(company.planId));
      const sharePercent = voice.narratorSharePercent ?? 0;
      const narratorUsd = round4((grossUsd * sharePercent) / 100);
      db.narratorEarnings.set(generationId, {
        id: crypto.randomUUID(), narratorId: voice.narratorId, voiceId: voice.id, voiceName: voice.name, generationId,
        companyId: company.id, chars: charsCount, grossUsd, sharePercent, narratorUsd, platformUsd: round4(grossUsd - narratorUsd),
        createdAt: generation.createdAt
      });
    }

    const newBalance = db.getCompanyBalance(company.id);

    return res.json({
      success: true,
      generation,
      newBalanceCredits: newBalance,
      message: `تم توليد الصوت بنجاح واستهلاك ${requiredCredits} نقطة.`
    });

  } catch (err: any) {
    console.error('[GenerationsRouter] Generation error:', err);
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء معالجة الصوت. لم يتم خصم أي رصيد من حسابك.',
      details: err?.message 
    });
  }
});

// GET: List Generations for Current Company ("My Audio")
generationsRouter.get('/', (req: Request, res: Response) => {
  const { company } = getAuthenticatedContext(req);

  const list = Array.from(db.generations.values())
    .filter(g => g.companyId === company.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    total: list.length,
    generations: list
  });
});

// GET single generation
generationsRouter.get('/:id', (req: Request, res: Response) => {
  const gen = db.generations.get(req.params.id);
  if (!gen) {
    return res.status(404).json({ error: 'التسجيل غير موجود' });
  }
  res.json(gen);
});

// DELETE generation
generationsRouter.delete('/:id', (req: Request, res: Response) => {
  const { company } = getAuthenticatedContext(req);
  const gen = db.generations.get(req.params.id);

  if (!gen || gen.companyId !== company.id) {
    return res.status(404).json({ error: 'التسجيل غير موجود' });
  }

  db.generations.delete(req.params.id);
  db.audioFiles.delete(req.params.id);

  res.json({ success: true, message: 'تم حذف التسجيل بنجاح' });
});
