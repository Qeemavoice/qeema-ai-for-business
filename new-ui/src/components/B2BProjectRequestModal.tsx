import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Briefcase,
  Clock,
  Users,
  FileText,
  Sparkles,
  ShieldCheck,
  Globe2,
  Radio,
  Building2,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

interface B2BProjectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledVoiceName?: string;
  prefilledDialect?: string;
}

export const B2BProjectRequestModal: React.FC<B2BProjectRequestModalProps> = ({
  isOpen,
  onClose,
  prefilledVoiceName,
  prefilledDialect
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    projectType: 'commercial_video',
    scriptLength: '1_2_mins',
    dialect: prefilledDialect || 'saudi',
    gender: 'any',
    performanceStyle: 'corporate_authoritative',
    voiceCount: '1',
    deadline: 'urgent_24h',
    usageType: 'broadcast_digital',
    selectedVoiceName: prefilledVoiceName || '',
    projectBrief: '',
    budgetRange: 'standard'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">

        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5500] to-amber-500 flex items-center justify-center text-white shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">طلب عرض لمشروع صوتي مؤسسي</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  B2B Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                أخبرنا بمتطلبات مشروعك وسيقوم مستشار الإنتاج الصوتي باقتراح أفضل المعلقين مع عرض تسعير مخصص.
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-black text-slate-900">تم استلام طلب مشروعك بنجاح!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                تم تحويل طلبك إلى فريق إدارة المشاريع المؤسسية في «قيمة فويس». سيتواصل معك مستشار الإنتاج خلال أقل من <strong className="text-slate-900 font-bold">ساعتين</strong> لمراجعة عينات المقترحة والجدول الزمني.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-md mx-auto text-right text-xs space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>نوع المشروع:</span>
                  <span className="font-bold text-slate-800">
                    {formData.projectType === 'commercial_video' ? 'فيديو إعلاني تجاري' :
                     formData.projectType === 'corporate_film' ? 'فيلم وثائقي / شركة' :
                     formData.projectType === 'ivr_system' ? 'نظام رد آلي IVR' :
                     formData.projectType === 'elearning' ? 'تدريب ومحتوى تعليمي' : 'حملة رقمية متكاملة'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>المهلة المحددة:</span>
                  <span className="font-bold text-emerald-700">
                    {formData.deadline === 'urgent_24h' ? 'تسليم سريع (24 ساعة)' :
                     formData.deadline === 'standard_48h' ? 'خلال 48 ساعة' : '3 إلى 5 أيام عمل'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>جودة التسجيل المعتمدة:</span>
                  <span className="font-bold text-slate-800">48kHz FLAC / WAV Studio</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={resetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-md"
                >
                  العودة لمكتبة الأصوات
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700">

              {/* Context Banner */}
              <div className="p-3.5 bg-orange-50/80 border border-orange-200/70 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#FF5500] shrink-0 mt-0.5" />
                <div className="text-[11.5px] leading-relaxed text-slate-800">
                  <strong>ضمان الجودة المؤسسي:</strong> جميع الأصوات البشرية مسجلة في استوديوهات عزل معتمدة (48kHz) مع تراخيص تجارية واضحة، وعقود حماية للملكية الفكرية.
                </div>
              </div>

              {/* Company & Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">اسم المنشأة / الشركة *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: شركة الاتصالات، وكالة إبداعية..."
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">اسم المسؤول / مدير المشروع *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: م. أحمد الغامدي"
                    value={formData.contactName}
                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">البريد الإلكتروني للعمل *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">رقم الهاتف / الواتساب *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+966 50 000 0000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Project Specs */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>تفاصيل ومواصفات المشروع الصوتي</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">نوع المشروع</label>
                    <select
                      value={formData.projectType}
                      onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="commercial_video">إعلان تجاري وسوشيال ميديا</option>
                      <option value="corporate_film">فيلم وثائقي / فيديو شركة</option>
                      <option value="ivr_system">نظام رد آلي IVR وبنوك</option>
                      <option value="elearning">تدريب ومحتوى تعليمي</option>
                      <option value="podcast_series">بودكاست أو برنامج صوتي</option>
                      <option value="dubbing">دوبلاج وتمثيل شخصيات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">اللهجة المطلوبة</label>
                    <select
                      value={formData.dialect}
                      onChange={e => setFormData({ ...formData, dialect: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="saudi">🇸🇦 سعودي (نجدي / حجازي / شرقاوي)</option>
                      <option value="khaleeji">🇦🇪 خليجي (إماراتي / كويتي / عام)</option>
                      <option value="egyptian">🇪🇬 مصري (أبيض / إعلاني / عفوي)</option>
                      <option value="levantine">🇸🇾 شامي (سوري / لبناني / أردني)</option>
                      <option value="maghrebi">🇲🇦 مغاربي (مغربي / تونسي)</option>
                      <option value="fusha">🌍 فصحى معيارية رنانة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">الجنس المفضل</label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="any">لا تفضيل محدد (الأنسب للنص)</option>
                      <option value="male">رجالي فقط</option>
                      <option value="female">نسائي فقط</option>
                      <option value="duo">صوتان (دويتو رجالي + نسائي)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">طول النص التقريبي</label>
                    <select
                      value={formData.scriptLength}
                      onChange={e => setFormData({ ...formData, scriptLength: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="short_30s">أقل من 30 ثانية (إعلان خاطف)</option>
                      <option value="1_min">حوالي دقيقة واحدة (130-150 كلمة)</option>
                      <option value="1_2_mins">دقيقة إلى دقيقتين</option>
                      <option value="3_5_mins">3 إلى 5 دقائق (وثائقي / شركة)</option>
                      <option value="long_script">مشروع طويل (أكثر من 10 دقائق)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">موعد التسليم المطلوب</label>
                    <select
                      value={formData.deadline}
                      onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none font-medium"
                    >
                      <option value="urgent_24h">⚡ تسليم فوري خلال 24 ساعة</option>
                      <option value="standard_48h">خلال 48 ساعة</option>
                      <option value="flexible_3_5d">خلال 3-5 أيام عمل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">حقوق الاستخدام والترخيص</label>
                    <select
                      value={formData.usageType}
                      onChange={e => setFormData({ ...formData, usageType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="broadcast_digital">إعلانات رقمية وسوشيال ميديا كاملة</option>
                      <option value="internal_corporate">استخدام داخلي للشركة وتدريب</option>
                      <option value="tv_radio_broadcast">بث تلفزيوني وراديوي واسع</option>
                      <option value="global_buyout">ترخيص شامل دائم (Full Buyout)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specific voice & Script brief */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  هل لديك معلق معين في بالك؟ (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: محمد.ع، سارة.خ، أو اتركها لترشيح الأنسب..."
                  value={formData.selectedVoiceName}
                  onChange={e => setFormData({ ...formData, selectedVoiceName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  نص الاسكريبت أو نبذة عن الفكرة وتوجيه الأداء
                </label>
                <textarea
                  rows={3}
                  placeholder="ضع مسودة النص أو رابط الملف، مع أي توجيهات خاصة بنبرة الصوت، التشكيل اللغوي، أو الموسيقى المصاحبة..."
                  value={formData.projectBrief}
                  onChange={e => setFormData({ ...formData, projectBrief: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  * ستحصل على ترشيحات مسجلة وعرض تسعير رسمي ملزم.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>إرسال طلب المشروع</span>
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
