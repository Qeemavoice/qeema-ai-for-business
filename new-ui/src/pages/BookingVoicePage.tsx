import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Volume2, Users, Briefcase, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Voice } from '../types';
import { useSeo } from '../seo/useSeo';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getShortDialect } from '../components/VoiceLibraryView';
import { useHumanVoices } from '../lib/humanVoices';
import { BookingForm } from '../components/BookHumanVoiceModal';

interface BookingVoicePageProps {
  voices: Voice[];
}

interface SampleView {
  id: string;
  title: string;
  dialect: string;
  flag: string;
  gender: 'male' | 'female';
  category: string;
  description: string;
  quote?: string;
  previewUrl: string;
  pricing?: string;
  turnaround?: string;
  trustYears?: string;
  usageCount?: string;
  bookingsCount?: number;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

const FALLBACK_AUDIO = 'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3';

/** Approved client ratings of this voice: stars only (review texts stay in the admin dashboard). */
const VoiceReviews: React.FC<{ sampleId: string }> = ({ sampleId }) => {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getVoiceReviews>> | null>(null);
  useEffect(() => { api.getVoiceReviews(sampleId).then(setData).catch(() => setData(null)); }, [sampleId]);
  if (!data?.count) return null;
  const full = Math.round(data.average);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-bold text-slate-900">تقييم العملاء</span>
      <span className="text-amber-500 tracking-tight" aria-label={`${data.average} من 5`}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
      <span className="font-mono text-xs text-slate-700">{data.average}</span>
      <span className="text-[11px] text-slate-400">({data.count} {data.count === 1 ? 'تقييم' : 'تقييمات'})</span>
    </div>
  );
};

