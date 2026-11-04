import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export const TOPICS = ['ملاحظة عامة', 'اقتراح تطوير', 'مشكلة تقنية', 'جودة التسجيل', 'الفوترة والدفع'];

/** Stars input (1–5), RTL. */
export const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; size?: string }> = ({ value, onChange, size = 'w-6 h-6' }) => (
  <div className="flex items-center gap-1" dir="ltr">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} title={`${n} من 5`}
        className={onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}>
        <Star className={`${size} ${n <= value ? 'fill-brand-yellow text-brand-yellow' : 'text-slate-300'}`} />
      </button>
    ))}
  </div>
);

/** "ملاحظات" in the client dashboard: sends a note + a rating of the work to the platform admins. */
export const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError('اختر تقييمك من 1 إلى 5 نجوم');
    if (message.trim().length < 3) return setError('اكتب ملاحظتك');
    setSending(true);
    setError('');
    try {
      await api.sendFeedback({ rating, topic, message: message.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'تعذر الإرسال');
    } finally { setSending(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl" onClick={onClose}>
      <form onSubmit={send} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 text-right shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">أرسل ملاحظتك لإدارة قيمة فويس</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        {sent ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900">شكراً لك، وصلت ملاحظتك للإدارة</p>
            <p className="text-xs text-slate-500">نراجع كل ملاحظة ونتواصل معك إذا احتاج الأمر.</p>
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl bg-brand-ink text-white text-xs font-bold cursor-pointer">إغلاق</button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-700">كيف تقيّم عملنا معك؟</span>
              <StarRating value={rating} onChange={setRating} size="w-7 h-7" />
            </div>
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 mb-1.5">نوع الملاحظة</span>
              <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-hidden cursor-pointer">
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظتك</span>
              <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} maxLength={1000}
                placeholder="اكتب ملاحظتك أو اقتراحك..." className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand" />
            </label>
            {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">إلغاء</button>
              <button type="submit" disabled={sending} className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                <Send className="w-3.5 h-3.5" />{sending ? 'جارٍ الإرسال...' : 'إرسال'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>,
    document.body
  );
};
