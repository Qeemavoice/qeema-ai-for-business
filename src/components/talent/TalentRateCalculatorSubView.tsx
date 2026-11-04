import React, { useState } from 'react';
import { 
  Calculator, 
  Copy, 
  Check, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Layers, 
  Radio, 
  Clock, 
  Headphones,
  FileCheck2,
  Share2
} from 'lucide-react';

export const TalentRateCalculatorSubView: React.FC = () => {
  const [projectCategory, setProjectCategory] = useState<'commercial_tv' | 'commercial_digital' | 'corporate_doc' | 'ivr' | 'audiobook' | 'dubbing'>('commercial_digital');
  const [wordCount, setWordCount] = useState<number>(75);
  const [usageDuration, setUsageDuration] = useState<'3_months' | '1_year' | '2_years' | 'perpetual'>('1_year');
  const [geoScope, setGeoScope] = useState<'saudi' | 'gcc' | 'mena' | 'global'>('saudi');

  // Add-ons
  const [hasLiveSession, setHasLiveSession] = useState(false);
  const [hasRushDelivery, setHasRushDelivery] = useState(false);
  const [hasMusicMix, setHasMusicMix] = useState(false);
  const [extraRevisions, setExtraRevisions] = useState(0);

  const [copiedQuote, setCopiedQuote] = useState(false);

  // Pricing calculations
  const calculateTotal = () => {
    let baseRate = 800; // default minimum
    let buyoutMultiplier = 1.0;
    let geoMultiplier = 1.0;

    switch (projectCategory) {
      case 'commercial_tv':
        baseRate = 1800;
        break;
      case 'commercial_digital':
        baseRate = 950;
        break;
      case 'corporate_doc':
        baseRate = Math.max(1200, wordCount * 5.5);
        break;
      case 'ivr':
        baseRate = Math.max(800, wordCount * 6.0);
        break;
      case 'audiobook':
        baseRate = Math.max(900, (wordCount / 150) * 450); // per finished hour/minute
        break;
      case 'dubbing':
        baseRate = Math.max(1400, wordCount * 7.0);
        break;
    }

    switch (usageDuration) {
      case '3_months':
        buyoutMultiplier = 0.8;
        break;
      case '1_year':
        buyoutMultiplier = 1.0;
        break;
      case '2_years':
        buyoutMultiplier = 1.4;
        break;
      case 'perpetual':
        buyoutMultiplier = 1.9;
        break;
    }

    switch (geoScope) {
      case 'saudi':
        geoMultiplier = 1.0;
        break;
      case 'gcc':
        geoMultiplier = 1.25;
        break;
      case 'mena':
        geoMultiplier = 1.5;
        break;
      case 'global':
        geoMultiplier = 1.9;
        break;
    }

    const coreSubtotal = Math.round(baseRate * buyoutMultiplier * geoMultiplier);

    let addonsCost = 0;
    if (hasLiveSession) addonsCost += 450;
    if (hasRushDelivery) addonsCost += 350;
    if (hasMusicMix) addonsCost += 280;
    addonsCost += extraRevisions * 180;

    const totalSAR = coreSubtotal + addonsCost;
    const totalUSD = Math.round(totalSAR / 3.75);

    return {
      coreSubtotal,
      addonsCost,
      totalSAR,
      totalUSD
    };
  };

  const { coreSubtotal, addonsCost, totalSAR, totalUSD } = calculateTotal();

  const handleCopyQuote = () => {
    const quoteText = `🎙️ *عرض سعر معلق صوتي معتمد*
━━━━━━━━━━━━━━━━━━━━
📌 *نوع العمل:* ${
      projectCategory === 'commercial_tv' ? 'إعلان تلفزيوني تجاري' :
      projectCategory === 'commercial_digital' ? 'إعلان رقمي لسوشيال ميديا ويوتيوب' :
      projectCategory === 'corporate_doc' ? 'فيلم وثائقي / نبرة مؤسسية' :
      projectCategory === 'ivr' ? 'نظام رد آلي IVR وسنترال' :
      projectCategory === 'audiobook' ? 'كتاب مسموع / سرد روائي' : 'دوبلاج وتمثيل صوتي'
    }
📝 *حجم النص:* ${wordCount} كلمة (~${Math.round((wordCount / 140) * 60)} ثانية)
🌍 *النطاق الجغرافي:* ${geoScope === 'saudi' ? 'المملكة العربية السعودية' : geoScope === 'gcc' ? 'دول الخليج العربي' : 'الشرق الأوسط والعالم'}
📅 *حقوق الاستخدام (Buyout):* ${usageDuration === '3_months' ? '3 أشهر' : usageDuration === '1_year' ? 'سنة واحدة' : 'دائم'}
🎛️ *مواصفات التسليم:* WAV 48kHz / 24-bit PCM Master
${hasLiveSession ? '• جلسة توجيه مباشر متضمنة\n' : ''}${hasRushDelivery ? '• تسليم سريع خلال 3 ساعات\n' : ''}${hasMusicMix ? '• مكساج وهندسة صوتية شاملة\n' : ''}
💰 *إجمالي العرض المقترح:* ${totalSAR.toLocaleString()} ر.س (${totalUSD.toLocaleString()} USD)
━━━━━━━━━━━━━━━━━━━━
_شامل جولة تعديلات واحدة ومطابقة لمواصفات البث الإذاعي والتلفزيوني._`;

    try {
      navigator.clipboard.writeText(quoteText);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2200);
    } catch {
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-text" />
            <span>حاسبة تسعير التعليق الصوتي المعتمدة</span>
          </h2>
          <p className="text-xs text-slate-400">
            حساب دقيق لأسعار الفويس أوفر وفق معايير السوق السعودي والخليجي وحقوق البث
          </p>
        </div>

        <button
          onClick={handleCopyQuote}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand hover:bg-orange-600 text-white transition-all cursor-pointer shadow-lg shadow-orange-600/30"
        >
          {copiedQuote ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copiedQuote ? 'تم نسخ عرض السعر المنسق!' : 'نسخ عرض السعر للعميل'}</span>
        </button>
      </div>

      {/* Main Grid: Parameters vs Quote Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Configuration */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              نوع العمل والتصنيف:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'commercial_digital', label: 'إعلان رقمي (سوشيال/يوتيوب)' },
                { id: 'commercial_tv', label: 'إعلان تلفزيوني وراديو' },
                { id: 'corporate_doc', label: 'وثائقي ومؤسسي' },
                { id: 'ivr', label: 'رد آلي وسنترال (IVR)' },
                { id: 'audiobook', label: 'كتب وبودكاست' },
                { id: 'dubbing', label: 'دوبلاج وتمثيل صوتي' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setProjectCategory(cat.id as any)}
                  className={`p-3 rounded-xl border text-right font-medium transition-all cursor-pointer ${
                    projectCategory === cat.id
                      ? 'bg-orange-500/10 border-brand text-orange-400 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Word Count Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-300">عدد كلمات السيناريو:</span>
              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-mono font-bold text-sm">{wordCount} كلمة</span>
                <span className="text-slate-500 font-mono text-[11px]">(~{Math.round((wordCount / 140) * 60)} ثانية)</span>
              </div>
            </div>
            <input
              type="range"
              min="15"
              max="1500"
              step="5"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>15 كلمة (إعلان ترويجي)</span>
              <span>150 كلمة (دقيقة)</span>
              <span>500 كلمة</span>
              <span>1500 كلمة (فيلم كامل)</span>
            </div>
          </div>

          {/* Usage Duration & Geo Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">
                مدة حقوق البث (Usage Buyout):
              </label>
              <select
                value={usageDuration}
                onChange={(e) => setUsageDuration(e.target.value as any)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand"
              >
                <option value="3_months">3 أشهر (حملة موسمية)</option>
                <option value="1_year">سنة واحدة (المعيار الشائع)</option>
                <option value="2_years">سنتين (حملة ممتدة)</option>
                <option value="perpetual">حقوق دائمة غير مقيدة</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">
                النطاق الجغرافي للبث:
              </label>
              <select
                value={geoScope}
                onChange={(e) => setGeoScope(e.target.value as any)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand"
              >
                <option value="saudi">المملكة العربية السعودية فقط</option>
                <option value="gcc">دول مجلس التعاون الخليجي</option>
                <option value="mena">الشرق الأوسط وشمال أفريقيا</option>
                <option value="global">بث عالمي مفتوح</option>
              </select>
            </div>
          </div>

          {/* Add-ons Checkboxes */}
          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
            <span className="text-slate-300 font-bold block mb-2">خدمات إضافية اختيارية:</span>
            
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:border-slate-600">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasLiveSession}
                  onChange={(e) => setHasLiveSession(e.target.checked)}
                  className="rounded accent-brand"
                />
                <span className="text-slate-200">جلسة توجيه مباشر عن بُعد مع المخرج</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">+450 ر.س</span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:border-slate-600">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasRushDelivery}
                  onChange={(e) => setHasRushDelivery(e.target.checked)}
                  className="rounded accent-brand"
                />
                <span className="text-slate-200">تسليم مستعجل فائق السرعة خلال 3 ساعات</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">+350 ر.س</span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:border-slate-600">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasMusicMix}
                  onChange={(e) => setHasMusicMix(e.target.checked)}
                  className="rounded accent-brand"
                />
                <span className="text-slate-200">هندسة ومكساج الصوت مع موسيقى مرخصة</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">+280 ر.س</span>
            </label>
          </div>
        </div>

        {/* Right (5 cols): Live Quotation Breakdown */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold text-slate-400">ملخص التسعير الموصى به:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                تسعير تنافسي عادل
              </span>
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">أجر الأداء الصوتي الأساسي:</span>
                <span className="font-mono text-white font-bold">{coreSubtotal.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الخدمات الإضافية المختارة:</span>
                <span className="font-mono text-white font-bold">{addonsCost.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">رسوم الضمان والحماية:</span>
                <span className="font-mono text-emerald-400 font-bold">مغطاة بالكامل 🛡️</span>
              </div>
            </div>

            {/* Big Total Box */}
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 text-center space-y-1 mb-4">
              <span className="text-xs text-slate-400 block font-medium">إجمالي عرض السعر المقترح</span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  {totalSAR.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-brand-text">ر.س</span>
              </div>
              <span className="text-xs text-slate-400 font-mono block">
                ≈ {totalUSD.toLocaleString()} دولار
              </span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>شامل جولة تعديلات واحدة مجانية.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تسليم ملفات ماستر استوديو نقية عالية الدقة بدون ضغط.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>إمكانية الدفع المباشر عبر المنصة بالضمان البنكي.</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleCopyQuote}
              className="w-full py-3 rounded-xl text-xs font-bold bg-brand hover:bg-orange-600 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30"
            >
              {copiedQuote ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedQuote ? 'تم نسخ النص!' : 'نسخ عرض السعر لإرساله للعميل'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
