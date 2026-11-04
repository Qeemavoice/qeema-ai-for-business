import React from 'react';
import { openTalentSignup } from '../lib/talentJoin';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, XCircle } from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { GUIDES } from '../data/guides';
import { GuideCover, GuidePriceBadge } from './GuideCover';
import { NotFoundPage } from './NotFoundPage';

const JOIN_STEPS = [
  { t: 'أنشئ حسابك وقدّم طلب الانضمام', d: 'من صفحة "انضم كمعلق" أدخل بياناتك الأساسية: الاسم، اللهجات التي تتقنها، ونوع الأعمال التي تجيدها (إعلانات، وثائقي، كتب صوتية، رد آلي...).' },
  { t: 'سجّل عيناتك الصوتية وارفعها', d: 'ارفع عينة واحدة على الأقل بصيغة MP3 (حتى 15 ميجابايت لكل عينة)، وسمِّ كل عينة وحدد تصنيفها ولهجتها بدقة.' },
  { t: 'مراجعة فريق الجودة', d: 'يستمع فريقنا لعيناتك ويقيّم نقاء التسجيل وسلامة النطق والتشكيل والأداء، ثم يصلك قرار القبول أو ملاحظات التحسين.' },
  { t: 'فعّل ملفك وحدد أسعارك', d: 'بعد القبول يظهر ملفك وعيناتك في مكتبة الأصوات، وتحدد تسعيرتك ومدة التسليم المعتادة لك.' },
  { t: 'استقبل الحجوزات وسلّم التسجيلات', d: 'يحجز العملاء عيناتك مباشرة، فتسجل النص المرسل وتسلّمه في الموعد، وتتولى المنصة الدفع والفوترة.' }
];

const SAMPLE_RULES_OK = [
  'صيغة MP3 فقط، وبحد أقصى 15 ميجابايت للعينة الواحدة',
  'تسجيل نظيف خالٍ من الضجيج والصدى والتقطيع',
  'نطق عربي سليم وتشكيل صحيح للنص المقروء',
  'قراءة طبيعية وأداء مناسب لتصنيف العينة (إعلان، وثائقي، كتب، رد آلي...)',
  'تسمية واضحة للعينة وتحديد دقيق للهجتها وتصنيفها',
  'صوتك الحقيقي أنت، وبحقوق ملكية تخصك'
];

const SAMPLE_RULES_NO = [
  'عينات فيها موسيقى أو مؤثرات تغطي على الصوت',
  'تسجيلات من مقاطع أو أعمال لمعلقين آخرين',
  'عينات مولّدة بالذكاء الاصطناعي على أنها صوتك البشري',
  'عينات بها أخطاء نطق أو تشكيل ظاهرة، أو جودة صوت ضعيفة'
];

export const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = GUIDES.find(g => g.slug === slug);
  useSeo(STATIC_SEO_ROUTES['/ar/guides/join-qeema-voice']);

  if (!guide || guide.slug !== 'join-qeema-voice') return <NotFoundPage />;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'الأدلة', item: '/ar/guides' },
          { name: 'كيف أنضم إلى قيمة فويس', item: '/ar/guides/join-qeema-voice' }
        ]} />
      </div>

      <section className="py-10 border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <GuideCover guide={guide} className="h-56 sm:h-72 rounded-3xl" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-brand-text bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">دليل إرشادي معتمد</span>
            <GuidePriceBadge priceUsd={guide.priceUsd} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-snug">{guide.title}</h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{guide.desc}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-5">
            <h2 className="text-2xl font-black">آلية الانضمام خطوة بخطوة</h2>
            <ol className="space-y-4">
              {JOIN_STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl">
                  <span className="w-9 h-9 rounded-full bg-brand text-white font-black text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                  <div>
                    <h3 className="text-sm font-black">{s.t}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-5">
            <h2 className="text-2xl font-black">شروط العينات الصوتية</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 bg-white border border-emerald-200 rounded-2xl space-y-3">
                <h3 className="text-sm font-black text-emerald-700">تُقبل العينة إذا كانت</h3>
                <ul className="space-y-2">
                  {SAMPLE_RULES_OK.map(r => (
                    <li key={r} className="flex gap-2 text-xs text-slate-700 leading-relaxed"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>{r}</span></li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-white border border-rose-200 rounded-2xl space-y-3">
                <h3 className="text-sm font-black text-rose-700">تُرفض العينة إذا كانت</h3>
                <ul className="space-y-2">
                  {SAMPLE_RULES_NO.map(r => (
                    <li key={r} className="flex gap-2 text-xs text-slate-700 leading-relaxed"><XCircle className="w-4 h-4 text-rose-500 shrink-0" /><span>{r}</span></li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">يمكنك رفع أكثر من عينة بلهجات وتصنيفات مختلفة، وكلما تنوعت عيناتك زادت فرص حجزك. تفاصيل تجهيز الاستوديو المنزلي في <Link to="/ar/guides" className="text-brand-text font-bold hover:underline">دليل الاستوديو المنزلي</Link>.</p>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-3">
            <h2 className="text-xl font-black">جاهز لتقديم طلبك؟</h2>
            <p className="text-sm text-slate-300">جهّز عينتك الأولى وقدّم طلب الانضمام كمعلق صوتي.</p>
            <button type="button" onClick={openTalentSignup} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold transition cursor-pointer">
              <span>انضم كمعلق</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
