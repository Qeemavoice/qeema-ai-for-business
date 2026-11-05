import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Voice } from '../types';
import { 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  ArrowLeft, 
  Wand2, 
  Zap, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  FileAudio
} from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { TextToSpeechPlayground } from '../components/TextToSpeechPlayground';
import { TextToSpeechVisitorLanding } from '../components/TextToSpeechVisitorLanding';

interface TextToSpeechPageProps {
  isLoggedIn: boolean;
  voices: Voice[];
  onGenerated: (newBalanceCredits: number) => void;
  onGoogle: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const TextToSpeechPage: React.FC<TextToSpeechPageProps> = ({ isLoggedIn, voices, onGenerated, onGoogle, onOpenLogin, onOpenSignup }) => {
  // 1. Centralized SEO matching requirements exactly
  useSeo(STATIC_SEO_ROUTES['/ar/text-to-speech']);
  const navigate = useNavigate();

  // Visitors see the technology guide; signed-in users get the generation studio
  const activeTab = isLoggedIn ? 'playground' : 'overview';

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs for SEO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'تحويل النص إلى صوت', item: '/ar/text-to-speech' }
        ]} />
      </div>

      {/* SEO Headline Header with Single Strict H1 */}
      {isLoggedIn && <header className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              {/* Strict Single H1 matching SEO spec */}
              <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                تحويل النص إلى صوت عربي
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                استمع لنصك بأصوات AI مرخّصة من معلقين عرب حقيقيين وبتقاسم الأرباح معهم، ثم احجز المعلق البشري نفسه للنسخة النهائية.
              </p>
            </div>
          </div>
        </div>
      </header>}

      {/* Main Content Area */}
      {activeTab === 'playground' ? (
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            {/* The Restored Interactive Text-to-Speech Playground Console */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-4 sm:p-7">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>أستوديو النطق الفوري المباشر</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 font-normal">ضبط التشكيل والسرعة واللهجات</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تراخيص تجارية موثقة</span>
                </div>
              </div>

              <TextToSpeechPlayground voices={voices} onGenerated={onGenerated} onExploreVoices={() => navigate('/ar/voices')} />
            </div>

            {/* SEO Key Value Props Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-text flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">نطق فصيح مشكول تلقائياً</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  معالجة لغوية عصبية تتعرف على سياق الجملة وتضبط الحركات وتنوين الكلمات ومخارج الحروف.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">عقود تقاسم أرباح مع المعلقين</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  كل صوت AI مبني بترخيص قانوني كامل يضمن حقوق الملكية الفكرية وعوائد مالية للمعلق البشري الأصلي.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileAudio className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">حجز المعلق البشري للنسخة النهائية</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  استخدم الـ AI لاختبار وتأكيد النص مع فريقك، ثم احجز المعلق البشري نفسه بنقرة واحدة لتسجيل الاستوديو.
                </p>
              </div>
            </div>

            {/* Bottom Conversion Box */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1 text-center sm:text-right">
                <h3 className="text-base font-bold">هل مشروعك يحتاج أداء بشري مع إشراف إخراجي؟</h3>
                <p className="text-xs text-slate-300">
                  تصفح أكثر من 1,000 معلق صوتي بشري معتمد واستلم تسجيلك النهائي خلال 24–48 ساعة.
                </p>
              </div>
              <Link
                to="/ar/voices"
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shadow-md transition whitespace-nowrap"
              >
                تصفح الأصوات البشرية
              </Link>
            </div>

          </div>
        </section>
      ) : (
        <section className="py-6">
          <TextToSpeechVisitorLanding
            onOpenLogin={onOpenLogin}
            onOpenSignup={onOpenSignup}
            onGoogle={onGoogle}
            onTryStudio={onOpenSignup}
          />
        </section>
      )}

    </div>
  );
};
