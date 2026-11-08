import React, { useEffect, useState } from 'react';
import { openTalentSignup, openClientLogin, SIGNED_IN_EVENT } from '../lib/talentJoin';
import { api, getToken, PAYMENT_CONFIRMED_EVENT } from '../lib/api';
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
  const isStatic = Boolean(guide && guide.slug === 'join-qeema-voice');
  useSeo(isStatic ? STATIC_SEO_ROUTES['/ar/guides/join-qeema-voice'] : { ...STATIC_SEO_ROUTES['/ar/guides'], path: `/ar/guides/${slug || ''}` });

  // Guides written in the dashboard keep their own pages (/ar/guides/{id}-{title}, the old site's URL form)
  if (!isStatic) return <DbGuidePage slug={slug || ''} />;

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

/** A guide of the dashboard (/api/v1/guides): cover, description and the file (free) or a request link (paid). */
const DbGuidePage: React.FC<{ slug: string }> = ({ slug }) => {
  const [state, setState] = useState<{ loaded: boolean; guide: any | null }>({ loaded: false, guide: null });
  useEffect(() => {
    let alive = true;
    fetch('/api/v1/guides').then(r => (r.ok ? r.json() : { items: [] })).then(({ items }) => {
      const decoded = (() => { try { return decodeURIComponent(slug); } catch { return slug; } })();
      const g = (items || []).find((x: any) => x.slug === decoded || decoded === x.id || decoded.startsWith(`${x.id}-`)) || null;
      if (alive) setState({ loaded: true, guide: g });
    }).catch(() => alive && setState({ loaded: true, guide: null }));
    return () => { alive = false; };
  }, [slug]);
  const g = state.guide;
  useSeo({ ...STATIC_SEO_ROUTES['/ar/guides'], path: `/ar/guides/${slug}`, title: g ? `${g.title} | قيمة فويس` : STATIC_SEO_ROUTES['/ar/guides'].title, description: g?.description || STATIC_SEO_ROUTES['/ar/guides'].description });
  if (!state.loaded) return <div className="min-h-[50vh]" />;
  if (!g) return <NotFoundPage />;
  const card = { slug: g.slug, title: g.title, desc: g.description || '', link: '', cover: g.cover || '', priceUsd: g.type === 'free' ? null : Number(g.price) || 0, gradient: '' };
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[{ name: 'الرئيسية', item: '/ar' }, { name: 'الأدلة', item: '/ar/guides' }, { name: g.title, item: `/ar/guides/${slug}` }]} />
      </div>
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <GuideCover guide={card as any} className="h-56 sm:h-72 rounded-3xl" />
          <GuidePriceBadge priceUsd={card.priceUsd} />
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-snug">{g.title}</h1>
          {g.description && <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">{g.description}</p>}
          {g.hasFile ? <GuideAccess guide={g} price={card.priceUsd} /> : (
            <a href="/ar/contact-us" className="inline-flex items-center px-6 py-3 rounded-full bg-brand-ink text-white text-sm font-bold">اطلب هذا الدليل</a>
          )}
        </div>
      </section>
    </div>
  );
};

/**
 * Who may read the file: free guides open for any signed-in account; a paid guide shows a short buy form
 * (name, e-mail, then card payment on Stripe's own page) and opens like a free one once bought.
 */
const GuideAccess: React.FC<{ guide: any; price: number | null }> = ({ guide, price }) => {
  const [signedIn, setSignedIn] = useState(() => Boolean(getToken()));
  const [file, setFile] = useState<string | null>(null);
  const [owned, setOwned] = useState<boolean | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    if (!getToken()) { setSignedIn(false); return; }
    setSignedIn(true);
    api.guideFile(guide.id).then(r => { setOwned(r.owned); setFile(r.file || null); }).catch(e => setErr(e.message));
    api.getProfile().then(p => setForm(f => ({ name: f.name || p.name || '', email: f.email || p.email || '' }))).catch(() => {});
  };
  useEffect(() => {
    load();
    window.addEventListener(SIGNED_IN_EVENT, load);
    window.addEventListener(PAYMENT_CONFIRMED_EVENT, load);
    return () => { window.removeEventListener(SIGNED_IN_EVENT, load); window.removeEventListener(PAYMENT_CONFIRMED_EVENT, load); };
  }, [guide.id]);

  const buy = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { const r = await api.buyGuide(guide.id, form.name, form.email); if (r.owned) load(); }
    catch (ex: any) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  const btn = 'inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold cursor-pointer';
  const priceText = price === null ? '' : `$${price}`;
  if (!signedIn) return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-3">
      <p className="text-sm font-bold text-slate-800">{price === null ? 'الدليل مجاني، سجّل الدخول لتحميله وقراءته.' : `سعر الدليل ${priceText}. سجّل الدخول لشرائه وتحميله.`}</p>
      <button type="button" onClick={openClientLogin} className={`${btn} bg-brand hover:bg-brand-orange text-white`}>تسجيل الدخول</button>
    </div>
  );
  if (owned === null) return err ? <p className="text-xs font-bold text-rose-600">{err}</p> : <div className="h-12" />;
  if (owned && file) return (
    <div className="space-y-5">
      <a href={file} target="_blank" rel="noopener" download className={`${btn} bg-brand-ink text-white`}>تحميل الدليل</a>
      {/\.pdf($|\?)/i.test(file) && <iframe src={file} title={guide.title} className="w-full h-[80vh] rounded-3xl border border-slate-200 bg-slate-50" loading="lazy" />}
    </div>
  );
  return (
    <form onSubmit={buy} className="rounded-3xl border border-slate-200 bg-white shadow-xs p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-black text-slate-950">اشترِ الدليل: {priceText}</h2>
        <p className="text-xs text-slate-500 leading-relaxed">دفعة واحدة، ثم يبقى الدليل متاحاً في حسابك للتحميل في أي وقت. الدفع ببطاقة ائتمانية أو Apple Pay عبر صفحة دفع آمنة، ولا نحتفظ ببيانات بطاقتك.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-xs font-bold text-slate-600 space-y-1.5"><span>الاسم الكامل</span>
          <input required minLength={2} maxLength={120} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand" /></label>
        <label className="block text-xs font-bold text-slate-600 space-y-1.5"><span>البريد الإلكتروني (تصلك عليه الفاتورة)</span>
          <input required type="email" dir="ltr" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand" /></label>
      </div>
      {err && <p className="text-xs font-bold text-rose-600">{err}</p>}
      <button type="submit" disabled={busy} className={`${btn} bg-brand hover:bg-brand-orange text-white disabled:opacity-60`}>{busy ? 'جارٍ فتح صفحة الدفع...' : `ادفع ${priceText} واحصل على الدليل`}</button>
    </form>
  );
};
