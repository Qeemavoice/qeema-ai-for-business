import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpLeft, Building2, CheckCircle2, ChevronLeft, ChevronRight, Headphones, LoaderCircle, Pause, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSeo } from '../seo/useSeo';

interface Story {
  id: string;
  slug: string;
  brand: string;
  brandColor: string | null;
  title: string;
  industry: string;
  voiceCategory: string;
  about: string;
  audioUrl: string | null;
  audioDuration: string | null;
  heroSubtitle: string;
  highlights: string[];
  storyDate?: string | null;
}

const categoryColors = ['#F15A24', '#192D4D', '#227C70', '#7A4B9A', '#AB6E1D', '#D1495B'];

const StoryAudio: React.FC<{ story: Story; active: boolean; onToggle: () => void }> = ({ story, active, onToggle }) => (
  <button
    onClick={onToggle}
    disabled={!story.audioUrl}
    className="group mt-6 flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-right transition hover:border-orange-200 hover:bg-orange-50 disabled:cursor-not-allowed"
    aria-label={active ? `إيقاف عينة ${story.brand}` : `تشغيل عينة ${story.brand}`}
  >
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm transition ${active ? 'bg-slate-950' : 'bg-[#F15A24] group-hover:scale-105'}`}>
      {active ? <Pause className="h-4 w-4 fill-current" /> : <Play className="mr-[-2px] h-4 w-4 fill-current" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-xs font-black text-slate-800">{active ? 'يتم تشغيل العينة الآن' : 'استمع إلى العينة'}</span>
      <span className="mt-1 flex h-1.5 items-center gap-1 overflow-hidden">
        {Array.from({ length: 24 }).map((_, index) => <i key={index} className={`block w-1 rounded-full ${active ? 'animate-pulse bg-[#F15A24]' : 'bg-slate-300'}`} style={{ height: `${20 + ((index * 19) % 75)}%`, animationDelay: `${index * 55}ms` }} />)}
      </span>
    </span>
    <span className="shrink-0 text-xs font-bold text-slate-400">{story.audioDuration || 'عينة صوتية'}</span>
  </button>
);

export const SuccessStoriesPage: React.FC<{ onOpenDemo: () => void }> = ({ onOpenDemo }) => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState('الكل');
  const [activeId, setActiveId] = useState<string | null>(null);

  useSeo({ path: '/ar/our-works', title: 'أعمال صوتية نفتخر بها | قيمة', description: 'شاهد كيف يخرج العمل الصوتي بشكله النهائي، واستمع إلى نماذج من مشاريع وقصص نجاح عملاء قيمة.' });

  useEffect(() => {
    let active = true;
    fetch('/api/v1/stories', { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => active && setStories(Array.isArray(data.items) ? data.items : []))
      .catch(() => active && setStories([]))
      .finally(() => active && setLoaded(true));
    return () => { active = false; };
  }, []);

  useEffect(() => () => audioRef.current?.pause(), []);

  const categories = useMemo(() => ['الكل', ...Array.from(new Set(stories.map((story) => story.voiceCategory).filter(Boolean)))], [stories]);
  const visibleStories = category === 'الكل' ? stories : stories.filter((story) => story.voiceCategory === category);
  const featured = visibleStories[0] || stories[0];

  const toggleAudio = (story: Story) => {
    if (!story.audioUrl) return;
    if (activeId === story.id) {
      audioRef.current?.pause();
      setActiveId(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(story.audioUrl);
    audio.onended = () => setActiveId(null);
    audio.onerror = () => setActiveId(null);
    audio.play().then(() => {
      audioRef.current = audio;
      setActiveId(story.id);
    }).catch(() => setActiveId(null));
  };

  return <main className="overflow-hidden bg-[#faf9f7] pb-16 text-slate-950" dir="rtl">
    <section className="relative isolate overflow-hidden bg-[#10233d] px-4 pb-16 pt-16 text-white sm:pb-24 sm:pt-24">
      <div className="absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 18% 20%, rgba(241,90,36,.42), transparent 28%), radial-gradient(circle at 84% 70%, rgba(254,190,80,.2), transparent 26%)' }} />
      <div className="mx-auto max-w-6xl text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-orange-200 backdrop-blur">
          <Sparkles className="h-4 w-4" /> قصص نجاح صنعت أثرًا مسموعًا
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">أعمال صوتية نفتخر بها</h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">شاهد كيف يخرج العمل الصوتي بشكله النهائي، واستمع إلى نماذج حقيقية من مشاريع نفذتها قيمة لعلامات ومؤسسات عربية.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3 text-sm font-bold">
          <span className="rounded-full bg-white px-4 py-2 text-[#10233d]"><b>{stories.length || '—'}</b> قصة نجاح منشورة</span>
          <span className="rounded-full border border-white/25 px-4 py-2">{Math.max(categories.length - 1, 0) || '—'} تصنيفات صوتية</span>
        </div>
      </div>
    </section>

    {!loaded ? <div className="flex justify-center gap-2 py-24 text-sm font-bold text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" /> جارٍ تحميل الأعمال…</div> : stories.length === 0 ? <section className="mx-auto max-w-3xl px-4 py-20 text-center"><Building2 className="mx-auto h-12 w-12 text-slate-300" /><h2 className="mt-5 text-2xl font-black">لا توجد أعمال منشورة حاليًا</h2><p className="mt-3 text-slate-600">يمكن للإدارة استيراد قصص النجاح من لوحة التحكم ثم نشر ما تم اعتماد نشره.</p></section> : <>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="flex flex-col items-center justify-between gap-5 border-b border-slate-200 pb-7 md:flex-row">
          <div>
            <p className="text-sm font-black text-[#F15A24]">تصفّح الأعمال</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">اختر تصنيفًا واستمع للنتيجة</h2>
          </div>
          <div className="flex max-w-full flex-wrap gap-2">{categories.map((item, index) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2.5 text-xs font-black transition sm:text-sm ${category === item ? 'bg-[#F15A24] text-white shadow-lg shadow-orange-200' : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-[#F15A24]'}`}><span className={`ml-2 inline-block h-2 w-2 rounded-full ${category === item ? 'bg-white' : ''}`} style={category === item ? undefined : { backgroundColor: categoryColors[index % categoryColors.length] }} />{item}</button>)}</div>
        </div>
      </section>

      {featured && <section className="mx-auto max-w-7xl px-4 pb-8 sm:pb-14">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#f0ece6] p-6 sm:p-10 lg:p-14">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl" style={{ backgroundColor: featured.brandColor || '#F15A24' }} />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-[#F15A24] shadow-sm"><CheckCircle2 className="h-4 w-4" /> عمل مميّز</span>
              <p className="mt-7 text-sm font-black text-slate-500">{featured.voiceCategory} · {featured.industry}</p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{featured.title}</h2>
              <p className="mt-5 max-w-2xl leading-8 text-slate-600">{featured.heroSubtitle || featured.about}</p>
              <div className="mt-7 max-w-xl"><StoryAudio story={featured} active={activeId === featured.id} onToggle={() => toggleAudio(featured)} /></div>
            </div>
            <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center overflow-hidden rounded-[2rem] bg-[#10233d] p-8 text-center text-white shadow-2xl">
              <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 70% 22%, ${featured.brandColor || '#F15A24'}, transparent 42%), radial-gradient(circle at 25% 78%, #f6c667, transparent 40%)` }} />
              <div className="relative">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white text-3xl font-black shadow-xl" style={{ color: featured.brandColor || '#F15A24' }}>{featured.brand.charAt(0)}</div>
                <h3 className="mt-6 text-2xl font-black">{featured.brand}</h3>
                <p className="mt-2 text-sm text-slate-200">{featured.about}</p>
              </div>
            </div>
          </div>
        </div>
      </section>}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-black text-[#F15A24]">معرض الأعمال</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">نماذج صوتية من قيمة</h2></div><p className="hidden text-sm text-slate-500 sm:block">اضغط على زر التشغيل لسماع العينة</p></div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visibleStories.map((story, index) => <article key={story.id} className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
          <div className="absolute left-0 top-0 h-1 w-full" style={{ backgroundColor: story.brandColor || categoryColors[index % categoryColors.length] }} />
          <div className="flex items-start justify-between gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-black text-white shadow-sm" style={{ backgroundColor: story.brandColor || categoryColors[index % categoryColors.length] }}>{story.brand.charAt(0)}</div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-500">{story.voiceCategory}</span></div>
          <div className="mt-6 flex-1"><h3 className="text-xl font-black">{story.brand}</h3><p className="mt-1 text-xs font-bold text-[#F15A24]">{story.industry}</p><h4 className="mt-4 text-base font-black leading-7">{story.title}</h4><p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">{story.heroSubtitle || story.about}</p></div>
          <StoryAudio story={story} active={activeId === story.id} onToggle={() => toggleAudio(story)} />
        </article>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="grid gap-5 md:grid-cols-3"><div className="rounded-3xl border border-slate-200 bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-[#F15A24]"><Headphones className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-black">استمع</h3><p className="mt-2 text-sm leading-7 text-slate-600">اختر نماذج من مجالات مختلفة واستمع إليها مباشرة.</p><span className="mt-5 block text-xs font-black text-slate-400">01</span></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-[#F15A24]"><Sparkles className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-black">اختر الصوت</h3><p className="mt-2 text-sm leading-7 text-slate-600">نساعدك على اختيار المعلّق المناسب لهوية مشروعك.</p><span className="mt-5 block text-xs font-black text-slate-400">02</span></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-[#F15A24]"><ArrowUpLeft className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-black">أطلق مشروعك</h3><p className="mt-2 text-sm leading-7 text-slate-600">اطلب مشروعك وتابع تفاصيله مع فريق قيمة.</p><span className="mt-5 block text-xs font-black text-slate-400">03</span></div></div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:pb-12">
        <div className="overflow-hidden rounded-[2rem] bg-[#F15A24] px-6 py-12 text-center text-white sm:px-12"><p className="text-sm font-black text-orange-100">لديك مشروع يحتاج لصوت يترك أثرًا؟</p><h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">لنصنع معًا عملًا صوتيًا يستحق أن يُسمع</h2><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={onOpenDemo} className="rounded-xl bg-white px-6 py-3 text-sm font-black text-[#F15A24] transition hover:bg-slate-950 hover:text-white">اطلب مشروعك الصوتي</button><button onClick={() => navigate('/ar')} className="inline-flex items-center gap-2 rounded-xl border border-white/45 px-6 py-3 text-sm font-black transition hover:bg-white/10"><ArrowLeft className="h-4 w-4" /> العودة للرئيسية</button></div></div>
      </section>
    </>}
  </main>;
};
