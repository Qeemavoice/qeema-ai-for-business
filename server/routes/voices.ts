import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { Voice, VoiceType, DialectCode, VoiceGender } from '../types';

export const voicesRouter = Router();

// GET all voices with filtering
/** Customers never see the provider voice id, the owner narrator or his share. */
const publicVoice = ({ providerVoiceId, narratorId, narratorSharePercent, ...rest }: Voice) => rest;

voicesRouter.get('/', (req: Request, res: Response) => {
  const { type, dialect, gender, search, useCase, style } = req.query;

  let list = Array.from(db.voices.values());

  // Filter active
  list = list.filter(v => v.isActive);

  // Filter by Type: 'human' | 'ai'
  if (type && type !== 'all') {
    list = list.filter(v => v.type === (type as VoiceType));
  }

  // Filter by Dialect
  if (dialect && dialect !== 'all') {
    list = list.filter(v => v.dialect === (dialect as DialectCode));
  }

  // Filter by Gender
  if (gender && gender !== 'all') {
    list = list.filter(v => v.gender === (gender as VoiceGender));
  }

  // Filter by UseCase
  if (useCase && useCase !== 'all') {
    list = list.filter(v => v.useCases.includes(useCase as any));
  }

  // Search keyword (matches name, nameEn, dialectLabel, styleLabel)
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(v =>
      v.name.toLowerCase().includes(q) ||
      (v.nameEn && v.nameEn.toLowerCase().includes(q)) ||
      v.dialectLabel.toLowerCase().includes(q) ||
      v.styleLabel.toLowerCase().includes(q)
    );
  }

  res.json({
    total: list.length,
    voices: list.map(publicVoice),
    metadata: {
      dialects: [
        { code: 'all', labelAr: 'كافة اللهجات' },
        { code: 'gulf', labelAr: 'خليجي / سعودي' },
        { code: 'egyptian', labelAr: 'مصري' },
        { code: 'levantine', labelAr: 'شامي' },
        { code: 'maghrebi', labelAr: 'مغاربي' },
        { code: 'fusha', labelAr: 'فصحى معيارية' },
      ],
      types: [
        { code: 'all', labelAr: 'الكل (Human + AI)' },
        { code: 'ai', labelAr: 'أصوات الذكاء الاصطناعي (AI)' },
        { code: 'human', labelAr: 'أصوات المعلقين البشريين' },
      ],
    }
  });
});

// GET single voice by ID
voicesRouter.get('/:id', (req: Request, res: Response) => {
  const voice = db.voices.get(req.params.id);
  if (!voice) {
    return res.status(404).json({ error: 'الصوت غير موجود' });
  }
  res.json(publicVoice(voice));
});
