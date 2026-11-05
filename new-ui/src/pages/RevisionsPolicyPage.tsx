import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';

type Verdict = 'free' | 'part' | 'paid';

const VERDICT_STYLE: Record<Verdict, string> = {
  free: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  part: 'bg-orange-50 text-brand-text border-orange-200',
  paid: 'bg-amber-50 text-amber-800 border-amber-200'
};
const VERDICT_WORD: Record<Verdict, string> = { free: 'مجاني', part: 'جولة مجانية', paid: 'مدفوع' };

const CASES: { k: string; label: string; v: Verdict; t: string; d: string }[] = [
  { k: 'mispron', label: 'المعلق نطق كلمة بشكل خاطئ', v: 'free', t: 'تصحيح خطأ المعلق: مجاني', d: 'أرسل توقيت الكلمة والنطق الصحيح. يُصحَّح دون تكلفة خلال 30 يومًا من التسليم.' },
  { k: 'dialect', label: 'اللهجة لا تطابق ما طلبته', v: 'free', t: 'تصحيح خطأ المعلق: مجاني', d: 'إذا كانت اللهجة مذكورة في البريف، يُعاد التسجيل مجانًا، ويتدخل فريق الجودة إذا لزم الأمر.' },
  { k: 'noise', label: 'في الملف ضجيج أو تقطيع', v: 'free', t: 'تصحيح خطأ المعلق: مجاني', d: 'مشاكل الجودة التقنية مسؤولية المعلق وتُصلح مجانًا دائمًا.' },
  { k: 'speed', label: 'أريده أسرع أو أبطأ', v: 'part', t: 'تعديل أداء: الجولة الأولى مجانية', d: 'جولة واحدة مجانية خلال 14 يومًا. اجمع كل ملاحظات الأداء في رسالة واحدة.' },
  { k: 'energy', label: 'أريد نبرة أهدأ أو طاقة أعلى', v: 'part', t: 'تعديل أداء: الجولة الأولى مجانية', d: 'مجانية ما دامت ضمن روح البريف. تغيير الاتجاه كليًا يُعامل كتسجيل جديد.' },
  { k: 'word', label: 'غيّرت جملة أو رقمًا في النص', v: 'paid', t: 'تغيير نص: 20% من قيمة الطلب', d: 'ينطبق على جملة أو جملتين. أرسل الجملة الجديدة مع التي قبلها وبعدها.' },
  { k: 'para', label: 'أعدت كتابة فقرة أو أكثر', v: 'paid', t: 'تغيير نص: 40% من قيمة الطلب', d: 'ينطبق حتى 30% من النص الأصلي. أكثر من ذلك يُعامل كتسجيل جديد.' },
  { k: 'brand', label: 'لم أكتب نطق اسم العلامة مسبقًا', v: 'paid', t: 'تغيير بريف: برسوم تعديل بسيط', d: 'النطق غير المكتوب في البريف يُعد معلومة جديدة. في المرة القادمة أرفق دليل نطق قبل التسجيل.' }
];

const FAQS = [
  { q: 'هل تصحيح خطأ المعلق في النطق مجاني؟', a: 'نعم. أي خطأ من المعلق في النطق أو القراءة أو جودة الصوت يُصحَّح مجانًا ودون حد لعدد المرات خلال 30 يومًا من التسليم.' },
  { q: 'كم جولة تعديل مجانية على الأداء؟', a: 'جولة واحدة مجانية لتعديل الأداء (السرعة، الطاقة، النبرة) خلال 14 يومًا من التسليم، بشرط أن يكون التعديل ضمن التوجيهات المكتوبة في البريف الأصلي.' },
  { q: 'ماذا لو غيّرت النص بعد التسجيل؟', a: 'تغيير النص بعد التسجيل يعني جلسة تسجيل جديدة للمعلق، وله رسوم حسب حجم التغيير: 20% من قيمة الطلب لجملة أو جملتين، و40% حتى 30% من النص، ويُعامل التغيير الأكبر كتسجيل جديد.' },
  { q: 'هل أستطيع طلب صوت مختلف إذا لم يعجبني المعلق؟', a: 'اختيار المعلق يتم بعد سماع عيناته، لذا لا يُعد تغيير المعلق بعد التسجيل تعديلًا. لكن إذا لم يلتزم المعلق باللهجة أو النبرة المكتوبة في البريف، يتدخل فريق الجودة لإعادة التسجيل أو استبدال المعلق دون تكلفة.' },
  { q: 'كم يستغرق تنفيذ التعديل؟', a: 'تُسلَّم تصحيحات أخطاء المعلق وجولة تعديل الأداء خلال 48 ساعة عمل في الغالب، حسب توفر المعلق. التعديلات المدفوعة تأخذ مدة تسليم طلب جديد.' }
];

