import { useEffect, useSyncExternalStore } from 'react';
import { DIALECTS } from '../data/dialects';
import { VOICE_CATEGORY_FILTERS } from '../data/humanVoices';

/** Lists edited in the dashboard (الخدمات / اللهجات واللغات / التصنيفات); built-in defaults until the API answers */
export interface SiteLists {
  services: { title: string; slug: string }[];
  dialects: { key: string; flag: string; type: string }[];
  categories: string[];
}

let lists: SiteLists = {
  services: [
    { title: 'خدمة الدوبلاج العربي', slug: '/ar/services/dubbing' },
    { title: 'تسجيل الكتب الصوتية', slug: '/ar/voice-models/audiobooks' },
    { title: 'إنتاج مقدمات البودكاست', slug: '/ar/voice-models/podcast' },
    { title: 'تسجيلات الرد الآلي', slug: '/ar/voice-models/ivr' }
  ],
  dialects: DIALECTS.map(d => ({ key: d.key, flag: d.flag, type: d.key.startsWith('إنجليزي') ? 'لغة' : 'لهجة' })),
  categories: VOICE_CATEGORY_FILTERS.filter(c => c.key !== 'all').map(c => c.key)
};
let requested = false;
const listeners = new Set<() => void>();

const load = () => {
  if (requested) return;
  requested = true;
  fetch('/api/v1/site-lists')
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then((data: SiteLists) => {
      lists = {
        services: data.services?.length ? data.services : lists.services,
        dialects: data.dialects?.length ? data.dialects : lists.dialects,
        categories: data.categories?.length ? data.categories : lists.categories
      };
      listeners.forEach(l => l());
    })
    .catch(() => { requested = false; });
};

export const useSiteLists = (): SiteLists => {
  useEffect(load, []);
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => lists);
};
