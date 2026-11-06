import React from 'react';
import { BookOpen, Film, Phone, Radio } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { B2BHome } from '../components/B2BHome';
import { ActiveView, Voice } from '../types';
import { useSeo } from '../seo/useSeo';

interface HomePageProps {
  voices: Voice[];
  onOpenDemo: () => void;
  onOpenSignup: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
  onOpenTopUp: () => void;
  onSelectForBooking: (voice: Voice) => void;
}

const services = [
  { slug: 'dubbing', title: 'خدمة الدبلجة العربية', description: 'دبلجة الإعلانات والأفلام والمحتوى المرئي بأصوات عربية بشرية وإشراف صوتي احترافي.', icon: Film, color: 'text-orange-600 bg-orange-50' },
  { slug: 'audiobooks', title: 'تسجيل الكتب الصوتية', description: 'سرد عربي واضح ومريح للاستماع الطويل مع تسجيل وهندسة صوتية جاهزة للنشر.', icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
  { slug: 'podcast', title: 'إنتاج البودكاست', description: 'مقدمات وخواتيم وفواصل إعلانية بصوت يناسب هوية البرنامج والجمهور المستهدف.', icon: Radio, color: 'text-blue-600 bg-blue-50' },
  { slug: 'ivr', title: 'تسجيلات الرد الآلي IVR', description: 'رسائل ترحيب وقوائم انتظار ومراكز اتصال بفصحى واضحة ولهجات عربية متعددة.', icon: Phone, color: 'text-emerald-600 bg-emerald-50' },
];

export const HomePage: React.FC<HomePageProps> = (props) => {
  const navigate = useNavigate();

  useSeo({
    path: '/ar',
    title: 'قيمة | أصوات عربية بشرية وإنتاج صوتي احترافي',
    description: 'اكتشف أصواتاً عربية بشرية واحجز خدمات الدبلجة والكتب الصوتية والبودكاست والرد الآلي من منصة قيمة.',
  });

  const handleNavigate = (view: ActiveView, extra?: { voiceId?: string; text?: string; tab?: 'human' | 'ai' | 'my-voices' }) => {
    if (view === 'customer-stories') {
      navigate('/ar/our-works');
      return;
    }
    if (view === 'home') {
      navigate('/ar');
      return;
    }
    const url = new URL('/new-ui/', window.location.origin);
    url.searchParams.set('view', view === 'human-marketplace' ? 'voice-library' : view);
    if (extra?.tab) url.searchParams.set('tab', extra.tab);
    window.location.assign(url.toString());
  };

  return (
    <div dir="rtl">
      <B2BHome
        onNavigate={handleNavigate}
        onOpenDemo={props.onOpenDemo}
        onOpenSignup={props.onOpenSignup}
        onOpenLogin={props.onOpenLogin}
        isLoggedIn={props.isLoggedIn}
        onOpenTopUp={props.onOpenTopUp}
        voices={props.voices}
        onSelectForBooking={props.onSelectForBooking}
      />

      <section className="border-t border-slate-200 bg-white py-20" aria-labelledby="voice-services-title">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <span className="text-xs font-bold text-[#FF5500]">حلول متكاملة للصوت العربي</span>
            <h2 id="voice-services-title" className="text-2xl font-black text-slate-950 sm:text-4xl">خدمات الإنتاج الصوتي من قيمة</h2>
            <p className="text-sm leading-7 text-slate-600 sm:text-base">من اختيار الصوت البشري المناسب حتى التسجيل والهندسة الصوتية والتسليم، اختر الخدمة التي تناسب مشروعك.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map(({ slug, title, description, icon: Icon, color }) => (
              <Link key={slug} to={`/ar/services/${slug}`} className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 text-right transition hover:-translate-y-1 hover:border-orange-300 hover:bg-white hover:shadow-xl">
                <span className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl ${color}`}><Icon className="h-6 w-6" /></span>
                <h3 className="mb-2 text-lg font-black text-slate-900 transition group-hover:text-[#FF5500]">{title}</h3>
                <p className="text-xs leading-6 text-slate-600">{description}</p>
                <span className="mt-5 inline-flex text-xs font-bold text-[#FF5500]">اعرف تفاصيل الخدمة ←</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
