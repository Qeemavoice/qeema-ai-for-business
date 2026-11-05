import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { openAssistant } from '../lib/assistantEvents';
import { usePageText } from '../lib/pageTexts';

export const BookingStepsPage: React.FC = () => {
  const pageText = usePageText('booking-steps');
  useSeo(STATIC_SEO_ROUTES['/ar/booking-steps']);

  const steps = [
    {
      number: '01',
      title: 'استمع واختر الصوت المناسب',
      desc: 'تصفح مكتبة الأصوات وفلتر حسب اللهجة ونوع المشروع والجنس، واستمع للعينات.'
    },
    {
      number: '02',
      title: 'أرسل النص والتعليمات الإخراجية',
      desc: 'الصق نص الإعلان أو السيناريو، وحدد النبرة المطلوبة وسرعة الإلقاء وأي كلمات تحتاج تأكيداً للنطق الصحيح.'
    },
    {
      number: '03',
      title: 'اعتماد عرض السعر والدفع الآمن',
      desc: 'تحصل على تسعير فوري وشفاف بعدد الحروف الواضح، مع خيار دفع آمن وفواتير ضريبية إلكترونية معتمدة.'
    },
    {
      number: '04',
      title: 'استلم التسجيل النهائي بجودة أستوديو',
      desc: null
    }
  ];

  const ttsSteps = [
    { title: 'اكتب نصك أو الصقه', desc: 'اكتب النص أو الصقه في الاستوديو، ويعرض لك عدّاد الحروف أثناء الكتابة.' },
    { title: 'اختر الصوت واللغة', desc: 'اختر الصوت المناسب من قائمة الأصوات، وحدّد اللغة أو اللهجة التي تريد التوليد بها.' },
    { title: 'اضبط الأداء', desc: 'تحكم في سرعة الإلقاء والثبات والتعبير، وفعّل التشكيل التلقائي للنصوص العربية.' },
    { title: 'ولّد الصوت واستمع', desc: 'اضغط «توليد الصوت» واستمع للنتيجة فوراً، وعدّل النص أو الإعدادات وأعد التوليد حتى ترضى عنها.' },
    { title: 'حمّل الملف', desc: 'اختر صيغة التصدير (MP3 أو WAV أو FLAC) وحمّل الملف، أو احجز المعلق البشري نفسه للنسخة النهائية.' }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'كيف نعمل', item: '/ar/booking-steps' }
        ]} />
      </div>

      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Strict Single H1 */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            {pageText.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            {pageText.intro}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          {/* Human voices booking steps */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-slate-900">خطوات حجز الأصوات البشرية</h2>
              <button
                onClick={() => openAssistant()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs transition cursor-pointer"
              >
                <span>أو تحدث مع المساعد الذكي واحصل على ترشيحات صوتية فورية</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((s, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 relative">
                  <div className="text-4xl font-black text-brand-text/25 font-mono">{s.number}</div>
                  <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.desc ?? (
                      <>
                        يصلك الملف الصوتي مسجلاً في استوديو معزول مع إمكانية طلب أي تعديلات حسب{' '}
                        <Link to="/ar/p/revisions-policy" className="text-brand-text font-bold hover:underline">«سياسة التعديلات»</Link>.
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link
                to="/ar/voices"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand hover:bg-brand-orange text-white font-bold text-xs shadow-lg shadow-brand/25 transition"
              >
                <span>ابدأ الآن واستكشف الأصوات</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* TTS studio steps */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">خطوات استخدام استوديو TTS</h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {ttsSteps.map((s, i) => (
                <li key={s.title} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
                  <h3 className="text-sm font-bold text-slate-900 leading-relaxed">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </li>
              ))}
            </ol>
            <div className="text-center pt-2">
              <Link
                to="/ar/text-to-speech"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand hover:bg-brand-orange text-white font-bold text-xs shadow-lg shadow-brand/25 transition"
              >
                <span>جرّب استوديو TTS</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
