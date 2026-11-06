import React, { useState } from 'react';
import { X, Building2, Mail, Phone, User, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

interface BusinessDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessDemoModal: React.FC<BusinessDemoModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Marketing & Advertising',
    contactName: '',
    email: '',
    phone: '',
    monthlyVolume: '50,000 - 250,000 حرف',
    requirements: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await api.submitLead({
        type: 'business_demo',
        name: formData.contactName,
        email: formData.email,
        mobile: formData.phone,
        message: formData.requirements || 'طلب عرض توضيحي للمؤسسات',
        metadata: {
          company: formData.companyName,
          industry: formData.industry,
          monthlyVolume: formData.monthlyVolume
        }
      });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'تعذر إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5500]/20 flex items-center justify-center border border-[#FF5500]/30">
              <Building2 className="w-5 h-5 text-[#FF5500]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">طلب عرض توضيحي للمؤسسات</h3>
              <p className="text-xs text-slate-300">حلول مخصصة للوكالات والشركات الكبرى والجهات الحكومية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">تم استلام طلبكم بنجاح!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                سيتواصل معكم مستشار الإنتاج الصوتي والذكاء الاصطناعي في قيمة خلال ساعتي عمل لترتيب العرض التوضيحي وتخصيص باقة المؤسسات.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                إغلاق النافذة
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">اسم الشركة أو الجهة *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: وكالة رؤية للإعلان"
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">مجال العمل *</label>
                  <select
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
                  >
                    <option value="Marketing & Advertising">وكالات الإعلان والتسويق</option>
                    <option value="E-learning & Education">منصات التعليم الإلكتروني والتدريب</option>
                    <option value="Media & Production">الإنتاج الإعلامي والبودكاست</option>
                    <option value="E-commerce & Retail">التجارة الإلكترونية والتجزئة</option>
                    <option value="Banking & FinTech">البنوك والتقنية المالية</option>
                    <option value="Telecom & Technology">الاتصالات والبرمجيات SaaS</option>
                    <option value="Government & Enterprise">القطاع الحكومي والمؤسسات الكبرى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">اسم المسؤول / مدير المشروع *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: طلال القحطاني"
                      value={formData.contactName}
                      onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">البريد الإلكتروني المهني *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">رقم الهاتف / واتساب *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+966 5X XXX XXXX"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">حجم الإنتاج الصوتي الشهري المتوقع</label>
                  <select
                    value={formData.monthlyVolume}
                    onChange={e => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
                  >
                    <option value="50,000 - 250,000 حرف">50,000 - 250,000 حرف شهرياً</option>
                    <option value="250,000 - 1,000,000 حرف">250,000 - 1,000,000 حرف شهرياً</option>
                    <option value="أكثر من 1,000,000 حرف (Enterprise API)">أكثر من 1,000,000 حرف (Enterprise API)</option>
                    <option value="طلب صوت حصري مخصص (Branded Voice)">طلب صوت حصري مخصص (Branded Voice)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">تفاصيل إضافية أو متطلبات خاصة (اختياري)</label>
                <textarea
                  rows={2}
                  placeholder="مثال: نحتاج لهجة سعودية نجدية متخصصة لإعلانات سناب شات ورسائل IVR..."
                  value={formData.requirements}
                  onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#E04800] text-white font-bold text-sm shadow-lg shadow-[#FF5500]/25 hover:shadow-xl hover:shadow-[#FF5500]/35 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {submitting ? 'جارٍ إرسال الطلب...' : 'إرسال طلب العرض التوضيحي للمؤسسات'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
