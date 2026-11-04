import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { getAuthenticatedContext } from './auth';

export const usageRouter = Router();

usageRouter.get('/', (req: Request, res: Response) => {
  const { company } = getAuthenticatedContext(req);

  const generations = Array.from(db.generations.values()).filter(g => g.companyId === company.id);
  const usageRecords = Array.from(db.usageRecords.values()).filter(u => u.companyId === company.id);

  const totalGenerations = generations.length;
  const totalCharacters = generations.reduce((acc, g) => acc + g.textChars, 0);
  const totalCredits = generations.reduce((acc, g) => acc + g.creditsConsumed, 0);
  const totalAudioSeconds = generations.reduce((acc, g) => acc + g.durationSeconds, 0);

  // Group by Dialect
  const dialectBreakdown: Record<string, { label: string; count: number; characters: number }> = {
    gulf: { label: 'خليجي / سعودي', count: 0, characters: 0 },
    egyptian: { label: 'مصري', count: 0, characters: 0 },
    levantine: { label: 'شامي', count: 0, characters: 0 },
    maghrebi: { label: 'مغاربي', count: 0, characters: 0 },
    fusha: { label: 'فصحى معيارية', count: 0, characters: 0 }
  };

  // Group by Voice
  const voiceBreakdown: Record<string, { name: string; count: number; characters: number }> = {};

  generations.forEach(g => {
    if (dialectBreakdown[g.dialect]) {
      dialectBreakdown[g.dialect].count += 1;
      dialectBreakdown[g.dialect].characters += g.textChars;
    }

    if (!voiceBreakdown[g.voiceId]) {
      voiceBreakdown[g.voiceId] = { name: g.voiceName, count: 0, characters: 0 };
    }
    voiceBreakdown[g.voiceId].count += 1;
    voiceBreakdown[g.voiceId].characters += g.textChars;
  });

  // Top voice
  const sortedVoices = Object.values(voiceBreakdown).sort((a, b) => b.characters - a.characters);
  const topVoice = sortedVoices[0] || { name: 'لا يوجد بعد', count: 0, characters: 0 };

  res.json({
    metrics: {
      totalGenerations,
      totalCharacters,
      totalCredits,
      totalAudioMinutes: Number((totalAudioSeconds / 60).toFixed(1)),
      topVoiceName: topVoice.name,
    },
    dialectBreakdown: Object.entries(dialectBreakdown).map(([code, data]) => ({
      code,
      ...data
    })),
    topVoices: sortedVoices.slice(0, 5),
    recentRecords: usageRecords.slice(-10).reverse()
  });
});
