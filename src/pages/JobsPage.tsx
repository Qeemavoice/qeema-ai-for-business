import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Upload, 
  Mic2, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  Phone, 
  Mail, 
  User, 
  Layers, 
  ShieldCheck, 
  Trash2, 
  Play, 
  Pause,
  HelpCircle,
  FileAudio
} from 'lucide-react';
import { useSeo } from '../seo/useSeo';
import { STATIC_SEO_ROUTES } from '../seo/seoConfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useSiteLists } from '../lib/siteLists';
import { usePageText } from '../lib/pageTexts';

interface AudioUploadItem {
  id: string;
  file: File;
  name: string;
  size: string;
  category: string;
  dialect: string;
  audioUrl: string;
}

const SAMPLE_CATEGORIES = [
  'إعلانات',
  'وثائقيات',
  'دراما',
  'رد آلي',
  'دوبلاج كرتوني',
  'دوبلاج وثائقي',
  'تقارير وأخبار',
  'شعر وخواطر',
  'قصص',
  'تعليمي',
  'برومو',
  'بودكاست',
  'كتب وروايات',
  'ديني'
];

const COUNTRY_DIAL_CODES = [
  { code: '+966', country: 'السعودية', flag: '🇸🇦' },
  { code: '+971', country: 'الإمارات', flag: '🇦🇪' },
  { code: '+20', country: 'مصر', flag: '🇪🇬' },
  { code: '+965', country: 'الكويت', flag: '🇰🇼' },
  { code: '+974', country: 'قطر', flag: '🇶🇦' },
  { code: '+973', country: 'البحرين', flag: '🇧🇭' },
  { code: '+968', country: 'عُمان', flag: '🇴🇲' },
  { code: '+962', country: 'الأردن', flag: '🇯🇴' },
  { code: '+961', country: 'لبنان', flag: '🇱🇧' },
  { code: '+963', country: 'سوريا', flag: '🇸🇾' },
  { code: '+964', country: 'العراق', flag: '🇮🇶' },
  { code: '+970', country: 'فلسطين', flag: '🇵🇸' },
  { code: '+212', country: 'المغرب', flag: '🇲🇦' },
  { code: '+213', country: 'الجزائر', flag: '🇩🇿' },
  { code: '+216', country: 'تونس', flag: '🇹🇳' },
  { code: '+218', country: 'ليبيا', flag: '🇱🇾' },
  { code: '+249', country: 'السودان', flag: '🇸🇩' },
  { code: '+967', country: 'اليمن', flag: '🇾🇪' }
];


