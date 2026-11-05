import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { Voice, VoiceType, DialectCode, VoiceGender } from '../types';
import { ProviderManager } from '../providers/ProviderManager';

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
/** Listen sample for a studio voice: the uploaded file if any, otherwise one sentence synthesized once and cached. */
const PREVIEW_TEXT = 'مرحباً بكم في قيمة فويس، منصة الصوت العربي بجودة استوديو.';
voicesRouter.get('/:id/preview', async (req: Request, res: Response) => {
  const voice = db.voices.get(req.params.id);
  if (!voice || !voice.isActive || voice.type !== 'ai') return res.status(404).json({ error: 'الصوت غير موجود' });
  if (voice.previewUrl) return res.redirect(voice.previewUrl.startsWith('data:') ? `/api/v1/voices/${voice.id}/file` : voice.previewUrl);
  const key = `preview-${voice.id}`;
  try {
    let file = db.audioFiles.get(key);
    if (!file) {
      const synth = await ProviderManager.getInstance().synthesize({
        text: PREVIEW_TEXT, voice, settings: { speed: 1, stability: 0.7, style: 0.5, pitch: 0, format: 'mp3' }, companyId: 'preview', userId: 'system'
      });
      file = { buffer: synth.audioBuffer, mimeType: synth.mimeType, filename: `${key}.mp3` };
      db.audioFiles.set(key, file);
    }
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(file.buffer);
  } catch (err) {
    console.error('Voice preview failed:', err);
    res.status(500).json({ error: 'تعذر تجهيز العينة' });
  }
});

/** Uploaded sample stored as a data URL in the dashboard, served as audio. */
voicesRouter.get('/:id/file', (req: Request, res: Response) => {
  const m = /^data:([^;]+);base64,(.*)$/.exec(db.voices.get(req.params.id)?.previewUrl || '');
  if (!m) return res.status(404).end();
  res.setHeader('Content-Type', m[1]);
  res.send(Buffer.from(m[2], 'base64'));
});

voicesRouter.get('/:id', (req: Request, res: Response) => {
  const voice = db.voices.get(req.params.id);
  if (!voice) {
    return res.status(404).json({ error: 'الصوت غير موجود' });
  }
  res.json(publicVoice(voice));
});
