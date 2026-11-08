import React from 'react';
import { Link } from 'react-router-dom';
import { X, Mic } from 'lucide-react';
import { useHumanVoices } from '../lib/humanVoices';
import { buildSampleSlug } from './VoiceLibraryView';
import type { VoiceTemplate } from '../data/voiceTemplates';

const MAX_SUGGESTIONS = 4;

/** «اطلب هذا النموذج»: human voices from the model's category; each opens that sample's booking page. */
export const TemplateRequestModal: React.FC<{ template: VoiceTemplate; onClose: () => void }> = ({ template, onClose }) => {
  const voices = useHumanVoices().filter(v => v.isHuman);
  const inCategory = template.category ? voices.filter(v => v.tags?.includes(template.category) || v.category === template.category) : voices;
  const suggestions = (inCategory.length ? inCategory : voices).slice(0, MAX_SUGGESTIONS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" dir="rtl" onClick={onClose}>
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 bg-brand-ink text-white">
          <div className="min-w-0">
            <h3 className="font-black text-lg truncate">{template.title}</h3>
            <p className="text-xs text-white/70">أصوات مقترحة لهذا النموذج{template.category ? ` · ${template.category}` : ''}</p>
          </div>
          <button onClick={onClose} aria-label="إغلاق" className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">اختر الصوت الذي يناسب مشروعك، ثم أرسل النص واحجز التسجيل من صفحة الصوت.</p>
          {suggestions.map(v => (
            <Link key={v.id} to={`/ar/voices/${buildSampleSlug(v)}`} onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-brand/50 hover:shadow-sm transition-all">
              <span className="w-10 h-10 rounded-xl bg-brand-ink text-white flex items-center justify-center shrink-0"><Mic className="w-4 h-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900 truncate">{v.sampleName || v.name}</span>
                <span className="block text-xs text-slate-500 truncate">{v.accent}</span>
              </span>
              {v.pricing && <span className="text-xs font-bold text-brand-text whitespace-nowrap">{v.pricing}</span>}
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-ink text-white whitespace-nowrap">احجز هذا الصوت</span>
            </Link>
          ))}
          <Link to="/ar/voices" onClick={onClose}
            className="block text-center text-xs font-bold text-brand-text hover:underline pt-1">عرض مكتبة الأصوات كاملة ←</Link>
        </div>
      </div>
    </div>
  );
};
