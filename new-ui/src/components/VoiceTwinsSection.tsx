import React, { useState } from 'react';
import { Copy, Sparkles, User, ArrowLeft, Check, ShieldCheck, Zap, Activity } from 'lucide-react';
import { VoiceOrb } from './VoiceOrb';

interface VoiceTwinsSectionProps {
  onCreateTwin: () => void;
}

export const VoiceTwinsSection: React.FC<VoiceTwinsSectionProps> = ({ onCreateTwin }) => {
  const [twinMode, setTwinMode] = useState<'human' | 'ai'>('human');
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="section-voice-twins" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" dir="rtl">
      <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/60 rounded-3xl p-8 sm:p-14 border border-slate-800 text-white shadow-2xl relative overflow-hidden">

        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          {/* Left Column (Text & Features) - 7 Cols */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              صوتك. لكن بذكاء اصطناعي.
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              أنشئ توأمًا صوتيًا رقميًا يحافظ على هوية صوتك ونبرتك وأسلوبك الفريد، واستخدمه لإنتاج مئات الساعات من المحتوى الإعلاني، التدريبي، والبودكاست بأمان تام ودون الحاجة للتسجيل اليدوي كل مرة.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ملكية تجارية وتشفير آمن</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  حماية كاملة للبصمة الصوتية مع توثيق قانوني وتراخيص حصرية مخصصة لمؤسستك فقط.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Activity className="w-4 h-4" />
                  <span>تطابق نبرة يصل إلى 99.4%</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  نماذج عصبية متخصصة في اللهجات العربية مع الحفاظ على التنفس الطبيعي ومخارج الحروف.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onCreateTwin}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>أنشئ توأمك الصوتي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>يتطلب 3 دقائق فقط من عينات التسجيل عالية الجودة</span>
              </span>
            </div>
          </div>

          {/* Right Column: Morphing Visual Human -> AI Voice Twin - 5 Cols */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl">

              {/* Morphing Switcher Tabs */}
              <div className="inline-flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setTwinMode('human')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    twinMode === 'human'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>التسجيل البشري الأصلي</span>
                </button>
                <button
                  onClick={() => setTwinMode('ai')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    twinMode === 'ai'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>التوأم الرقمي (Voice Twin)</span>
                </button>
              </div>

              {/* Central Morphing Voice Orb */}
              <div className="relative py-2 flex items-center justify-center">
                <VoiceOrb
                  mode={twinMode === 'human' ? 'human' : 'twins'}
                  state={isPlaying ? 'playing' : 'idle'}
                  isPlaying={isPlaying}
                  size={230}
                  onClick={() => setIsPlaying(!isPlaying)}
                />
              </div>

              {/* Status Banner */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 text-right space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {twinMode === 'human' ? 'الملف البشري المرجعي:' : 'التوليد عبر التوأم الذكي:'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    twinMode === 'human' ? 'bg-amber-500/15 text-amber-300' : 'bg-purple-500/15 text-purple-300'
                  }`}>
                    {twinMode === 'human' ? '48kHz WAV Studio' : 'AI Neural Synthesis'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {twinMode === 'human'
                    ? '"أهلاً بكم في التقرير السنوي للربع الرابع، حيث سجلت مؤشرات النمو أرقاماً استثنائية."'
                    : '"أهلاً بكم في التقرير السنوي للربع الرابع، تم توليد هذه العبارة بالكامل عبر التوأم دون تسجيل بشري."'}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
