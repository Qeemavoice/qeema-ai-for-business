import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  ArrowLeft,
  Lock,
  Headphones,
  Cpu,
  Send,
  FileCheck2,
  Users
} from 'lucide-react';
import { ActiveView } from '../types';

interface BrandedVoiceViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const BrandedVoiceView: React.FC<BrandedVoiceViewProps> = ({ onNavigate }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDialect, setSelectedDialect] = useState('خليجي سعودي');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#FF5500]/10 border border-[#FF5500]/30 px-3.5 py-1 rounded-full text-xs font-bold text-[#E04400]">
          <Building2 className="w-3.5 h-3.5" />
          <span>حلول المؤسسات وكبرى الشركات B2B</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          صوتٌ حصري لعلامتك التجارية
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          اصنع هوية صوتية فريدة تميز علامتك عن كل المنافسين. نستنسخ صوتاً بشرياً معتمداً بعقد ملكية قانونية كاملة ومشفرة، لتستخدمه في كافة تطبيقاتك، إعلاناتك، ومساعدك الذكي.
        </p>
      </div>

      {/* Comparison: Shared vs Exclusive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

        {/* Shared Voice */}
        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">الخيار العام</span>
            <h3 className="text-xl font-bold text-slate-800">الأصوات المشتركة (Shared Voices)</h3>
            <p className="text-xs text-slate-500">مكتبة الأصوات المتاحة لجميع مشتركي منصة قيمة فويس</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 text-xs text-slate-600">
              <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>جاهز للاستخدام الفوري بدون فترة تدريب</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-slate-600">
              <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>اشتراك شهري مرن وتكلفة منخفضة</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-slate-400">
              <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>متاح لأي شركة أخرى أو منافس في نفس مجالك</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-slate-400">
              <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>لا يمكن تعديل بصمته النغمية لتناسب شخصية براندك الخاصة</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('instant-studio')}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
          >
            استكشف أصوات المكتبة المشتركة
          </button>
        </div>

        {/* Exclusive Branded Voice */}
        <div className="bg-gradient-to-br from-[#1C120A] to-[#2B170B] rounded-2xl p-7 border-2 border-[#FF5500] shadow-xl text-white space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-[#FF5500] text-white text-[11px] font-bold px-3 py-1 rounded-br-xl">
            حصري لشركتك فقط
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FF7A29] uppercase tracking-wider">الحل الحصري الموصى به</span>
            <h3 className="text-xl font-bold text-white">الصوت الحصري المخصص (Branded Voice)</h3>
            <p className="text-xs text-amber-200/70">نموذج ذكاء اصطناعي صوتي مملوك ومشفر بالكامل لعلامتكم</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 text-xs text-amber-100">
              <Check className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5 font-bold" />
              <span>ملكية تجارية وقانونية حصرية 100% لا يشاركك فيها أحد</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-amber-100">
              <Check className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5 font-bold" />
              <span>تدريب النموذج على صوت سفير علامتكم أو اختيار معلق معتمد</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-amber-100">
              <Check className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5 font-bold" />
              <span>حماية تامة من التزييف ببصمة مشفرة وتدقيق دوري</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-amber-100">
              <Check className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5 font-bold" />
              <span>ربط مباشر عبر API فائق السرعة لأنظمة الرد الآلي والمساعدات الذكية</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="#branded-form"
              className="w-full py-3 rounded-xl bg-[#FF5500] hover:bg-[#E04400] text-white font-bold text-xs transition block text-center shadow-md shadow-[#FF5500]/30"
            >
              احجز استشارة لتطوير صوت علامتك
            </a>
          </div>
        </div>

      </div>

      {/* 4 Steps Deployment Process */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-6 max-w-5xl mx-auto">
        <h3 className="text-xl font-bold text-slate-900 text-center">خطوات بناء صوت علامتك الحصري</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF5500] font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900">تحديد الشخصية والنبرة</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ندرس قيم علامتك، الفئة المستهدفة، واللهجة المعتمدة (رسمية، حيوية، أو تفاعلية).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF5500] font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900">جلسة تسجيل الاستوديو</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              تسجيل خامات نقية 48kHz مع الفنان المختار في بيئة عزل صوتي احترافية.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF5500] font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900">التدريب العصبي والتدقيق</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              تدريب النموذج واختبار دقة اللهجة بنسبة 99%+ عبر محرك الفحص الآلي.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF5500] font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h4 className="text-sm font-bold text-slate-900">التسليم وتكامل الـ API</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              إتاحة الصوت في لوحة تحكم شركتكم مع مفاتيح API مشفرة جاهزة للإنتاج.
            </p>
          </div>
        </div>
      </div>

      {/* Consultation Request Form (نموذج تواصل بصيغة فصحى) */}
      <div id="branded-form" className="bg-[#18110A] text-white rounded-3xl p-8 sm:p-10 max-w-3xl mx-auto border border-orange-500/30 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#FF7A29] uppercase">نموذج طلب صوت حصري</span>
          <h3 className="text-2xl font-bold text-white">تحدث مع خبراء الهندسة الصوتية</h3>
          <p className="text-xs text-amber-100/70">
            يرجى ملء النموذج أدناه بدقة، وسيقوم مستشار الحلول المؤسسية بالتواصل معكم خلال 24 ساعة.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">تم استلام طلبكم بنجاح!</h4>
            <p className="text-xs text-emerald-300">
              شكراً لاهتمامكم. سيقوم فريق قيمة فويس للتطوير المؤسسي بالتواصل مع {contactName} عبر {email}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-amber-200/80 mb-1">اسم المنشأة أو الشركة:</label>
                <input
                  required
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/15 p-3 text-xs text-white focus:ring-2 focus:ring-[#FF5500]"
                  placeholder="مثال: مصرف الراجحي، شركة تقنية..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/80 mb-1">الاسم الكريم:</label>
                <input
                  required
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/15 p-3 text-xs text-white focus:ring-2 focus:ring-[#FF5500]"
                  placeholder="الاسم الأول والأخير"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-amber-200/80 mb-1">البريد الإلكتروني المهني:</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/15 p-3 text-xs text-white focus:ring-2 focus:ring-[#FF5500]"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/80 mb-1">اللهجة المستهدفة:</label>
                <select
                  value={selectedDialect}
                  onChange={e => setSelectedDialect(e.target.value)}
                  className="w-full rounded-xl bg-[#1C120A] border border-white/15 p-3 text-xs text-white focus:ring-2 focus:ring-[#FF5500]"
                >
                  <option value="خليجي سعودي">لهجة خليجية (سعودية - نجدية / حجازية)</option>
                  <option value="شامي">لهجة شامية (سورية / لبنانية / أردنية)</option>
                  <option value="مصري">لهجة مصرية (تجارية معاصرة)</option>
                  <option value="مغاربي">لهجة مغاربية (مغربية / تونسية)</option>
                  <option value="فصحى">لغة عربية فصحى وقورة</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-200/80 mb-1">نبذة عن الاستخدام المتوقع:</label>
              <textarea
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/15 p-3 text-xs text-white focus:ring-2 focus:ring-[#FF5500]"
                placeholder="مثال: نود تدريب صوت AI حصري لاستخدامه في مركز الاتصال الهاتفي وتطبيق الجوال..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#E04400] text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال طلب الاستشارة الفنية</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
};
