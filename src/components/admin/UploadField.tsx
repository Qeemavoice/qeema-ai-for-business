import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  label: string;
  value: string;              // data URL or existing path ('' = empty)
  onChange: (value: string, fileName: string) => void;
  accept: string;
  maxMb: number;
  kind: 'image' | 'file' | 'audio';
  fileName?: string;
  required?: boolean;
  hint?: string;
}

/** Compact "رفع | file name" upload input; stores the file as a data URL. */
// ponytail: data URLs live in the in-memory DB; switch to object storage uploads with the real backend
export const UploadField: React.FC<Props> = ({ label, value, onChange, accept, maxMb, kind, fileName, required, hint }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const shownName = fileName || (value && !value.startsWith('data:') ? value.split('/').pop() : value ? 'ملف مرفوع' : '');

  const pick = (file?: File) => {
    if (!file) return;
    if (file.size > maxMb * 1024 * 1024) return setErr(`الحد الأقصى لحجم الملف ${maxMb}MB`);
    setErr('');
    const r = new FileReader();
    r.onload = () => onChange(String(r.result), file.name);
    r.readAsDataURL(file);
  };

  return (
    <div>
      <span className="block text-xs font-bold text-slate-700 mb-1.5">{label}{required && <span className="text-rose-500"> *</span>}</span>
      <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
        <button type="button" onClick={() => ref.current?.click()} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-brand text-xs font-black text-slate-800 cursor-pointer">رفع</button>
        <span className={`flex-1 truncate text-xs ${shownName ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>{shownName || label}</span>
        {value && <button type="button" onClick={() => onChange('', '')} title="إزالة" className="p-1 rounded-md hover:bg-slate-200 text-slate-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => { pick(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
      {err && <p className="text-[11px] text-rose-600 mt-1">{err}</p>}
      {value && kind === 'image' && <img src={value} alt="" className="mt-2 w-28 h-28 rounded-xl object-cover border border-slate-200" />}
      {value && kind === 'audio' && <audio controls preload="none" src={value} className="mt-2 w-full h-9" />}
    </div>
  );
};
