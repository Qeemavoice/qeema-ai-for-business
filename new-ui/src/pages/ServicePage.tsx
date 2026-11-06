import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, ChevronDown, Film, Mic2, Phone, Radio, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeoFaq, useSeo } from '../seo/useSeo';

interface ServiceDefinition {
  slug: 'dubbing' | 'audiobooks' | 'podcast' | 'ivr';
  title: string;
  pageTitle: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  audiences: string[];
  useCases: string[];
  steps: { title: string; description: string }[];
  faqs: SeoFaq[];
}

export const servicePages: Record<ServiceDefinition['slug'], ServiceDefinition> = {
  dubbing: {
    slug: 'dubbing',
    title: 'خدمة الدبلجة العربية',
    pageTitle: 'دبلجة عربية احترافية بأصوات بشرية | قيمة',
    description: 'دبلجة عربية للإعلانات والأفلام والمحتوى التعليمي بأصوات بشرية، مع مراجعة النص والتسجيل والإخراج والهندسة الصوتية.',
    badge: 'دبلجة وإنتاج صوتي متكامل',
    icon: Film,
    audiences: ['شركات الإنتاج والإعلان', 'منصات التعليم الإلكتروني', 'الألعاب والرسوم المتحركة', 'المؤسسات صاحبة المحتوى متعدد اللغات'],
    useCases: ['إعلانات الفيديو والحملات الرقمية', 'الأفلام الوثائقية والمحتوى التعليمي', 'الرسوم المتحركة والشخصيات', 'تعريب عروض الشركات والمنتجات'],
    steps: [
      { title: 'استلام المادة والنص', description: 'نراجع الفيديو والنص والزمن المطلوب لكل مشهد.' },
      { title: 'اختيار الأصوات', description: 'نرشح أصواتاً بشرية تناسب الشخصيات والسوق المستهدف.' },
      { title: 'التسجيل والإخراج', description: 'نسجل الأداء بإشراف صوتي يحافظ على المعنى والإحساس.' },
      { title: 'المكساج والتسليم', description: 'نوازن الصوت ونجهز الملفات بالصيغ المتفق عليها.' },
    ],
    faqs: [
      { question: 'هل تتوفر الدبلجة بالفصحى واللهجات؟', answer: 'نعم، يمكن تنفيذ المشروع بالفصحى أو باللهجة المناسبة للجمهور حسب توفر المعلقين.' },
      { question: 'هل تشمل الخدمة مزامنة الصوت مع الفيديو؟', answer: 'نحدد مستوى المزامنة المطلوب عند استلام المادة، ثم يُدرج ضمن نطاق العمل وعرض السعر.' },
      { question: 'كيف يتم تسعير مشروع الدبلجة؟', answer: 'يعتمد السعر على مدة المادة وعدد الشخصيات واللغة ومستوى الإخراج والهندسة المطلوبة.' },
    ],
  },
  audiobooks: {
    slug: 'audiobooks',
    title: 'تسجيل الكتب الصوتية',
    pageTitle: 'تسجيل الكتب الصوتية بأصوات عربية بشرية | قيمة',
    description: 'إنتاج كتب صوتية عربية بصوت بشري واضح، بدءاً من مراجعة النص واختيار الراوي حتى التسجيل والتنقية والتقسيم الجاهز للنشر.',
    badge: 'سرد طويل بجودة استوديو',
    icon: BookOpen,
    audiences: ['دور النشر', 'المؤلفون والكتّاب', 'منصات الكتب الصوتية', 'المؤسسات التعليمية والثقافية'],
    useCases: ['الروايات والقصص', 'الكتب المعرفية والتعليمية', 'كتب الأطفال', 'الأدلة والتقارير المسموعة'],
    steps: [
      { title: 'تدقيق النص', description: 'نراجع الأسماء والمصطلحات وعلامات الوقف قبل التسجيل.' },
      { title: 'اختيار الراوي', description: 'نختار خامة صوت وإيقاعاً مناسبين لطبيعة الكتاب.' },
      { title: 'التسجيل والمتابعة', description: 'يُسجل المحتوى في جلسات منظمة مع مراجعة مستمرة.' },
      { title: 'التقسيم والتسليم', description: 'ننظف الصوت ونقسم الفصول ونسلمها بالصيغ المطلوبة.' },
    ],
    faqs: [
      { question: 'هل أستطيع الاستماع إلى عينة قبل بدء الكتاب؟', answer: 'نعم، يمكن طلب عينة قصيرة من الراوي المختار قبل اعتماد الإنتاج الكامل.' },
      { question: 'هل يشمل التسجيل التدقيق اللغوي؟', answer: 'تتضمن العملية مراجعة نطق ومصطلحات، ويمكن إضافة تدقيق لغوي موسع حسب احتياج الكتاب.' },
      { question: 'ما مدة تنفيذ الكتاب الصوتي؟', answer: 'تعتمد المدة على عدد الكلمات وطول الكتاب وتوفر الراوي، ويُحدد جدول واضح قبل بدء المشروع.' },
    ],
  },
  podcast: {
    slug: 'podcast',
    title: 'إنتاج مقدمات البودكاست',
    pageTitle: 'تعليق صوتي وإنتاج مقدمات بودكاست عربي | قيمة',
    description: 'مقدمات وخواتيم وفواصل بودكاست بصوت عربي بشري يعكس هوية البرنامج، مع هندسة صوتية وتسليم جاهز للمونتاج.',
    badge: 'هوية صوتية للبرامج والبودكاست',
    icon: Radio,
    audiences: ['منتجو البودكاست', 'العلامات التجارية', 'المنصات الإعلامية', 'الجهات التعليمية والثقافية'],
    useCases: ['مقدمة وخاتمة البرنامج', 'فواصل الرعاية والإعلانات', 'الإعلانات التشويقية للحلقات', 'تعريف الضيوف والفقرات'],
    steps: [
      { title: 'فهم هوية البرنامج', description: 'نحدد الجمهور والنبرة وسرعة الأداء المطلوبة.' },
      { title: 'اختيار المعلق', description: 'نرشح أصواتاً تتوافق مع شخصية البودكاست.' },
      { title: 'تسجيل النسخ', description: 'نسجل الأداء ونراجع وضوح الأسماء والرسائل.' },
      { title: 'هندسة وتسليم', description: 'نسلم ملفات نظيفة وجاهزة للإضافة إلى الحلقات.' },
    ],
    faqs: [
      { question: 'هل تقدمون صوتاً واحداً لكل حلقات الموسم؟', answer: 'نعم، يمكن حجز المعلق نفسه لبناء هوية صوتية ثابتة للبرنامج أو الموسم.' },
      { question: 'هل يمكن تسجيل فواصل متعددة في جلسة واحدة؟', answer: 'نعم، نجمع النصوص المعتمدة في جلسة منظمة لتقليل الوقت والتكلفة.' },
      { question: 'هل الموسيقى جزء من الخدمة؟', answer: 'يمكن تحديد احتياج الموسيقى والمؤثرات ضمن عرض السعر وحقوق الاستخدام المطلوبة.' },
    ],
  },
  ivr: {
    slug: 'ivr',
    title: 'تسجيلات الرد الآلي IVR',
    pageTitle: 'تسجيلات الرد الآلي ومراكز الاتصال بالعربية | قيمة',
    description: 'رسائل ترحيب وقوائم رد آلي وانتظار بأصوات عربية واضحة ومهنية، جاهزة لأنظمة السنترال ومراكز الاتصال.',
    badge: 'صوت احترافي لكل مكالمة',
    icon: Phone,
    audiences: ['البنوك وشركات الاتصالات', 'المتاجر والخدمات', 'الجهات الحكومية', 'المستشفيات ومراكز الحجز'],
    useCases: ['رسائل الترحيب', 'القوائم الصوتية وتحويل المكالمات', 'رسائل الانتظار وخارج الدوام', 'التنبيهات والتعليمات الهاتفية'],
    steps: [
      { title: 'مراجعة شجرة الاتصال', description: 'نتأكد من ترتيب القوائم والأرقام وسهولة فهم التعليمات.' },
      { title: 'اختيار النبرة واللهجة', description: 'نحدد صوتاً واضحاً يناسب هوية المؤسسة والعملاء.' },
      { title: 'التسجيل والمراجعة', description: 'نسجل كل رسالة باسم منظم ونراجع الأرقام والمصطلحات.' },
      { title: 'تهيئة الملفات', description: 'نسلم الملفات منفصلة وبالصيغة الملائمة لنظام الاتصال.' },
    ],
    faqs: [
      { question: 'هل تدعمون صيغ أنظمة السنترال المختلفة؟', answer: 'نعم، نجهز الملفات وفق الصيغة ومعدل العينة المطلوبين من مزود نظام الاتصال.' },
      { question: 'هل يمكن تحديث رسالة واحدة لاحقاً؟', answer: 'نعم، يمكن تسجيل التعديلات أو الرسائل الجديدة بنفس المعلق للحفاظ على اتساق الهوية.' },
      { question: 'هل يمكن تنفيذ أكثر من لغة؟', answer: 'يمكن تنظيم المشروع بعدة لغات أو لهجات حسب توفر المعلقين ونطاق المشروع.' },
    ],
  },
};