const Badge: React.FC<{ v: Verdict; children: React.ReactNode }> = ({ v, children }) => (
  <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full border ${VERDICT_STYLE[v]}`}>{children}</span>
);

export const RevisionsPolicyPage: React.FC = () => {
  useSeo(STATIC_SEO_ROUTES['/ar/p/revisions-policy']);
  const [selected, setSelected] = useState(CASES[0].k);
  const current = CASES.find(c => c.k === selected)!;

  // FAQPage structured data
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'qeema-faq-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    });
    document.head.appendChild(script);
    return () => { document.getElementById('qeema-faq-jsonld')?.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'سياسة التعديلات', item: '/ar/p/revisions-policy' }
        ]} />
      </div>

      {/* Hero */}
      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand-text text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>سياسة واضحة ومعلنة مسبقًا</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            سياسة التعديلات: <span className="text-brand-text">متى يكون التعديل مجانيًا؟</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            نتبع في قيمة فويس القاعدة المعمول بها في استوديوهات التعليق الصوتي حول العالم: خطأ المعلق يُصلح على حسابنا، وتعديل الأداء ضمن البريف له جولة مجانية، وتغيير النص بعد التسجيل يعني جلسة جديدة لها رسوم واضحة ومعلنة مسبقًا.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 pt-2">
            <span>أخطاء المعلق: <b className="text-slate-900">مجانًا لمدة 30 يومًا</b></span>
            <span>تعديل الأداء: <b className="text-slate-900">جولة مجانية خلال 14 يومًا</b></span>
            <span>مدة التنفيذ: <b className="text-slate-900">48 ساعة عمل</b></span>
          </div>
        </div>
      </section>

      {/* Three types */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-text">أنواع التعديلات الثلاثة</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">كل طلب تعديل يندرج تحت واحد من ثلاثة أنواع</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">السؤال الذي يحدد التكلفة بسيط: هل كان المطلوب واضحًا ومكتوبًا قبل التسجيل؟ إذا كان كذلك ولم يلتزم به التسجيل، فالتعديل مجاني.</p>
          </div>

          <article className="bg-white border border-slate-200 rounded-3xl p-6 grid md:grid-cols-[200px_1fr] gap-5">
            <div className="space-y-2">
              <h3 className="text-base font-black">تصحيح خطأ المعلق</h3>
              <Badge v="free">مجاني دائمًا</Badge>
            </div>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>أي خطأ يتحمله المعلق نصلحه دون تكلفة ودون حد لعدد المرات، ما دام الطلب خلال 30 يومًا من التسليم.</p>
              <ul className="list-disc pr-5 space-y-1 marker:text-brand-text">
                <li>كلمة منطوقة خطأ أو مشكّلة خطأ عن النص المرسل</li>
                <li>كلمة أو جملة ساقطة أو مكررة</li>
                <li>اللهجة لا تطابق المطلوب في البريف (مثل نجدي بدل حجازي)</li>
                <li>ضجيج أو صدى أو تقطيع أو جودة صوت أقل من المواصفات المتفق عليها</li>
                <li>نطق اسم علم بطريقة تخالف دليل النطق المرسل</li>
              </ul>
            </div>
          </article>

          <article className="bg-white border border-slate-200 rounded-3xl p-6 grid md:grid-cols-[200px_1fr] gap-5">
            <div className="space-y-2">
              <h3 className="text-base font-black">تعديل الأداء</h3>
              <Badge v="part">جولة واحدة مجانية</Badge>
            </div>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>إذا كان التسجيل صحيحًا لكن الإحساس لا يناسبك، تحصل على جولة تعديل مجانية واحدة خلال 14 يومًا من التسليم.</p>
              <ul className="list-disc pr-5 space-y-1 marker:text-brand-text">
                <li>أسرع أو أبطأ، أو لضبط المدة على توقيت الفيديو المتفق عليه</li>
                <li>طاقة أعلى أو نبرة أهدأ أو أكثر دفئًا</li>
                <li>تغيير التأكيد على كلمة أو جملة معيّنة</li>
              </ul>
              <p className="bg-slate-50 rounded-xl p-3 text-[13px]">الشرط: أن يبقى التعديل ضمن روح البريف الأصلي. أما تغيير الاتجاه كليًا (من إعلان حماسي إلى سرد وثائقي مثلًا) فيُعامل كتسجيل جديد. الجولات بعد الأولى تُحسب كتعديل نص بسيط.</p>
            </div>
          </article>

          <article className="bg-white border border-slate-200 rounded-3xl p-6 grid md:grid-cols-[200px_1fr] gap-5">
            <div className="space-y-2">
              <h3 className="text-base font-black">تغيير النص أو البريف</h3>
              <Badge v="paid">برسوم حسب الحجم</Badge>
            </div>
            <div className="text-sm text-slate-600 space-y-3 leading-relaxed min-w-0">
              <p>إضافة كلمات أو حذفها أو إعادة صياغة بعد التسجيل، أو معلومات جديدة لم تكن في البريف (فيديو توقيت، صوت مرجعي، نطق مفضّل لم يُكتب). كل ذلك يتطلب جلسة تسجيل جديدة من المعلق.</p>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm min-w-[360px]">
                  <thead className="bg-slate-50 text-xs">
                    <tr><th className="text-right p-3 font-bold">حجم التغيير</th><th className="text-right p-3 font-bold">الرسوم</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200"><td className="p-3">جملة أو جملتان</td><td className="p-3 font-bold">20%</td></tr>
                    <tr className="border-t border-slate-200"><td className="p-3">فقرة أو أكثر، حتى 30% من النص</td><td className="p-3 font-bold">40%</td></tr>
                    <tr className="border-t border-slate-200"><td className="p-3">أكثر من 30% من النص، أو بريف جديد</td><td className="p-3">تسجيل جديد بسعره</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="bg-slate-50 rounded-xl p-3 text-[13px]">النسب من قيمة الطلب الأصلي لنفس المعلق. لو تعدّل الاسم أو الرقم في النص لأنه كان خطأ لديك، فهو تغيير نص؛ ولو نطقه المعلق خطأ رغم صحته في النص، فهو تصحيح مجاني.</p>
            </div>
          </article>
        </div>
      </section>

      {/* Classifier */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div>
            <span className="text-xs font-bold text-brand-text">اعرف نوع تعديلك</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">ما الذي تريد تعديله؟</h2>
            <p className="text-sm text-slate-600 mt-2">اختر الحالة الأقرب لطلبك لتعرف تصنيفه وتكلفته قبل أن ترسله.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-5 pb-2 text-sm font-bold">حالتي هي:</div>
            <div className="grid sm:grid-cols-2 gap-2 p-5 pt-3" role="radiogroup" aria-label="حالة التعديل">
              {CASES.map(c => (
                <button
                  key={c.k}
                  role="radio"
                  aria-checked={selected === c.k}
                  onClick={() => setSelected(c.k)}
                  className={`text-right px-4 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                    selected === c.k ? 'border-brand bg-orange-50 font-bold text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-1.5" aria-live="polite">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge v={current.v}>{VERDICT_WORD[current.v]}</Badge>
                <span className="font-black text-base">{current.t}</span>
              </div>
              <p className="text-sm text-slate-600">{current.d}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Windows */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div>
            <span className="text-xs font-bold text-brand-text">المدد الزمنية</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">متى تطلب التعديل، ومتى تستلمه</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { n: '30', u: 'يومًا', d: 'المدة المتاحة لطلب تصحيح أخطاء المعلق مجانًا من تاريخ التسليم.' },
              { n: '14', u: 'يومًا', d: 'المدة المتاحة لاستخدام جولة تعديل الأداء المجانية.' },
              { n: '48', u: 'ساعة عمل', d: 'المدة المعتادة لتسليم التصحيحات وجولة الأداء، حسب توفر المعلق.' }
            ].map(w => (
              <div key={w.n} className="bg-white border border-slate-200 border-t-4 border-t-brand rounded-2xl p-5">
                <div className="text-3xl font-black text-brand-text leading-tight">{w.n} <span className="text-sm font-bold text-slate-800">{w.u}</span></div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{w.d}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">بعد انتهاء هذه المدد تُعامل أي تعديلات كطلب جديد، لأن المعلق قد لا يستطيع إعادة نفس ظروف التسجيل والميكروفون والإحساس بعد فترة طويلة.</p>
        </div>
      </section>

      {/* How to request */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-text">طريقة الطلب</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">كيف ترسل طلب تعديل يُنفَّذ من أول مرة</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <ol className="space-y-4">
              {[
                { t: 'اجمع كل الملاحظات في رسالة واحدة', d: 'الجولة المجانية تُحسب بعدد الرسائل لا بعدد الملاحظات. أرسل كل ما تريد تعديله دفعة واحدة.' },
                { t: 'حدد المكان بالتوقيت', d: 'اكتب توقيت الجملة في الملف (مثل 00:12)، والجملة نفسها، والجملة التي قبلها وبعدها، حتى يطابق المعلق النبرة.' },
                { t: 'صِف المطلوب بدقة', d: '"أسرع قليلًا" أوضح من "ليست جيدة". ولو كان النطق هو المشكلة، اكتب الكلمة بالتشكيل أو أرفق تسجيلًا صوتيًا لها.' },
                { t: 'أرسلها من صفحة الطلب', d: 'من حسابك في قيمة فويس داخل محادثة المشروع، ليبقى كل شيء موثقًا مع الطلب الأصلي.' }
              ].map((s, i) => (
                <li key={s.t} className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-brand text-white text-sm font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <div>
                    <b className="block text-sm">{s.t}</b>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-sm" aria-label="مثال على ورقة ملاحظات التعديل">
              <div className="flex justify-between items-center gap-2 flex-wrap px-4 py-3 bg-slate-50 text-xs font-bold">
                <span>مثال: ورقة ملاحظات طلب #QV-2481</span>
                <span dir="ltr" className="text-slate-400 font-mono">spot_ramadan_v1.wav</span>
              </div>
              <div className="flex gap-3 px-4 py-3 border-t border-slate-200">
                <span dir="ltr" className="font-mono text-[11px] border border-slate-200 rounded px-1.5 h-fit">00:03</span>
                <div>"أهلًا بكم في <b>تمّور</b>" <Badge v="free">خطأ معلق</Badge>
                  <span className="block text-xs text-slate-500 mt-1">النطق الصحيح بتشديد الميم، كما في دليل النطق.</span></div>
              </div>
              <div className="flex gap-3 px-4 py-3 border-t border-slate-200">
                <span dir="ltr" className="font-mono text-[11px] border border-slate-200 rounded px-1.5 h-fit">00:11</span>
                <div>"عروض تبدأ من اليوم" <Badge v="part">أداء</Badge>
                  <span className="block text-xs text-slate-500 mt-1">نريدها أدفأ وأبطأ قليلًا، مثل نبرة الافتتاح.</span></div>
              </div>
              <div className="flex gap-3 px-4 py-3 border-t border-slate-200">
                <span dir="ltr" className="font-mono text-[11px] border border-slate-200 rounded px-1.5 h-fit">00:18</span>
                <div>"خصم <s className="text-slate-400">20%</s> <ins className="no-underline bg-amber-100 px-1 rounded">25%</ins> على كل الطلبات" <Badge v="paid">تغيير نص</Badge>
                  <span className="block text-xs text-slate-500 mt-1">تغيّر العرض بعد التسجيل، جملة واحدة.</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avoid paid */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div>
            <span className="text-xs font-bold text-brand-text">قبل التسجيل</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">أربع خطوات توفّر عليك أي تعديل مدفوع</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { t: 'اعتمد النص نهائيًا', d: 'راجع الأرقام والأسعار والتواريخ وأسماء المنتجات مع كل من يجب أن يوافق، قبل إرسال الطلب.' },
              { t: 'أرفق دليل نطق', d: 'الأسماء الأجنبية، والعلامات التجارية، والكلمات التي تُنطق بأكثر من طريقة. اكتبها بالتشكيل أو سجّلها بصوتك.' },
              { t: 'حدد المدة واللهجة', d: 'إذا كان الصوت لفيديو مدته 30 ثانية فاكتبها، واذكر اللهجة الدقيقة (سعودي نجدي، إماراتي، مصري قاهري).' },
              { t: 'أرسل مرجعًا للنبرة', d: 'رابط إعلان أو عينة من مكتبة الأصوات تحب إحساسها. المرجع يختصر جولات من الشرح.' }
            ].map(t => (
              <div key={t.t} className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="text-sm font-black">{t.t}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special cases */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div>
            <span className="text-xs font-bold text-brand-text">حالات خاصة</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">كيف تطبق السياسة على كل خدمة</h2>
          </div>
          <div className="border-t border-slate-200">
            {[
              { t: 'الجلسات الموجّهة مباشرة', d: 'إذا حضرت التسجيل وأعطيت المعلق ملاحظاتك أثناء الجلسة، فكل التعديلات داخل الوقت المحجوز مجانية. بعد انتهاء الجلسة تنطبق السياسة العادية.' },
              { t: 'الدوبلاج', d: 'إعطاء جملة لشخصية غير صاحبتها، أو أداء لا يطابق وصف الشخصية المرسل، يُعد خطأ يُصلح مجانًا. تغيير الترجمة أو الحوار بعد التسجيل يُعد تغيير نص.' },
              { t: 'الكتب الصوتية', d: 'أخطاء القراءة تُصلح مجانًا بعد مراجعتك للفصل. نوصي بمراجعة الفصل الأول قبل إكمال الكتاب لتثبيت الإيقاع والنبرة.' },
              { t: 'الرد الآلي IVR', d: 'تغيير خيارات القائمة أو أرقام التحويل أو أوقات الدوام بعد التسجيل يُعد تغيير نص، وتغطيه باقات الاشتراك الشهرية ضمن حدودها.' },
              { t: 'معاينات الصوت بالذكاء الاصطناعي', d: 'المعاينة تُستخدم للتجربة قبل الحجز ولا تخضع لهذه السياسة. سياسة التعديلات تبدأ مع التسجيل البشري النهائي الذي تحجزه.' }
            ].map(c => (
              <div key={c.t} className="grid md:grid-cols-[200px_1fr] gap-1 md:gap-6 py-4 border-b border-slate-200">
                <h3 className="text-sm font-black">{c.t}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div>
            <span className="text-xs font-bold text-brand-text">أسئلة شائعة</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">أسئلة عن التعديلات</h2>
          </div>
          <div className="space-y-2.5">
            {FAQS.map(f => (
              <details key={f.q} className="group bg-white border border-slate-200 rounded-2xl">
                <summary className="cursor-pointer list-none p-4 text-sm font-bold flex items-center justify-between gap-3">
                  <span>{f.q}</span>
                  <span className="text-brand-text text-xl leading-none group-open:hidden">+</span>
                  <span className="text-brand-text text-xl leading-none hidden group-open:inline">−</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            آخر تحديث: 26 أكتوبر 2026. هذه السياسة جزء من <Link to="/ar/p/terms-of-use" className="text-brand-text font-bold hover:underline">الشروط والأحكام</Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-3">
            <h2 className="text-xl font-black">ابدأ مشروعك بنص جاهز وبريف واضح</h2>
            <p className="text-sm text-slate-300">استمع لعينات المعلقين، واختر الصوت المناسب، وأرسل نصك مع دليل النطق.</p>
            <div className="flex gap-3 flex-wrap pt-1">
              <Link to="/ar/voices" className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold transition">تصفح مكتبة الأصوات</Link>
              <Link to="/ar/contact-us" className="px-6 py-2.5 rounded-xl border border-white/30 hover:bg-white/10 text-white text-xs font-bold transition">تواصل معنا</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
