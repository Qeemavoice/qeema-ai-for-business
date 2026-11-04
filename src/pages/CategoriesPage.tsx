import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Film, BookOpen, Radio, Phone, Sparkles, ArrowLeft, Volume2 } from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { usePageText } from '../lib/pageTexts';

export const CategoriesPage: React.FC = () => {
  const pageText = usePageText('categories');
  useSeo(STATIC_SEO_ROUTES['/ar/categories']);

  const categories = [
    {
      title: 'إعلانات تجارية وتسويقية',
      desc: 'أصوات إعلانية حيوية وجذابة لإعلانات التلفزيون، الراديو، السوشيال ميديا، واليوتيوب.',
      link: '/ar/voices?category=1-إعلانات',
      icon: Sparkles
    },
    {
      title: 'وثائقي ورسمي ومؤسسي',
      desc: 'نبرات فخمة ووقورة للتقارير السنوية، الأفلام الوثائقية، والبيانات الوطنية الرسمية.',
      link: '/ar/voices?category=2-وثائقي',
      icon: Volume2
    },
    {
      title: 'دوبلاج وكرتون وتمثيل صوتي',
      desc: 'تمثيل صوتي حيوي وتجسيد للشخصيات الكرتونية والألعاب الإلكترونية والأفلام.',
      link: '/ar/services/dubbing',
      icon: Film
    },
    {
      title: 'كتب صوتية وأوديوبوك',
      desc: 'قراءة فصيحة متصلة للروايات والكتب الفكرية والتنموية بمعايير ACX العالمية.',
      link: '/ar/voice-models/audiobooks',
      icon: BookOpen
    },
    {
      title: 'بودكاست وفواصل إذاعية',
      desc: 'مقدمات وخواتيم وفواصل رعاية لبرامج البودكاست بمختلف اللهجات العربية.',
      link: '/ar/voice-models/podcast',
      icon: Radio
    },
    {
      title: 'تسجيلات الرد الآلي IVR ومراكز الاتصال',
      desc: 'رسائل ترحيب وقوائم انتظار احترافية لسنترالات الشركات والمستشفيات والبنوك.',
      link: '/ar/voice-models/ivr',
      icon: Phone
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'التصنيفات', item: '/ar/categories' }
        ]} />
      </div>

      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand-text text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>دليل التصنيفات الصوتية</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  to={cat.link}
                  className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:border-brand hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-text flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-brand-text transition-colors">
                      {cat.title}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-brand-text">
                    <span>تصفح أصوات هذا التصنيف</span>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
