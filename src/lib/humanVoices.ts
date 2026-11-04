import { useEffect, useSyncExternalStore } from 'react';
import { HUMAN_VOICE_SAMPLES, type UnifiedVoiceItem } from '../data/humanVoices';
import { fmtUsd } from '../../shared/pricing';

/**
 * Human voice samples as managed in the dashboard (الأصوات), fetched once per page load.
 * The built-in catalog is shown until the API answers (and if it fails).
 */
let samples: UnifiedVoiceItem[] = HUMAN_VOICE_SAMPLES;
let requested = false;
const listeners = new Set<() => void>();

const defaults = (v: any): UnifiedVoiceItem => ({
  name: v.talentName || '', subtitle: '', gender: 'male', language: 'العربية', flag: '🎙️', accent: v.dialect || '',
  extraAccentsCount: 0, license: 'ترخيص تجاري شامل', licenseTooltip: '', usageCount: '0', category: v.categories?.[0] || '',
  categoryKey: 'custom', glassGradient: 'radial-gradient(circle at 30% 30%, #FFA513 0%, #7c2d12 60%, #1c1917 100%)',
  previewUrl: '', isVerified: true, isHuman: true, ...v
});

const load = () => {
  if (requested) return;
  requested = true;
  fetch('/api/v1/human-voices')
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(({ items }) => {
      if (!items?.length) return;
      samples = items.map((v: any) => ({
        ...defaults(v),
        name: v.talentName || v.name,
        tags: v.categories?.length ? v.categories : v.tags,
        pricing: `$${fmtUsd(v.finalPriceUsd)} / دقيقة`
      }));
      listeners.forEach(l => l());
    })
    .catch(() => { requested = false; });
};

export const useHumanVoices = (): UnifiedVoiceItem[] => {
  useEffect(load, []);
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => samples);
};

/** The sample file uploaded in the dashboard, or '' when the voice still has the seed placeholder track. */
export const realSampleUrl = (url?: string) => (!url || url.includes('pixabay.com/download/audio/2022/03/15/audio_c8c8a73467') ? '' : url);
