import React, { useState } from 'react';
import { openTalentSignup } from '../lib/talentJoin';
import { 
  Building2, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Award, 
  Users, 
  MessageSquare, 
  Headphones
} from 'lucide-react';
import { ActiveView } from '../types';

interface AboutContactViewProps {
  initialMode?: 'about' | 'contact';
  onNavigate: (view: ActiveView) => void;
  onOpenDemo: () => void;
}

export const AboutContactView: React.FC<AboutContactViewProps> = ({ 
  initialMode = 'about', 
  onNavigate,
  onOpenDemo
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'contact'>(initialMode);
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    serviceType: 'ai-voice',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" dir="rtl">
      {/* Top Toggle Switch */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {activeTab === 'about' ? 'من نحن • منصة قيمة للذكاء الصوتي' : 'تواصل معنا • فريق الدعم المؤسسي'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeTab === 'about' 
              ? 'الرواد في بناء البنية التحتية للصوت العربي والذكاء الاصطناعي للمؤسسات والشركات.'
              : 'نحن هنا لمساعدتكم في تخصيص الحلول الصوتية ودمج الأنظمة وعقود المؤسسات.'}
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => { setActiveTab('about'); setFormSent(false); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'about' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            من نحن
          </button>
          <button
            onClick={() => { setActiveTab('contact'); setFormSent(false); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'contact' ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تواصل معنا
          </button>
        </div>
      </div>

      {activeTab === 'about' ? (
        /* About Us Content */
        <div className="space-y-10">
          {/* Mission Hero */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 text-brand-text border border-brand/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>رؤيتنا ورسالتنا</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-snug max-w-3xl">
              بناء البنية التحتية الموثوقة للصوت العربي والذكاء الاصطناعي للشركات
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              انطلقت "قيمة" من إيمان عميق بأن اللغة العربية ولهجاتها الغنية تستحق تقنيات صوتية تضاهي بل وتتفوق على اللغات العالمية. وبدلاً من استبدال المعلقين البشريين بنماذج آلية مجهولة المصدر، بنينا نموذج عمل ريادي يجمع بين **الأصوات البشرية المعتمدة** ونماذج **الذكاء الاصطناعي الصوتي** بحفظ كامل للحقوق والملكية الفكرية.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-brand-text font-mono">1,000+</div>
                <div className="text-xs text-slate-400">معلق صوتي معتمد</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">48kHz</div>
                <div className="text-xs text-slate-400">جودة استوديو موحدة</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">6+</div>
                <div className="text-xs text-slate-400">لهجات عربية دقيقة</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">100%</div>
                <div className="text-xs text-slate-400">تراخيص تجارية نظامية</div>
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-brand-text flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">حماية الحقوق والملكية</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                كل نموذج صوتي ذكي في منصتنا مدرب بناءً على موافقة خطية وعقود أرباح مستمرة للمواهب الصوتية، مما يوفر للشركات حماية قانونية وتجارية كاملة.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">دقة اللهجات والتلوين</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                تم تدريب نماذجنا على آلاف الساعات المسجلة في استوديوهات معزولة، لضمان النطق الصحيح للحروف العربية المفخمة والمرققة والتشكيل الإعرابي.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">جاهزية بيئة B2B</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                أنظمة محاسبية دقيقة باحتساب الحروف (Credit Ledger)، فواتير معتمدة لضريبة القيمة المضافة، ودعم فني مخصص للمشاريع الضخمة.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Contact Us Form & Direct Info */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-brand-text tracking-wider uppercase">اتصل بنا مباشرة</span>
                <h3 className="text-2xl font-black text-white mt-1">نسعد بالإجابة على استفساراتكم</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  فريقنا الهندسي والتجاري متواجد للإجابة على متطلبات ربط الـ API، تصميم البصمة الصوتية للشركات، أو طلبات عروض الأسعار المؤسسية.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-text shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white">المقر الرئيسي:</span>
                    <span className="text-slate-400">الرياض، المملكة العربية السعودية • دبي، الإمارات</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-brand-text shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white">البريد الإلكتروني المعتمد:</span>
                    <a href="mailto:info@qeemavoice.com" className="text-slate-300 hover:text-white font-mono">info@qeemavoice.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <span className="text-xs text-slate-300 font-bold block">هل أنت معلق صوتي وترغب بالانضمام لسوق قيمة؟</span>
              <button
                onClick={openTalentSignup}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold transition-all shadow-md shadow-brand/25 cursor-pointer"
              >
                <span>أنشئ حسابك الآن</span>
              </button>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            {formSent ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">تم استلام رسالتكم بنجاح!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  شكراً لتواصلكم مع منصة قيمة. سيقوم فريقنا بالتواصل معكم عبر البريد الإلكتروني خلال أسرع وقت ممكن.
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  إرسال استفسار آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  نموذج الاستفسارات وطلبات عروض المؤسسات
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: عبد الله السبيعي"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني للعمل *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الشركة أو الجهة *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: شركة سيل للاتصالات"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الجوال للتواصل (اختياري)</label>
                    <input
                      type="tel"
                      placeholder="+966 50 123 4567"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">مجال الاهتمام الأساسي</label>
                  <select
                    value={formData.serviceType}
                    onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand"
                  >
                    <option value="ai-voice">اشتراك استوديو التوليد الصوتي بالذكاء الاصطناعي (TTS)</option>
                    <option value="human-booking">حجز معلقين صوتيين بشريين لمشروع خاص</option>
                    <option value="branded-voice">بناء بصمة صوتية مخصصة حصرية للشركة (Custom Voice)</option>
                    <option value="api-integration">الربط البرمجي للرد الآلي والتطبيقات</option>
                    <option value="enterprise-plan">طلب باقة مؤسسية مفصلة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تفاصيل الرسالة أو المشروع *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="وضح متطلباتك، حجم الاستهلاك المتوقع، أو أي استفسار ترغب في مناقشته..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-orange transition-colors shadow-md shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال الرسالة إلى فريق الأعمال</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bottom Talent Invitation Banner at end of page */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto text-brand-text">
          <Headphones className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            هل أنت معلق صوتي وترغب بالانضمام لسوق قيمة؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            انضم إلى شبكة نخبة الأصوات المعتمدة في الوطن العربي واستقبل طلبات المشاريع والعقود المؤسسية مباشرة.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={openTalentSignup}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-brand hover:bg-brand-orange text-white text-sm font-bold shadow-lg shadow-brand/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>أنشئ حسابك الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
