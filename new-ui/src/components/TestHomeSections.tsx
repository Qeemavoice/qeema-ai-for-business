import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronDown, Headphones, Mic2, Play, Pause, Sparkles, Star } from 'lucide-react';
import { Voice } from '../types';

type Showcase = {
  categories: { id: string; name: string; icon: string }[];
  works: { id: string; title: string; url: string }[];
  customers: { id: string; name: string; imageUrl: string | null; alt: string }[];
  partners: { id: string; name: string; jobTitle: string; description: string; imageUrl: string | null; alt: string }[];
  faqs: { id: string; title: string; details: string }[];
};

const initialShowcase: Showcase = { categories: [], works: [], customers: [], partners: [], faqs: [] };

export const TestHomeSections: React.FC<{
  voices: Voice[];
  onOpenVoiceLibrary: () => void;
  onSelectForBooking: (voice: Voice) => void;
  onOpenWorks: () => void;
  onOpenDemo: () => void;
}> = ({ voices, onOpenVoiceLibrary, onSelectForBooking, onOpenWorks, onOpenDemo }) => {
  const [data, setData] = useState<Showcase>(initialShowcase);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/v1/home-showcase', { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((response) => setData({ ...initialShowcase, ...response }))
      .catch(() => setData(initialShowcase));
    return () => audio.current?.pause();
  }, []);

  const featuredVoices = useMemo(() => voices.filter((voice) => voice.isActive).slice(0, 6), [voices]);
  const playVoice = (voice: Voice) => {
    if (!voice.previewUrl) return;
    if (playingId === voice.id) {
      audio.current?.pause();
      setPlayingId(null);
      return;
    }
    audio.current?.pause();
    const next = new Audio(voice.previewUrl);
    next.onended = () => setPlayingId(null);
    next.onerror = () => setPlayingId(null);
    next.play().then(() => {
      audio.current = next;
      setPlayingId(voice.id);
    }).catch(() => setPlayingId(null));
  };

  return <div className="overflow-hidden bg-[#fffdf9]" dir="rtl">
    <section className="relative overflow-hidden bg-[#fff8f0] px-4 pb-16 pt-14 sm:pb-24 sm:pt-20">
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-[#ffad5b]/25 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#18345a]/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div className="text-center lg:text-right">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-black text-[#ef5a24]"><Sparkles className="h-4 w-4" /> منصة قيمة فويس</span>
          <h1 className="mt-5 text-4xl font-black leading-[1.25] text-[#172d4f] sm:text-6xl">أكبر منصة عربية للتعليق الصوتي</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">اختر من نخبة المعلّقين الصوتيين العرب المحترفين، استمع للعينات، واحجز صوت مشروعك بثقة.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <button onClick={onOpenVoiceLibrary} className="inline-flex items-center gap-2 rounded-xl bg-[#ef5a24] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5"><Mic2 className="h-4 w-4" /> احجز الصوت الآن</button>
            <button onClick={onOpenWorks} className="rounded-xl border border-[#172d4f]/15 bg-white px-6 py-3.5 text-sm font-black text-[#172d4f] transition hover:border-[#ef5a24]">شاهد أعمالنا</button>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#172d4f] p-7 shadow-2xl">
            <div className="absolute inset-0 opacity-80" style={{ background: 'radial-gradient(circle at 70% 22%, #ff8b47, transparent 30%), radial-gradient(circle at 25% 75%, #ffc876, transparent 34%)' }} />
            <div className="relative flex h-full flex-col justify-between text-white">
              <span className="w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-black">الصوت الذي يليق بعلامتك</span>
              <div><span className="grid h-16 w-16 place-items-center rounded-3xl bg-white text-[#ef5a24]"><Headphones className="h-8 w-8" /></span><p className="mt-6 text-2xl font-black">استمع، اختر، واحجز</p><p className="mt-2 text-sm leading-7 text-white/75">كل ما تحتاجه لإنتاج مشروعك الصوتي في مكان واحد.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm font-black text-[#ef5a24]">بداية سهلة وواضحة</p>
        <h2 className="mt-3 text-3xl font-black text-[#172d4f]">كيف تحجز خدمة التعليق الصوتي الآن؟</h2>
        <p className="mt-3 text-slate-600">احجز أفضل أصوات المعلّقين الصوتيين في 3 خطوات</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-[#fffaf5] p-7"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#ef5a24] text-lg font-black text-white">1</span><h3 className="mt-5 text-xl font-black">اختر الصوت</h3><p className="mt-2 text-sm leading-7 text-slate-600">تصفح الأصوات حسب اللهجة والتصنيف، واستمع إلى نماذجها.</p></div>
          <div className="rounded-3xl border border-slate-100 bg-[#fffaf5] p-7"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#ef5a24] text-lg font-black text-white">2</span><h3 className="mt-5 text-xl font-black">أرسل تفاصيل مشروعك</h3><p className="mt-2 text-sm leading-7 text-slate-600">أضف النص والتعليمات والموعد الذي يناسب مشروعك.</p></div>
          <div className="rounded-3xl border border-slate-100 bg-[#fffaf5] p-7"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#ef5a24] text-lg font-black text-white">3</span><h3 className="mt-5 text-xl font-black">استلم عملك</h3><p className="mt-2 text-sm leading-7 text-slate-600">تابع التنفيذ واستلم ملفك الصوتي بجودة احترافية.</p></div>
        </div>
      </div>
    </section>

    <section className="border-y border-slate-100 bg-[#f8fafc] px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center"><p className="text-sm font-black text-[#ef5a24]">اعثر على النبرة المناسبة</p><h2 className="mt-3 text-3xl font-black text-[#172d4f]">التصنيفات الصوتية</h2><p className="mt-3 text-slate-600">هنا يمكنك اختيار نوع الأداء الصوتي المطلوب لمشروعك</p></div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {(data.categories.length ? data.categories : [{ id: 'ads', name: 'إعلانات', icon: '✦' }, { id: 'doc', name: 'وثائقيات', icon: '◉' }, { id: 'ivr', name: 'رد آلي', icon: '☎' }, { id: 'dub', name: 'دوبلاج', icon: '◌' }, { id: 'pod', name: 'بودكاست', icon: '◍' }, { id: 'edu', name: 'تعليمي', icon: '▣' }]).map((item) => <button key={item.id} onClick={onOpenVoiceLibrary} className="group rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"><span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-lg text-[#ef5a24]">{item.icon}</span><span className="mt-3 block text-sm font-black text-slate-700 group-hover:text-[#ef5a24]">{item.name}</span></button>)}
        </div>
      </div>
    </section>

    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-right"><div><p className="text-sm font-black text-[#ef5a24]">أصوات بشرية احترافية</p><h2 className="mt-2 text-3xl font-black text-[#172d4f]">الأصوات</h2><p className="mt-2 text-slate-600">استمع إلى نخبة من أفضل معلقينا الصوتيين</p></div><button onClick={onOpenVoiceLibrary} className="inline-flex items-center gap-2 rounded-xl border border-[#172d4f]/15 px-5 py-3 text-sm font-black text-[#172d4f] hover:border-[#ef5a24] hover:text-[#ef5a24]">استمع للمزيد <ArrowLeft className="h-4 w-4" /></button></div>
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{featuredVoices.map((voice) => <article key={voice.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-lg"><div className="flex items-center gap-3"><img src={voice.avatar} alt={voice.name} className="h-12 w-12 rounded-2xl object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} /><div className="min-w-0 flex-1"><h3 className="truncate text-lg font-black">{voice.name}</h3><p className="mt-1 text-xs font-bold text-slate-500">{voice.language}، {voice.dialectLabel || voice.dialect}، {voice.category || voice.styleLabel}</p></div></div><button onClick={() => playVoice(voice)} className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-[#fff7f1] p-3 text-right"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ef5a24] text-white">{playingId === voice.id ? <Pause className="h-4 w-4 fill-current" /> : <Play className="mr-[-2px] h-4 w-4 fill-current" />}</span><span className="flex-1"><span className="block text-xs font-black">تشغيل العينة</span><span className="mt-2 block h-1 rounded-full bg-orange-200" /></span></button><button onClick={() => onSelectForBooking(voice)} className="mt-3 w-full rounded-xl bg-[#172d4f] px-4 py-3 text-sm font-black text-white transition hover:bg-[#ef5a24]">احجز الآن</button></article>)}</div>
      </div>
    </section>

    <section className="bg-[#fff8f0] px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl text-center"><p className="text-sm font-black text-[#ef5a24]">نماذج من الإنتاج</p><h2 className="mt-3 text-3xl font-black text-[#172d4f]">أعمال صوتية نفتخر بها</h2><p className="mt-3 text-slate-600">شاهد كيف يخرج العمل الصوتي بشكله النهائي</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{data.works.slice(0, 6).map((work) => <div key={work.id} className="overflow-hidden rounded-3xl bg-slate-950 shadow-lg"><div className="aspect-video"><iframe src={work.url} title={work.title} className="h-full w-full" allowFullScreen /></div><p className="bg-white px-5 py-4 text-right text-sm font-black text-slate-700">{work.title || 'عمل صوتي من قيمة فويس'}</p></div>)}</div>
        <button onClick={onOpenWorks} className="mt-8 rounded-xl bg-[#ef5a24] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200">شاهد المزيد</button>
      </div>
    </section>

    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl text-center"><p className="text-sm font-black text-[#ef5a24]">ثقة تتحدث عن نفسها</p><h2 className="mt-3 text-3xl font-black text-[#172d4f]">عملاؤنا</h2><p className="mt-3 text-slate-600">أكثر من 250 شركة وثقت بخدماتنا الصوتية</p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">{data.customers.map((customer) => <div key={customer.id} className="grid h-28 place-items-center rounded-2xl border border-slate-100 bg-[#fafafa] p-4">{customer.imageUrl ? <img src={customer.imageUrl} alt={customer.alt || customer.name} className="max-h-16 max-w-full object-contain" /> : <span className="text-sm font-black text-slate-500">{customer.name}</span>}</div>)}</div>
      </div>
    </section>

    <section className="bg-[#f8fafc] px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl"><div className="text-center"><p className="text-sm font-black text-[#ef5a24]">تجارب حقيقية</p><h2 className="mt-3 text-3xl font-black text-[#172d4f]">شركاء النجاح</h2><p className="mt-3 text-slate-600">آراء عملائنا بجودة خدماتنا</p></div><div className="mt-10 grid gap-5 md:grid-cols-2">{data.partners.map((partner) => <article key={partner.id} className="rounded-3xl border border-slate-200 bg-white p-7"><div className="flex items-center gap-3">{partner.imageUrl ? <img src={partner.imageUrl} alt={partner.alt} className="h-12 w-12 rounded-2xl object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#ef5a24]"><Star className="h-5 w-5 fill-current" /></span>}<div><h3 className="font-black">{partner.name}</h3><p className="mt-1 text-xs text-slate-500">{partner.jobTitle}</p></div></div><p className="mt-5 leading-8 text-slate-600">“{partner.description}”</p></article>)}</div></div>
    </section>

    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl"><div className="text-center"><p className="text-sm font-black text-[#ef5a24]">كل ما تحتاج معرفته</p><h2 className="mt-3 text-3xl font-black text-[#172d4f]">الأسئلة الشائعة</h2></div><div className="mt-9 space-y-3">{data.faqs.map((faq) => <article key={faq.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-right"><ChevronDown className={`h-5 w-5 shrink-0 text-[#ef5a24] transition ${openFaq === faq.id ? 'rotate-180' : ''}`} /><span className="font-black text-slate-800">{faq.title}</span></button>{openFaq === faq.id && <p className="border-t border-slate-100 px-5 py-5 text-sm leading-8 text-slate-600">{faq.details}</p>}</article>)}</div></div>
    </section>

    <section className="px-4 pb-16 pt-6"><div className="mx-auto max-w-7xl rounded-[2rem] bg-[#172d4f] px-6 py-12 text-center text-white sm:px-12"><CheckCircle2 className="mx-auto h-9 w-9 text-orange-300" /><h2 className="mt-4 text-3xl font-black">جاهز لبدء مشروعك الصوتي؟</h2><p className="mx-auto mt-3 max-w-xl leading-8 text-slate-300">اختر صوتك الآن أو تواصل معنا لنساعدك على بناء التجربة الصوتية المناسبة.</p><button onClick={onOpenDemo} className="mt-7 rounded-xl bg-[#ef5a24] px-6 py-3.5 text-sm font-black text-white">اطلب مشروعك الصوتي</button></div></section>
  </div>;
};
