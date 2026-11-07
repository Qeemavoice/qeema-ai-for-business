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
import { TtsStudioPanel } from '../TtsStudioPanel';
import { useNavigate } from 'react-router-dom';
import { useVoiceTemplates, openTemplateLink } from '../../lib/voiceTemplates';

interface HomeSubViewProps {
  voices: Voice[];
  generations: Generation[];
  playingId: string | null;
  onTogglePlay: (id: string, url: string) => void;
  onNavigateTab: (tab: DashboardNavKey) => void;
  onQuickGenerate: (text: string, voiceId: string) => void;
  onOpenStudioPreset?: (text: string, voiceId?: string) => void;
  canUseStudio?: boolean;
  onGenerated?: (newBalanceCredits: number) => void;
}

export const HomeSubView: React.FC<HomeSubViewProps> = ({
  voices,
  generations,
  playingId,
  onTogglePlay,
  onNavigateTab,
  onQuickGenerate,
  onOpenStudioPreset,
  canUseStudio,
  onGenerated
}) => {
  const navigate = useNavigate();
  const templates = useVoiceTemplates();
  const [promptText, setPromptText] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(voices[0]?.id || 'v-1');
  const [selectedModel, setSelectedModel] = useState('qeema-acoustic-v1');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedVoice = voices.find(v => v.id === selectedVoiceId) || voices[0];

  const quickPrompts = [
    { label: 'سرد قصة', text: 'في قلب الصحراء العربية، كانت الرمال الذهبية تروي حكاية حضارة عريقة لا تنتهي...' },
    { label: 'تسجيل إعلان ترويجي', text: 'اكتشف المعنى الحقيقي للجودة والفخامة مع تشكيلتنا الحصرية الجديدة. اطلب الآن واستمتع بخصم خاص لفترة محدودة!' },
    { label: 'رسالة رد آلي (IVR)', text: 'مرحباً بكم في مصرف الابتكار. لخدمات الحسابات والبطاقات اضغط واحد، للتمويل الشخصي اضغط اثنين...' },
    { label: 'جلسة تأملية مريحة', text: 'خذ نفساً عميقاً... استشعر السكينة والهدوء يملأ كيانك، ودع كل التوترات تتلاشى بهدوء...' }
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
      {/* 1. The same studio as the TTS page (/ar/text-to-speech); without studio access the old quick box opens the studio tab */}
      {canUseStudio ? <TtsStudioPanel voices={voices} onGenerated={onGenerated} showHistory={false} /> : (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 space-y-4">
        {/* Top Tools Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-bold text-slate-600 border-b border-slate-100">
          <button className="px-3 py-1.5 bg-brand-ink text-white rounded-xl shadow-2xs flex items-center gap-1.5 shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-brand-text" />
            <span>تحويل النص إلى صوت</span>
          </button>
          <button 
            onClick={() => onNavigateTab('studio')}
            className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>الاستوديو الاحترافي</span>
          </button>
          <button 
            onClick={() => onNavigateTab('human-bookings')}
            className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Mic2 className="w-3.5 h-3.5 text-brand-yellow" />
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
              className="px-2.5 py-1 bg-slate-50 hover:bg-brand/10 text-slate-600 hover:text-brand-text border border-slate-200/60 hover:border-brand/30 rounded-full text-xs font-semibold transition-all active:scale-95"
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
              <Zap className="w-3.5 h-3.5 text-brand-text" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent outline-hidden font-bold cursor-pointer"
              >
                <option value="qeema-acoustic-v1">استوديو قيمة الصوتي النقي</option>
              </select>
            </div>

            {/* Voice Picker Dropdown */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-800">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-brand-yellow to-brand-orange flex items-center justify-center text-[10px] text-white">
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
                ? 'bg-brand hover:bg-brand-orange text-white shadow-orange-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>توليد الصوت الآن</span>
          </button>
        </div>
      </div>
      )}

      {/* 3. Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">نماذج الإنتاج الصوتي</h3>
            <p className="text-xs text-slate-500">ابدأ بسرعة باستخدام إعدادات مسبقة مخصصة لحملتك الإعلانية أو مشروعك</p>
          </div>
          <button
            onClick={() => window.open('/ar/voice-models', '_blank', 'noopener')}
            className="text-xs font-bold text-brand-text hover:underline"
          >
            عرض كل النماذج ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.slice(0, 6).map((tmpl) => (
            <div
              key={tmpl.id}
              // The template's own link (set in the admin dashboard); the studio when it has none
              onClick={() => { if (!openTemplateLink(tmpl.link, navigate)) onNavigateTab('studio'); }}
              className="group relative rounded-2xl overflow-hidden border border-slate-200/80 hover:border-brand/50 transition-all duration-300 hover:shadow-md cursor-pointer bg-white"
            >
              <div className="h-32 relative overflow-hidden bg-brand-ink">
                {tmpl.img && (
                  <img
                    src={tmpl.img}
                    alt={tmpl.title}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/50 to-brand-ink/10" />
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {tmpl.tag}
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-text transition-colors">
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
            className="text-xs font-bold text-brand-text hover:underline"
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
              className="px-3.5 py-1.5 bg-brand text-white text-xs font-bold rounded-xl shadow-2xs"
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
                  className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 hover:border-brand/50 rounded-2xl shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onTogglePlay(gen.id, gen.audioUrl)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isPlaying
                          ? 'bg-brand text-white shadow-xs scale-95'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {(gen.textPrompt || gen.text || "").slice(0, 45)}...
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {gen.voiceName} • {gen.dialect || 'سعودي'} • {gen.durationSec || 4.2} ثواني
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
