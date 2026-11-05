import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, BookOpen, Mic2, ArrowLeft } from 'lucide-react';
import { useSeo } from '../seo/useSeo';

export const NotFoundPage: React.FC = () => {
  useSeo({
    path: '/404',
    title: 'الصفحة غير موجودة 404 | قيمة فويس',
    h1: 'الصفحة غير موجودة (404)',
    description: 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى رابط آخر.',
    noindex: true
  });

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#FFFFFF] px-4 py-16 text-center" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-brand-text flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-black text-brand-text font-mono">404</div>
          {/* Strict Single H1 */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            الصفحة غير موجودة
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            الصفحة التي تحاول الوصول إليها قد تكون حُذفت أو نُقلت إلى مسار جديد. يمكنك الانتقال إلى الأقسام الرئيسية التالية:
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            to="/ar"
            className="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية</span>
          </Link>

          <Link
            to="/ar/voices"
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Mic2 className="w-4 h-4 text-brand-text" />
            <span>مكتبة الأصوات العربية</span>
          </Link>

          <Link
            to="/ar/blogs"
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>مدونة قيمة فويس</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
