/** Voice sample conditions + rejection reasons (used by the admin samples page and the narrator upload). */
export const SAMPLE_RULES = {
  format: 'mp3',
  maxDurationSec: 40,
  maxSizeMb: 20,
  maxSamplesPerNarrator: 3
} as const;

export interface RejectionReason {
  code: string;
  label: string;          // short label for the admin picker
  message: string;        // text delivered to the narrator
  auto?: boolean;         // applied automatically by the system
}

export const REJECTION_REASONS: RejectionReason[] = [
  { code: 'duration', auto: true, label: 'مدة العينة تتجاوز 40 ثانية', message: `مدة العينة تتجاوز الحد الأقصى المسموح (${SAMPLE_RULES.maxDurationSec} ثانية).` },
  { code: 'format', auto: true, label: 'الصيغة غير MP3', message: 'صيغة الملف غير مقبولة، المقبول هو MP3 فقط.' },
  { code: 'size', label: 'حجم الملف كبير', message: `حجم الملف يتجاوز الحد المسموح (${SAMPLE_RULES.maxSizeMb} ميجابايت).` },
  { code: 'noise', label: 'ضوضاء في الخلفية', message: 'يوجد ضوضاء أو تشويش في الخلفية، يرجى التسجيل في مكان هادئ.' },
  { code: 'echo', label: 'صدى في الغرفة', message: 'التسجيل يحتوي على صدى، يرجى التسجيل في غرفة معزولة صوتياً.' },
  { code: 'music', label: 'موسيقى أو مؤثرات مضافة', message: 'العينة تحتوي على موسيقى أو مؤثرات صوتية، المطلوب صوتك فقط بدون مؤثرات.' },
  { code: 'clipping', label: 'تقطيع أو تشويه في الصوت', message: 'يوجد تقطيع أو تشويه (Clipping) في الصوت، يرجى خفض مستوى التسجيل.' },
  { code: 'quality', label: 'جودة تسجيل منخفضة', message: 'جودة التسجيل أقل من المطلوب، يرجى استخدام ميكروفون أفضل ومعدل بت أعلى.' },
  { code: 'delivery', label: 'إلقاء غير واضح أو سريع', message: 'الإلقاء غير واضح أو سريع، يرجى إعادة التسجيل بإيقاع أهدأ ومخارج حروف أوضح.' },
  { code: 'dialect', label: 'اللهجة لا تطابق المختار', message: 'اللهجة المسجلة لا تطابق اللهجة المختارة للعينة.' },
  { code: 'content', label: 'محتوى مخالف', message: 'محتوى العينة مخالف لسياسات المنصة (سياسي، ديني، أو غير لائق).' },
  { code: 'impersonation', label: 'العينة ليست بصوتك', message: 'تعذر التأكد أن العينة بصوتك الشخصي، يرجى رفع تسجيل بصوتك أنت.' },
  { code: 'duplicate', label: 'عينة مكررة', message: 'هذه العينة مكررة أو مطابقة لعينة أخرى مرفوعة.' }
];

export const reasonByCode = (code: string) => REJECTION_REASONS.find(r => r.code === code);
