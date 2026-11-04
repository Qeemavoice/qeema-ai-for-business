import React, { useEffect, useState } from 'react';
import { FAQS_DATA } from '../data/faqs';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Sparkles, ArrowLeft } from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { usePageText } from '../lib/pageTexts';

/** FAQs managed in the dashboard (الأسئلة الشائعة); the built-in list shows until the API answers. */
const useFaqs = () => {
  const [faqs, setFaqs] = useState(FAQS_DATA);
  useEffect(() => {
    fetch('/api/v1/faqs').then(r => (r.ok ? r.json() : Promise.reject())).then(({ items }) => { if (items?.length) setFaqs(items); }).catch(() => {});
  }, []);
  return faqs;
};

export const FaqsPage: React.FC = () => {
  const faqs = useFaqs();
  const pageText = usePageText('faqs');
  useSeo({
    ...STATIC_SEO_ROUTES['/ar/faqs'],
    faqs
  });

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'الأسئلة الشائعة', item: '/ar/faqs' }
        ]} />
      </div>

      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand-text text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>مركز المساعدة والإجابات</span>
          </div>

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-text transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-brand-text' : ''}`} />
                </button>

                {/* Always rendered in DOM for search bots */}
                <div 
                  className={`px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 ${
                    isOpen ? 'block' : 'hidden'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cross link */}
      <section className="pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
            <h3 className="font-bold text-base text-slate-900">هل لديك استفسار آخر لم تجد إجابته هنا؟</h3>
            <p className="text-xs text-slate-600">فريق خدمة العملاء جاهز للإجابة على استفساراتك على مدار الساعة.</p>
            <div className="pt-2">
              <Link to="/ar/contact-us" className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-orange transition">
                <span>تواصل معنا الآن</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
