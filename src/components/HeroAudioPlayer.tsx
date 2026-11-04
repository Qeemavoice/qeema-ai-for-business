import React from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, User, RefreshCw } from 'lucide-react';
import { OrbMode } from './VoiceOrb';

interface HeroAudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  voiceName: string;
  dialect: string;
  gender: string;
  category: string;
  mode: OrbMode;
  currentTime: number;
  duration: number;
  onSeek?: (percentage: number) => void;
  onSwitchSample?: () => void;
}

export const HeroAudioPlayer: React.FC<HeroAudioPlayerProps> = ({
  isPlaying,
  onTogglePlay,
  voiceName,
  dialect,
  gender,
  category,
  mode,
  currentTime,
  duration,
  onSeek,
  onSwitchSample
}) => {
  const [isMuted, setIsMuted] = React.useState(false);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(pct);
  };

  return (
    <div 
      className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 shadow-xl shadow-slate-900/5 transition-all duration-300 hover:border-slate-300"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Play / Pause Primary Button */}
        <button
          onClick={onTogglePlay}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
            isPlaying
              ? 'bg-brand-ink text-white shadow-slate-950/25 scale-95'
              : 'bg-gradient-to-tr from-brand-yellow to-amber-500 text-white shadow-brand/20 hover:scale-105'
          }`}
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل العينة'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Voice Info */}
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 truncate">{voiceName}</h4>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {mode === 'human' ? <User className="w-3 h-3 text-amber-600" /> : <Sparkles className="w-3 h-3 text-blue-600" />}
              <span>{category}</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            {dialect} • {gender === 'female' ? 'صوت أنثوي' : 'صوت رجالي'} • جودة استوديو
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onSwitchSample && (
            <button
              onClick={onSwitchSample}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="تجربة صوت آخر"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress & Waveform Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-400 w-8 text-left">{formatTime(currentTime)}</span>
        <div
          onClick={handleBarClick}
          className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer relative group/bar"
        >
          {/* Waveform track ticks */}
          <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none opacity-40">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="w-0.5 bg-slate-300 rounded-full"
                style={{ height: `${Math.sin(i * 0.4) * 40 + 50}%` }}
              />
            ))}
          </div>
          {/* Active progress fill */}
          <div
            className="h-full bg-gradient-to-l from-brand-yellow to-amber-500 rounded-full transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{formatTime(duration)}</span>
      </div>
    </div>
  );
};
