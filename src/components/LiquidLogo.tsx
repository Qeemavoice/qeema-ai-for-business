import React, { useEffect, useRef } from 'react';

/**
 * The 3D glass play-triangle (Qeema logo) with liquid colour inside, from the designer's
 * transparent renders (public/logo-motion). Still image when idle, looping video when live;
 * while a voice plays the loop speeds up with the loudness (same smoothing as render_liquid.py).
 * Assets were made from transparent.zip: 608px centre crop, 320px, 24fps
 * (WebM VP9 alpha for Chrome/Firefox, HEVC alpha MP4 for Safari).
 */
export const LIQUID_VARIANTS = ['lilac', 'ember', 'garnet', 'grove'] as const;

/** Stable look for any id (voice id, category key...). */
export const variantFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % LIQUID_VARIANTS.length;
};

const isSafari = () => typeof navigator !== 'undefined' && /Apple/.test(navigator.vendor) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ---- Audio energy: one analyser per media element (an element can only be wired once) ----
let actx: AudioContext | null = null;
const analysers = new WeakMap<HTMLMediaElement, AnalyserNode>();
function analyserFor(el: HTMLMediaElement): AnalyserNode | null {
  if (analysers.has(el)) return analysers.get(el)!;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    actx = actx || new AC();
    const src = actx.createMediaElementSource(el);
    const an = actx.createAnalyser();
    an.fftSize = 1024;
    src.connect(an);
    an.connect(actx.destination);
    analysers.set(el, an);
    return an;
  } catch {
    return null;
  }
}

interface LiquidLogoProps {
  variant: number;
  /** CSS pixel size of the square box. */
  size: number;
  /** Animate (otherwise the still). */
  live?: boolean;
  /** Voice is playing: drives the loop speed (from `audio` when given, simulated otherwise). */
  playing?: boolean;
  audio?: HTMLMediaElement | null;
  /** Show the full frame with the spray around the glass (large sizes); small icons zoom on the glass. */
  spray?: boolean;
  className?: string;
}

export const LiquidLogo: React.FC<LiquidLogoProps> = ({ variant, size, live = false, playing = false, audio, spray = false, className = '' }) => {
  const look = LIQUID_VARIANTS[variant % LIQUID_VARIANTS.length];
  const videoRef = useRef<HTMLVideoElement>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const animate = live && !reducedMotion();
  const zoom = spray ? 1 : 1.45;   // the glass fills about 2/3 of the frame

  useEffect(() => {
    const v = videoRef.current;
    if (!animate || !v) return;
    v.play().catch(() => {});
    const an = playing && audio ? analyserFor(audio) : null;
    if (an && actx?.state === 'suspended') actx.resume();
    const buf = new Float32Array(an ? an.fftSize : 0);
    let e = 0, raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      let target = 0;
      if (playingRef.current) {
        if (an) {
          an.getFloatTimeDomainData(buf);
          let s = 0;
          for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
          target = Math.min(1, Math.sqrt(s / buf.length) / .18);
        } else {
          target = .45 + .3 * Math.sin(now / 170) * Math.sin(now / 410 + 1); // ponytail: simulated voice when there is no real audio stream
        }
      }
      e += (target - e) * Math.min(1, (target > e ? .14 : .045) * dt * 60);   // attack faster than release
      v.playbackRate = .55 + 1.1 * e;                                          // calm when silent, lively with the voice
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, audio, playing, look]);

  const still = `/logo-motion/${look}.webp`;
  const inner: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'contain', transform: zoom !== 1 ? `scale(${zoom})` : undefined, pointerEvents: 'none' };
  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {animate ? (
        <video
          key={look}
          ref={videoRef}
          src={isSafari() ? `/logo-motion/${look}.mp4` : `/logo-motion/${look}.webm`}
          poster={still}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={inner}
        />
      ) : (
        <img src={still} alt="" draggable={false} loading="lazy" decoding="async" style={inner} />
      )}
    </span>
  );
};
