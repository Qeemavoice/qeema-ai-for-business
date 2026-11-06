import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  Play,
  Pause,
  Download,
  ShieldCheck,
  Coins,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Users,
  UserPlus,
  Sparkles,
  Terminal,
  Zap,
  Clock,
  Calendar,
  Radio,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Building2,
  Trash2,
  FileText
} from 'lucide-react';
import { Generation, Company, User, Voice } from '../../types';

// ==========================================
// 1. Projects & Campaigns SubView
// ==========================================
interface ProjectsSubViewProps {
  projects: any[];
  onOpenNewProject: () => void;
  onNavigateToStudio: (presetText?: string) => void;
}

export const ProjectsSubView: React.FC<ProjectsSubViewProps> = ({
  projects,
  onOpenNewProject,
  onNavigateToStudio
}) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">المشاريع والحملات الصوتية</h2>
          <p className="text-xs text-slate-500">تنظيم وتنسيق سكريبتات التعليق الصوتي والإنتاج لحملاتك الإعلانية</p>
        </div>
        <button
          onClick={onOpenNewProject}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
        >
          <FolderPlus className="w-4 h-4 text-[#FF5500]" />
          <span>+ مشروع صوتي جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-[#FF5500] border border-orange-200/60">
                  {proj.dialect}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{proj.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{proj.description}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-600 font-bold">
                <span>نسبة الإنجاز</span>
                <span>{proj.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#FF5500] h-full rounded-full transition-all"
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <span>{proj.clipsCount} مقاطع صوتية • {proj.totalChars?.toLocaleString()} حرف</span>
              <button
                onClick={() => onNavigateToStudio(proj.title)}
                className="text-[#FF5500] font-bold hover:underline"
              >
                فتح في الاستوديو ←
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 2. Assets & My Audio SubView
// ==========================================
interface AssetsSubViewProps {
  generations: Generation[];
  playingId: string | null;
  onTogglePlay: (id: string, url: string) => void;
  onViewLicense: (gen: Generation) => void;
}

export const AssetsSubView: React.FC<AssetsSubViewProps> = ({
  generations,
  playingId,
  onTogglePlay,
  onViewLicense
}) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">الأصول والتسجيلات والتراخيص</h2>
          <p className="text-xs text-slate-500">سجل كامل بملفات الاستوديو المكتملة وشهادات الترخيص التجاري PDF</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {generations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-semibold">لا توجد تسجيلات بعد في مكتبة الأصول</p>
          </div>
        ) : (
          generations.map((gen) => {
            const isPlaying = playingId === gen.id;
            return (
              <div key={gen.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onTogglePlay(gen.id, gen.audioUrl)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isPlaying ? 'bg-[#FF5500] text-white shadow-xs' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <div className="min-w-0">
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 truncate">
                      {gen.text}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {gen.voiceName} • {gen.dialect || 'سعودي'} • {new Date(gen.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onViewLicense(gen)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>شهادة الترخيص</span>
                  </button>

                  <a
                    href={gen.audioUrl}
                    download={`qeema-studio-${gen.id}.wav`}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>WAV Master</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. Human Bookings SubView
// ==========================================
interface HumanBookingsSubViewProps {
  voices: Voice[];
  onBookTalent: (voice: Voice) => void;
}

export const HumanBookingsSubView: React.FC<HumanBookingsSubViewProps> = ({
  voices,
  onBookTalent
}) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">سوق المعلقين البشريين المعتمدين</h2>
          <p className="text-xs text-slate-500">إدارة حجوزات المعلقين المحترفين وجلسات التوجيه المباشر في الاستوديو</p>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#D94800]">{voices.length} معلق متاح</span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {voices.map((voice) => (
            <article key={voice.id} className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={voice.avatar} alt="" className="h-12 w-12 rounded-full object-cover bg-slate-100" />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-slate-900">{voice.name}</h3>
                  <p className="text-xs text-slate-500">{voice.dialectLabel} • {voice.styleLabel}</p>
                </div>
              </div>
              {voice.previewUrl && <audio controls preload="none" src={voice.previewUrl} className="w-full h-9" />}
              <button onClick={() => onBookTalent(voice)} className="w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-[#FF5500]">عرض الملف وطلب الحجز</button>
            </article>
          ))}
        </div>
        {voices.length === 0 && <div className="py-10 text-center text-sm text-slate-500">لا توجد أصوات بشرية منشورة حالياً.</div>}
      </div>
    </div>
  );
};

// ==========================================
// 4. Developers & API SubView
// ==========================================
export const DevelopersSubView: React.FC = () => {
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = 'غير متاح في النسخة التجريبية';

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div>
        <h2 className="text-xl font-black text-slate-900">المطورين والربط البرمجي (API & Webhooks)</h2>
        <p className="text-xs text-slate-500">دمج محرك توليد الأصوات واللهجات في تطبيقات شركتك وأنظمة الـ IVR مباشرة</p>
      </div>

      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#FF5500]" />
            <h3 className="text-sm font-bold text-slate-900">مفتاح الإنتاج الحي (Live Secret Key)</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active / 48kHz Enabled
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
          <input
            type={showLiveKey ? 'text' : 'password'}
            readOnly
            value={apiKey}
            className="w-full bg-transparent outline-hidden font-mono text-xs text-slate-800 px-2"
          />
          <button
            onClick={() => setShowLiveKey(!showLiveKey)}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"
          >
            {showLiveKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>
        </div>

        <div className="pt-2 text-xs text-slate-500">
          توثيق الـ SDK متاح لـ Node.js و Python و cURL مع دعم كامل للبث التدفقي (Streaming Audio).
        </div>
      </div>
    </div>
  );
};
