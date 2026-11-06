import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Lock, ShieldCheck, Volume2, Square, CreditCard } from 'lucide-react';
import { api } from '../lib/api';

/** Minimal shape needed to book a voice sample (works for backend voices and library samples) */
export interface BookableVoice {
  id: string;
  name: string;
  sampleName?: string;
  accent?: string;
  dialect?: string;
  dialectLabel?: string;
  pricing?: string;
  quote?: string;
}

const CHARS_PER_MINUTE = 100;
const DEFAULT_PRICE_PER_MINUTE_USD = 40;

/** Delivery speed: express options add a percentage of the booking value. */
const DELIVERY_OPTIONS = [
  { value: '48h', label: 'خلال 48 ساعة', surchargePct: 0 },
  { value: '24h', label: 'تسليم سريع (خلال 24 ساعة) +10%', surchargePct: 10 },
  { value: '6h', label: 'تسليم عاجل (خلال 6 ساعات) +15%', surchargePct: 15 }
];
/** Projects longer than this get no express option: delivery is scheduled with the client. */
const MAX_EXPRESS_MINUTES = 5;

/** Counts characters including spaces and diacritics (tashkeel) */
export const countScriptChars = (text: string) => Array.from(text).length;

/** Reads the per-minute price from strings such as "يبدأ من $45 / دقيقة" */
const getPricePerMinute = (voice: BookableVoice) => {
  const match = voice.pricing?.match(/\$\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : DEFAULT_PRICE_PER_MINUTE_USD;
};

/** Secure payment methods shown under the pay button */
const PAYMENT_METHODS = ['Visa', 'Mastercard', 'Apple Pay', 'Google Pay'];

export const SecurePaymentBadges: React.FC = () => (
  <div className="pt-3 border-t border-slate-100 space-y-2">
    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 font-medium">
      <Lock className="w-3.5 h-3.5 text-emerald-600" />
      <span>دفع آمن ومشفّر بالكامل (SSL 256-bit)</span>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
    </div>
    <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr">
      {PAYMENT_METHODS.map(method => (
        <span
          key={method}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 bg-white text-[11px] font-bold text-slate-700 shadow-2xs"
        >
          <CreditCard className="w-3 h-3 text-slate-400" />
          {method}
        </span>
      ))}
    </div>
  </div>
);

interface BookingFormProps {
  voice: BookableVoice;
  onCancel?: () => void;
  onDone?: () => void;
}

/** Booking + payment form, used inside the modal and on the per-sample booking page */
export const BookingForm: React.FC<BookingFormProps> = ({ voice, onCancel, onDone }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    scriptText: '',
    delivery: '48h',
    usageLicense: 'commercial_ads',
    notes: '',
    customerName: '',
    customerEmail: '',
    customerWhatsapp: ''
  });

  const charCount = countScriptChars(formData.scriptText);
  const durationMinutes = charCount === 0 ? 0 : Math.ceil(charCount / CHARS_PER_MINUTE);
  const pricePerMinute = getPricePerMinute(voice);
  const isLongProject = durationMinutes > MAX_EXPRESS_MINUTES;
  const delivery = DELIVERY_OPTIONS.find(o => o.value === formData.delivery) || DELIVERY_OPTIONS[0];
  const surchargePct = isLongProject ? 0 : delivery.surchargePct;
  const baseUsd = durationMinutes * pricePerMinute;
  const surchargeUsd = Math.round(baseUsd * surchargePct) / 100;
  const totalUsd = Math.round((baseUsd + surchargeUsd) * 100) / 100;

  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = formData.customerWhatsapp.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) return setFormError('أدخل رقم واتساب صحيح مع مفتاح الدولة، مثل +966 5X XXX XXXX');
    setFormError('');
    setSending(true);
    try {
      // Saved as a pending request: it then appears in the client's "حجوزاتي" and in the admin bookings
      await api.createBooking({
        sampleId: voice.id, scriptText: formData.scriptText, delivery: isLongProject ? 'custom' : formData.delivery,
        usageLicense: formData.usageLicense, notes: formData.notes,
        customerName: formData.customerName, customerEmail: formData.customerEmail, customerWhatsapp: formData.customerWhatsapp
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || 'تعذر إرسال طلب الحجز');
    } finally { setSending(false); }
  };

  if (submitted) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-bold text-slate-900">تم استلام طلب الحجز بنجاح!</h4>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          شكراً لثقتك بقيمة فويس! استلمنا طلبك وسيتواصل معك فريقنا قريباً لتأكيد التفاصيل، ونضمن لك تسجيلاً احترافياً بجودة عالية يليق بمشروعك.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-xs mx-auto text-xs space-y-1.5 text-right">
          <div className="flex justify-between"><span className="text-slate-500">مدة العمل:</span><strong>{durationMinutes} دقيقة</strong></div>
          <div className="flex justify-between"><span className="text-slate-500">الإجمالي:</span><strong className="text-brand-text">${totalUsd.toLocaleString('en-US')}</strong></div>
        </div>
        <div className="pt-2">
          <button
            onClick={() => {
              setSubmitted(false);
              onDone?.();
            }}
            className="px-8 py-2.5 rounded-xl bg-brand-ink text-white text-xs font-bold hover:bg-brand-ink/90 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer details */}
      <div className="space-y-3 pt-1">
        <h3 className="text-sm font-bold text-slate-800">بياناتك</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">اسم العميل *</span>
            <input required autoComplete="name" value={formData.customerName}
              onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="الاسم أو اسم الشركة"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand transition-colors" />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني *</span>
            <input required type="email" dir="ltr" autoComplete="email" value={formData.customerEmail}
              onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 text-left placeholder:text-slate-400 focus:outline-none focus:border-brand transition-colors" />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">رقم الواتساب *</span>
            <input required type="tel" dir="ltr" autoComplete="tel" inputMode="tel" value={formData.customerWhatsapp}
              onChange={e => setFormData({ ...formData, customerWhatsapp: e.target.value })}
              placeholder="+966 5X XXX XXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 text-left font-mono placeholder:text-slate-400 focus:outline-none focus:border-brand transition-colors" />
          </label>
        </div>
      </div>

      {/* Script Textarea */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-1.5">
          نص السيناريو المطلوب تسجيله *
        </label>
        <textarea
          rows={4}
          required
          placeholder="أدخل النص هنا مع أي ملاحظات نطقية أو تشكيلية محددة..."
          value={formData.scriptText}
          onChange={e => setFormData({ ...formData, scriptText: e.target.value })}
          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition-colors"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mt-1.5 px-0.5">
          <span>جودة التسجيل: 48kHz WAV Broadcast Standard</span>
          <span>
            عدد الحروف: <strong className="font-mono text-slate-800">{charCount.toLocaleString('en-US')}</strong>
            <span className="text-slate-400"> (يشمل التشكيل والمسافات)</span>
          </span>
        </div>
      </div>

      {/* Duration & total */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-[10px] text-slate-500">مدة العمل (كل 100 حرف = دقيقة)</div>
          <div className="font-mono font-bold text-slate-900 text-sm">{durationMinutes} دقيقة</div>
        </div>
        <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-center">
          <div className="text-[10px] text-orange-900">الإجمالي (${pricePerMinute} / دقيقة{surchargePct ? ` + ${surchargePct}% تسليم سريع` : ''})</div>
          <div className="font-mono font-black text-brand-text text-sm">${totalUsd.toLocaleString('en-US')}</div>
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-brand transition-colors"
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
            value={isLongProject ? '' : formData.delivery}
            disabled={isLongProject}
            onChange={e => setFormData({ ...formData, delivery: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-brand transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {isLongProject && <option value="">يُحدد مع فريق قيمة فويس</option>}
            {DELIVERY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {isLongProject && (
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              سيتم تحديد موعد التسليم بناءً على متطلبات ومدة المشروع.
            </p>
          )}
        </div>
      </div>

      {/* Art Direction Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          توجيه الأداء
        </label>
        <input
          type="text"
          placeholder="مثال: نبرة رسمية وهادئة، سرعة معتدلة، تركيز على الكلمات المفتاحية"
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      {formError && <p className="text-xs text-rose-600 font-bold">{formError}</p>}

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        )}
        <button
          type="submit"
          disabled={sending}
          className={`${onCancel ? '' : 'w-full justify-center'} px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-sm font-bold transition-all shadow-md shadow-brand/25 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{sending ? 'جارٍ الإرسال...' : `ادفع الآن${totalUsd > 0 ? ` • $${totalUsd.toLocaleString('en-US')}` : ''}`}</span>
        </button>
      </div>

      <SecurePaymentBadges />
    </form>
  );
};

interface BookHumanVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  voice: BookableVoice | null;
  onTryAITwin?: (voice: any, scriptText?: string) => void;
}

export const BookHumanVoiceModal: React.FC<BookHumanVoiceModalProps> = ({
  isOpen,
  onClose,
  voice
}) => {
  if (!isOpen || !voice) return null;

  // Show the sample name, not the talent name
  const title = voice.sampleName || voice.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f172a] text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-white/20 shrink-0 flex items-center justify-center text-white">
              <Volume2 className="w-5 h-5 text-brand-text" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-white truncate">{title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#452800]/80 text-[#f59e0b] border border-[#f59e0b]/40">
                  صوت بشري موثق
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{voice.dialectLabel || voice.accent || voice.dialect || 'سعودي'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <BookingForm voice={voice} onCancel={onClose} onDone={onClose} />
        </div>
      </div>
    </div>
  );
};
