import React, { useEffect, useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Play, 
  Pause, 
  Download, 
  ShieldCheck, 
  Coins, 
  Key, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Users, 
  UserPlus, 
  Sparkles, 
  Terminal, 
  Zap, 
  Clock, 
  Calendar, 
  Radio, 
  CheckCircle2, 
  ExternalLink,
  CreditCard,
  Building2,
  Trash2,
  FileText,
  ChevronDown
} from 'lucide-react';
import { Generation, Company, User, Voice, HumanBooking } from '../../types';
import { api } from '../../lib/api';
import { fmtDate } from '../../lib/format';
import { StarRating } from './FeedbackModal';
import { InvoiceModal, type InvoiceData } from './InvoiceModal';

// ==========================================
// 1. Projects & Campaigns SubView
// ==========================================
interface ProjectsSubViewProps {
  projects: any[];
  onOpenNewProject: () => void;
  onNavigateToStudio: (presetText?: string) => void;
}

export const ProjectsSubView: React.FC<ProjectsSubViewProps> = ({
  projects,
  onOpenNewProject,
  onNavigateToStudio
}) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">المشاريع والحملات الصوتية</h2>
          <p className="text-xs text-slate-500">تنظيم وتنسيق سكريبتات التعليق الصوتي والإنتاج لحملاتك الإعلانية</p>
        </div>
        <button
          onClick={onOpenNewProject}
          className="px-4 py-2 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
        >
          <FolderPlus className="w-4 h-4 text-brand-text" />
          <span>+ مشروع صوتي جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 && (
          <div className="md:col-span-2 p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-xs text-slate-500">
            لا توجد مشاريع بعد. أنشئ مشروعك الأول لتنظيم نصوصك وتسجيلاتك.
          </div>
        )}
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand/10 text-brand-text border border-brand/30">
                  {proj.dialect}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{proj.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{proj.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
              <span>أُنشئ {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString('ar-SA') : ''}</span>
              <button
                onClick={() => onNavigateToStudio(proj.title)}
                className="text-brand-text font-bold hover:underline"
              >
                فتح في الاستوديو ←
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 2. Assets & My Audio SubView
// ==========================================
interface AssetsSubViewProps {
  generations: Generation[];
  playingId: string | null;
  onTogglePlay: (id: string, url: string) => void;
  onViewLicense: (gen: Generation) => void;
}

export const AssetsSubView: React.FC<AssetsSubViewProps> = ({
  generations,
  playingId,
  onTogglePlay,
  onViewLicense
}) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">الأصول والتسجيلات والتراخيص</h2>
          <p className="text-xs text-slate-500">سجل كامل بملفات الاستوديو المكتملة ووثائق الترخيص التجاري المعتمدة</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {generations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-semibold">لا توجد تسجيلات بعد في مكتبة الأصول</p>
          </div>
        ) : (
          generations.map((gen) => {
            const isPlaying = playingId === gen.id;
            return (
              <div key={gen.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onTogglePlay(gen.id, gen.audioUrl)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isPlaying ? 'bg-brand text-white shadow-xs' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <div className="min-w-0">
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 truncate">
                      {gen.textPrompt || gen.text}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {gen.voiceName} • {gen.dialect || 'سعودي'} • {new Date(gen.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onViewLicense(gen)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>شهادة الترخيص</span>
                  </button>

                  <a
                    href={gen.audioUrl}
                    download={`qeema-studio-${gen.id}.wav`}
                    className="px-3 py-1.5 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل بصيغة ماستر عالية الدقة</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. Human Bookings SubView (real bookings, project review + invoice)
// ==========================================
interface HumanBookingsSubViewProps {
  onBookTalent: () => void;
}

const BOOKING_STATUS: Record<string, { label: string; cls: string; step: number }> = {
  pending: { label: 'قيد المراجعة', cls: 'bg-slate-100 text-slate-700 border-slate-200', step: 0 },
  in_studio: { label: 'جاري التسجيل', cls: 'bg-brand/10 text-brand-text border-brand/30', step: 1 },
  delivered: { label: 'تم التسليم', cls: 'bg-brand-ink/10 text-brand-ink border-brand-ink/20', step: 2 },
  approved: { label: 'مكتمل', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 3 }
};
const BOOKING_STEPS = ['استلام الطلب ومراجعته', 'جاري التسجيل', 'تسليم التسجيل', 'اعتماد المشروع'];
const LICENSE_AR: Record<string, string> = {
  commercial_ads: 'إعلانات تجارية وحملات رقمية', internal_corporate: 'استخدام داخلي', broadcast_tv: 'بث تلفزيوني وراديوي',
  elearning: 'محتوى تعليمي ومؤسسي', ivr: 'رد آلي IVR', global_license: 'حقوق إنتاج وتوزيع شاملة'
};
const DELIVERY_AR: Record<string, string> = {
  '48h': 'خلال 48 ساعة', '24h': 'تسليم سريع (خلال 24 ساعة)', '6h': 'تسليم عاجل (خلال 6 ساعات)', custom: 'يُحدد مع فريق قيمة فويس'
};

export const bookingInvoice = (b: HumanBooking, customer: { name: string; country?: string }): InvoiceData => {
  const chars = Array.from(b.scriptText || '').length;
  return {
    number: `INV-${b.id}`,
    date: b.createdAt,
    customer,
    lines: [{
      description: `تسجيل تعليق صوتي — ${LICENSE_AR[b.usageLicense] || b.usageLicense} — المشروع ${b.id}`,
      detail: `عدد الحروف: ${chars.toLocaleString('en-US')} · المدة التقريبية: ${b.durationMinutes ?? Math.max(1, Math.ceil(chars / 100))} دقيقة · ${DELIVERY_AR[b.delivery || ''] || `التسليم خلال ${b.deadlineDays} أيام`}`,
      amountUsd: b.priceUsd
    }],
    paymentMethod: 'بطاقة ائتمانية',
    status: 'مدفوعة'
  };
};

const ReviewBox: React.FC<{ booking: HumanBooking; onSaved: (b: HumanBooking) => void }> = ({ booking, onSaved }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (booking.review) {
    return (
      <div className="rounded-2xl bg-brand/10 border border-brand/30 p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700">تقييمك للمشروع</span>
          <StarRating value={booking.review.rating} size="w-4 h-4" />
        </div>
        <p className="text-[10px] text-slate-500">
          {booking.review.status === 'approved' ? 'منشور في صفحة الصوت' : booking.review.status === 'rejected' ? 'لم يُنشر' : 'بانتظار مراجعة الإدارة قبل النشر'}
        </p>
        {booking.review.text && <p className="text-xs text-slate-700 leading-relaxed">{booking.review.text}</p>}
      </div>
    );
  }
  if (booking.status !== 'delivered' && booking.status !== 'approved') {
    return <p className="text-[11px] text-slate-400">يمكنك تقييم المشروع بعد تسليم التسجيل.</p>;
  }

  const save = async () => {
    if (!rating) return setError('اختر عدد النجوم');
    setSaving(true); setError('');
    try { onSaved(await api.reviewBooking(booking.id, rating, text)); }
    catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700">قيّم هذا المشروع</span>
        <StarRating value={rating} onChange={setRating} size="w-5 h-5" />
      </div>
      <textarea rows={2} value={text} onChange={e => setText(e.target.value)} maxLength={1000} placeholder="اكتب رأيك في التسجيل والتعامل (اختياري)"
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand" />
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      <button onClick={save} disabled={saving} className="w-full py-2 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold cursor-pointer disabled:opacity-50">
        {saving ? 'جارٍ الحفظ...' : 'إرسال التقييم'}
      </button>
    </div>
  );
};

const Detail: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
    <div className="text-[10px] font-bold text-slate-400">{label}</div>
    <div className="text-xs font-black text-slate-900 mt-0.5 leading-relaxed">{value || '-'}</div>
  </div>
);

export const HumanBookingsSubView: React.FC<HumanBookingsSubViewProps> = ({ onBookTalent }) => {
  const [bookings, setBookings] = useState<HumanBooking[] | null>(null);
  const [customer, setCustomer] = useState<{ name: string; country?: string }>({ name: '' });
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.getMyBookings().then(d => {
      setBookings(d.bookings); setCustomer(d.company || { name: "" });
      // Open the project that needs attention first (being recorded, else the newest)
      setOpenId((d.bookings.find(b => b.status === 'in_studio') || d.bookings[0])?.id || null);
    }).catch(() => setBookings([]));
  }, []);

  const counts = (st: string) => (bookings || []).filter(b => b.status === st).length;
  const shown = (bookings || []).filter(b => filter === 'all' || b.status === filter);
  const copyText = (b: HumanBooking) => {
    navigator.clipboard?.writeText(b.scriptText).then(() => { setCopied(b.id); setTimeout(() => setCopied(null), 1500); }).catch(() => {});
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-900">حجوزاتي مع المعلقين</h2>
          <p className="text-xs text-slate-500">تابع كل مشروع: نصه ومدته ولهجته وحالة التسجيل، وقيّمه بعد التسليم</p>
        </div>
        <button
          onClick={onBookTalent}
          className="px-4 py-2 bg-brand hover:bg-brand-orange text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          + حجز معلق صوتي جديد
        </button>
      </div>

      {/* Status filters */}
      {bookings && bookings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[['all', 'الكل', bookings.length], ...Object.entries(BOOKING_STATUS).map(([k, v]) => [k, v.label, counts(k)])].map(([k, label, n]) => (
            <button key={k as string} onClick={() => setFilter(k as string)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                filter === k ? 'bg-brand-ink text-white border-brand-ink' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-ink/40'
              }`}>
              {label} <span className={filter === k ? 'text-white/70' : 'text-slate-400'}>({n})</span>
            </button>
          ))}
        </div>
      )}

      {bookings === null && <p className="text-center text-xs text-slate-400 py-10">جارٍ التحميل...</p>}
      {bookings?.length === 0 && (
        <div className="text-center text-sm text-slate-500 py-12 border border-dashed border-slate-200 rounded-3xl">لا توجد حجوزات بعد.</div>
      )}

      <div className="space-y-3">
        {shown.map(b => {
          const st = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending;
          const open = openId === b.id;
          const title = b.sampleName || 'عينة صوتية'; // never the narrator's name (site rule)
          return (
            <div key={b.id} className={`bg-white rounded-3xl border transition-shadow ${open ? 'border-brand-ink/30 shadow-md' : 'border-slate-200/90 shadow-2xs'}`}>
              {/* Summary row */}
              <button onClick={() => setOpenId(open ? null : b.id)} className="w-full text-right p-5 flex items-center gap-4 cursor-pointer">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${st.cls}`}>
                      {b.status === 'in_studio' && <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />}
                      {st.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">{b.id}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 truncate">{title}</h3>
                  <p className="text-xs text-slate-500 truncate">{b.scriptText}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0 text-[11px] font-bold">
                  {b.dialect && <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">{b.dialect}</span>}
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">{b.durationMinutes} دقيقة</span>
                  <span className="px-2.5 py-1 rounded-lg bg-brand-ink/10 text-brand-ink font-mono">${b.priceUsd}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="px-5 pb-5 space-y-5 border-t border-slate-100 pt-5">
                  {/* Progress */}
                  <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BOOKING_STEPS.map((label, i) => {
                      const done = i < st.step, current = i === st.step;
                      return (
                        <li key={label} className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                            done ? 'bg-emerald-500 text-white' : current ? 'bg-brand text-white ring-4 ring-brand/20' : 'bg-slate-100 text-slate-400'
                          }`}>{done ? <Check className="w-3.5 h-3.5" /> : i + 1}</span>
                          <span className={`text-[11px] font-bold leading-snug ${current ? 'text-slate-900' : done ? 'text-slate-600' : 'text-slate-400'}`}>{label}</span>
                        </li>
                      );
                    })}
                  </ol>

                  {/* Details entered when booking */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <Detail label="الصوت" value={title} />
                    <Detail label="اللهجة" value={b.dialect} />
                    <Detail label="مدة المشروع" value={`${b.durationMinutes} دقيقة`} />
                    <Detail label="عدد الحروف" value={(b.charCount ?? 0).toLocaleString('en-US')} />
                    <Detail label="مدة التسليم" value={DELIVERY_AR[b.delivery || ''] || `خلال ${b.deadlineDays} أيام`} />
                    <Detail label="الترخيص" value={LICENSE_AR[b.usageLicense] || b.usageLicense} />
                    <Detail label="توجيه الأداء" value={b.notes} />
                    <Detail label="تاريخ الطلب" value={<span className="font-mono">{fmtDate(b.createdAt)}</span>} />
                    <Detail label="المبلغ" value={<span className="font-mono">${b.priceUsd}</span>} />
                  </div>

                  {/* Project text */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                      <span className="text-[11px] font-black text-slate-700">نص المشروع</span>
                      <button onClick={() => copyText(b)} className="text-[11px] font-bold text-brand-ink hover:underline flex items-center gap-1 cursor-pointer">
                        {copied === b.id ? <><Check className="w-3 h-3" />تم النسخ</> : <><Copy className="w-3 h-3" />نسخ النص</>}
                      </button>
                    </div>
                    <p className="p-4 text-sm text-slate-800 leading-8 whitespace-pre-wrap max-h-64 overflow-y-auto">{b.scriptText}</p>
                  </div>

                  {b.deliverableAudioUrl && (b.status === 'delivered' || b.status === 'approved') && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-black text-slate-700">التسجيل النهائي</div>
                      <audio controls preload="none" src={b.deliverableAudioUrl} className="w-full h-10" />
                    </div>
                  )}

                  <ReviewBox booking={b} onSaved={nb => setBookings(list => list!.map(x => x.id === nb.id ? nb : x))} />

                  <button onClick={() => setInvoice(bookingInvoice(b, customer))}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <FileText className="w-3.5 h-3.5" />عرض الفاتورة
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {invoice && <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} />}
    </div>
  );
};

// ==========================================
// 4. Developers & API SubView
// ==========================================
export const DevelopersSubView: React.FC = () => {
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = 'qv_live_89f91a27e492b0c14902847a98';

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div>
        <h2 className="text-xl font-black text-slate-900">المطورين والربط البرمجي المباشر</h2>
        <p className="text-xs text-slate-500">دمج محرك توليد الأصوات واللهجات في تطبيقات شركتك وأنظمة الرد الآلي الهاتفية مباشرة</p>
      </div>

      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-brand-text" />
            <h3 className="text-sm font-bold text-slate-900">مفتاح الإنتاج الحي المعتمد</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            نشط ومفعل بجودة استوديو 48 كيلوهرتز
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
          <input
            type={showLiveKey ? 'text' : 'password'}
            readOnly
            value={apiKey}
            className="w-full bg-transparent outline-hidden font-mono text-xs text-slate-800 px-2"
          />
          <button
            onClick={() => setShowLiveKey(!showLiveKey)}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"
          >
            {showLiveKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-brand-ink text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>
        </div>

        <div className="pt-2 text-xs text-slate-500">
          توثيق الـ SDK متاح لـ Node.js و Python و cURL مع دعم كامل للبث التدفقي (Streaming Audio).
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. Flows & Workflows SubView
// ==========================================
interface FlowStep { title: string; desc: string; }
interface FlowDef {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  steps: FlowStep[];
  cta: string;
  target: 'studio' | 'voices' | 'human-bookings' | 'team';
}

const FLOWS: FlowDef[] = [
  {
    id: 'flow-ai',
    title: 'إنتاج تعليق صوتي بالذكاء الاصطناعي',
    subtitle: 'من النص إلى ملف صوتي جاهز بجودة استوديو خلال دقائق.',
    duration: 'خلال دقائق',
    steps: [
      { title: 'اكتب النص', desc: 'الصق السيناريو بالتشكيل الذي تريده.' },
      { title: 'اختر الصوت واللهجة', desc: 'من مكتبة أصوات AI بكل اللهجات.' },
      { title: 'ولّد واستمع', desc: 'عدّل النطق وأعد التوليد حتى تصل للنتيجة.' },
      { title: 'نزّل الملف', desc: 'MP3 أو WAV 48kHz بترخيص تجاري كامل.' }
    ],
    cta: 'ابدأ في الاستوديو',
    target: 'studio'
  },
  {
    id: 'flow-human',
    title: 'حجز معلق بشري',
    subtitle: 'احجز صوتاً حقيقياً لمشروعك واستلمه مسجلاً في استوديو احترافي.',
    duration: '24 إلى 48 ساعة',
    steps: [
      { title: 'اختر عينة صوتية', desc: 'استمع لعينات المعلقين وصفّها حسب اللهجة.' },
      { title: 'أدخل السيناريو', desc: 'يُحسب عدد الحروف والمدة والتكلفة تلقائياً.' },
      { title: 'ادفع لتأكيد الحجز', desc: 'دفع آمن عبر بطاقات Visa وMastercard وApple Pay وGoogle Pay.' },
      { title: 'التسجيل والتسليم', desc: 'يسجل المعلق ويصلك الملف مع تعديل النطق مجاناً.' }
    ],
    cta: 'تصفح الأصوات البشرية',
    target: 'voices'
  },
  {
    id: 'flow-team',
    title: 'مراجعة واعتماد الفريق',
    subtitle: 'شارك المشروع مع فريقك قبل نشر الصوت النهائي.',
    duration: 'حسب فريقك',
    steps: [
      { title: 'ادعُ أعضاء الفريق', desc: 'كتّاب نصوص ومراجعون ومهندسو صوت.' },
      { title: 'جهّز المسودة', desc: 'يولّد الكاتب النسخة التجريبية من الاستوديو.' },
      { title: 'راجع واعتمد', desc: 'يستمع المراجع ويطلب التعديلات أو يعتمد.' },
      { title: 'انشر وسلّم', desc: 'يحفظ الملف المعتمد في أصولي مع ترخيصه.' }
    ],
    cta: 'إدارة الفريق',
    target: 'team'
  }
];

interface FlowsSubViewProps {
  onNavigateTab: (tab: any) => void;
}

export const FlowsSubView: React.FC<FlowsSubViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div>
        <h2 className="text-xl font-black text-slate-900">التدفقات وسير العمل</h2>
        <p className="text-xs text-slate-500 mt-1">مسارات جاهزة توضح خطوات كل نوع من الإنتاج الصوتي داخل المنصة، وتنقلك مباشرة إلى الخطوة الأولى.</p>
      </div>

      <div className="space-y-5">
        {FLOWS.map((flow) => (
          <div key={flow.id} className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-base font-black text-slate-900">{flow.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{flow.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  المدة: {flow.duration}
                </span>
                <button
                  onClick={() => onNavigateTab(flow.target)}
                  className="px-4 py-2 bg-brand hover:bg-brand-orange text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {flow.cta}
                </button>
              </div>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {flow.steps.map((step, i) => (
                <li key={step.title} className="relative p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-brand-ink text-white text-[11px] font-black flex items-center justify-center mb-2">
                    {i + 1}
                  </span>
                  <div className="text-xs font-bold text-slate-900">{step.title}</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};
