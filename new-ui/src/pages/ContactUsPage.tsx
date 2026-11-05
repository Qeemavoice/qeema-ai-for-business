import React, { useState } from 'react';
import { openTalentSignup } from '../lib/talentJoin';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Headphones, 
  Building2, 
  ArrowLeft 
} from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { usePageText } from '../lib/pageTexts';

export const ContactUsPage: React.FC = () => {
  const pageText = usePageText('contact-us');
  useSeo(STATIC_SEO_ROUTES['/ar/contact-us']);

  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    serviceType: 'voice-over',
    message: ''
  });

  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  // Lands in the admin dashboard under «الرسائل البريدية»
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormError('');
    try {
      const res = await fetch('/api/v1/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'تعذر إرسال الرسالة');
      setFormSent(true);
    } catch (err: any) {
      setFormError(err.message || 'تعذر إرسال الرسالة، حاول مرة أخرى');
    } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'تواصل معنا', item: '/ar/contact-us' }
        ]} />
      </div>

      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand-text text-xs font-bold">
            <Mail className="w-3.5 h-3.5" />
            <span>خدمة العملاء والشركات</span>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Contact Details (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-brand-text tracking-wider uppercase">اتصل بنا مباشرة</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">نسعد بالإجابة على استفساراتكم</h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    فريقنا متواجد للإجابة على كافة الاستفسارات، متطلبات التوليد الصوتي بالذكاء الاصطناعي (TTS)، حجز المعلقين البشريين، وطلبات عروض الأسعار المؤسسية.
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
                      <a href="mailto:info@qeemavoice.com" className="text-slate-300 hover:text-white font-mono">
                        info@qeemavoice.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side CTA */}
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <span className="text-xs text-slate-300 font-bold block">
                  هل أنت معلق صوتي وترغب بالانضمام لسوق قيمة؟
                </span>
                <button
                  type="button"
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
                      <option value="voice-over">حجز معلقين صوتيين بشريين لمشروع خاص</option>
                      <option value="dubbing">خدمة الدوبلاج العربي</option>
                      <option value="audiobooks">تسجيل الكتب الصوتية</option>
                      <option value="podcast">إنتاج البودكاست والفواصل</option>
                      <option value="ivr">تسجيلات الرد الآلي IVR</option>
                      <option value="ai-voice">اشتراك استوديو التوليد الصوتي بالذكاء الاصطناعي (TTS)</option>
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

                  {formError && <p className="text-xs font-bold text-rose-600 text-center">{formError}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 rounded-xl bg-brand disabled:opacity-60 text-white font-bold text-xs hover:bg-brand-orange transition-colors shadow-md shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'جاري الإرسال...' : 'إرسال الرسالة إلى فريق الأعمال'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Bottom Talent Invitation Banner at end of page */}
          <div className="mt-12 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
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
                type="button"
                onClick={openTalentSignup}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-brand hover:bg-brand-orange text-white text-sm font-bold shadow-lg shadow-brand/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>أنشئ حسابك الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