export const JobsPage: React.FC = () => {
  // 1. Centralized SEO
  const pageText = usePageText('jobs');
  // Dialects from the dashboard (اللهجات واللغات), Arabic dialects only
  const ALL_ARABIC_DIALECTS = useSiteLists().dialects.filter(d => d.type !== 'لغة').map(d => d.key);
  useSeo(STATIC_SEO_ROUTES['/ar/jobs']);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+966');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedDialects, setSelectedDialects] = useState<string[]>(['سعودية', 'فصحى']);
  const [uploadedSamples, setUploadedSamples] = useState<AudioUploadItem[]>([]);
  const [selectedCategoryForNew, setSelectedCategoryForNew] = useState('إعلانات');
  const [studioMic, setStudioMic] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('2-5 سنوات');
  const [submitted, setSubmitted] = useState(false);

  // Sample Details Popup Modal State
  const [sampleModalItem, setSampleModalItem] = useState<{
    item: AudioUploadItem;
    isNew: boolean;
  } | null>(null);

  // Toggle Dialect
  const handleToggleDialect = (d: string) => {
    if (selectedDialects.includes(d)) {
      if (selectedDialects.length > 1) {
        setSelectedDialects(selectedDialects.filter(item => item !== d));
      }
    } else {
      setSelectedDialects([...selectedDialects, d]);
    }
  };

  // Direct Audio File Upload -> Opens Sample Details Popup
  const handleAudioFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const f: File = e.target.files[0];
    const url = URL.createObjectURL(f);
    const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
    const cleanName = f.name.replace(/\.[^/.]+$/, '');

    const newItem: AudioUploadItem = {
      id: `sample_${Date.now()}`,
      file: f,
      name: cleanName,
      size: `${sizeMb} MB`,
      category: selectedCategoryForNew,
      dialect: selectedDialects[0] || 'سعودية',
      audioUrl: url
    };

    // Open popup to set name, category, dialect
    setSampleModalItem({
      item: newItem,
      isNew: true
    });

    // Reset input
    e.target.value = '';
  };

  const handleSaveSampleDetails = (updated: AudioUploadItem, isNew: boolean) => {
    if (isNew) {
      setUploadedSamples(prev => [...prev, updated]);
    } else {
      setUploadedSamples(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
    setSampleModalItem(null);
  };

  const handleRemoveSample = (id: string) => {
    setUploadedSamples(uploadedSamples.filter(s => s.id !== id));
  };

  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  // Lands in the admin dashboard under «الوظائف» (طلبات التقديم)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormError('');
    try {
      const res = await fetch('/api/v1/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName, email,
          phone: `${selectedCountryCode} ${whatsappNumber}`.trim(),
          country: COUNTRY_DIAL_CODES.find(c => c.code === selectedCountryCode)?.country || '',
          experienceYears: parseInt(yearsOfExperience, 10) || 0,
          coverLetter: [
            `الجنس: ${gender === 'male' ? 'ذكر' : 'أنثى'}`,
            `اللهجات: ${selectedDialects.join('، ')}`,
            `التخصص: ${selectedCategoryForNew}`,
            studioMic && `الميكروفون: ${studioMic}`,
            `الخبرة: ${yearsOfExperience}`,
            `العينات (${uploadedSamples.length}): ${uploadedSamples.map(u => u.name).join('، ')}`
          ].filter(Boolean).join('\n')
        })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'تعذر إرسال الطلب');
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || 'تعذر إرسال الطلب، حاول مرة أخرى');
    } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-slate-900 pb-20" dir="rtl">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { name: 'الرئيسية', item: '/ar' },
          { name: 'انضم كمعلق صوتي', item: '/ar/jobs' }
        ]} />
      </div>

      {/* Hero Header */}
      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5500]/10 text-[#FF5500] text-xs font-bold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>بوابة المواهب الصوتية العربية</span>
          </div>

          {/* Strict Single H1 */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            {pageText.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            {pageText.intro}
          </p>

          <div className="pt-2">
            <Link
              to="/ar/guides"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5500] hover:underline"
            >
              <span>اقرأ دليل: كيف أنضم إلى منصة قيمة فويس وأحقق دخلاً مستمراً؟</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content & Registration Form */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {submitted ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">تم استلام طلبك وعيناتك الصوتية بنجاح!</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                شكراً لانضمامك إلى قيمة فويس. سيقوم فريق التدقيق الصوتي بمراجعة عيناتك، وسنتواصل معك عبر الواتساب المعتمد <span className="font-mono text-slate-900 font-bold" dir="ltr">{selectedCountryCode} {whatsappNumber}</span> لتفعيل ملفك وإتاحته للشركات.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  تقديم طلب آخر
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
              
              <div className="border-b border-slate-100 pb-5 space-y-1">
                <h2 className="text-xl font-bold text-slate-900">نموذج تسجيل معلق صوتي جديد</h2>
                <p className="text-xs text-slate-500">
                  يرجى ملء بياناتك بدقة وإرفاق عينات استوديو حقيقية مباشرة (ملفات صوتية MP3 أو WAV خالية من الصدى).
                </p>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-6">
                
                {/* 1. Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: عبد الرحمن الشهري"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      required
                      placeholder="voice@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                </div>

                {/* 2. WhatsApp Number with Country Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    رقم الواتساب المعتمد للتواصل *
                  </label>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 sm:col-span-3">
                      <select
                        value={selectedCountryCode}
                        onChange={e => setSelectedCountryCode(e.target.value)}
                        className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono focus:outline-none focus:border-[#FF5500]"
                      >
                        {COUNTRY_DIAL_CODES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.country})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-8 sm:col-span-9">
                      <input
                        type="tel"
                        required
                        placeholder="50 123 4567"
                        value={whatsappNumber}
                        onChange={e => setWhatsappNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#FF5500]"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    يستخدم للتواصل الفوري وإشعارات حجز المشاريع الجديدة وعروض الأسعار.
                  </span>
                </div>

                {/* 3. Gender & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">الجنس</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === 'male'}
                          onChange={() => setGender('male')}
                          className="accent-[#FF5500]"
                        />
                        <span>صوت رجالي</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === 'female'}
                          onChange={() => setGender('female')}
                          className="accent-[#FF5500]"
                        />
                        <span>صوت نسائي</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">سنوات الخبرة في الفويس اوفر</label>
                    <select
                      value={yearsOfExperience}
                      onChange={e => setYearsOfExperience(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF5500]"
                    >
                      <option value="مبتدئ موهوب">مبتدئ موهوب (أقل من سنة)</option>
                      <option value="1-3 سنوات">1 إلى 3 سنوات</option>
                      <option value="3-5 سنوات">3 إلى 5 سنوات</option>
                      <option value="+5 سنوات محترف">+5 سنوات (محترف معتمد)</option>
                    </select>
                  </div>
                </div>

                {/* 4. All Arabic Dialects (No Najdi / Hijazi split) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800">
                      اللهجات العربية التي تتقنها بطلاقة (اختر واحدة أو أكثر) *
                    </label>
                    <span className="text-[11px] text-[#FF5500] font-bold">
                      {selectedDialects.length} لهجات مختارة
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    {ALL_ARABIC_DIALECTS.map(d => {
                      const isSelected = selectedDialects.includes(d);
                      return (
                        <button
                          type="button"
                          key={d}
                          onClick={() => handleToggleDialect(d)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#FF5500] text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Direct Audio File Upload (Not a URL!) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      إرفاق العينات الصوتية مباشرة (حتى 5 عينات MP3 أو WAV) *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {uploadedSamples.length} من 5 عينات
                    </span>
                  </div>

                  {uploadedSamples.length < 5 && (
                    <div className="p-4 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 hover:bg-orange-50/70 transition text-center space-y-2">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <select
                          value={selectedCategoryForNew}
                          onChange={e => setSelectedCategoryForNew(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-orange-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="إعلانات تجارية">إعلانات تجارية</option>
                          <option value="دوبلاج وكرتون">دوبلاج وكرتون</option>
                          <option value="وثائقي ورسمي">وثائقي ورسمي</option>
                          <option value="كتب صوتية">كتب صوتية</option>
                          <option value="بودكاست">بودكاست</option>
                          <option value="رد آلي IVR">رد آلي IVR</option>
                        </select>

                        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-bold cursor-pointer transition shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع ملف صوتي من جهازك</span>
                          <input
                            type="file"
                            accept="audio/mp3,audio/mpeg"
                            multiple
                            onChange={handleAudioFiles}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        الحد الأقصى لكل عينة 15 ميجابايت • صيغ مدعومة: MP3 فقط
                      </p>
                    </div>
                  )}

                  {/* List of uploaded files with real HTML audio players */}
                  {uploadedSamples.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {uploadedSamples.map((sample, idx) => (
                        <div
                          key={sample.id}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center font-bold text-xs shrink-0">
                              {idx + 1}
                            </div>
                            <div className="truncate text-right">
                              <div className="font-bold text-xs text-slate-900 truncate max-w-xs">{sample.name}</div>
                              <div className="text-[10px] text-slate-500">
                                {sample.category} • {sample.size}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            {/* Real HTML Audio Player with preload="none" */}
                            <audio
                              controls
                              preload="none"
                              src={sample.audioUrl}
                              className="h-8 max-w-[200px]"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSample(sample.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition cursor-pointer"
                              title="حذف العينة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Studio Gear */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    تجهيزات الاستوديو والمايكروفون (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: Rode NT1 / Focusrite Scarlett / غرفة معزولة صوتياً"
                    value={studioMic}
                    onChange={e => setStudioMic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                {/* Submit Button */}
                {formError && <p className="text-xs font-bold text-rose-600 text-center">{formError}</p>}
                <button
                  type="submit"
                  disabled={uploadedSamples.length === 0 || sending}
                  className="w-full py-4 rounded-2xl bg-[#FF5500] hover:bg-[#E04800] disabled:bg-slate-300 text-white font-bold text-sm shadow-lg shadow-[#FF5500]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{sending ? 'جاري الإرسال...' : 'إرسال طلب الانضمام والعينات الصوتية'}</span>
                </button>

                {uploadedSamples.length === 0 && (
                  <p className="text-[11px] text-center text-amber-600 font-medium">
                    * يرجى إرفاق عينة صوتية واحدة على الأقل لتفعيل زر الإرسال.
                  </p>
                )}

              </form>
            </div>
          )}

          {/* SEO Text Section: وظائف تعليق صوتي أون لاين */}
          <div className="mt-16 bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              لماذا تختار العمل كمعلق صوتي مع منصة قيمة فويس؟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm">مطلوب أصوات للدوبلاج والإعلانات</div>
                <p>
                  نستقبل يومياً طلبات مشاريع من وكالات إعلانية وشركات إنتاج كبرى تبحث عن خامات صوتية جديدة ومتنوعة لكافة اللهجات العربية.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm">شغل فويس اوفر من المنزل</div>
                <p>
                  سجّل من استوديوهاتك المنزلية واستلم مستحقاتك المالية بانتظام عبر التحويلات البنكية المباشرة دون الحاجة للسفر أو الانتقال.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm">حماية العقود وحقوق الملكية</div>
                <p>
                  عقود وتراخيص استخدام نظامية واضحة تضمن عدم استغلال صوتك خارج نطاق الترخيص المتفق عليه مع العميل.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Sample Details Popup Modal */}
      {sampleModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-5 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900">تفاصيل العينة الصوتية المرفوعة</h3>
            <p className="text-xs text-slate-500">قم بتسمية العينة وتحديد تصنيفها واللهجة بدقة.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">اسم العينة (المقطع الصوتي)</label>
                <input
                  type="text"
                  value={sampleModalItem.item.name}
                  onChange={e => setSampleModalItem({
                    ...sampleModalItem,
                    item: { ...sampleModalItem.item, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">تصنيف العينة</label>
                <select
                  value={sampleModalItem.item.category}
                  onChange={e => setSampleModalItem({
                    ...sampleModalItem,
                    item: { ...sampleModalItem.item, category: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF5500]"
                >
                  {SAMPLE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">لهجة المقطع</label>
                <select
                  value={sampleModalItem.item.dialect}
                  onChange={e => setSampleModalItem({
                    ...sampleModalItem,
                    item: { ...sampleModalItem.item, dialect: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF5500]"
                >
                  {ALL_ARABIC_DIALECTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSampleModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleSaveSampleDetails(sampleModalItem.item, sampleModalItem.isNew)}
                className="px-5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-xs font-bold text-white shadow-md shadow-[#FF5500]/25"
              >
                حفظ وإضافة العينة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
