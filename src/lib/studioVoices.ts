import { useEffect, useState } from 'react';

/** English dialect / style tags of the Munsit catalogue in Arabic (unknown tags pass through) */
const AR: Record<string, string> = {
  emirati: 'إماراتي', najdi: 'نجدي', kuwaiti: 'كويتي', american: 'أمريكي', fusha: 'فصحى', hijazi: 'حجازي', omani: 'عماني',
  british: 'بريطاني', indian: 'هندي', australian: 'أسترالي', ireland: 'أيرلندي', irish: 'أيرلندي', bahraini: 'بحريني', qatari: 'قطري',
  saudi: 'سعودي', egyptian: 'مصري', levantine: 'شامي', syrian: 'سوري', lebanese: 'لبناني', jordanian: 'أردني', iraqi: 'عراقي', moroccan: 'مغربي',
  conversational: 'محادثة', narration: 'سرد', educational: 'تعليمي', documentary: 'وثائقي', news: 'أخبار', broadcast: 'إذاعي',
  social_media: 'سوشال ميديا', advertising: 'إعلاني', commercial: 'تجاري', storytelling: 'قصصي', audiobook: 'كتب صوتية', corporate: 'شركات',
};
export const arLabel = (s: string) => s.split(/[،,]\s*/).filter(Boolean).map(w => AR[w.trim().toLowerCase()] || w.trim()).join('، ');

export interface MunsitVoice { id: string; code: string; name: string; dialect: string; gender: string; style: string; description: string; previewUrl: string }

let cache: Promise<MunsitVoice[]> | null = null;
/** Munsit voices (/api/v1/tts/munsit-voices), fetched once per page load; [] when Munsit is not set up */
export const useMunsitVoices = () => {
  const [voices, setVoices] = useState<MunsitVoice[]>([]);
  useEffect(() => {
    cache ??= fetch('/api/v1/tts/munsit-voices').then(r => (r.ok ? r.json() : null)).then(d => (d?.voices || []).map((v: any) => ({
      id: v.id, code: v.code || '', name: v.name, dialect: v.dialect || '', gender: v.gender, style: v.style || '', description: v.description || '', previewUrl: v.previewUrl || '',
    }))).catch(() => []);
    let live = true;
    cache.then(v => live && setVoices(v));
    return () => { live = false; };
  }, []);
  return voices;
};
