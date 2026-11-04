import React from 'react';
import { openTalentSignup } from '../lib/talentJoin';
import { FileSignature, ShieldCheck, Stamp, QrCode, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const VerifiedBadgeSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'عقد ترخيص قانوني صريح',
      desc: 'توقيع اتفاقية رقمية تحفظ حقوق الفنان الصوتية وتحدد بدقة مجالات الاستخدام التجاري للذكاء الاصطناعي مع ضمان المقابل المادي العادل.',
      icon: FileSignature,
      highlight: 'حقوق محمية 100%'
    },
    {
      step: '02',
      title: 'إصدار جواز الصوت الرقمي QV',
      desc: 'توليد بصمة صوتية مشفرة برقم تعريفي موحد (مثل QV-1042) يربط النموذج الصوتي بالهوية البشرية المعتمدة وتاريخ التسجيل.',
      icon: ShieldCheck,
      highlight: 'بصمة تشفير فريدة'
    },
    {
      step: '03',
      title: 'ختم المقطع الصوتي المُولد',
      desc: 'تضمين علامة مائية رقمية غير مسموعة (Watermark) مع ختم مرئي يمكن للعميل إرفاقه في حملاته الإعلانية ومحتواه الرقمي.',
      icon: Stamp,
      highlight: 'شارة Verified Human'
    },
    {
      step: '04',
      title: 'التحقق اللحظي والموثوقية',
      desc: 'إمكانية فحص أي مقطع أو رخصة صوتية فورياً عبر مسح رمز QR أو إدخال الهاش في المنصة للتأكد من شرعية وأصالة المصدر.',
      icon: QrCode,
      highlight: 'فحص فوري عبر الرابط'
    }
  ];

  return (
    <section className="py-16 bg-[#FFFFFF] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>منظومة التوثيق والأخلاقيات الصوتية</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            كيف تعمل شارة "معلق موثّق" (Verified Human)؟
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            أربعة مستويات أمان قانونية وتقنية تضمن لك ولجمهورك أن كل نبرة صوتية مستخدمة في مشروعك تحترم حقوق الإنسان والقوانين الدولية.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-brand/40 hover:shadow-lg transition space-y-4 relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-text flex items-center justify-center font-bold">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">{item.step}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    {item.highlight}
                  </span>
                  {idx < 3 && <ArrowLeft className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-[#1C120A] to-[#2B170B] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-orange-500/20">
          <div className="space-y-1 text-center sm:text-right">
            <h4 className="text-lg font-bold text-[#FED7AA]">هل أنت معلق صوتي وتريد الانضمام لبرنامج التوثيق؟</h4>
            <p className="text-xs text-amber-200/70">
              ارفع خامة صوتك، احصل على جواز QV الخاص بك، وابدأ في تحقيق دخل سلبي مستمر من كل توليد لصوتك بالذكاء الاصطناعي.
            </p>
          </div>

          <button
            onClick={openTalentSignup}
            className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shrink-0 shadow-md transition cursor-pointer"
          >
            انضم كمعلق موثق
          </button>
        </div>

      </div>
    </section>
  );
};
