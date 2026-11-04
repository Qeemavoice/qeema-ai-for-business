import React, { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Link2, Unlink, AlignRight, AlignCenter, AlignLeft, AlignJustify,
  Undo2, Redo2, RemoveFormatting, Code2, Scissors, Copy, ImagePlus, Table, Minus, Omega, Maximize2, Minimize2, IndentIncrease, IndentDecrease
} from 'lucide-react';

interface Props {
  /** Initial HTML; the editor is uncontrolled after mount (re-mount with a new `key` to reset it). */
  initialHtml: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

const BLOCKS = [
  { value: 'P', label: 'فقرة' }, { value: 'H1', label: 'عنوان 1' }, { value: 'H2', label: 'عنوان 2' },
  { value: 'H3', label: 'عنوان 3' }, { value: 'H4', label: 'عنوان 4' }, { value: 'PRE', label: 'نص منسق' }
];
const SPECIAL_CHARS = ['«', '»', '،', '؛', '؟', '—', '•', '©', '®', '™', '$', '€', '%', '✓', '★', '←', '→', '…'];

/** Native contentEditable rich text editor with a full RTL toolbar (no dependency). */
export const RichTextEditor: React.FC<Props> = ({ initialHtml, onChange, minHeight = 360 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [charsOpen, setCharsOpen] = useState(false);
  const [html, setHtml] = useState(initialHtml);

  useEffect(() => { if (ref.current && !source) ref.current.innerHTML = html; }, [source]);

  const emit = (v: string) => { setHtml(v); onChange(v); };
  const cmd = (command: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, value);
    emit(ref.current?.innerHTML || '');
  };

  const addLink = () => { const url = window.prompt('أدخل الرابط'); if (url) cmd('createLink', url); };
  const addTable = () => {
    const rows = Number(window.prompt('عدد الصفوف', '3')) || 0;
    const cols = Number(window.prompt('عدد الأعمدة', '2')) || 0;
    if (rows < 1 || cols < 1) return;
    const row = `<tr>${'<td>&nbsp;</td>'.repeat(cols)}</tr>`;
    cmd('insertHTML', `<table><tbody>${row.repeat(rows)}</tbody></table><p><br></p>`);
  };
  const addImage = (file?: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return window.alert('الحد الأقصى لحجم الصورة 3MB');
    const r = new FileReader();
    r.onload = () => cmd('insertImage', String(r.result));
    r.readAsDataURL(file);
  };

  type Tool = { icon: React.ElementType; title: string; run: () => void; active?: boolean };
  const groups: Tool[][] = [
    [
      { icon: Scissors, title: 'قص', run: () => cmd('cut') },
      { icon: Copy, title: 'نسخ', run: () => cmd('copy') }
    ],
    [
      { icon: Undo2, title: 'تراجع', run: () => cmd('undo') },
      { icon: Redo2, title: 'إعادة', run: () => cmd('redo') }
    ],
    [
      { icon: Link2, title: 'إدراج رابط', run: addLink },
      { icon: Unlink, title: 'إزالة الرابط', run: () => cmd('unlink') }
    ],
    [
      { icon: ImagePlus, title: 'إدراج صورة', run: () => imageInput.current?.click() },
      { icon: Table, title: 'إدراج جدول', run: addTable },
      { icon: Minus, title: 'خط أفقي', run: () => cmd('insertHorizontalRule') },
      { icon: Omega, title: 'رموز خاصة', run: () => setCharsOpen(o => !o), active: charsOpen }
    ],
    [
      { icon: Bold, title: 'عريض', run: () => cmd('bold') },
      { icon: Italic, title: 'مائل', run: () => cmd('italic') },
      { icon: Underline, title: 'تسطير', run: () => cmd('underline') },
      { icon: Strikethrough, title: 'يتوسطه خط', run: () => cmd('strikeThrough') },
      { icon: RemoveFormatting, title: 'إزالة التنسيق', run: () => cmd('removeFormat') }
    ],
    [
      { icon: ListOrdered, title: 'قائمة مرقمة', run: () => cmd('insertOrderedList') },
      { icon: List, title: 'قائمة نقطية', run: () => cmd('insertUnorderedList') },
      { icon: IndentDecrease, title: 'إنقاص المسافة البادئة', run: () => cmd('outdent') },
      { icon: IndentIncrease, title: 'زيادة المسافة البادئة', run: () => cmd('indent') },
      { icon: Quote, title: 'اقتباس', run: () => cmd('formatBlock', 'BLOCKQUOTE') }
    ],
    [
      { icon: AlignRight, title: 'محاذاة لليمين', run: () => cmd('justifyRight') },
      { icon: AlignCenter, title: 'توسيط', run: () => cmd('justifyCenter') },
      { icon: AlignLeft, title: 'محاذاة لليسار', run: () => cmd('justifyLeft') },
      { icon: AlignJustify, title: 'ضبط', run: () => cmd('justifyFull') }
    ]
  ];

  const btn = 'p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-brand-text cursor-pointer disabled:opacity-30';
  const words = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className={`rounded-2xl border border-slate-200 overflow-hidden bg-white focus-within:border-brand ${fullscreen ? 'fixed inset-4 z-[70] shadow-2xl flex flex-col' : ''}`}>
      {/* keep the selection when clicking toolbar buttons */}
      <div className="flex flex-wrap items-center gap-y-1 p-1.5 bg-slate-50 border-b border-slate-200 relative"
        onMouseDown={e => { if ((e.target as HTMLElement).closest('button')) e.preventDefault(); }}>
        {groups.map((g, gi) => (
          <div key={gi} className="flex items-center px-1 border-l border-slate-200">
            {g.map(t => (
              <button key={t.title} type="button" title={t.title} onClick={t.run} disabled={source}
                className={`${btn} ${t.active ? 'bg-white text-brand-text' : ''}`}>
                <t.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        ))}

        <div className="flex items-center gap-1 px-1">
          <select title="تنسيق" disabled={source} defaultValue="" onChange={e => { cmd('formatBlock', e.target.value); e.target.value = ''; }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 cursor-pointer outline-hidden">
            <option value="" disabled>تنسيق</option>
            {BLOCKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
          <label title="لون النص" className={`${btn} relative flex items-center`}>
            <span className="text-sm font-black underline decoration-[3px] decoration-brand">A</span>
            <input type="color" disabled={source} onChange={e => cmd('foreColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
          <label title="لون الخلفية" className={`${btn} relative flex items-center`}>
            <span className="text-sm font-black px-0.5 rounded bg-amber-200 text-slate-900">A</span>
            <input type="color" disabled={source} defaultValue="#fde68a" onChange={e => cmd('hiliteColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
        </div>

        <div className="flex items-center gap-1 px-1 mr-auto">
          <button type="button" onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'تصغير' : 'ملء الشاشة'} className={btn}>
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button type="button" onClick={() => setSource(v => !v)} title="المصدر (HTML)"
            className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer ${source ? 'bg-brand-ink text-white' : 'text-slate-600 hover:bg-white'}`}>
            <Code2 className="w-4 h-4" />المصدر
          </button>
        </div>

        {charsOpen && !source && (
          <div className="absolute top-full right-2 mt-1 z-10 grid grid-cols-6 gap-1 p-2 bg-white border border-slate-200 rounded-xl shadow-lg">
            {SPECIAL_CHARS.map(c => (
              <button key={c} type="button" onClick={() => { cmd('insertText', c); setCharsOpen(false); }}
                className="w-8 h-8 rounded-lg hover:bg-orange-50 text-sm font-bold text-slate-800 cursor-pointer">{c}</button>
            ))}
          </div>
        )}
        <input ref={imageInput} type="file" accept="image/*" className="hidden" onChange={e => { addImage(e.target.files?.[0]); e.target.value = ''; }} />
      </div>

      {source ? (
        <textarea dir="ltr" value={html} onChange={e => emit(e.target.value)} style={{ minHeight }}
          className={`w-full p-4 font-mono text-xs text-slate-700 outline-hidden ${fullscreen ? 'flex-1' : ''}`} />
      ) : (
        <div
          ref={ref}
          contentEditable
          spellCheck
          suppressContentEditableWarning
          onInput={e => emit((e.target as HTMLDivElement).innerHTML)}
          style={{ minHeight }}
          className={`rich-content p-4 text-sm leading-8 text-slate-800 outline-hidden ${fullscreen ? 'flex-1 overflow-y-auto' : 'max-h-[70vh] overflow-y-auto'}`}
        />
      )}
      <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400">عدد الكلمات: <span className="font-mono">{words}</span></div>
    </div>
  );
};
