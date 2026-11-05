import React, { useState } from 'react';
import { 
  Sliders, 
  Mic2, 
  Radio, 
  ShieldCheck, 
  Award, 
  Check, 
  ExternalLink, 
  Zap, 
  Headphones, 
  Layers,
  Volume2
} from 'lucide-react';
import { TalentProfile } from '../../data/talentMockData';

interface TalentStudioSpecsSubViewProps {
  profile: TalentProfile;
}

export const TalentStudioSpecsSubView: React.FC<TalentStudioSpecsSubViewProps> = ({ profile }) => {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopySourceConnect = () => {
    navigator.clipboard.writeText(profile.equipment.sourceConnectId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-text" />
            <span>مواصفات الاستوديو المنزلي والاعتماد الهندسي</span>
          </h2>
          <p className="text-xs text-slate-400">
            شهادة كفاءة العزل الصوتي والعتاد التقني المعتمد لاستقبال جلسات الإخراج المباشرة
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>استوديو معتمد من الدرجة الأولى (Class A)</span>
        </span>
      </div>

      {/* Main Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Microphone */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-brand-text flex items-center justify-center">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">المايكروفون الرئيسي</h3>
              <span className="text-[10px] text-slate-400">Primary Broadcast Microphone</span>
            </div>
          </div>
          <p className="text-xs text-slate-200 font-semibold">
            {profile.equipment.mic}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            مايكروفون كوندنسر ذو ديافرام عريض يوفر خامة صوتية دافئة وتفاصيل فائقة النقاء لمخارج الحروف العربية.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>معاير بفلتر بوب (Pop Filter) مزدوج</span>
          </div>
        </div>

        {/* Audio Interface & DSP */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">كرت الصوت والبري آمب</h3>
              <span className="text-[10px] text-slate-400">Preamps & Converters</span>
            </div>
          </div>
          <p className="text-xs text-slate-200 font-semibold">
            {profile.equipment.interface} + {profile.equipment.preamp}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            محولات تناظرية إلى رقمية متطورة 192kHz مع معالجة DSP آنية بدون أي تأخير زمني (Zero Latency).
          </p>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-indigo-400 font-mono flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>تسجيل بـ 24-bit 48kHz Broadcast Standard</span>
          </div>
        </div>

        {/* Acoustic Booth */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">العزل والمعالجة الصوتية</h3>
              <span className="text-[10px] text-slate-400">Acoustic Treatment & Isolation</span>
            </div>
          </div>
          <p className="text-xs text-slate-200 font-semibold">
            {profile.equipment.acousticIsolation}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            كابينة مفرغة ومعالجة بألواح الصوف الصخري وفخاخ البيز لامتصاص الصدى والانعكاسات حتى 0.12s RT60.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>مستوى ضوضاء الغرفة: -64 dB (صامت تماماً)</span>
          </div>
        </div>
      </div>

      {/* Live Directing Connection Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>جلسات الإخراج والتوجيه المباشر (Live Remote Direction)</span>
            </h3>
            <p className="text-xs text-slate-400">
              اربط استوديوك مباشرة مع المخرج والعميل أثناء التسجيل بجودة البث الكاملة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
              Source-Connect ID: <strong className="text-white">{profile.equipment.sourceConnectId}</strong>
            </div>
            <button
              onClick={handleCopySourceConnect}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand hover:bg-orange-600 text-white transition-all cursor-pointer"
            >
              {copiedId ? 'تم النسخ!' : 'نسخ المعرّف'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-slate-400 block text-[10px]">البرنامج:</span>
            <strong className="text-white block mt-0.5">Source-Connect Pro</strong>
            <span className="text-emerald-400 text-[10px]">جاهز ومتصل</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-slate-400 block text-[10px]">البرنامج البديل:</span>
            <strong className="text-white block mt-0.5">Cleanfeed Pro HQ</strong>
            <span className="text-emerald-400 text-[10px]">256kbps Stereo</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-slate-400 block text-[10px]">برنامج الهندسة:</span>
            <strong className="text-white block mt-0.5">{profile.equipment.daw}</strong>
            <span className="text-indigo-400 text-[10px]">Pro Tools 2024</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-slate-400 block text-[10px]">سرعة الاتصال:</span>
            <strong className="text-white block mt-0.5">ألياف بصرية 500Mbps</strong>
            <span className="text-emerald-400 text-[10px]">Ping &lt; 5ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
