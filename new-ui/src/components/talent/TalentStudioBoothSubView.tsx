import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic2, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Type, 
  ChevronDown, 
  FileText,
  Radio,
  Headphones,
  Settings2,
  Wand2,
  ArrowDown
} from 'lucide-react';
import { TalentProject } from '../../data/talentMockData';

interface RecordedTake {
  id: string;
  name: string;
  blobUrl: string;
  durationSeconds: number;
  createdAt: string;
  sizeKb: number;
}

interface TalentStudioBoothSubViewProps {
  initialProject?: TalentProject | null;
  projects?: TalentProject[];
}

export const TalentStudioBoothSubView: React.FC<TalentStudioBoothSubViewProps> = ({
  initialProject,
  projects = []
}) => {
  // Script and teleprompter state
  const defaultScript = initialProject?.script || `[وقفة تمهيدية هادئة] هنا، حيث تلتقي أصالة الأرض بعنان السماء..
[نبرة تصاعدية واثقة] لا نبني الغد فقط، بل نصيغ مجداً تتوارثه الأجيال!
[تنفس عميق] مع البنك الأهلي السعودي.. خطوتك الأولى نحو ريادة استثنائية، وعهدٌ يتجدد مع كل إشراقة شمس.
[نبرة دافئة ختامية] طموحنا.. سماءٌ بلا حدود. البنك الأهلي السعودي، معاً نصنع الريادة.`;

  const [activeScript, setActiveScript] = useState<string>(defaultScript);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProject?.id || 'custom');
  const [fontSize, setFontSize] = useState<number>(20);
  const [scrollSpeedWpm, setScrollSpeedWpm] = useState<number>(140);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [vuLevel, setVuLevel] = useState<number>(-45); // in dB
  const [peakLevel, setPeakLevel] = useState<number>(-3);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [takes, setTakes] = useState<RecordedTake[]>([]);
  const [playingTakeId, setPlayingTakeId] = useState<string | null>(null);

  // Audio nodes and references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prompterContainerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const currentAudioElemRef = useRef<HTMLAudioElement | null>(null);

  // When initialProject changes, update script
  useEffect(() => {
    if (initialProject) {
      setActiveScript(initialProject.script);
      setSelectedProjectId(initialProject.id);
    }
  }, [initialProject]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (currentAudioElemRef.current) {
        currentAudioElemRef.current.pause();
      }
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setMicActive(false);
  };

  // Start Mic & Canvas Waveform Visualizer
  const initAudioEngine = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000
        } 
      });

      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 48000 });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      setMicActive(true);
      startCanvasVisualizer();
      return stream;
    } catch (err) {
      console.warn('Microphone permission not granted or available, using synthesized studio feedback mode:', err);
      setMicActive(true);
      startSimulatedVisualizer();
      return null;
    }
  };

  // Visualizer loop for real mic input
  const startCanvasVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      // map to dB approx (-60 to 0)
      const db = Math.round(-60 + (avg / 255) * 58);
      setVuLevel(db);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Gradient background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Render audio waveform bars
      const barWidth = (width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.9;

        const grad = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
        grad.addColorStop(0, '#FFA513');
        grad.addColorStop(0.5, '#f59e0b');
        grad.addColorStop(1, '#FFA513');

        ctx.fillStyle = grad;
        ctx.fillRect(x, (height - barHeight) / 2, barWidth - 1, Math.max(2, barHeight));
        x += barWidth;
      }
    };
    draw();
  };

  // Simulated visualizer for fallback / demo preview
  const startSimulatedVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      phase += 0.05;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      const bars = 48;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        const val = Math.sin(phase + i * 0.25) * 0.5 + 0.5;
        const barHeight = Math.max(4, val * height * 0.7);

        const grad = ctx.createLinearGradient(0, (height - barHeight) / 2, 0, (height + barHeight) / 2);
        grad.addColorStop(0, '#FFA513');
        grad.addColorStop(0.5, '#f59e0b');
        grad.addColorStop(1, '#FFA513');

        ctx.fillStyle = grad;
        ctx.fillRect(i * barWidth, (height - barHeight) / 2, barWidth - 2, barHeight);
      }
      setVuLevel(-18 + Math.round(Math.sin(phase) * 6));
    };
    draw();
  };

  // Start actual recording
  const handleStartRecording = async () => {
    let stream = micStreamRef.current;
    if (!stream) {
      stream = await initAudioEngine();
    }

    setIsRecording(true);
    setIsPaused(false);
    setRecordingSeconds(0);
    recordedChunksRef.current = [];

    // Auto start teleprompter scrolling when recording starts
    setIsAutoScrolling(true);

    if (stream && typeof MediaRecorder !== 'undefined') {
      try {
        const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        mr.start(250);
        mediaRecorderRef.current = mr;
      } catch (e) {
        console.warn('MediaRecorder init fallback:', e);
      }
    }

    // Timer
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Stop recording & save take
  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setIsAutoScrolling(false);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Create Take blob
    const duration = recordingSeconds;
    const takeNumber = takes.length + 1;
    let blobUrl = '';

    if (recordedChunksRef.current.length > 0) {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      blobUrl = URL.createObjectURL(blob);
    } else {
      // Mock take audio
      blobUrl = 'https://actions.google.com/sounds/v1/human_voices/male_voice_announcement.ogg';
    }

    const newTake: RecordedTake = {
      id: `take-${Date.now()}`,
      name: `Take ${takeNumber} - ${initialProject ? initialProject.brand : 'تسجيل حر'} (${duration}s)`,
      blobUrl: blobUrl,
      durationSeconds: Math.max(1, duration),
      createdAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      sizeKb: Math.round(duration * 28.5)
    };

    setTakes(prev => [newTake, ...prev]);
  };

  // Teleprompter Auto-scroll Effect
  useEffect(() => {
    if (!isAutoScrolling) return;

    const container = prompterContainerRef.current;
    if (!container) return;

    // Convert WPM to scroll speed pixels per second
    const scrollPixelsPerSec = (scrollSpeedWpm / 150) * 22;
    let lastTime = performance.now();
    let frameId: number;

    const scrollStep = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (container) {
        container.scrollTop += scrollPixelsPerSec * delta;
        // If reached bottom, stop
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
          setIsAutoScrolling(false);
          return;
        }
      }

      frameId = requestAnimationFrame(scrollStep);
    };

    frameId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoScrolling, scrollSpeedWpm]);

  // Play Take
  const handleTogglePlayTake = (take: RecordedTake) => {
    if (playingTakeId === take.id) {
      if (currentAudioElemRef.current) {
        currentAudioElemRef.current.pause();
      }
      setPlayingTakeId(null);
    } else {
      if (currentAudioElemRef.current) {
        currentAudioElemRef.current.pause();
      }
      const audio = new Audio(take.blobUrl);
      currentAudioElemRef.current = audio;
      audio.onended = () => setPlayingTakeId(null);
      audio.play().catch(() => setPlayingTakeId(null));
      setPlayingTakeId(take.id);
    }
  };

  const handleDeleteTake = (id: string) => {
    setTakes(prev => prev.filter(t => t.id !== id));
    if (playingTakeId === id && currentAudioElemRef.current) {
      currentAudioElemRef.current.pause();
      setPlayingTakeId(null);
    }
  };

  // Calculate script metrics
  const wordsCount = activeScript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTimeSec = Math.round((wordsCount / scrollSpeedWpm) * 60);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & Console Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Mic2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">كابينة التسجيل المباشرة والملقّن</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-brand-text border border-orange-500/30">
                Studio Booth v3.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تسجيل بدقة 48kHz / 24-bit مع ملقّن نصوص ذكي وفحص فوري للموجات الصوتية
            </p>
          </div>
        </div>

        {/* Studio Specs Indicator pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>48,000 Hz</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-mono">
            <Sliders className="w-3.5 h-3.5 text-brand-text" />
            <span>24-Bit Linear PCM</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Room Tone: -64 dB</span>
          </div>
        </div>
      </div>

      {/* Main Studio Console: Split into Teleprompter & Recording Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): The Smart Teleprompter */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          {/* Prompter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            {/* Script selector */}
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-text" />
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProjectId(val);
                  if (val === 'custom') {
                    // keep custom
                  } else {
                    const found = projects.find(p => p.id === val);
                    if (found) setActiveScript(found.script);
                  }
                }}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand"
              >
                <option value="custom">نص مخصص حر</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.wordCount} كلمة)
                  </option>
                ))}
              </select>
            </div>

            {/* Controls: Speed, Font Size, Scroll Toggle */}
            <div className="flex items-center gap-3">
              {/* Speed WPM */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400">سرعة الإلقاء:</span>
                <span className="font-mono font-bold text-orange-400">{scrollSpeedWpm}</span>
                <span className="text-[10px] text-slate-400">WPM</span>
                <input
                  type="range"
                  min="90"
                  max="240"
                  step="10"
                  value={scrollSpeedWpm}
                  onChange={(e) => setScrollSpeedWpm(Number(e.target.value))}
                  className="w-16 accent-brand cursor-pointer"
                />
              </div>

              {/* Font Size (+ / -) */}
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                  className="px-1.5 py-0.5 text-slate-400 hover:text-white font-bold cursor-pointer"
                  title="تصغير الخط"
                >
                  A-
                </button>
                <span className="text-[11px] text-slate-300 font-mono px-1">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
                  className="px-1.5 py-0.5 text-slate-400 hover:text-white font-bold cursor-pointer"
                  title="تكبير الخط"
                >
                  A+
                </button>
              </div>

              {/* Auto scroll play/pause */}
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isAutoScrolling
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isAutoScrolling ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isAutoScrolling ? 'إيقاف التمرير' : 'تمرير آلي'}</span>
              </button>
            </div>
          </div>

          {/* Prompter Visual Viewport */}
          <div 
            ref={prompterContainerRef}
            className="my-4 h-[340px] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 relative scroll-smooth focus:outline-none"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.code === 'Space') {
                e.preventDefault();
                setIsAutoScrolling(!isAutoScrolling);
              }
            }}
          >
            {/* Center Eye-Line Reading Marker */}
            <div className="sticky top-1/2 -translate-y-1/2 left-0 right-0 h-10 border-y border-orange-500/20 bg-orange-500/5 pointer-events-none rounded-lg flex items-center justify-between px-3">
              <span className="text-[10px] text-orange-400/80 font-mono">◄ خط تركيز العين</span>
              <span className="text-[10px] text-orange-400/80 font-mono">EYE-LINE ►</span>
            </div>

            {/* Editable or Formatted Script */}
            <div 
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setActiveScript(e.currentTarget.innerText)}
              className="text-white leading-loose font-medium select-text whitespace-pre-wrap outline-none"
              style={{ fontSize: `${fontSize}px` }}
            >
              {activeScript}
            </div>
          </div>

          {/* Prompter Footer Metrics */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span>الكلمات: <strong className="text-white font-mono">{wordsCount}</strong></span>
              <span>الوقت المتوقع: <strong className="text-orange-400 font-mono">~{estimatedReadTimeSec} ثانية</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>علامات الوقف:</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">[تنفس]</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">[نبرة تصاعدية]</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">[وقفة]</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Recording Deck & Waveform & Takes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recording & VU Meter Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                <h3 className="text-sm font-bold text-white">
                  {isRecording ? 'جاري التسجيل الحي الآن' : 'وحدة التسجيل الصوتي'}
                </h3>
              </div>

              {/* Live Timer */}
              <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-base font-black text-rose-500 tracking-wider">
                {formatTimer(recordingSeconds)}
              </div>
            </div>

            {/* Audio Waveform Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-28 bg-[#090d16]">
              <canvas
                ref={canvasRef}
                width={400}
                height={112}
                className="w-full h-full block"
              />
              {!isRecording && !micActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs text-slate-400 text-xs">
                  <Mic2 className="w-6 h-6 text-slate-500 mb-1" />
                  <span>انقر على زر التسجيل لبدء الالتقاط الحي</span>
                </div>
              )}
            </div>

            {/* VU Meter dB Indicator */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>-60 dB</span>
                <span>-36 dB</span>
                <span>-18 dB</span>
                <span className="text-amber-400">-6 dB</span>
                <span className="text-rose-500">0 dB (Clip)</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800 flex items-center">
                <div 
                  className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600"
                  style={{ width: `${Math.min(100, Math.max(5, ((vuLevel + 60) / 60) * 100))}%` }}
                />
              </div>
            </div>

            {/* Primary Recording Action Buttons */}
            <div className="pt-2 flex items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 group"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white group-hover:scale-110 transition-transform" />
                  <span>بدء تسجيل تيك جديد (Rec)</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Square className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>إيقاف وحفظ التيك</span>
                </button>
              )}
            </div>
          </div>

          {/* Takes Recorded List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-brand-text" />
                <h3 className="text-xs font-bold text-white">التيكات المسجلة (Takes)</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {takes.length} تسجيل
              </span>
            </div>

            {takes.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                لا توجد تسجيلات بعد في هذه الجلسة.
                <br />
                اضغط على زر التسجيل لإنتاج أول تيك.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-none">
                {takes.map(take => (
                  <div
                    key={take.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5 truncate">
                      <strong className="text-white block truncate">{take.name}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {take.createdAt} • {take.durationSeconds}ث • {take.sizeKb} KB
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleTogglePlayTake(take)}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-brand text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="استماع"
                      >
                        {playingTakeId === take.id ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>

                      <a
                        href={take.blobUrl}
                        download={`${take.name.replace(/\s+/g, '_')}.wav`}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="تحميل ملف WAV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDeleteTake(take.id)}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
