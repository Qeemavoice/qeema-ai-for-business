import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send, X } from 'lucide-react';
import { User, Voice } from '../types';
import { authRequest } from '../lib/api';

interface BookHumanVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  voice: Voice | null;
  currentUser?: User | null;
}

export const BookHumanVoiceModal: React.FC<BookHumanVoiceModalProps> = ({
  isOpen,
  onClose,
  voice,
  currentUser
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');
  const [formData, setFormData] = useState({
    contactName: currentUser?.name || '',
    email: currentUser?.email || '',
    mobile: '',
    projectTitle: '',
    scriptText: '',
    deadlineDays: '3',
    usageLicense: 'commercial_ads',
    notes: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false);
    setSubmitting(false);
    setError('');
    setRequestId('');
    setFormData({
      contactName: currentUser?.name || '',
      email: currentUser?.email || '',
      mobile: '',
      projectTitle: '',
      scriptText: '',
      deadlineDays: '3',
      usageLicense: 'commercial_ads',
      notes: ''
    });
  }, [isOpen, voice?.id, currentUser?.name, currentUser?.email]);

  if (!isOpen || !voice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voice || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      const response = await authRequest('/api/v1/leads', {
        type: 'human_voice_booking',
        name: formData.contactName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim() || undefined,
        message: `طلب حجز المعلق ${voice.name} لمشروع: ${formData.projectTitle.trim()}\n\nالنص المطلوب:\n${formData.scriptText.trim()}`,
        metadata: {
          voice_id: voice.id,
          voice_name: voice.name,
          talent_id: voice.humanTalentId || '',
          project_title: formData.projectTitle.trim(),
          deadline_days: formData.deadlineDays,
          usage_license: formData.usageLicense,
          direction_notes: formData.notes.trim(),
          approximate_words: wordCount
        }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const validation = data.errors ? Object.values(data.errors).flat().find(Boolean) : null;
        throw new Error(String(validation || data.message || 'تعذر إرسال طلب الحجز.'));
      }

      setRequestId(String(data.id || ''));
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'تعذر إرسال طلب الحجز.');
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = formData.scriptText.trim() ? formData.scriptText.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f172a] text-white">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border-2 border-white/20 shrink-0 flex items-center justify-center text-white font-bold">
              {voice.avatar ? (
                <img src={voice.avatar} alt={voice.name} className="w-full h-full object-cover" />
              ) : (
                <span>{voice.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">{voice.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#452800]/80 text-[#f59e0b] border border-[#f59e0b]/40">
                  معلق صوتي بشري موثق
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{voice.dialectLabel || voice.dialect || 'سعودي معاصر'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">وصل طلب الحجز بنجاح</h4>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-600">
                سنراجع تفاصيل المشروع ونتواصل معك لتأكيد السعر وموعد التسجيل وحقوق الاستخدام قبل بدء التنفيذ.
              </p>
              {requestId && <p className="text-xs font-bold text-slate-500">رقم الطلب: #{requestId}</p>}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="px-8 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم صاحب الطلب *</label>
                  <input required maxLength={191} value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني *</label>
                  <input required type="email" maxLength={191} dir="ltr" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم المشروع *</label>
                  <input required maxLength={150} placeholder="مثال: إعلان إطلاق المنتج" value={formData.projectTitle} onChange={e => setFormData({ ...formData, projectTitle: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم التواصل</label>
                  <input type="tel" maxLength={50} dir="ltr" placeholder="+20..." value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500]" />
                </div>
              </div>

              {/* Script Textarea */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  نص الاسكريبت المطلوب تسجيله استوديو *
                </label>
                <textarea
                  rows={4}
                  required
                  maxLength={1500}
                  placeholder="أدخل النص هنا مع أي ملاحظات نطقية أو تشكيلية محددة..."
                  value={formData.scriptText}
                  onChange={e => setFormData({ ...formData, scriptText: e.target.value })}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] resize-none transition-colors"
                />
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5 px-0.5">
                  <span>سيتم تأكيد مواصفات التسليم معك</span>
                  <span>عدد الكلمات التقريبي: {wordCount}</span>
                </div>
              </div>

              {/* 2 Dropdown Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نوع الترخيص وحقوق الاستخدام
                  </label>
                  <select
                    value={formData.usageLicense}
                    onChange={e => setFormData({ ...formData, usageLicense: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF5500] transition-colors"
                  >
                    <option value="commercial_ads">إعلانات تجارية وحملات رقمية</option>
                    <option value="elearning">محتوى تعليمي ومؤسسي داخلي</option>
                    <option value="broadcast_tv">بث تلفزيوني وراديوي إقليمي</option>
                    <option value="ivr">رد آلي IVR وبنوك</option>
                    <option value="global_license">حقوق إنتاج وتوزيع شاملة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    مدة التسليم المطلوبة
                  </label>
                  <select
                    value={formData.deadlineDays}
                    onChange={e => setFormData({ ...formData, deadlineDays: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF5500] transition-colors"
                  >
                    <option value="3">خلال 3 إلى 4 أيام</option>
                    <option value="2">خلال 48 ساعة</option>
                    <option value="1">تسليم سريع (خلال 24 ساعة)</option>
                  </select>
                </div>
              </div>

              {/* Art Direction Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  توجيه الأداء (Art Direction Notes)
                </label>
                <input
                  type="text"
                  maxLength={300}
                  placeholder="مثال: نبرة رسمية وهادئة، سرعة معتدلة، تركيز على الكلمات المفتاحية"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5500] transition-colors"
                />
              </div>

              {/* Action Buttons */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:bg-slate-400 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{submitting ? 'جارٍ إرسال الطلب...' : 'إرسال طلب الحجز للمراجعة'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
