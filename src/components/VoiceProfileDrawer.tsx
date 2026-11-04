import React from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Star, 
  ShieldCheck, 
  Check, 
  Clock, 
  Globe2, 
  Mic2, 
  Sparkles, 
  FileAudio, 
  Calendar, 
  Coins, 
  ExternalLink,
  Layers,
  Building2,
  Volume2,
  Users,
  Briefcase
} from 'lucide-react';
import { UnifiedVoiceItem, RetentionNoticeIcon } from './VoiceLibraryView';

interface VoiceProfileDrawerProps {
  voice: UnifiedVoiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: (voice: UnifiedVoiceItem) => void;
  onBookVoice: (voice: UnifiedVoiceItem) => void;
  onUseForGeneration: (voice: UnifiedVoiceItem) => void;
  isSaved: boolean;
  onToggleSave: (voiceId: string) => void;
}

export const VoiceProfileDrawer: React.FC<VoiceProfileDrawerProps> = ({
  voice,
  isOpen,
  onClose,
  isPlaying,
  onTogglePlay,
  onBookVoice,
  onUseForGeneration,
  isSaved,
  onToggleSave
}) => {
  if (!isOpen || !voice) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity" dir="rtl">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-r border-slate-200 animate-in slide-in-from-right duration-300"
      >
        
        {/* Top Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/20"
                style={{ background: voice.glassGradient }}
              >
                {voice.isHuman ? (
                  <Mic2 className="w-6 h-6 text-white" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">{voice.name}</h3>
                  {voice.isVerified && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{voice.isHuman ? 'معلق معتمد' : 'نموذج مرخص'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {voice.language} • {voice.accent} {voice.flag}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleSave(voice.id)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isSaved ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isSaved ? 'محفوظ في المفضلة' : 'حفظ في المفضلة'}
              >
                <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6 text-xs text-slate-700">
            
            {/* Audio Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-brand-text" />
                  <span>عينة الاستماع المعتمدة (48kHz)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  WAV Studio
                </span>
              </div>

              {voice.quote && (
                <p className="text-[12px] italic text-slate-800 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed font-serif">
                  "{voice.quote}"
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => onTogglePlay(voice)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>إيقاف المؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white mr-0.5" />
                      <span>استماع للعينة الكاملة</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] text-slate-500">
                  استمع للأداء الحقيقي ومخارج الحروف
                </span>
              </div>
            </div>

            {/* Description / Bio */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">نبذة عن الصوت والأداء</h4>
              <p className="text-slate-600 leading-relaxed text-[12px] bg-white p-3 rounded-xl border border-slate-100">
                {voice.subtitle}
              </p>
            </div>

            {/* Trust & Quality Indicators */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2.5">بيانات الاعتماد والترخيص</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>سجل الموثوقية</span>
                  </div>
                  <p className="text-[11px] text-emerald-950 font-medium">
                    {voice.isHuman 
                      ? `موثوق ومعتمد منذ ${voice.trustYears || '6 سنوات'}`
                      : 'مرخص ومحمي قانونياً (2y)'}
                  </p>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl">
                  <div className="flex items-center gap-1.5 text-blue-800 font-bold mb-1">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>حقوق الاستخدام</span>
                  </div>
                  <p className="text-[11px] text-blue-950 font-medium">
                    {voice.license || 'ترخيص تجاري كامل'}
                  </p>
                </div>

                {voice.isHuman ? (
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
                      <Sparkles className="w-4 h-4 text-brand-text" />
                      <span>جاهزية الاستوديو</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      استوديو احترافي معتمد 48kHz
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span>سرعة التوليد</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      توليد فوري بالذكاء الاصطناعي
                    </p>
                  </div>
                )}

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>{voice.isHuman ? 'عملاء وثقوا بالصوت' : 'مستخدمو النموذج'}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 font-mono">
                    {voice.usageCount || '48.2K'} {voice.isHuman ? 'عميل وشركة' : 'استخدام'}
                  </p>
                </div>

                {voice.isHuman && (
                  <div className="p-3 bg-orange-50/80 border border-orange-200/80 rounded-xl">
                    <div className="flex items-center gap-1.5 text-orange-950 font-bold mb-1">
                      <Briefcase className="w-4 h-4 text-brand-text" />
                      <span>حجوزات الاستوديو المكتملة</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-900 font-mono">
                      {voice.bookingsCount || 142} <span className="font-sans font-normal text-slate-600">مشروع تم تنفيذه</span>
                    </p>
                  </div>
                )}

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
                    <Coins className="w-4 h-4 text-slate-600" />
                    <span>التسعير التجاري</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-900">
                    {voice.isHuman ? 'تسعير مخصص حسب المشروع' : (voice.pricing || '1 نقطة / حرف (TTS)')}
                  </p>
                </div>

                {!voice.isHuman && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl col-span-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                      <RetentionNoticeIcon className="w-4 h-4 text-amber-600" />
                      <span>سياسة الحفظ والإتاحة (سنتين 2y)</span>
                    </div>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      إذا قام صاحب هذا الصوت بحذفه من مكتبة الأصوات، فلن يكون متاحاً لك بعد سنتين ({voice.trustYears || '2y'}).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Use-cases / Tags */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">أبرز الاستخدامات ومجالات الأداء</h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px]">
                  {voice.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px]">
                  {voice.accent}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px]">
                  استوديوهات معتمدة 48kHz
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px]">
                  حملات تسويقية وإعلانات
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-5 border-t border-slate-200 bg-white sticky bottom-0 flex items-center justify-between gap-3 shadow-lg">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">التكلفة والبدء</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              {voice.pricing || 'يبدأ من 45$ / دقيقة'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {voice.isHuman ? (
              <button
                onClick={() => {
                  onClose();
                  onBookVoice(voice);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Mic2 className="w-4 h-4 text-brand-text" />
                <span>احجز الصوت للمشروع</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onUseForGeneration(voice);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-brand-text" />
                <span>استخدم في استوديو التوليد</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
