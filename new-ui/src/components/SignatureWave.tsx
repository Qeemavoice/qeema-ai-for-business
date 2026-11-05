import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioSynth } from '../utils/audioSynthesizer';

interface SignatureWaveProps {
  onPlayTrigger?: () => void;
}

export const SignatureWave: React.FC<SignatureWaveProps> = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  const toggleSound = () => {
    if (isPlaying) {
      audioSynth.stopAll();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioSynth.playAcousticPreview(() => {
        setIsPlaying(false);
      }, 5);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 110);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 110;
      }
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // We draw an Arabic calligraphic curve that morphs into sound frequencies
      const centerY = height / 2;
      phaseRef.current += isPlaying ? 0.08 : 0.02;

      // Draw background ambient glow
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, 'rgba(255, 85, 0, 0.05)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
      grad.addColorStop(1, 'rgba(255, 85, 0, 0.05)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Calligraphic start (RTL: from right to left or vice versa)
      // Transition from right (Arabic calligraphic flow) to left (frequency bars / waves)
      ctx.beginPath();
      ctx.lineWidth = 3;
      const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
      strokeGrad.addColorStop(0, '#FFA513'); // Orange
      strokeGrad.addColorStop(0.5, '#F59E0B'); // Amber Gold
      strokeGrad.addColorStop(1, '#EA580C'); // Deep Orange
      ctx.strokeStyle = strokeGrad;

      for (let x = 0; x < width; x += 2) {
        const progress = x / width; // 0 to 1
        // Right side (progress > 0.6): smooth elegant Arabic calligraphy stroke
        // Left side (progress < 0.6): pulsing digital soundwave
        let y = centerY;

        if (progress > 0.6) {
          // Arabic calligraphic wave: sweeping, smooth harmonic
          const sPhase = (x * 0.015) - phaseRef.current * 0.5;
          y = centerY + Math.sin(sPhase) * 20 * (1 - (progress - 0.6) * 1.5);
        } else {
          // Digital sound wave
          const amp = isPlaying ? 35 : 18;
          const wPhase = (x * 0.06) + phaseRef.current * 2;
          const multi = Math.sin(x * 0.02) * Math.cos(wPhase);
          y = centerY + multi * amp;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw vertical acoustic frequency bars along the path
      const barCount = Math.floor(width / 16);
      for (let i = 0; i < barCount; i++) {
        const bx = i * 16 + 8;
        const bProgress = bx / width;
        if (bProgress < 0.65) {
          const barHeightFactor = Math.sin((i * 0.3) + phaseRef.current * (isPlaying ? 3 : 1));
          const barHeight = Math.abs(barHeightFactor) * (isPlaying ? 40 : 20) + 4;

          const barGrad = ctx.createLinearGradient(bx, centerY - barHeight / 2, bx, centerY + barHeight / 2);
          barGrad.addColorStop(0, '#FF8A00');
          barGrad.addColorStop(1, '#FF4500');

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(bx - 2, centerY - barHeight / 2, 4, barHeight, 2);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div id="signature-wave-container" className="relative w-full rounded-2xl bg-gradient-to-r from-[#1E110A] via-[#2A170C] to-[#1A0F07] p-4 border border-brand/20 shadow-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 px-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#FED7AA]">
          <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
          <span className="text-brand-yellow">العنصر البصري التوقيعي:</span>
          <span>من حبر الخط العربي الأصيل إلى الموجة الصوتية الرقمية</span>
        </div>

        <button
          id="btn-toggle-wave-sound"
          onClick={toggleSound}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-brand/20 hover:bg-brand/30 text-[#FED7AA] border border-brand/40 transition-all cursor-pointer"
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-brand-text" />
              <span>إيقاف التردد</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-brand-yellow" />
              <span>استمع لنبض التردد 48kHz</span>
            </>
          )}
          <Sparkles className="w-3 h-3 text-[#F59E0B]" />
        </button>
      </div>

      <div className="relative w-full h-[90px] flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="flex justify-between items-center text-[11px] text-amber-200/50 px-2 mt-1">
        <span>01. محاكاة التردد الرقمي الفوري (AI Waves)</span>
        <span className="hidden sm:inline">← تناغم سلس بين التقنية والأصالة →</span>
        <span>02. مخارج الحروف العربية الموثقة (Human Master)</span>
      </div>
    </div>
  );
};
