import React, { useEffect, useRef, useState } from 'react';

/**
 * The 3D glass play-triangle (Qeema logo) with liquid colour inside, from the designer's
 * transparent renders (public/logo-motion). Still WebP when idle, animated WebP when live;
 * while a voice plays the glass breathes with the loudness (same smoothing as render_liquid.py).
 * Animated WebP, not video: transparent video (VP9/HEVC alpha) rendered invisible in some Chromium
 * builds. Assets from transparent.zip: 608px centre crop, 240px, 12fps, 3.5s ping-pong loop.
 */
export const LIQUID_VARIANTS = ['lilac', 'ember', 'garnet', 'grove'] as const;

/** Stable look for any id (voice id, category key...). */
export const variantFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % LIQUID_VARIANTS.length;
};

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
  const imgRef = useRef<HTMLImageElement>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const animate = live && !reducedMotion();
  const [loadedLook, setLoadedLook] = useState<string | null>(null);   // which animation has finished loading
  const animReady = animate && loadedLook === look;
  const zoom = spray ? 1 : 1.45;   // the glass fills about 2/3 of the frame

  useEffect(() => {
    const v = imgRef.current;
    if (!animate || !v || !playing) return;
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
      v.style.transform = `scale(${zoom * (1 + .07 * e)})`;                     // breathes with the voice
      v.style.filter = `brightness(${1 + .25 * e}) saturate(${1 + .3 * e})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); v.style.filter = ''; v.style.transform = zoom !== 1 ? `scale(${zoom})` : ''; };
  }, [animate, audio, playing, look, zoom]);

  const still = `/logo-motion/${look}.webp`;
  const inner: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'contain', transform: zoom !== 1 ? `scale(${zoom})` : undefined, pointerEvents: 'none' };
  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {/* the still stays until the animation (~1.7MB) has loaded, so the mark never disappears */}
      {(!animate || !animReady) && <img src={still} alt="" draggable={false} decoding="async" loading="lazy" style={{ ...inner, position: 'absolute', inset: 0 }} />}
      {animate && (
        <img ref={imgRef} key={look} src={`/logo-motion/${look}-anim.webp`} alt="" draggable={false} decoding="async" onLoad={() => setLoadedLook(look)}
          style={{ ...inner, position: 'absolute', inset: 0, opacity: animReady ? 1 : 0, transition: 'transform .08s linear' }} />
      )}
    </span>
  );
};
