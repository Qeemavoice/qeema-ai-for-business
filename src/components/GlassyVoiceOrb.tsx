import React from 'react';
import { Play, Pause, Check } from 'lucide-react';
import { LiquidLogo, variantFor } from './LiquidLogo';

export interface GlassyVoiceOrbProps {
  gradient: string;
  isPlaying?: boolean;
  isVerified?: boolean;
  onTogglePlay?: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showPlayButton?: boolean;
  title?: string;
  /** When given, shows the liquid glass logo (look picked from the id) instead of the gradient circle. */
  voiceId?: string;
}

/**
 * GlassyVoiceOrb:
 * The signature 3D luminous glass sphere avatar used across Qeema Voice.
 * Replaces generic icons with an artistic, specular-lit colored orb and verified badge.
 */
export const GlassyVoiceOrb: React.FC<GlassyVoiceOrbProps> = ({
  gradient,
  isPlaying = false,
  isVerified = true,
  onTogglePlay,
  size = 'md',
  className = '',
  showPlayButton = true,
  title,
  voiceId
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const playSizeMap = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8'
  };

  const iconSizeMap = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4'
  };

  if (voiceId) {
    const px = { sm: 36, md: 44, lg: 52, xl: 60 }[size];
    return (
      <div className={`relative shrink-0 select-none ${className}`} title={title}>
        <button type="button" onClick={onTogglePlay} className="relative block cursor-pointer group active:scale-95 transition-transform" style={{ width: px, height: px }} aria-label={isPlaying ? 'إيقاف العينة' : 'تشغيل العينة'}>
          <LiquidLogo variant={variantFor(voiceId)} size={px} live={isPlaying} playing={isPlaying} />
          {showPlayButton && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className={`rounded-full flex items-center justify-center bg-white text-slate-950 shadow-md transition-opacity ${playSizeMap[size]} ${isPlaying ? 'opacity-100' : 'opacity-90 sm:opacity-0 group-hover:opacity-100'}`}>
                {isPlaying ? <Pause className={`${iconSizeMap[size]} fill-current`} /> : <Play className={`${iconSizeMap[size]} fill-current mr-0.5`} />}
              </span>
            </span>
          )}
        </button>
        {isVerified && (
          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-xs z-10 pointer-events-none" title="صوت موثق ومرخص رسمياً">
            <Check className="w-2 h-2 text-white stroke-[3.5]" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 select-none ${className}`} title={title}>
      <div
        onClick={onTogglePlay}
        className={`relative ${sizeMap[size]} rounded-full cursor-pointer group transition-all duration-200 active:scale-95 flex items-center justify-center overflow-hidden border border-white/50 shadow-xs`}
        style={{
          background: gradient,
          boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.45), 0 3px 8px rgba(0, 0, 0, 0.16)'
        }}
      >
        {/* Specular gloss highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/50 pointer-events-none rounded-full" />
        
        {/* Inner glow depth ring */}
        <div className="absolute inset-[1.5px] rounded-full border border-white/25 pointer-events-none" />

        {/* Play/Pause Button overlay */}
        {showPlayButton && (
          <div
            className={`rounded-full flex items-center justify-center transition-all ${playSizeMap[size]} ${
              isPlaying
                ? 'bg-black text-white shadow-md scale-100 opacity-100'
                : 'bg-black/65 sm:bg-black/35 text-white opacity-90 sm:opacity-0 group-hover:opacity-100 sm:hover:bg-black/80'
            }`}
          >
            {isPlaying ? (
              <Pause className={`${iconSizeMap[size]} fill-white text-white`} />
            ) : (
              <Play className={`${iconSizeMap[size]} fill-white text-white mr-0.5`} />
            )}
          </div>
        )}
      </div>

      {/* Verified Black Badge with White Checkmark `✓` */}
      {isVerified && (
        <div
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-xs z-10 pointer-events-none"
          title="صوت موثق ومرخص رسمياً"
        >
          <Check className="w-2 h-2 text-white stroke-[3.5]" />
        </div>
      )}
    </div>
  );
};
