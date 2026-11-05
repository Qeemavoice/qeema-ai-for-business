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
 * GlassyVoiceOrb: the voice mark used across Qeema Voice, the 3D glass logo (see LiquidLogo)
 * with play button and verified badge. `gradient` is kept only to pick a stable look for old callers.
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

  // The glass logo is the voice mark across the site; the look is picked from the voice id (or its old gradient).
  const key = voiceId || gradient || title || '';
  const px = { sm: 36, md: 44, lg: 52, xl: 60 }[size];
  return (
    <div className={`relative shrink-0 select-none ${className}`} title={title}>
      {/* a div, not a button: the orb is sometimes placed inside clickable cards/buttons */}
      <div
        role={onTogglePlay ? 'button' : undefined}
        tabIndex={onTogglePlay ? 0 : undefined}
        onClick={onTogglePlay}
        onKeyDown={onTogglePlay ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTogglePlay(e as unknown as React.MouseEvent); } } : undefined}
        className="relative block cursor-pointer group active:scale-95 transition-transform"
        style={{ width: px, height: px }}
        aria-label={isPlaying ? 'إيقاف العينة' : 'تشغيل العينة'}
      >
        <LiquidLogo variant={variantFor(key)} size={px} live={isPlaying} playing={isPlaying} />
        {showPlayButton && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className={`rounded-full flex items-center justify-center bg-white text-slate-950 shadow-md transition-opacity ${playSizeMap[size]} ${isPlaying ? 'opacity-100' : 'opacity-90 sm:opacity-0 group-hover:opacity-100'}`}>
              {isPlaying ? <Pause className={`${iconSizeMap[size]} fill-current`} /> : <Play className={`${iconSizeMap[size]} fill-current mr-0.5`} />}
            </span>
          </span>
        )}
      </div>
      {isVerified && (
        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-xs z-10 pointer-events-none" title="صوت موثق ومرخص رسمياً">
          <Check className="w-2 h-2 text-white stroke-[3.5]" />
        </div>
      )}
    </div>
  );
};
