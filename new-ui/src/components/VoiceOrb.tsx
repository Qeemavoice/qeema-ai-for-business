import React, { useRef, useEffect, useState, useCallback } from 'react';

export type OrbMode = 'human' | 'ai' | 'twins' | 'tts' | 'cloning';
export type OrbState = 'idle' | 'hover' | 'playing' | 'generating' | 'completed';

interface VoiceOrbProps {
  mode?: OrbMode;
  state?: OrbState;
  audioElement?: HTMLAudioElement | null;
  isPlaying?: boolean;
  size?: number;
  onClick?: () => void;
  className?: string;
  voiceLabel?: string;
}

interface ModeTheme {
  primaryGlow: string;
  secondaryGlow: string;
  coreGradient: [string, string, string];
  waveformColor: string;
  particleColor: string;
  lightHue: number;
}

const THEMES: Record<OrbMode, ModeTheme> = {
  human: {
    primaryGlow: 'rgba(245, 158, 11, 0.45)', // Warm Amber
    secondaryGlow: 'rgba(225, 29, 72, 0.35)', // Rose Gold
    coreGradient: ['#F59E0B', '#E11D48', '#1E1B4B'],
    waveformColor: 'rgba(245, 158, 11, 0.85)',
    particleColor: '#FDE68A',
    lightHue: 38
  },
  ai: {
    primaryGlow: 'rgba(37, 99, 235, 0.55)', // Electric Blue
    secondaryGlow: 'rgba(6, 182, 212, 0.45)', // Cyan
    coreGradient: ['#3B82F6', '#06B6D4', '#0F172A'],
    waveformColor: 'rgba(56, 189, 248, 0.9)',
    particleColor: '#BAE6FD',
    lightHue: 215
  },
  twins: {
    primaryGlow: 'rgba(139, 92, 246, 0.5)', // Electric Violet
    secondaryGlow: 'rgba(245, 158, 11, 0.4)', // Warm Gold
    coreGradient: ['#8B5CF6', '#F59E0B', '#111827'],
    waveformColor: 'rgba(167, 139, 250, 0.9)',
    particleColor: '#DDD6FE',
    lightHue: 270
  },
  tts: {
    primaryGlow: 'rgba(16, 185, 129, 0.45)', // Emerald
    secondaryGlow: 'rgba(59, 130, 246, 0.4)', // Blue
    coreGradient: ['#10B981', '#3B82F6', '#064E3B'],
    waveformColor: 'rgba(52, 211, 153, 0.85)',
    particleColor: '#A7F3D0',
    lightHue: 160
  },
  cloning: {
    primaryGlow: 'rgba(124, 58, 237, 0.55)', // Purple
    secondaryGlow: 'rgba(236, 72, 153, 0.4)', // Pink
    coreGradient: ['#7C3AED', '#EC4899', '#1E1B4B'],
    waveformColor: 'rgba(192, 132, 252, 0.9)',
    particleColor: '#FBCFE8',
    lightHue: 285
  }
};

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  mode = 'human',
  state = 'idle',
  audioElement,
  isPlaying = false,
  size = 380,
  onClick,
  className = '',
  voiceLabel = 'الصوت العربي'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Audio Context & Analyser
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Motion & mouse tracking
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  });

  const [isHovered, setIsHovered] = useState(false);
  const [effectiveState, setEffectiveState] = useState<OrbState>(state);

  // Keep effective state updated
  useEffect(() => {
    if (isPlaying) {
      setEffectiveState('playing');
    } else if (state === 'generating') {
      setEffectiveState('generating');
    } else if (isHovered) {
      setEffectiveState('hover');
    } else {
      setEffectiveState(state || 'idle');
    }
  }, [isPlaying, state, isHovered]);

  // Setup Web Audio API when an audio element is passed and active
  useEffect(() => {
    if (!audioElement) return;

    const setupAudio = () => {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended' && isPlaying) {
          ctx.resume();
        }

        if (!analyserRef.current) {
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.82;
          analyserRef.current = analyser;
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

          try {
            if (!sourceNodeRef.current) {
              const source = ctx.createMediaElementSource(audioElement);
              source.connect(analyser);
              analyser.connect(ctx.destination);
              sourceNodeRef.current = source;
            }
          } catch (sourceErr) {
            // In case media element is already connected or has CORS restriction
            console.debug('MediaElementSource already connected or cross-origin:', sourceErr);
          }
        }
      } catch (err) {
        console.debug('Web Audio API initialization fallback:', err);
      }
    };

    if (isPlaying) {
      setupAudio();
    }
  }, [audioElement, isPlaying]);

  // Mouse move handler for organic 3D light deflection
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseRef.current.targetX = nx * 2;
    mouseRef.current.targetY = ny * 2;
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

  // Canvas render loop: 60fps high precision organic 3D Orb + Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let fallbackPhase = 0;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      // Pause if tab is hidden to save CPU/GPU
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += prefersReducedMotion ? 0.005 : 0.02;
      fallbackPhase += 0.035;

      // Smooth mouse LERP
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.28;

      // Extract real audio frequency and amplitude metrics
      let audioAmp = 0;
      let bassVal = 0;
      let midVal = 0;
      let highVal = 0;

      if (effectiveState === 'playing') {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const data = dataArrayRef.current;
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            sum += data[i];
          }
          audioAmp = sum / (data.length * 255);
          bassVal = data[4] / 255;
          midVal = data[16] / 255;
          highVal = data[32] / 255;
        } else {
          // Synthetic audio reactivity fallback (harmonic voice cadence)
          const voiceBeat = Math.sin(fallbackPhase * 2.8) * Math.cos(fallbackPhase * 1.4);
          audioAmp = 0.35 + Math.max(0, voiceBeat) * 0.45;
          bassVal = 0.4 + Math.sin(fallbackPhase * 2.1) * 0.35;
          midVal = 0.35 + Math.cos(fallbackPhase * 3.4) * 0.3;
          highVal = 0.25 + Math.sin(fallbackPhase * 5.1) * 0.25;
        }
      } else if (effectiveState === 'generating') {
        audioAmp = 0.5 + Math.sin(time * 6) * 0.25;
        bassVal = 0.6;
        midVal = 0.5;
        highVal = 0.7;
      } else if (effectiveState === 'hover') {
        audioAmp = 0.12;
      } else {
        // Subtle idle breathing
        audioAmp = 0.04 + Math.sin(time * 1.2) * 0.02;
      }

      const theme = THEMES[mode] || THEMES.human;

      // -------------------------------------------------------------
      // 1. OUTER AMBIENT GLOW (Soft volumetric diffuse lighting)
      // -------------------------------------------------------------
      const glowScale = 1 + audioAmp * 0.4;
      const outerGlow = ctx.createRadialGradient(
        centerX + mouseRef.current.x * 20,
        centerY + mouseRef.current.y * 20,
        baseRadius * 0.4,
        centerX,
        centerY,
        baseRadius * 2.0 * glowScale
      );
      outerGlow.addColorStop(0, theme.primaryGlow);
      outerGlow.addColorStop(0.55, theme.secondaryGlow);
      outerGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.0 * glowScale, 0, Math.PI * 2);
      ctx.fill();

      // -------------------------------------------------------------
      // 2. RADIAL / CIRCULAR AUDIO WAVEFORM (Flowing around the Orb)
      // -------------------------------------------------------------
      const wavePoints = 72;
      const waveRadius = baseRadius * (1.18 + audioAmp * 0.15);

      ctx.beginPath();
      for (let i = 0; i <= wavePoints; i++) {
        const angle = (i / wavePoints) * Math.PI * 2;
        // Harmonic waveform modulation
        const freq1 = Math.sin(angle * 7 + time * 3.2);
        const freq2 = Math.cos(angle * 12 - time * 2.1);
        const waveDisplacement = (freq1 * 0.6 + freq2 * 0.4) * (audioAmp * 28 + (effectiveState === 'generating' ? 14 : 4));
        const r = waveRadius + waveDisplacement;
        const wx = centerX + Math.cos(angle) * r;
        const wy = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(wx, wy);
        } else {
          ctx.lineTo(wx, wy);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = theme.waveformColor;
      ctx.lineWidth = effectiveState === 'playing' ? 2.5 : 1.5;
      ctx.stroke();

      // Secondary fine waveform ring
      if (effectiveState === 'playing' || effectiveState === 'generating') {
        ctx.beginPath();
        const waveRadius2 = baseRadius * (1.32 + audioAmp * 0.22);
        for (let i = 0; i <= wavePoints; i++) {
          const angle = (i / wavePoints) * Math.PI * 2;
          const freq = Math.sin(angle * 9 - time * 4.5);
          const r = waveRadius2 + freq * (audioAmp * 20);
          const wx = centerX + Math.cos(angle) * r;
          const wy = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.strokeStyle = theme.secondaryGlow;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // 3. THE 3D ORGANIC LIVING ORB BODY (Deformed Translucent Sphere)
      // -------------------------------------------------------------
      const orbPoints = 64;
      const currentRadius = baseRadius * (1.0 + (effectiveState === 'playing' ? audioAmp * 0.2 : audioAmp * 0.08));

      ctx.beginPath();
      for (let i = 0; i <= orbPoints; i++) {
        const angle = (i / orbPoints) * Math.PI * 2;
        // Organic Perlin-like mathematical deformation
        const d1 = Math.sin(angle * 3 + time * 1.6);
        const d2 = Math.cos(angle * 5 - time * 2.1);
        const d3 = Math.sin(angle * 8 + time * 3.4);
        const organicNoise = (d1 * 0.5 + d2 * 0.35 + d3 * 0.15);

        const deformationScale = effectiveState === 'playing'
          ? (bassVal * 22 + midVal * 12 + 6)
          : effectiveState === 'generating'
          ? 18
          : effectiveState === 'hover'
          ? 10
          : 5;

        const r = currentRadius + organicNoise * deformationScale;
        const ox = centerX + Math.cos(angle) * r;
        const oy = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(ox, oy);
        } else {
          ctx.lineTo(ox, oy);
        }
      }
      ctx.closePath();

      // Dynamic lighting offset based on mouse position
      const lightSourceX = centerX - currentRadius * 0.32 + mouseRef.current.x * 45;
      const lightSourceY = centerY - currentRadius * 0.32 + mouseRef.current.y * 45;

      // 3D Spherical Volume Gradient
      const orbGrad = ctx.createRadialGradient(
        lightSourceX,
        lightSourceY,
        currentRadius * 0.1,
        centerX,
        centerY,
        currentRadius * 1.15
      );
      orbGrad.addColorStop(0, '#FFFFFF'); // Specular highlight
      orbGrad.addColorStop(0.22, theme.coreGradient[0]); // Primary bright accent
      orbGrad.addColorStop(0.68, theme.coreGradient[1]); // Secondary deep tone
      orbGrad.addColorStop(1, theme.coreGradient[2]); // Core deep shadow

      ctx.fillStyle = orbGrad;
      ctx.fill();

      // -------------------------------------------------------------
      // 4. TRANSLUCENT REFRACTIVE GLASS SHELL & FRESNEL RIM
      // -------------------------------------------------------------
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.clip();

      // Internal light filament
      const internalGrad = ctx.createLinearGradient(
        centerX - currentRadius + mouseRef.current.x * 30,
        centerY - currentRadius,
        centerX + currentRadius,
        centerY + currentRadius
      );
      internalGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      internalGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
      internalGrad.addColorStop(0.7, theme.primaryGlow);
      internalGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');

      ctx.fillStyle = internalGrad;
      ctx.fill();

      // Specular glare glint on glass surface
      ctx.beginPath();
      ctx.ellipse(
        lightSourceX + currentRadius * 0.15,
        lightSourceY + currentRadius * 0.15,
        currentRadius * 0.35,
        currentRadius * 0.18,
        -Math.PI / 4 + mouseRef.current.x * 0.2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.fill();

      ctx.restore();

      // Fresnel outer rim stroke
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.75;
      ctx.stroke();

      // -------------------------------------------------------------
      // 5. FLOATING ACOUSTIC PARTICLES
      // -------------------------------------------------------------
      const particleCount = effectiveState === 'playing' ? 24 : 12;
      for (let p = 0; p < particleCount; p++) {
        const pAngle = (p / particleCount) * Math.PI * 2 + time * 0.4;
        const pDistance = currentRadius * (1.15 + (Math.sin(p * 3.7 + time * 1.8) * 0.35 + 0.35) * (audioAmp + 0.4));
        const px = centerX + Math.cos(pAngle) * pDistance + Math.sin(time + p) * 6;
        const py = centerY + Math.sin(pAngle) * pDistance + Math.cos(time + p) * 6;
        const pSize = (Math.sin(p + time * 2) * 1.2 + 2.0) * (effectiveState === 'playing' ? 1.4 : 1.0);

        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.8, pSize), 0, Math.PI * 2);
        ctx.fillStyle = theme.particleColor;
        ctx.shadowColor = theme.particleColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, effectiveState]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative select-none flex items-center justify-center cursor-pointer group transition-transform duration-700 ${className}`}
      style={{ width: size, height: size }}
      role="button"
      tabIndex={0}
      aria-label={`تفاعل مع الصوت العربي - الحالة: ${effectiveState}`}
    >
      {/* 60fps High Precision Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="w-full h-full block transform transition-transform duration-500 group-hover:scale-[1.02]"
      />

      {/* Floating Center Acoustic Badge / State Cue */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300">
        <div
          className={`px-3 py-1 rounded-full backdrop-blur-md text-[11px] font-bold tracking-wide transition-all duration-300 border ${
            effectiveState === 'playing'
              ? 'bg-slate-950/80 text-white border-white/20 shadow-lg scale-105'
              : 'bg-white/25 text-slate-900 border-white/40 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
          }`}
        >
          {effectiveState === 'playing' ? (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>جاري تشغيل الصوت...</span>
            </span>
          ) : effectiveState === 'generating' ? (
            <span className="flex items-center gap-1.5 text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>جاري بناء الصوت...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span>انقر لتشغيل العينة</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
