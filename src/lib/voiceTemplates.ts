import { useEffect, useSyncExternalStore } from 'react';
import { VOICE_TEMPLATES, type VoiceTemplate } from '../data/voiceTemplates';

/** Published templates as managed in the dashboard (نماذج الإنتاج الصوتي), fetched once; built-in list until the API answers. */
let templates: VoiceTemplate[] = VOICE_TEMPLATES;
let requested = false;
const listeners = new Set<() => void>();

const load = () => {
  if (requested) return;
  requested = true;
  fetch('/api/v1/voice-templates')
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(({ items }: { items: VoiceTemplate[] }) => { templates = items; listeners.forEach(l => l()); })
    .catch(() => { requested = false; });
};

export const useVoiceTemplates = (): VoiceTemplate[] => {
  useEffect(load, []);
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => templates);
};

/** Internal path -> client-side route; full URL -> new tab. Returns false when there is no link. */
export const openTemplateLink = (link: string, navigate: (to: string) => void): boolean => {
  const url = (link || '').trim();
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener,noreferrer');
  else navigate(url.startsWith('/') ? url : `/${url}`);
  return true;
};
