import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  Award, 
  Headphones, 
  Sparkles, 
  Users, 
  ArrowLeft 
} from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useSitePage } from './SitePageView';
import { SocialLinks } from '../components/SocialLinks';

export const AboutUsPage: React.FC = () => {
  useSeo(STATIC_SEO_ROUTES['/ar/p/about-us']);
  const page = useSitePage('about');

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'من نحن', item: '/ar/p/about-us' }
        ]} />
      </div>

      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand-text text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>عن منصة قيمة فويس</span>
          </div>

          {/* Strict Single H1 */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            من نحن
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            {page.intro}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              بناء البنية التحتية الموثوقة للصوت العربي والذكاء الاصطناعي الأخلاقي
            </h2>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl space-y-3 [&_strong]:text-white [&_a]:text-brand-text" dangerouslySetInnerHTML={{ __html: page.content }} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-800">
              <div>
                <div className="text-3xl font-black text-brand-text font-mono">+1000</div>
                <div className="text-xs text-slate-400">معلق صوتي معتمد</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white font-mono">+5000</div>
                <div className="text-xs text-slate-400">شركة وجهة مخدومة</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-400 font-mono">48kHz</div>
                <div className="text-xs text-slate-400">جودة استوديو موحدة</div>
              </div>
              <div>
                <div className="text-3xl font-black text-amber-400 font-mono">100%</div>
                <div className="text-xs text-slate-400">تراخيص تجارية نظامية</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-brand-text flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">حماية الحقوق والأخلاقية</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                كل نموذج صوتي في منصتنا مدرب بناءً على موافقة خطية وعقود أرباح مستمرة للمواهب الصوتية، مما يوفر للشركات حماية قانونية وتجارية كاملة.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">دقة اللهجات والتلوين</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                تم تدريب واختيار معلقينا بعناية فائقة لضمان النطق الصحيح للحروف العربية المفخمة والمرققة والتشكيل الإعرابي لكافة المشاريع المؤسسية.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">جاهزية بيئة B2B</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                أنظمة تسعير واضحة بالكلمة، فواتير ضريبية إلكترونية معتمدة، ودعم فني مخصص للمشاريع الضخمة وعقود المؤسسات.
              </p>
            </div>
          </div>

          {/* Social accounts */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">تابع قيمة فويس</h3>
              <p className="text-xs text-slate-600 mt-1">جديد الأصوات والمقالات وكواليس المشاريع على حساباتنا الرسمية</p>
            </div>
            <SocialLinks />
          </div>

        </div>
      </section>

    </div>
  );
};
