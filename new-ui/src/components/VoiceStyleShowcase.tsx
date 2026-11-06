import React, { useEffect, useMemo, useRef, useState } from 'react';
import { VoiceStyleCarousel, buildVoiceStyleItems } from './VoiceStyleCarousel';
import { useSiteLists } from '../lib/siteLists';

/** The home page voice-style player as a stand-alone section (own audio element), e.g. under the TTS studio. */
export const VoiceStyleShowcase: React.FC<{ title: string; subtitle: string; id?: string }> = ({ title, subtitle, id = 'voice-style-showcase' }) => {
  const categories = useSiteLists().categories;
  const items = useMemo(() => buildVoiceStyleItems(categories), [categories]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio();
    a.crossOrigin = 'anonymous';
    a.preload = 'none';
    audioRef.current = a;
    const onTime = () => { setCurrentTime(a.currentTime); if (a.duration && !isNaN(a.duration)) setDuration(a.duration); };
    const onEnd = () => { setIsPlaying(false); setCurrentTime(0); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);
    return () => { a.pause(); a.removeEventListener('timeupdate', onTime); a.removeEventListener('ended', onEnd); };
  }, []);

  // a new style: stop the old clip, keep playing if it was playing
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !items.length) return;
    const was = isPlaying;
    a.pause();
    a.src = items[index % items.length].audioUrl;
    setCurrentTime(0); setDuration(0);
    if (was) a.play().catch(() => setIsPlaying(false));
  }, [index, items]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !items.length) return;
    if (isPlaying) { a.pause(); setIsPlaying(false); return; }
    if (!a.src) a.src = items[index % items.length].audioUrl;
    a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  if (!items.length) return null;
  return (
    <section className="rounded-3xl bg-[#f5f3f1] border border-slate-200/80 overflow-hidden" aria-labelledby={id}>
      <div className="px-5 sm:px-8 pt-6 text-center">
        <h2 id={id} className="text-lg sm:text-xl font-bold text-slate-950">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">{subtitle}</p>
      </div>
      <VoiceStyleCarousel
        items={items}
        index={index % items.length}
        onSelect={setIndex}
        isPlaying={isPlaying}
        onTogglePlay={toggle}
        audio={audioRef.current}
        currentTime={currentTime}
        duration={duration}
        onSeek={(pct) => { const a = audioRef.current; if (a && duration > 0) { a.currentTime = pct * duration; setCurrentTime(pct * duration); } }}
      />
    </section>
  );
};
