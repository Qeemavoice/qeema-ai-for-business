import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  GitBranch, 
  GitCommit, 
  FileCode, 
  FolderTree, 
  AlertTriangle, 
  Save, 
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Check,
  Building2
} from 'lucide-react';
import { CHANGELOG_ITEMS } from '../data/mockData';

interface ProjectChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectChangelogModal: React.FC<ProjectChangelogModalProps> = ({ isOpen, onClose }) => {
  // Interactive state for the 3 pending confirmation items
  const [dialectCounts, setDialectCounts] = useState({
    gulf: 380,
    levantine: 240,
    egyptian: 260,
    maghrebi: 120
  });
  const [experienceYears, setExperienceYears] = useState(6);
  const [brandLogosStatus, setBrandLogosStatus] = useState('مربعات مؤقتة بانتظار تزويدنا بالشعارات الرسمية');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const totalDialects = dialectCounts.gulf + dialectCounts.levantine + dialectCounts.egyptian + dialectCounts.maghrebi;

  const handleSaveConfirmations = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 text-right">
      <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#1C120A] text-white p-5 sm:p-6 flex items-center justify-between border-b border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  تقرير ما تم إنجازه بالضبط في مشروع قيمة فويس (qv-dev)
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                  ملخص المطور
                </span>
              </div>
              <p className="text-xs text-amber-200/60 mt-0.5">
                مراجعة شاملة للملفات المطورة محلياً، التموضع، حالة الـ Git، والأرقام المطلوب تأكيدها
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 text-slate-800 text-sm">
          
