import React from 'react';
import { OrbState } from './types';

interface AssistantVoiceOrbProps {
  state: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  statusText?: string;
  className?: string;
}

export const AssistantVoiceOrb: React.FC<AssistantVoiceOrbProps> = ({
  state = 'idle',
  size = 'lg',
  onClick,
  statusText,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-44 h-44',
    xl: 'w-56 h-56'
  };

  const getOrbStateStyles = () => {
    switch (state) {
      case 'listening':
        return {
          glow: 'rgba(255, 85, 0, 0.55)',
          scale: 'scale-105',
          pulseSpeed: 'animate-pulse',
          rings: true,
          ringColor: 'border-brand/40'
        };
      case 'thinking':
        return {
          glow: 'rgba(139, 92, 246, 0.5)',
          scale: 'scale-100',
          pulseSpeed: 'animate-spin-slow',
          rings: true,
          ringColor: 'border-indigo-400/40'
        };
      case 'speaking':
        return {
          glow: 'rgba(245, 158, 11, 0.6)',
          scale: 'scale-110',
          pulseSpeed: 'animate-bounce-gentle',
          rings: true,
          ringColor: 'border-amber-400/50'
        };
      case 'connecting':
        return {
          glow: 'rgba(59, 130, 246, 0.45)',
          scale: 'scale-95',
          pulseSpeed: 'animate-pulse',
          rings: true,
          ringColor: 'border-blue-400/30'
        };
      case 'error':
        return {
          glow: 'rgba(239, 68, 68, 0.4)',
          scale: 'scale-95',
          pulseSpeed: '',
          rings: false,
          ringColor: 'border-red-400/30'
        };
      case 'idle':
      default:
        return {
          glow: 'rgba(255, 85, 0, 0.35)',
          scale: 'scale-100',
          pulseSpeed: '',
          rings: false,
          ringColor: 'border-orange-200/30'
        };
    }
  };

  const stateStyle = getOrbStateStyles();

  return (
    <div 
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Voice Orb Status: ${state}`}
    >
      {/* Outer Glow Radiance */}
      <div
        className={`absolute rounded-full transition-all duration-700 pointer-events-none blur-2xl ${sizeClasses[size]}`}
        style={{
          background: `radial-gradient(circle, ${stateStyle.glow} 0%, rgba(255, 85, 0, 0.05) 70%, transparent 100%)`,
          transform: 'scale(1.6)'
        }}
      />

      {/* Dynamic Soundwave Rings when active */}
      {stateStyle.rings && (
        <>
          <div
            className={`absolute rounded-full border-2 ${stateStyle.ringColor} animate-ping pointer-events-none ${sizeClasses[size]}`}
            style={{ animationDuration: state === 'speaking' ? '1.5s' : '2.5s' }}
          />
          <div
            className={`absolute rounded-full border ${stateStyle.ringColor} animate-pulse pointer-events-none ${sizeClasses[size]}`}
            style={{ transform: 'scale(1.25)' }}
          />
        </>
      )}

      {/* Main Core 3D Luminous Sphere */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full transition-all duration-500 cursor-pointer overflow-hidden ${stateStyle.scale} shadow-2xl flex items-center justify-center`}
        style={{
          background: 'radial-gradient(circle at 35% 30%, #FF8A00 0%, #FFA513 35%, #D93800 65%, #0F172A 100%)',
          boxShadow: `
            inset 0 4px 12px rgba(255, 255, 255, 0.7),
            inset 0 -10px 20px rgba(0, 0, 0, 0.5),
            0 12px 36px ${stateStyle.glow}
          `
        }}
      >
        {/* Specular Inner Highlight Curve */}
        <div
          className="absolute top-2 left-4 w-3/4 h-1/2 rounded-full pointer-events-none opacity-80"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0) 100%)',
            transform: 'rotate(-25deg)',
            filter: 'blur(1px)'
          }}
        />

        {/* Ambient Color Fluid Swirl inside */}
        <div
          className="absolute inset-0 rounded-full opacity-60 mix-blend-overlay pointer-events-none animate-spin-slow"
          style={{
            background: 'conic-gradient(from 0deg, #FFA513, #F59E0B, #EC4899, #8B5CF6, #3B82F6, #FFA513)',
            filter: 'blur(8px)'
          }}
        />

        {/* Core Center Pulse */}
        <div
          className="w-1/3 h-1/3 rounded-full bg-white/40 blur-xs transition-transform duration-300 pointer-events-none"
          style={{
            transform: state === 'speaking' ? 'scale(1.4)' : state === 'listening' ? 'scale(1.2)' : 'scale(1)'
          }}
        />
      </div>

      {/* Status Label Text if provided */}
      {statusText && (
        <div className="mt-4 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold tracking-wide shadow-md border border-white/10 flex items-center gap-2 animate-fade-in">
          <span 
            className="w-2 h-2 rounded-full animate-ping"
            style={{ 
              backgroundColor: state === 'listening' ? '#FFA513' : state === 'speaking' ? '#F59E0B' : state === 'thinking' ? '#8B5CF6' : '#10B981' 
            }}
          />
          <span>{statusText}</span>
        </div>
      )}
    </div>
  );
};
