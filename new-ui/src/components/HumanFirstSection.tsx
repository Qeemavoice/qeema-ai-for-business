import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  Play,
  Pause,
  Check,
  X,
  AlertCircle,
  HeartHandshake,
  Mic,
  Globe,
  ShieldAlert,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { DIALECT_STATS } from '../data/mockData';
import { audioSynth } from '../utils/audioSynthesizer';
import { DialectKey } from '../types';

interface HumanFirstSectionProps {
  onOpenChangelog?: () => void;
}

export const HumanFirstSection: React.FC<HumanFirstSectionProps> = ({ onOpenChangelog }) => {
  const [playingDialectKey, setPlayingDialectKey] = useState<DialectKey | null>(null);

  const handlePlayDialect = (key: DialectKey, text: string) => {
    if (playingDialectKey === key) {
      audioSynth.stopAll();
      setPlayingDialectKey(null);
      return;
    }
    setPlayingDialectKey(key);
    audioSynth.speakText(text, 1, 1, () => {
      setPlayingDialectKey(null);
    });
  };

  return (
    <section className="py-16 bg-[#160F09] text-white relative overflow-hidden">
      {/* Warm ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FF5500]/20 border border-[#FF5500]/30 px-3.5 py-1 rounded-full text-xs font-bold text-[#FF7A29]">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>مبدأنا الأساسي: الإنسان أولاً، والذكاء الاصطناعي أداة</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            عمق لهجوي حقيقي من أهل كل لهجة
          </h2>

          <p className="text-sm sm:text-base text-amber-100/70 leading-relaxed">
            الذكاء الاصطناعي العام يفشل دائماً في اللهجات العربية لأنه يحاول "تقريب" اللهجة برمجياً.
            في قيمة فويس، نبني أصواتنا من 1,000+ فنان حقيقي وُلد ونشأ في بيئة اللهجة.
          </p>
        </div>

        {/* 3 Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 1. Generic AI */}
          <div className="bg-[#1F150E] rounded-2xl p-6 border border-red-500/20 space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>منصات AI العامة (مثل ElevenLabs)</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-200">صوت آلي هجين مسحوب عشوائياً</h3>

            <ul className="text-xs text-slate-400 space-y-3">
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>بيانات تدريب مجهولة المصدر مسحوبة من الإنترنت بدون موافقة صريحة.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>لهجة ممسوخة تمزج مفردات خليجية بنبرة شامية أو مصرية مشوهة.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>مخاطر قانونية على العلامات التجارية في حال مقاضاة أصحاب الأصوات الأصلية.</span>
              </li>
            </ul>
          </div>

          {/* 2. Qeema Voice (Featured & Highlighted) */}
          <div className="bg-gradient-to-b from-[#2B170B] to-[#1C1007] rounded-2xl p-6 border-2 border-[#FF5500] space-y-4 relative shadow-2xl scale-[1.02]">
            <div className="absolute -top-3.5 right-6 bg-[#FF5500] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md">
              الخيار الأمثل والمتوازن
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF7A29] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
                <span>قيمة فويس: هندسة الذكاء الصوتي الأخلاقي</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">صوت AI نقي بأصل بشري موثق</h3>

            <ul className="text-xs text-amber-100/90 space-y-3">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5 font-bold" />
                <span>أصوات مستنسخة بموافقة وتعاقد رسمي يحفظ حقوق الفنانين ويمنحهم عوائدهم.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5 font-bold" />
                <span>مخارج حروف عربية أصيلة مطابقة 100% لنطق أهل الرياض، القاهرة، دمشق، والرباط.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5 font-bold" />
                <span>جواز الصوت QV + تدقيق صوتي آلي يضمن جاهزية النشر التجاري الفوري.</span>
              </li>
            </ul>
          </div>

          {/* 3. Direct Human Booking */}
          <div className="bg-[#1F150E] rounded-2xl p-6 border border-emerald-500/20 space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-4 h-4" />
                <span>سوق التعليق البشري المباشر (1,000+)</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-200">تسجيل استوديو حي مع الفنان</h3>

            <ul className="text-xs text-slate-400 space-y-3">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>تفاعل إنساني فوري، توجيه مباشر أثناء جلسة التسجيل الحي في الاستوديو.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>الأفضل للحملات الإعلانية التلفزيونية الكبرى، الأفلام الوثائقية، والأعمال الدرامية.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>متاح في نفس المنصة بحجز مباشر دون الحاجة للانتقال لموقع آخر.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Dialect Distribution Cards */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-white">خريطة توزيع المعلقين حسب اللهجات</h3>
              <p className="text-xs text-amber-200/60">استمع لعينات حية وتعرف على مجالات القوة لكل لهجة</p>
            </div>

            {onOpenChangelog && (
              <button
                onClick={onOpenChangelog}
                className="text-xs font-medium text-[#FF7A29] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>ملاحظة: أرقام التوزيع تقديرية بانتظار التأكيد (اضغط للمراجعة)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIALECT_STATS.map(dialect => (
              <div
                key={dialect.key}
                className="bg-[#1C130C] rounded-xl p-5 border border-orange-500/20 hover:border-orange-500/40 transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{dialect.name}</h4>
                    <p className="text-[11px] text-amber-200/60 mt-0.5">{dialect.region}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#FF5500]">{dialect.estimatedCount}+</span>
                    <div className="text-[9px] text-amber-300/60">معلق صوتي</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-amber-100/70">
                  {dialect.characteristics.map((char, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                      <span>{char}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => handlePlayDialect(dialect.key, dialect.sampleAudioText)}
                    className="flex items-center gap-2 text-xs font-bold text-[#FF7A29] hover:text-white transition cursor-pointer"
                  >
                    {playingDialectKey === dialect.key ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>إيقاف العينة</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-[#FF7A29]" />
                        <span>استمع للهجة</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] bg-white/10 text-amber-200 px-2 py-0.5 rounded font-mono">
                    48kHz Studio
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