          {/* Important Git Status Alert */}
          <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-3">
              <GitBranch className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-sm block text-amber-950">
                  الحالة الحالية: محلي فقط بمجلد `qv-dev` (0 commits / 0 push)
                </strong>
                <span className="text-amber-800">
                  جميع الأكواد والصفحات المذكورة أدناه موجودة فعلياً بالجهاز ولكن لم يتم عمل commit أو push بانتظار موافقتك الصريحة بعد مراجعة هذا المعاين.
                </span>
              </div>
            </div>
            <div className="bg-amber-200/80 px-3 py-1.5 rounded-lg font-mono font-bold shrink-0 text-amber-950">
              Branch: main
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>1. التموضع الاستراتيجي الذي تم اعتماده</span>
            </h3>
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                تم إعادة توجيه قيمة فويس للاستفادة من أقوى نقطة تميز تنافسية ضد منصات مثل <strong>ElevenLabs</strong> و<strong>Voices.com</strong> و<strong>Munsit</strong>: 
                وهي قاعدة <strong className="text-slate-900">1,000+ معلق صوتي عربي حقيقي وموثق</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li><strong>الإنسان أولاً:</strong> كل صوت ذكاء اصطناعي له أب بشري شرعي مرخص قانونياً.</li>
                <li><strong>عمق لهجوي حقيقي:</strong> تسجيل أصوات ناطقين أصليين (خليجي، شامي، مصري، مغاربي) بدل اللهجات المقاربة العشوائية.</li>
                <li><strong>تكامل ثلاث خدمات:</strong> جواز الصوت الرقمي QV + تدقيق الصوت اللغوي + استوديو التوليد الفوري مع السوق البشري.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Detailed File Work Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>2. الملفات والمسارات التي تم بناؤها وتعديلها في كود الموقع</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">الصفحة / العنصر</th>
                    <th className="p-3">المسار (Route)</th>
                    <th className="p-3">الملفات في qv-dev</th>
                    <th className="p-3">الوصف والتأثير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CHANGELOG_ITEMS.filter(c => c.category !== 'pending').map(item => (
                    <tr key={item.id} className="hover:bg-orange-50/30 transition">
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        {item.title}
                      </td>
                      <td className="p-3 font-mono text-brand-text whitespace-nowrap">
                        {item.route || '-'}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {item.files.map((f, i) => (
                          <div key={i} className="truncate max-w-[220px]" title={f}>{f}</div>
                        ))}
                      </td>
                      <td className="p-3 text-slate-600 leading-normal">
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: The 3 Artifacts Summary */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>3. المعاينات التصميمية السابقة والدمج النهائي</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">1. معاينة طبق الأصل</div>
                <p className="text-slate-500">نفس الألوان البرتقالية مع الصفحات الجديدة مجمعة في ملف واحد.</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-red-200 bg-red-50/20 space-y-1">
                <div className="font-bold text-red-900">2. استكشاف الموجة العربية</div>
                <p className="text-red-700">تصميم بنفسجي وأزرق مع هيرو غامق (تم رفض الألوان لأن الهوية برتقالية).</p>
              </div>
              <div className="bg-orange-50 p-3.5 rounded-xl border border-orange-300 space-y-1">
                <div className="font-bold text-brand-text">3. الدمج النهائي (المعتمد حالياً)</div>
                <p className="text-orange-950">أخذ العناصر الهيكلية القوية (الشريط البصري، جواز الصوت، شارة التوثيق) وتلوينها بالبرتقالي الأصلي.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Interactive Data Confirmation Manager */}
          <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl p-5 border border-orange-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>4. بيانات وأرقام بانتظار تأكيدك النهائي</span>
                </h3>
                <p className="text-xs text-slate-500">
                  يمكنك تعديل الأرقام هنا مباشرة لمطابقتها مع الواقع الفعلي للشركة:
                </p>
              </div>

              {savedSuccess && (
                <div className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>تم حفظ التعديل!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveConfirmations} className="space-y-4 text-xs">
              {/* Dialect counts */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  أ) توزيع المعلقين الـ 1,000 حسب اللهجة (المجموع الحالي: {totalDialects}):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500">خليجي:</span>
                    <input
                      type="number"
                      value={dialectCounts.gulf}
                      onChange={e => setDialectCounts({ ...dialectCounts, gulf: parseInt(e.target.value) || 0 })}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">شامي:</span>
                    <input
                      type="number"
                      value={dialectCounts.levantine}
                      onChange={e => setDialectCounts({ ...dialectCounts, levantine: parseInt(e.target.value) || 0 })}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">مصري:</span>
                    <input
                      type="number"
                      value={dialectCounts.egyptian}
                      onChange={e => setDialectCounts({ ...dialectCounts, egyptian: parseInt(e.target.value) || 0 })}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">مغاربي:</span>
                    <input
                      type="number"
                      value={dialectCounts.maghrebi}
                      onChange={e => setDialectCounts({ ...dialectCounts, maghrebi: parseInt(e.target.value) || 0 })}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Experience Years */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ب) سنوات الخبرة الميدانية:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={e => setExperienceYears(parseInt(e.target.value) || 0)}
                      className="w-24 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-center"
                    />
                    <span className="text-slate-500">سنوات خبرة في الإنتاج الصوتي</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ج) شعارات العلامات التجارية الشريكة:
                  </label>
                  <input
                    type="text"
                    value={brandLogosStatus}
                    onChange={e => setBrandLogosStatus(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>تثبيت الأرقام المؤكدة للمشروع</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 5: Next Steps */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-[#FED7AA]">الخطوات المقترحة التالية:</h4>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>مراجعة هذا التصميم التفاعلي المدمج والتأكد من تناسق كافة الأقسام.</li>
              <li>اعتماد أو تصحيح أرقام اللهجات وسنوات الخبرة من النموذج أعلاه.</li>
              <li>تحويل الأقسام الجديدة من كود المعاينة إلى ملفات Blade حقيقية في مجلد `qv-dev`.</li>
              <li>إجراء المراجعة الشاملة ثم تنفيذ `git commit` و `git push` بعد موافقتك الصريحة.</li>
            </ol>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            مستودع: Qeemavoice/qv-dev • الفرع: main
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition cursor-pointer"
          >
            إغلاق المراجعة والعودة للموقع
          </button>
        </div>

      </div>
    </div>
  );
};
