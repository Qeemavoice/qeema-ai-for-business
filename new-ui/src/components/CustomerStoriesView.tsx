import React from 'react';
import { ArrowRight, Building2 } from 'lucide-react';
import { ActiveView } from '../types';

interface CustomerStoriesViewProps {
  onNavigate: (view: ActiveView, extra?: any) => void;
  onOpenDemo?: () => void;
  initialStoryId?: string;
}

export const CustomerStoriesView: React.FC<CustomerStoriesViewProps> = ({ onNavigate, onOpenDemo }) => (
  <main className="min-h-[70vh] bg-white px-4 py-16 text-slate-900" dir="rtl">
    <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center sm:p-12">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 text-[#FF5500]">
        <Building2 className="h-7 w-7" />
      </div>
      <p className="text-sm font-bold text-[#FF5500]">قصص وتجارب العملاء</p>
      <h1 className="mt-3 text-3xl font-black">هذه الصفحة قيد التجهيز</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
        سننشر تجارب العملاء بعد مراجعة مصادرها والحصول على موافقتهم على نشر الأسماء والنتائج. لا توجد دراسات حالة منشورة حاليًا.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold hover:bg-slate-100">
          <ArrowRight className="h-4 w-4" /> العودة للرئيسية
        </button>
        {onOpenDemo && <button onClick={onOpenDemo} className="rounded-xl bg-[#FF5500] px-5 py-3 text-sm font-bold text-white hover:bg-[#E04800]">تواصل معنا</button>}
      </div>
    </section>
  </main>
);