interface ServicePageProps {
  service: ServiceDefinition;
  onOpenDemo: () => void;
}

export const ServicePage: React.FC<ServicePageProps> = ({ service, onOpenDemo }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const Icon = service.icon;

  useSeo({ path: `/ar/services/${service.slug}`, title: service.pageTitle, description: service.description, type: 'service', faqs: service.faqs });

  return (
    <div className="min-h-screen bg-[#FDFBF9] pb-20 text-slate-900" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 pt-5 text-xs text-slate-500 sm:px-6 lg:px-8">
        <Link to="/ar" className="transition hover:text-[#FF5500]">الرئيسية</Link>
        <span className="px-2">/</span>
        <span className="font-bold text-slate-800">{service.title}</span>
      </div>

      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_.65fr] lg:px-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-[#FF5500]"><Sparkles className="h-4 w-4" />{service.badge}</span>
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-5xl">{service.title}</h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{service.description}</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onOpenDemo} className="inline-flex items-center gap-2 rounded-2xl bg-[#FF5500] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#E04800]"><span>اطلب عرض سعر</span><ArrowLeft className="h-4 w-4" /></button>
              <a href="/new-ui/?view=voice-library" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:border-orange-300 hover:bg-white"><Volume2 className="h-4 w-4 text-[#FF5500]" />استمع للأصوات</a>
            </div>
          </div>
          <div className="mx-auto grid aspect-square w-full max-w-sm place-items-center rounded-[40px] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-purple-50 shadow-xl shadow-orange-900/5">
            <span className="grid h-32 w-32 place-items-center rounded-[36px] bg-slate-950 text-white shadow-2xl"><Icon className="h-16 w-16 text-[#FF5500]" /></span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl space-y-9 px-4 sm:px-6 lg:px-8">
          <div><span className="text-xs font-bold text-[#FF5500]">الفئات المستفيدة</span><h2 className="mt-2 text-2xl font-black sm:text-3xl">لمن تناسب هذه الخدمة؟</h2></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{service.audiences.map((audience) => <article key={audience} className="rounded-2xl border border-slate-200 bg-white p-5"><ShieldCheck className="mb-4 h-5 w-5 text-emerald-500" /><h3 className="text-sm font-bold">{audience}</h3></article>)}</div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl space-y-9 px-4 sm:px-6 lg:px-8">
          <div><span className="text-xs font-bold text-[#FF5500]">مجالات الاستخدام</span><h2 className="mt-2 text-2xl font-black sm:text-3xl">ماذا نستطيع تنفيذه؟</h2></div>
          <div className="grid gap-4 md:grid-cols-2">{service.useCases.map((useCase) => <article key={useCase} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /><h3 className="text-sm font-bold">{useCase}</h3></article>)}</div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl space-y-9 px-4 sm:px-6 lg:px-8">
          <div><span className="text-xs font-bold text-[#FF5500]">خطوات واضحة</span><h2 className="mt-2 text-2xl font-black sm:text-3xl">من الطلب حتى التسليم</h2></div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{service.steps.map((step, index) => <article key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6"><span className="text-3xl font-black text-orange-200">{String(index + 1).padStart(2, '0')}</span><h3 className="mt-4 font-black">{step.title}</h3><p className="mt-2 text-xs leading-6 text-slate-600">{step.description}</p></article>)}</div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div><span className="text-xs font-bold text-orange-400">أصوات بشرية من منصة قيمة</span><h2 className="mt-2 text-2xl font-black">استمع إلى العينات واختر الصوت المناسب</h2><p className="mt-2 text-sm text-slate-400">جميع العينات مرتبطة بملفات المعلقين المنشورة داخل المنصة.</p></div>
          <a href="/new-ui/?view=voice-library" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950"><Mic2 className="h-4 w-4 text-[#FF5500]" />فتح مكتبة الأصوات</a>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center"><span className="text-xs font-bold text-[#FF5500]">الأسئلة الشائعة</span><h2 className="mt-2 text-2xl font-black sm:text-3xl">معلومات قبل طلب الخدمة</h2></div>
          <div className="space-y-3">{service.faqs.map((faq, index) => { const isOpen = openFaq === index; return <article key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)} className="flex w-full items-center justify-between gap-4 p-5 text-right text-sm font-bold"><span>{faq.question}</span><ChevronDown className={`h-4 w-4 shrink-0 transition ${isOpen ? 'rotate-180 text-[#FF5500]' : 'text-slate-400'}`} /></button>{isOpen && <p className="border-t border-slate-100 px-5 py-4 text-xs leading-7 text-slate-600">{faq.answer}</p>}</article>; })}</div>
        </div>
      </section>
    </div>
  );
};
