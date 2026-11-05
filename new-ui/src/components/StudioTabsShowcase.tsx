import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck, 
  Sparkles, 
  Play, 
  Pause, 
  CheckCircle2, 
  Download, 
  Share2, 
  Volume2, 
  Hash, 
  Clock, 
  SlidersHorizontal,
  ExternalLink,
  Code2,
  Lock
} from 'lucide-react';
import { VOICE_ARTISTS, DEFAULT_AUDIT_REPORT } from '../data/mockData';
import { audioSynth } from '../utils/audioSynthesizer';
import { ActiveView } from '../types';

interface StudioTabsShowcaseProps {
  onNavigate: (view: ActiveView) => void;
}

export const StudioTabsShowcase: React.FC<StudioTabsShowcaseProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'passport' | 'audit' | 'studio'>('passport');
  const [playingPassport, setPlayingPassport] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const mainArtist = VOICE_ARTISTS[0]; // طارق الشمري QV-1042

  const togglePassportAudio = () => {
    if (playingPassport) {
      audioSynth.stopAll();
      setPlayingPassport(false);
    } else {
      setPlayingPassport(true);
      audioSynth.speakText(mainArtist.sampleQuote, 1, 1, () => {
        setPlayingPassport(false);
      });
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(DEFAULT_AUDIT_REPORT.verificationHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <section className="py-14 bg-[#140F0A] text-white relative overflow-hidden rounded-3xl mx-4 sm:mx-8 my-8 border border-brand/20 shadow-2xl">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-brand/20 border border-brand/30 px-3.5 py-1 rounded-full text-xs font-bold text-brand-yellow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ثلاث خدمات AI ثورية متكاملة</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            جواز الصوت الرقمي، تدقيق الصوت، واستوديو التوليد الفوري
          </h2>

          <p className="text-sm sm:text-base text-amber-100/70 leading-relaxed">
            لأول مرة في العالم العربي: نظام بيئي متكامل يضمن لك ترخيص الصوت قانونياً، فحص دقته اللغوية، وتوليده في ثوانٍ معدودة.
          </p>
        </div>

        {/* 3 Main Tabs Switcher */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto p-1.5 rounded-2xl bg-[#20160F] border border-orange-500/20">
          <button
            id="tab-showcase-passport"
            onClick={() => setActiveTab('passport')}
            className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'passport'
                ? 'bg-gradient-to-r from-brand-yellow to-brand-orange text-white shadow-lg'
                : 'text-amber-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>جواز الصوت الرقمي</span>
          </button>

          <button
            id="tab-showcase-audit"
            onClick={() => setActiveTab('audit')}
            className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-brand-yellow to-brand-orange text-white shadow-lg'
                : 'text-amber-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>تدقيق الصوت (Audit)</span>
          </button>

          <button
            id="tab-showcase-studio"
            onClick={() => setActiveTab('studio')}
            className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-brand-yellow to-brand-orange text-white shadow-lg'
                : 'text-amber-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>استوديو الأصوات الفوري</span>
          </button>
        </div>

        {/* Tab 1: Voice Passport (جواز الصوت QV-1042) */}
        {activeTab === 'passport' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* The Passport Card Mockup */}
            <div className="lg:col-span-7 bg-[#1A120B] rounded-2xl border-2 border-brand/40 p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/15 rounded-full blur-2xl pointer-events-none" />
              
              {/* Passport Header */}
              <div className="flex items-center justify-between border-b border-orange-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-black">
                    QV
                  </div>
                  <div>
                    <div className="text-xs font-bold text-brand-yellow uppercase tracking-wider">
                      جواز الصوت الرقمي المعتمد
                    </div>
                    <div className="text-sm font-extrabold text-white">
                      VOICE PASSPORT • {mainArtist.code}
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>معلق موثق 100%</span>
                </div>
              </div>

              {/* Artist Details & Photo */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative">
                  <img
                    src={mainArtist.avatar}
                    alt={mainArtist.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-orange-500/50 shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1 border-2 border-[#1A120B]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-right">
                  <h3 className="text-xl font-extrabold text-white">{mainArtist.name}</h3>
                  <p className="text-xs text-brand-yellow font-medium">{mainArtist.role}</p>
                  <p className="text-xs text-amber-100/70 leading-relaxed">{mainArtist.bio}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px]">
                    <span className="bg-white/10 text-amber-200 px-2.5 py-0.5 rounded-md font-mono">
                      المنطقة: {mainArtist.region}
                    </span>
                    <span className="bg-white/10 text-amber-200 px-2.5 py-0.5 rounded-md font-mono">
                      التردد: {mainArtist.sampleFrequency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Hash & Verification Bar */}
              <div className="bg-[#120B06] rounded-xl p-3 border border-orange-500/20 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-amber-300/80">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-brand-text" />
                    <span>البصمة المشفرة في شبكة التوثيق:</span>
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="text-[11px] text-brand-yellow hover:underline cursor-pointer"
                  >
                    {copiedHash ? 'تم النسخ!' : 'نسخ الهاش'}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-300 break-all bg-black/40 p-2 rounded border border-white/5">
                  {DEFAULT_AUDIT_REPORT.verificationHash}
                </div>
              </div>

              {/* Play Audio Sample inside Passport */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-amber-200/60">
                  عقد الترخيص: <strong className="text-white">QV-LEGAL-2026-SA</strong>
                </div>

                <button
                  onClick={togglePassportAudio}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {playingPassport ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{playingPassport ? 'إيقاف الاستماع' : 'استمع لصوت الجواز'}</span>
                </button>
              </div>
            </div>

            {/* Passport Side Benefits */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-text uppercase tracking-wider">
                  لماذا جواز الصوت الرقمي؟
                </span>
                <h3 className="text-2xl font-bold text-white">حماية قانونية وشفافية مطلقة</h3>
                <p className="text-xs text-amber-100/70 leading-relaxed">
                  في عصر تزايدت فيه مشاكل التزييف الصوتي وحقوق الملكية الفكرية، يمنحك جواز الصوت QV وثيقة دامغة بأن الصوت المستخدم موافق عليه، مرخص، وله مصدر بشري معلوم.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-lg bg-brand/20 text-brand-yellow shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">عقود ترخيص صريحة</h4>
                    <p className="text-xs text-amber-100/60 mt-0.5">
                      كل معلق صوتي مسجل يوقع عقداً رقمياً واضحاً يحدد استخدامات نماذج الذكاء الاصطناعي ويضمن عائده المالي العادل.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">ختم شارة "معلق موثق"</h4>
                    <p className="text-xs text-amber-100/60 mt-0.5">
                      يُمنح المقطع المنتج شارة تحقق يمكن للعميل وضعها في إعلانه لتأكيد الاستخدام الأخلاقي والمصرح.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('branded-voice')}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2"
              >
                <span>طلب تدقيق أو تسجيل صوت لجواز QV</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Voice Audit Report (تدقيق الصوت) */}
        {activeTab === 'audit' && (
          <div className="bg-[#1A120B] rounded-2xl border border-orange-500/30 p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase">نظام التدقيق اللغوي والصوتي الآلي</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  تقرير تدقيق الصوت: {mainArtist.name} ({mainArtist.code})
                </h3>
                <p className="text-xs text-amber-100/60 mt-1">تاريخ الفحص: {DEFAULT_AUDIT_REPORT.date} • الجودة: 48kHz FLAC</p>
              </div>

              <div className="text-center bg-[#120B06] px-5 py-3 rounded-xl border border-orange-500/30">
                <div className="text-2xl font-black text-brand-text">{DEFAULT_AUDIT_REPORT.overallScore}%</div>
                <div className="text-[10px] text-amber-200 uppercase font-bold">التقييم العام للمعيار الصوتي</div>
              </div>
            </div>

            {/* 3 Metric Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">دقة اللهجة ومخارج الحروف</span>
                  <span className="font-mono text-brand-yellow font-bold">{DEFAULT_AUDIT_REPORT.dialectAccuracy}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-yellow to-emerald-500 rounded-full" style={{ width: `${DEFAULT_AUDIT_REPORT.dialectAccuracy}%` }} />
                </div>
                <p className="text-[11px] text-amber-100/60 leading-normal">
                  فحص صوتي متقدم لحروف الضاد، القاف، والتشكيل النحوي بدون أي أخطاء لسانية.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">الوضوح والنقاء الصوتي (SNR)</span>
                  <span className="font-mono text-emerald-400 font-bold">{DEFAULT_AUDIT_REPORT.acousticClarity}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${DEFAULT_AUDIT_REPORT.acousticClarity}%` }} />
                </div>
                <p className="text-[11px] text-amber-100/60 leading-normal">
                  معالجة صدى الاستوديو والضوضاء المعزولة لإنتاج صوت خالٍ تماماً من التشويش.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">مطابقة النبرة والعاطفة</span>
                  <span className="font-mono text-amber-400 font-bold">{DEFAULT_AUDIT_REPORT.emotionalMatch}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${DEFAULT_AUDIT_REPORT.emotionalMatch}%` }} />
                </div>
                <p className="text-[11px] text-amber-100/60 leading-normal">
                  تطابق نبرة الصوت المصرفية والوقار المطلوب للإعلانات الوطنية والشركات.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-amber-100/70">
              <span>تم الفحص بواسطة: <strong>Qeema Acoustic Neural Engine v3.2</strong></span>
              <button
                onClick={togglePassportAudio}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-brand-text" />
                <span>استمع للمقطع الخاضع للتدقيق</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Instant Studio (محاكاة الاستوديو الداكنة بأيقونات SVG راقية) */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            
            {/* Stat Row: 79% / 100% / 1,000+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1A120B] p-5 rounded-2xl border border-orange-500/20 text-center space-y-1">
                <div className="text-3xl font-black text-brand-text">79%</div>
                <div className="text-sm font-bold text-white">توفير في تكاليف الإنتاج الصوتي</div>
                <div className="text-xs text-amber-100/60">مقارنة بالحجز التقليدي المتكرر مع كل تعديل سكريبت</div>
              </div>

              <div className="bg-[#1A120B] p-5 rounded-2xl border border-orange-500/20 text-center space-y-1">
                <div className="text-3xl font-black text-emerald-400">100%</div>
                <div className="text-sm font-bold text-white">امتثال وتراخيص قانونية موثقة</div>
                <div className="text-xs text-amber-100/60">عقود رسمية تضمن حماية علامتك التجارية وحقوق الفنان</div>
              </div>

              <div className="bg-[#1A120B] p-5 rounded-2xl border border-orange-500/20 text-center space-y-1">
                <div className="text-3xl font-black text-amber-400">1,000+</div>
                <div className="text-sm font-bold text-white">معلق صوتي عربي تحت تصرفك</div>
                <div className="text-xs text-amber-100/60">من كافة اللهجات العربية مع خامات استوديو 48kHz</div>
              </div>
            </div>

            {/* Dark Browser Mockup Frame */}
            <div className="bg-[#0C0805] rounded-2xl border border-orange-500/30 overflow-hidden shadow-2xl">
              {/* Browser bar */}
              <div className="bg-[#1E130B] px-4 py-3 flex items-center justify-between border-b border-orange-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-amber-200/50 mr-3 font-mono">qeemavoice.com/instant-voices</span>
                </div>
                <span className="text-xs font-bold text-brand-yellow">استوديو الأصوات الفوري المطور</span>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">محرر التوليد الصوتي السريع</span>
                    <span className="text-xs text-brand-text font-mono">النموذج: QV-Arabic-Expressive-2026</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#160E08] border border-orange-500/20 text-sm text-slate-200 leading-relaxed font-sans">
                    «مع قيمة فويس، لا تساوم على جودة اللهجة العربية. كل جملة تخرج بمخارج حروف دقيقة، نبرة مشحونة بالعاطفة، وجاهزية فورية للنشر في منصاتك الرقمية.»
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onNavigate('instant-studio')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-yellow to-brand-orange hover:from-brand-orange text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>فتح الاستوديو الكامل مع سلايدرات التحكم</span>
                    </button>

                    <button
                      onClick={() => audioSynth.speakText('مع قيمة فويس، لا تساوم على جودة اللهجة العربية.')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition flex items-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-brand-yellow" />
                      <span>معاينة صوتية سريعة</span>
                    </button>
                  </div>
                </div>

                {/* Side cards */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">مصدر بشري موثق</span>
                    <h5 className="text-xs font-bold text-white">تراخيص متوافقة عالمياً</h5>
                    <p className="text-[11px] text-amber-100/60 leading-relaxed">
                      نضمن حقوق الطبع والنشر للاستخدام التجاري على يوتيوب، تيك توك، والتلفزيون.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-brand-yellow/20 to-transparent border border-brand/30 space-y-2">
                    <h5 className="text-xs font-bold text-[#FED7AA]">جاهز لبناء صوتك الآن؟</h5>
                    <p className="text-[11px] text-amber-100/70">
                      ابدأ مجاناً بدون بطاقة بنكية واستكشف أصوات 1,000+ معلق حقيقي.
                    </p>
                    <button
                      onClick={() => onNavigate('instant-studio')}
                      className="text-xs font-bold text-brand-text hover:underline block"
                    >
                      الانتقال للاستوديو الفوري ←
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
