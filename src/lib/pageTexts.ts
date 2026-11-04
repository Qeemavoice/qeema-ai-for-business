import { useEffect, useSyncExternalStore } from 'react';
import { PAGE_TEXTS, type PageText } from '../data/pageTexts';

/** Page header texts as edited in the dashboard (نصوص الصفحات), fetched once; built-in defaults until the API answers. */
let texts: PageText[] = PAGE_TEXTS;
let requested = false;
const listeners = new Set<() => void>();

const load = () => {
  if (requested) return;
  requested = true;
  fetch('/api/v1/page-texts')
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(({ items }: { items: PageText[] }) => {
      if (!items?.length) return;
      texts = items;
      listeners.forEach(l => l());
    })
    .catch(() => { requested = false; });
};

export const usePageText = (key: string): { title: string; intro: string } => {
  useEffect(load, []);
  const all = useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => texts);
  const def = PAGE_TEXTS.find(t => t.key === key);
  const saved = all.find(t => t.key === key);
  return {
    title: saved?.title || def?.title || '',
    intro: saved?.intro ?? def?.intro ?? ''
  };
};
