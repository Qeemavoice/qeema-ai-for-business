import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ExternalLink, Sparkles, UserCheck, Volume2 } from 'lucide-react';
import { Voice } from '../../types';
import { GlassyVoiceOrb } from '../GlassyVoiceOrb';
import { analytics } from '../../services/analyticsService';

interface VoiceCardItemProps {
  voice: Voice;
  isPlaying: boolean;
  onTogglePlay: (voiceId: string) => void;
  onSelectVoice?: (voice: Voice) => void;
  lang?: 'ar' | 'en';
}

export const VoiceCardItem: React.FC<VoiceCardItemProps> = ({
  voice,
  isPlaying,
  onTogglePlay,
  onSelectVoice,
  lang = 'ar'
}) => {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 3));
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    analytics.track('voice_preview_played', { voiceId: voice.id, voiceName: voice.name });
    onTogglePlay(voice.id);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    analytics.track('voice_selected', { voiceId: voice.id, voiceName: voice.name });
    onSelectVoice?.(voice);
  };

  const isHuman = voice.type === 'human';

  const selectVoice = () => {
    analytics.track('voice_selected', { voiceId: voice.id, voiceName: voice.name });
    onSelectVoice?.(voice);
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-slate-200/80 hover:border-orange-300 p-3.5 shadow-xs hover:shadow-md transition-all duration-200 ${onSelectVoice ? 'cursor-pointer' : ''}`}
      onClick={onSelectVoice ? selectVoice : undefined}
      onKeyDown={onSelectVoice ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectVoice();
        }
      } : undefined}
      role={onSelectVoice ? 'button' : undefined}
      tabIndex={onSelectVoice ? 0 : undefined}
      aria-label={onSelectVoice ? `${isHuman ? 'حجز' : 'اختيار'} ${voice.name}` : undefined}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <GlassyVoiceOrb
              gradient={
                isHuman
                  ? 'radial-gradient(circle at 35% 30%, #F59E0B, #E11D48, #1E1B4B)'
                  : 'radial-gradient(circle at 35% 30%, #3B82F6, #06B6D4, #0F172A)'
              }
              isPlaying={isPlaying}
              size="md"
              onTogglePlay={handlePlayClick}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {lang === 'en' && voice.nameEn ? voice.nameEn : voice.name}
              </h4>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isHuman
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                }`}
              >
                {isHuman ? (lang === 'en' ? 'Human Talent' : 'معلق بشري') : (lang === 'en' ? 'AI Voice' : 'ذكاء اصطناعي')}
              </span>
            </div>

            <p className="text-xs text-slate-500 truncate mt-0.5">
              {voice.dialectLabel} • {voice.gender === 'male' ? (lang === 'en' ? 'Male' : 'رجل') : (lang === 'en' ? 'Female' : 'امرأة')}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePlayClick}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              isPlaying
                ? 'bg-[#FF5500] text-white shadow-sm scale-95'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isPlaying ? (lang === 'en' ? 'Pause' : 'إيقاف') : (lang === 'en' ? 'Play Sample' : 'استماع للمعاينة')}
            aria-label={isPlaying ? 'Pause voice' : 'Play voice'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {onSelectVoice && (
            <button
              onClick={handleSelectClick}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1"
            >
              <span>{isHuman ? (lang === 'en' ? 'Book' : 'حجز') : (lang === 'en' ? 'Studio' : 'الاستوديو')}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Tags line */}
      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 flex-wrap">
        <span className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
          {voice.styleLabel}
        </span>
        {voice.useCases.slice(0, 2).map((uc, i) => (
          <span key={i} className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
            {uc}
          </span>
        ))}
      </div>

      {/* Progress Bar when Playing */}
      {isPlaying && (
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-2">
          <div
            className="bg-[#FF5500] h-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
