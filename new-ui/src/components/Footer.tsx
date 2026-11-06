import React from 'react';
import { Mic2, Sparkles, ShieldCheck, FileCode, Layers, Users, CreditCard, Mail } from 'lucide-react';
import { ActiveView } from '../types';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
  onOpenChangelog: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenChangelog }) => {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pt-16 pb-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF5500] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#FF5500]/25 group-hover:scale-105 transition-transform">
                ق
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white group-hover:text-[#FF5500] transition-colors">قيمة</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              منصة عربية لتصفّح أصوات المعلّقين وطلب خدمات التسجيل الصوتي.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onOpenChangelog}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#FF7A29] bg-[#FF5500]/15 hover:bg-[#FF5500]/25 px-3 py-1.5 rounded-lg border border-[#FF5500]/30 transition cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>سجل ملفات التطوير والتحديثات</span>
              </button>
            </div>
          </div>

          {/* Col 2: مكتبة الأصوات */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FF7A29] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>مكتبة الأصوات</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('human-marketplace')} className="hover:text-white transition">
                  أصوات بشرية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-[#FF5500] font-semibold transition">
                  كيف نعمل؟
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: المجتمع */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FF7A29] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>المجتمع</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('customer-stories')} className="hover:text-[#FF5500] font-semibold text-[#FF7A29] transition">
                  قصص وتجارب العملاء
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-white transition">
                  المدونة والأبحاث
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('training')} className="hover:text-white transition">
                  أكاديمية التدريب الصوتي
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('voice-data')} className="hover:text-white transition">
                  مجموعات البيانات الصوتية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('industries')} className="hover:text-white transition">
                  حلول القطاعات المؤسسية
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: الأسعار وتواصل معنا */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FF7A29] uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>الأسعار والتواصل</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('billing')} className="hover:text-[#FF5500] font-semibold transition">
                  الأسعار والباقات
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition">
                  من نحن
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition">
                  تواصل معنا
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} منصة قيمة للذكاء الصوتي (Qeema AI for Business).
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>حقوق الاستخدام تُحدد لكل طلب</span>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">Qeema Voice Infrastructure</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