export const BookingVoicePage: React.FC<BookingVoicePageProps> = ({ voices }) => {
  const [booked, setBooked] = useState(false);
  const { slug } = useParams<{ slug: string }>();
  const decoded = decodeURIComponent(slug || '');

  const humanSamples = useHumanVoices();
  // Each voice sample has its own page: match the library sample by id, then fall back to backend voices
  const sample: SampleView | null = useMemo(() => {
    const libSample = humanSamples.find(s => decoded === s.id || decoded.startsWith(`${s.id}-`));
    if (libSample) {
      return {
        id: libSample.id,
        title: libSample.sampleName || libSample.name,
        dialect: getShortDialect(libSample.accent),
        flag: libSample.flag,
        gender: libSample.gender,
        category: libSample.category,
        description: libSample.seoText || libSample.subtitle,
        quote: libSample.quote,
        previewUrl: libSample.previewUrl || FALLBACK_AUDIO,
        pricing: libSample.pricing,
        turnaround: libSample.turnaround,
        trustYears: libSample.trustYears,
        usageCount: libSample.usageCount,
        bookingsCount: libSample.bookingsCount,
        tags: libSample.tags,
        metaTitle: libSample.metaTitle,
        metaDescription: libSample.metaDescription
      };
    }
    const v = voices.find(x => decoded === x.id || decoded.startsWith(`${x.id}-`));
    if (!v) return null;
    return {
      id: v.id,
      title: (v as any).sampleName || v.name,
      dialect: v.dialectLabel || v.dialect,
      flag: '🎙️',
      gender: v.gender === 'female' ? 'female' : 'male',
      category: v.styleLabel || (v as any).category || 'تعليق احترافي',
      description: 'عينة صوتية معتمدة في منصة قيمة فويس بنطق عربي سليم ووضوح مخارج رفيع.',
      previewUrl: v.previewUrl || (v as any).sampleAudioUrl || FALLBACK_AUDIO
    };
  }, [decoded, voices, humanSamples]);

  // Dashboard SEO title wins when filled (brand suffix added if missing); otherwise the automatic title
  const customTitle = sample?.metaTitle?.trim();
  const pageTitle = sample
    ? (customTitle ? (customTitle.endsWith('قيمة فويس') ? customTitle : `${customTitle} | قيمة فويس`) : `${sample.title} - عينة تعليق صوتي ${sample.dialect} | قيمة فويس`)
    : 'عينة صوتية | قيمة فويس';
  const pageH1 = sample ? sample.title : 'عينة صوت';
  const pageDesc = sample
    ? (sample.metaDescription?.trim() || (sample.description ? sample.description.slice(0, 160) : `استمع إلى عينة «${sample.title}» بلهجة ${sample.dialect}، تخصص ${sample.category}. احجز الصوت مباشرة بجودة 48kHz.`))
    : 'استمع إلى عينات التعليق الصوتي المعتمدة واحجز صوتك اليوم عبر قيمة فويس.';

  useSeo({
    path: `/ar/booking/${slug || ''}`,
    title: pageTitle,
    h1: pageH1,
    description: pageDesc,
    ogType: 'website',
    breadcrumbs: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'مكتبة الأصوات', item: '/ar/voices' },
      { name: sample?.title || 'عينة صوتية', item: `/ar/booking/${slug}` }
    ]
  });

  // AudioObject schema
  useEffect(() => {
    if (!sample) return;
    const audioSchema = {
      '@context': 'https://schema.org',
      '@type': 'AudioObject',
      name: `${sample.title} - عينة تعليق صوتي`,
      description: pageDesc,
      contentUrl: sample.previewUrl,
      encodingFormat: 'audio/mpeg',
      inLanguage: 'ar'
    };
    let script = document.getElementById('qeema-audio-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'qeema-audio-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(audioSchema, null, 2);
    return () => {
      document.getElementById('qeema-audio-jsonld')?.remove();
    };
  }, [sample, pageDesc]);

  if (!sample) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] py-20 text-center space-y-4" dir="rtl">
        <h1 className="text-2xl font-bold text-slate-900">عينة الصوت غير موجودة</h1>
        <Link to="/ar/voices" className="inline-block px-6 py-2.5 rounded-xl bg-brand text-white text-xs font-bold">
          العودة لمكتبة الأصوات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'مكتبة الأصوات', item: '/ar/voices' },
          { name: sample.title, item: `/ar/booking/${slug}` }
        ]} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="space-y-6">

          {/* Sample details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{sample.title}</h1>
                  <span className="p-1 rounded-full bg-emerald-50 text-emerald-600" title="صوت بشري موثق">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {sample.flag} اللهجة: <strong className="text-slate-800">{sample.dialect}</strong> • الصوت: <strong className="text-slate-800">{sample.gender === 'male' ? 'رجالي' : 'نسائي'}</strong>
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-orange-50 text-brand-text border border-orange-200 whitespace-nowrap">
                {sample.category}
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900">عن هذا المقطع</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{sample.description}</p>
              {sample.tags && sample.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sample.tags.map(t => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Audio player */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Volume2 className="w-4 h-4" />
                  <span>عينة الاستوديو المعتمدة</span>
                </span>
                <span className="text-slate-400 font-mono">48kHz Studio</span>
              </div>
              <audio controls preload="none" src={sample.previewUrl} className="w-full" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">السعر</span>
                <strong className="text-slate-800">{sample.pricing || 'حسب المدة'}</strong>
              </div>
              {sample.bookingsCount !== undefined && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] flex items-center gap-1"><Briefcase className="w-3 h-3" />الحجوزات</span>
                  <strong className="text-slate-800 font-mono">{sample.bookingsCount}</strong>
                </div>
              )}
              {sample.usageCount && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] flex items-center gap-1"><Users className="w-3 h-3" />العملاء</span>
                  <strong className="text-slate-800 font-mono">{sample.usageCount}</strong>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <VoiceReviews sampleId={sample.id} />
              <span className="flex items-center gap-1.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ترخيص تجاري كامل
              </span>
              <Link to="/ar/voices" className="mr-auto inline-flex items-center gap-1.5 text-xs font-bold text-brand-text hover:underline">
                <span>← العودة إلى مكتبة الأصوات</span>
              </Link>
            </div>
          </div>

          {/* Booking & payment */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">{booked ? 'حجزك قيد المراجعة' : 'احجز هذا الصوت'}</h2>
              <p className="text-[11px] text-slate-500">{booked ? 'تابع حالة حجزك من حسابك، وسنبلغك بكل جديد.' : 'أدخل السيناريو لحساب المدة والتكلفة، ثم ادفع لتأكيد الحجز.'}</p>
            </div>
            <BookingForm
              onSubmittedChange={setBooked}
              voice={{ id: sample.id, name: sample.title, sampleName: sample.title, pricing: sample.pricing, quote: sample.quote, dialect: sample.dialect }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};
