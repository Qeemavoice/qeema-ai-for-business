import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useVoiceTemplates } from '../lib/voiceTemplates';
import type { VoiceTemplate } from '../data/voiceTemplates';
import { TemplateRequestModal } from './TemplateRequestModal';

/** Site cards for "نماذج الإنتاج الصوتي". The card opens its admin-set link (service page); «اطلب هذا النموذج» suggests voices. */
export const VoiceTemplatesGrid: React.FC<{ limit?: number }> = ({ limit }) => {
  const templates = useVoiceTemplates().slice(0, limit);
  const [requested, setRequested] = useState<VoiceTemplate | null>(null);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map(t => {
          const link = (t.link || '').trim();
          const external = /^https?:\/\//i.test(link);
          const body = (
            <>
              <div className="h-40 relative overflow-hidden bg-brand-ink">
                {t.img && (
                  <img src={t.img} alt={t.title} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/50 to-brand-ink/10" />
                {t.tag && (
                  <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white border border-white/20">{t.tag}</span>
                )}
              </div>
              <div className="px-4 pt-4 space-y-1.5">
                <h3 className="text-base font-black text-slate-900 group-hover:text-brand-text transition-colors">{t.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
              </div>
            </>
          );
          const cls = 'group block';
          return (
            <div key={t.id} className="rounded-3xl overflow-hidden border border-slate-200 bg-white hover:border-brand/50 hover:shadow-md transition-all flex flex-col">
              {!link
                ? <button type="button" onClick={() => setRequested(t)} className={`${cls} text-right`}>{body}</button>
                : external
                  ? <a href={link} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
                  : <Link to={link.startsWith('/') ? link : `/${link}`} className={cls}>{body}</Link>}
              <div className="p-4 pt-3 mt-auto">
                <button type="button" onClick={() => setRequested(t)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-colors">
                  اطلب هذا النموذج <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {requested && <TemplateRequestModal template={requested} onClose={() => setRequested(null)} />}
    </>
  );
};
