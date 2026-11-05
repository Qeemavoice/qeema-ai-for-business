import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { Voice, DialectCode } from '../types';

/** TTS studio voices are uploaded by the admin team (the studio's voice list = active type 'ai' voices). */
export const ttsVoicesRouter = Router();

const DIALECTS: DialectCode[] = ['gulf', 'egyptian', 'levantine', 'maghrebi', 'fusha'];
const PROVIDERS = ['elevenlabs', 'qeema_acoustic'] as const;
const MAX_PREVIEW_CHARS = 8 * 1024 * 1024; // data URL of a ~6MB audio file
const DEFAULT_SHARE_PERCENT = 40;
/** what the client sees as the dialect (one field «اللهجة» in the admin form) */
const DIALECT_AR: Record<DialectCode, string> = { gulf: 'خليجي', egyptian: 'مصري', levantine: 'شامي', maghrebi: 'مغاربي', fusha: 'فصحى' };

const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/** Validated fields shared by create and update. Returns an error message or the clean fields. */
const parse = (b: any, creating: boolean): { error: string } | { fields: Partial<Voice> } => {
  const f: Partial<Voice> = {};
  if (creating || b.name !== undefined) { f.name = text(b.name, 80); if (!f.name) return { error: 'اسم المقطع مطلوب' }; }
  if (b.gender !== undefined) f.gender = b.gender === 'female' ? 'female' : 'male';
  if (b.dialect !== undefined) {
    if (!DIALECTS.includes(b.dialect)) return { error: 'لهجة غير صالحة' };
    f.dialect = b.dialect;
    if (b.dialectLabel === undefined) f.dialectLabel = DIALECT_AR[b.dialect as DialectCode];
  }
  if (b.dialectLabel !== undefined) f.dialectLabel = text(b.dialectLabel, 60);
  if (b.styleLabel !== undefined) f.styleLabel = text(b.styleLabel, 60);
  if (b.provider !== undefined) { if (!PROVIDERS.includes(b.provider)) return { error: 'مزوّد غير صالح' }; f.provider = b.provider; }
  if (b.providerVoiceId !== undefined) f.providerVoiceId = text(b.providerVoiceId, 80);
  if (b.previewUrl !== undefined) {
    const url = String(b.previewUrl || '');
    if (url.length > MAX_PREVIEW_CHARS) return { error: 'حجم العينة الصوتية كبير (الحد 6MB)' };
    f.previewUrl = url;
  }
  if (b.avatar !== undefined) f.avatar = text(b.avatar, 500);
  // every voice belongs to a narrator (internal only: never sent to clients)
  if (creating || b.narratorId !== undefined) {
    f.narratorId = text(b.narratorId, 80) || undefined;
    if (!f.narratorId) return { error: 'اختر المعلق صاحب الصوت' };
  }
  if (b.narratorSharePercent !== undefined) {
    const n = Number(b.narratorSharePercent);
    if (!(n >= 0 && n <= 100)) return { error: 'نسبة المعلق يجب أن تكون بين 0 و100' };
    f.narratorSharePercent = n;
  }
  if (b.isActive !== undefined) f.isActive = !!b.isActive;
  return { fields: f };
};

ttsVoicesRouter.get('/', (_req: Request, res: Response) => {
  res.json({ voices: Array.from(db.voices.values()).filter(v => v.type === 'ai').sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

ttsVoicesRouter.post('/', (req: Request, res: Response) => {
  const parsed = parse(req.body, true);
  if ('error' in parsed) return res.status(400).json({ error: parsed.error });
  const f = parsed.fields;
  const provider = f.provider || 'qeema_acoustic';   // own voices: the uploaded sample, no ElevenLabs id
  if (provider === 'elevenlabs' && !f.providerVoiceId) return res.status(400).json({ error: 'معرّف الصوت في ElevenLabs (voice_id) مطلوب' });
  if (!f.previewUrl) return res.status(400).json({ error: 'العينة الصوتية مطلوبة' });
  const voice: Voice = {
    id: `voice-ai-${Date.now()}`,
    type: 'ai',
    name: f.name!,
    gender: f.gender || 'male',
    language: 'ar',
    dialect: f.dialect || 'gulf',
    dialectLabel: f.dialectLabel || DIALECT_AR[f.dialect || 'gulf'],
    style: 'commercial',
    styleLabel: f.styleLabel || 'رسمي واحترافي',
    useCases: ['ads', 'corporate', 'social_media'],
    provider,
    providerVoiceId: f.providerVoiceId,
    previewUrl: f.previewUrl,
    avatar: f.avatar || '',
    isActive: f.isActive ?? true,
    narratorId: f.narratorId,
    narratorSharePercent: f.narratorId ? (f.narratorSharePercent ?? DEFAULT_SHARE_PERCENT) : undefined,
    createdAt: new Date().toISOString()
  };
  db.voices.set(voice.id, voice);
  res.json({ voice });
});

ttsVoicesRouter.put('/:id', (req: Request, res: Response) => {
  const voice = db.voices.get(req.params.id);
  if (!voice || voice.type !== 'ai') return res.status(404).json({ error: 'الصوت غير موجود' });
  const parsed = parse(req.body, false);
  if ('error' in parsed) return res.status(400).json({ error: parsed.error });
  Object.assign(voice, parsed.fields);
  if (!voice.narratorId) voice.narratorSharePercent = undefined;
  res.json({ voice });
});
