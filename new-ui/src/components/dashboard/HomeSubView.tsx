import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Volume2,
  Video,
  Music2,
  Mic2,
  Layers,
  FileText,
  Radio,
  Zap,
  Check,
  ChevronDown,
  ExternalLink,
  Clock,
  Coins
} from 'lucide-react';
import { Voice, Generation } from '../../types';
import { GlassyVoiceOrb } from '../GlassyVoiceOrb';
import { DashboardNavKey } from './DashboardSidebar';

interface HomeSubViewProps {
  voices: Voice[];
  generations: Generation[];
  playingId: string | null;
  onTogglePlay: (id: string, url: string) => void;
  onNavigateTab: (tab: DashboardNavKey) => void;
  onQuickGenerate: (text: string, voiceId: string) => void;
  onOpenStudioPreset?: (text: string, voiceId?: string) => void;
}

export const HomeSubView: React.FC<HomeSubViewProps> = ({
  voices,
  generations,
  playingId,
  onTogglePlay,
  onNavigateTab,
  onQuickGenerate,
  onOpenStudioPreset
}) => {
  const [promptText, setPromptText] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(voices[0]?.id || 'v-1');
  const [selectedModel, setSelectedModel] = useState('qeema-multilingual-v2');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedVoice = voices.find(v => v.id === selectedVoiceId) || voices[0];

  const quickPrompts = [
    { label: 'سرد قصة', text: 'في قلب الصحراء العربية، كانت الرمال الذهبية تروي حكاية حضارة عريقة لا تنتهي...' },
    { label: 'تسجيل إعلان ترويجي', text: 'اكتشف المعنى الحقيقي للجودة والفخامة مع تشكيلتنا الحصرية الجديدة. اطلب الآن واستمتع بخصم خاص لفترة محدودة!' },
    { label: 'رسالة رد آلي (IVR)', text: 'مرحباً بكم في مصرف الابتكار. لخدمات الحسابات والبطاقات اضغط واحد، للتمويل الشخصي اضغط اثنين...' },
    { label: 'جلسة تأملية مريحة', text: 'خذ نفساً عميقاً... استشعر السكينة والهدوء يملأ كيانك، ودع كل التوترات تتلاشى بهدوء...' }
  ];

  const templates = [
    {
      id: 'tmpl-ugc',
      title: 'صناعة محتوى UGC',
      desc: 'أصوات طبيعية حيوية لمقاطع التيك توك وسناب شات وريلز',
      tag: 'سوشيال ميديا',
      gradient: 'from-purple-900/90 via-slate-900 to-black',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'tmpl-explainer',
      title: 'فيديو شارح وموشن جرافيك',
      desc: 'نبرة واضحة ومقنعة لشرح المنتجات والحلول التقنية',
      tag: 'شركات',
      gradient: 'from-blue-900/90 via-slate-900 to-black',
      img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'tmpl-ad',
      title: 'إعلان إذاعي وتلفزيوني',
      desc: 'أداء درامي وقور وحماسي للحملات الإعلانية الكبرى',
      tag: 'إعلانات',
      gradient: 'from-amber-900/90 via-slate-900 to-black',
      img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'tmpl-ivr',
      title: 'الرد الصوتي التفاعلي (IVR)',
      desc: 'توجيه محترف للعملاء بدقة مخارج الحروف والترحيب',
      tag: 'خدمة عملاء',
      gradient: 'from-emerald-900/90 via-slate-900 to-black',
      img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'tmpl-compare',
      title: 'مقارنة أداء اللهجات',
      desc: 'اختبر نفس النص بلهجات سعودية ومصرية وشامية فوراً',
      tag: 'مقارنة',
      gradient: 'from-orange-900/90 via-slate-900 to-black',
      img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'tmpl-podcast',
      title: 'افتتاحيات البودكاست',
      desc: 'سرد صوتي عميق مع موسيقى تصويرية فخمة',
      tag: 'بودكاست',
      gradient: 'from-rose-900/90 via-slate-900 to-black',
      img: 'https://images.unsplash.com/photo-1589903102059-7f94b806d203?w=500&auto=format&fit=crop&q=80'
    }
  ];

  const handleGenerate = () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    if (onOpenStudioPreset) {
      onOpenStudioPreset(promptText.trim(), selectedVoiceId);
    } else {
      onQuickGenerate(promptText.trim(), selectedVoiceId);
    }
    setTimeout(() => setIsGenerating(false), 800);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* 1. ElevenLabs-Style Quick Prompt Generator Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 space-y-4">
        {/* Top Tools Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-bold text-slate-600 border-b border-slate-100">
          <button className="px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-2xs flex items-center gap-1.5 shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>تحويل النص لصوت (Speech)</span>
          </button>
          <button
            onClick={() => onNavigateTab('studio')}
            className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>الاستوديو الاحترافي</span>
          </button>
          <button
            onClick={() => onNavigateTab('voice-twins')}
            className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>التوأم الصوتي</span>
          </button>
          <button
            onClick={() => onNavigateTab('human-bookings')}
            className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Mic2 className="w-3.5 h-3.5 text-amber-500" />
            <span>المعلقين البشريين</span>
          </button>
        </div>

        {/* Big Clean Prompt Textarea */}
        <div className="relative">
          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="ابدأ بكتابة أو لصق النص العربي الذي ترغب في تحويله إلى صوت فائق الدقة والواقعية..."
            className="w-full bg-transparent resize-none outline-hidden text-sm md:text-base text-slate-900 placeholder:text-slate-400 leading-relaxed font-medium"
          />
        </div>

        {/* Quick Inspiration Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-400">إلهام سريع:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPromptText(qp.text)}
              className="px-2.5 py-1 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-[#FF5500] border border-slate-200/60 hover:border-orange-200 rounded-full text-xs font-semibold transition-all active:scale-95"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Bottom Control Bar (Model, Voice, Generate) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Model Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-700">
              <Zap className="w-3.5 h-3.5 text-[#FF5500]" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent outline-hidden font-bold cursor-pointer"
              >
                <option value="qeema-multilingual-v2">Qeema Multilingual v2</option>
                <option value="qeema-neural-v3">Qeema Neural HD v3 (أعلى جودة)</option>
                <option value="qeema-acoustic-v1">Qeema Acoustic Studio</option>
              </select>
            </div>

            {/* Voice Picker Dropdown */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-800">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#FF5500] to-amber-400 flex items-center justify-center text-[10px] text-white">
                🎙
              </div>
              <select
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
                className="bg-transparent outline-hidden font-bold cursor-pointer"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.dialectLabel})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onNavigateTab('studio')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors px-2 py-1"
            >
              المزيد من خيارات الاستوديو ←
            </button>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!promptText.trim() || isGenerating}
            className={`px-5 py-2.5 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 ${
              promptText.trim() && !isGenerating
                ? 'bg-[#FF5500] hover:bg-[#e04b00] text-white shadow-orange-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>توليد الصوت الآن (Generate)</span>
          </button>
        </div>
      </div>

      {/* 2. Promo / Feature Banner (Qeema v3) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950 p-6 text-white border border-white/10 shadow-lg flex items-center justify-between gap-6 flex-wrap">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-[#FF5500] border border-orange-500/30 text-[11px] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>الجيل الثالث الجديد للذكاء الصوتي</span>
          </div>
          <h3 className="text-lg md:text-xl font-black tracking-tight">
            نموذج Qeema Neural HD v3 فائق الواقعية
          </h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            تحكم كامل في نبرة الصوت، سرعة التحدث، مطابقة اللهجات المحلية الدقيقة، وتوليد نصوص بلا أخطاء تشكيلية بنقاء 48kHz Studio Master.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('studio')}
            className="px-4 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            تجربة v3 في الاستوديو
          </button>
          <button
            onClick={() => onNavigateTab('voices')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs border border-white/15 transition-all"
          >
            استعراض الأصوات
          </button>
        </div>
      </div>

      {/* 3. Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">قوالب الإنتاج الصوتي الجاهزة</h3>
            <p className="text-xs text-slate-500">ابدأ بسرعة باستخدام إعدادات مسبقة مخصصة لحملتك الإعلانية أو مشروعك</p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs font-bold text-[#FF5500] hover:underline"
          >
            عرض كافة القوالب والمشاريع ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => onNavigateTab('studio')}
              className="group relative rounded-2xl overflow-hidden border border-slate-200/80 hover:border-orange-300 transition-all duration-300 hover:shadow-md cursor-pointer bg-white"
            >
              <div className="h-32 relative overflow-hidden">
                <img
                  src={tmpl.img}
                  alt={tmpl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${tmpl.gradient} opacity-80`} />
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {tmpl.tag}
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#FF5500] transition-colors">
                  {tmpl.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tmpl.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-base font-black text-slate-900">التسجيلات والتوليدات الأخيرة</h3>
          </div>
          <button
            onClick={() => onNavigateTab('assets')}
            className="text-xs font-bold text-[#FF5500] hover:underline"
          >
            سجل كافة الملفات والتراخيص ←
          </button>
        </div>

        {generations.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
            <Volume2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">لم يتم توليد أي تسجيلات بعد في مساحة العمل هذه</p>
            <button
              onClick={() => onNavigateTab('studio')}
              className="px-3.5 py-1.5 bg-[#FF5500] text-white text-xs font-bold rounded-xl shadow-2xs"
            >
              ابدأ التوليد الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {generations.slice(0, 4).map((gen) => {
              const isPlaying = playingId === gen.id;
              return (
                <div
                  key={gen.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 hover:border-orange-300 rounded-2xl shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onTogglePlay(gen.id, gen.audioUrl)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isPlaying
                          ? 'bg-[#FF5500] text-white shadow-xs scale-95'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {gen.text.slice(0, 45)}...
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {gen.voiceName} • {gen.dialect || 'سعودي'} • {gen.durationSeconds || 4.2} ثواني
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                    مرخص 100%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
