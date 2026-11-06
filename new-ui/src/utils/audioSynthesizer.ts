// Web Audio API & Speech Synthesis audio controller for authentic voice & waveform feedback

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private isPlayingSpeech = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  public stopAll() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isPlayingSpeech = false;
    }
    this.currentOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.currentOscillators = [];
  }

  // Plays a rich acoustic tone sequence simulating studio audio playback
  public playAcousticPreview(onEnd?: () => void, durationSeconds = 3.5) {
    this.initContext();
    if (!this.ctx) {
      if (onEnd) setTimeout(onEnd, 1000);
      return;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopAll();

    const now = this.ctx.currentTime;
    const notes = [220, 277.18, 329.63, 440, 329.63, 277.18, 220]; // Warm harmonic sweep
    const noteDuration = durationSeconds / notes.length;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

      gain.gain.setValueAtTime(0.001, now + idx * noteDuration);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * noteDuration + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * noteDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * noteDuration);
      osc.stop(now + (idx + 1) * noteDuration);
      this.currentOscillators.push(osc);
    });

    setTimeout(() => {
      if (onEnd) onEnd();
    }, durationSeconds * 1000);
  }

  // Tries Arabic speech synthesis with fallback to musical chime
  public speakText(text: string, rate = 1, pitch = 1, onEnd?: () => void) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.stopAll();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Check if Arabic voices are available
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arVoice) {
        utterance.voice = arVoice;
      }

      utterance.onend = () => {
        this.isPlayingSpeech = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isPlayingSpeech = false;
        this.playAcousticPreview(onEnd, 2.5);
      };

      this.isPlayingSpeech = true;
      window.speechSynthesis.speak(utterance);

      // In case speech is blocked or silent, fallback timer
      setTimeout(() => {
        if (this.isPlayingSpeech) {
          this.stopAll();
          if (onEnd) onEnd();
        }
      }, 7000);
    } else {
      this.playAcousticPreview(onEnd, 3);
    }
  }
}

export const audioSynth = new AudioSynthesizer();
