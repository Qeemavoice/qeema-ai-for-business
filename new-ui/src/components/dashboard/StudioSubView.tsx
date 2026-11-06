import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Sliders,
  Play,
  Pause,
  Download,
  RotateCcw,
  Zap,
  Check,
  ChevronDown,
  Info,
  Layers,
  Clock,
  FileAudio,
  ShieldCheck,
  History,
  X
} from 'lucide-react';
import { Voice, Generation } from '../../types';
import { GlassyVoiceOrb } from '../GlassyVoiceOrb';
import { api } from '../../lib/api';

interface StudioSubViewProps {
  voices: Voice[];
  initialText?: string;
  initialVoiceId?: string;
  generations: Generation[];
  onGenerationComplete: (gen: Generation) => void;
  balanceCredits: number;
  onOpenTopUp: () => void;
}

export const StudioSubView: React.FC<StudioSubViewProps> = ({
  voices,
  initialText = '',
  initialVoiceId,
  generations,
  onGenerationComplete,
  balanceCredits,
  onOpenTopUp
}) => {
  const [text, setText] = useState(initialText || 'مرحباً بكم في منصة قيمة للذكاء الصوتي. نحن نقدم لك تجربة استثنائية لتحويل النصوص العربية إلى تعليق صوتي واقعي بنبرات خليجية ومصرية وشامية ومعاصرة.');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(initialVoiceId || voices[0]?.id || 'v-1');
  const [inspectorTab, setInspectorTab] = useState<'settings' | 'history'>('settings');

  // Sliders matching Screenshot 3
  const [model, setModel] = useState('qeema-multilingual-v2');
  const [speed, setSpeed] = useState(1.0);
  const [stability, setStability] = useState(0.75);
  const [similarity, setSimilarity] = useState(0.85);
  const [styleExaggeration, setStyleExaggeration] = useState(0.2);
  const [autoTashkeel, setAutoTashkeel] = useState(true);
  const [speakerBoost, setSpeakerBoost] = useState(true);
  const [outputFormat, setOutputFormat] = useState('wav-48k');

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [activePlayId, setActivePlayId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const selectedVoice = voices.find(v => v.id === selectedVoiceId) || voices[0];
  const charCount = text.length;
  const estimatedCredits = Math.max(charCount * 1.5, 50);

  const quickChips = [
    { label: 'سرد قصة', text: 'في ليلة هادئة تحت ضوء النجوم، بدأت المغامرة التي غيرت مجرى الأحداث إلى الأبد...' },
    { label: 'تسجيل إعلان', text: 'استمتع بأقوى العروض الحصرية لفترة محدودة. الجودة والتميز في مكان واحد!' },
    { label: 'رسالة IVR للمصرف', text: 'مرحباً بكم في خدمة العملاء. لإتمام معاملتك المصرفية بسرعة وسهولة، يرجى الاستماع للخيارات التالية...' },
    { label: 'بودكاست حواري', text: 'أهلاً بكم في حلقة جديدة من البودكاست. موضوعنا اليوم يناقش مستقبل الذكاء الاصطناعي في المنطقة...' }
  ];

  const handleResetSliders = () => {
    setSpeed(1.0);
    setStability(0.75);
    setSimilarity(0.85);
    setStyleExaggeration(0.2);
    setSpeakerBoost(true);
    setAutoTashkeel(true);
  };

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    if (balanceCredits < estimatedCredits) {
      onOpenTopUp();
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.createGeneration({
        voiceId: selectedVoiceId,
        text: text.trim(),
        settings: {
          speed,
          stability,
          similarity,
          styleExaggeration,
          autoTashkeel,
          speakerBoost,
          outputFormat,
          model
        }
      });

      if (res && res.generation) {
        onGenerationComplete(res.generation);
        setGenerationSuccess(true);
        setTimeout(() => setGenerationSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAudio = (id: string, url: string) => {
    if (activePlayId === id) {
      currentAudio?.pause();
      setActivePlayId(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(url);
    setCurrentAudio(audio);
    setActivePlayId(id);
    audio.play().catch(console.error);
    audio.onended = () => setActivePlayId(null);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50 overflow-hidden" style={{ direction: 'rtl' }}>
      {/* 1. Main Central Distraction-Free Text Canvas */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
        {/* Editor Box (Matches ElevenLabs Text-to-speech) */}
        <div className="flex-1 min-h-[400px] bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب أو الصق النص هنا لتحويله إلى تعليق صوتي فائق الواقعية بدقة مخارج الحروف العربية..."
            className="w-full flex-1 bg-transparent resize-none outline-hidden text-base md:text-lg text-slate-900 placeholder:text-slate-400 leading-loose font-medium"
          />

          {/* Bottom Bar inside Text Box */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">{charCount.toLocaleString()} حرف</span>
              <span>•</span>
              <span className="text-[#FF5500] font-bold">~{Math.round(estimatedCredits)} نقطة مطلوبة</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setText('')}
                className="hover:text-slate-700 transition-colors font-semibold"
              >
                مسح النص
              </button>
            </div>
          </div>
        </div>

        {/* Quick Inspiration Chips */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400">إلهام سريع للبدء:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {quickChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => setText(chip.text)}
                className="px-3 py-1.5 bg-white hover:bg-orange-50 text-slate-700 hover:text-[#FF5500] border border-slate-200/80 hover:border-orange-300 rounded-full text-xs font-semibold transition-all shadow-2xs active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Right Inspector Sidebar (Settings / History) */}
      <div className="w-full md:w-96 bg-white border-r border-slate-200/90 flex flex-col shrink-0 select-none">
        {/* Inspector Tab Switcher */}
        <div className="flex items-center border-b border-slate-100 p-2 gap-1 bg-slate-50/50">
          <button
            onClick={() => setInspectorTab('settings')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              inspectorTab === 'settings'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            الإعدادات (Settings)
          </button>
          <button
            onClick={() => setInspectorTab('history')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              inspectorTab === 'history'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            السجل ({generations.length})
          </button>
        </div>

        {/* Tab Content */}
        {inspectorTab === 'settings' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
            {/* Promo Banner inside Inspector */}
            <div className="p-3 bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl text-white flex items-center justify-between gap-2 shadow-xs">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-teal-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Qeema Voice Design v3</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-tight">
                  تصميم وتخصيص النبرات المعاصرة بدقة عالية
                </p>
              </div>
            </div>

            {/* Voice Selector Card */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">الصوت المحدد</label>
              <div className="relative">
                <select
                  value={selectedVoiceId}
                  onChange={(e) => setSelectedVoiceId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-900 outline-hidden cursor-pointer"
                >
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.dialectLabel} • {v.styleLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Model Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">النموذج الصوتي (Model)</label>
              <div className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 outline-hidden cursor-pointer"
                >
                  <option value="qeema-multilingual-v2">Qeema Multilingual v2 (الأنسب للهجات)</option>
                  <option value="qeema-neural-v3">Qeema Neural HD v3 (أعلى جودة للبث)</option>
                  <option value="qeema-acoustic-v1">Qeema Acoustic Studio</option>
                </select>
                <div className="text-[10px] text-slate-400">
                  أعلى مستوى تعبير ومطابقة مخارج الحروف العربية
                </div>
              </div>
            </div>

            {/* Fine-Tuning Sliders (Matching Screenshot 3) */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {/* Speed */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>السرعة (Speed)</span>
                  <span className="text-slate-400 font-mono">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-[#FF5500] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>أبطأ</span>
                  <span>أسرع</span>
                </div>
              </div>

              {/* Stability */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>الثبات والاستقرار (Stability)</span>
                  <span className="text-slate-400 font-mono">{Math.round(stability * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={stability}
                  onChange={(e) => setStability(Number(e.target.value))}
                  className="w-full accent-[#FF5500] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>أكثر تنوعاً وعاطفة</span>
                  <span>أكثر ثباتاً ورسمية</span>
                </div>
              </div>

              {/* Similarity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>التطابق ومحاكاة الصوت (Similarity)</span>
                  <span className="text-slate-400 font-mono">{Math.round(similarity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={similarity}
                  onChange={(e) => setSimilarity(Number(e.target.value))}
                  className="w-full accent-[#FF5500] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>منخفض</span>
                  <span>مرتفع جداً</span>
                </div>
              </div>

              {/* Style Exaggeration */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>حدة الأسلوب والدراما (Style Exaggeration)</span>
                  <span className="text-slate-400 font-mono">{Math.round(styleExaggeration * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={styleExaggeration}
                  onChange={(e) => setStyleExaggeration(Number(e.target.value))}
                  className="w-full accent-[#FF5500] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>طبيعي</span>
                  <span>تمثيلي مبالغ</span>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-800 text-xs">التشكيل والتنقيح التلقائي</div>
                  <div className="text-[10px] text-slate-400">ضبط حركات الإعراب للنص العربي</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoTashkeel}
                  onChange={(e) => setAutoTashkeel(e.target.checked)}
                  className="w-4 h-4 accent-[#FF5500] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-800 text-xs">تعزيز وضوح الصوت (Speaker Boost)</div>
                  <div className="text-[10px] text-slate-400">عزل الترددات الحادة وتحسين النقاء</div>
                </div>
                <input
                  type="checkbox"
                  checked={speakerBoost}
                  onChange={(e) => setSpeakerBoost(e.target.checked)}
                  className="w-4 h-4 accent-[#FF5500] rounded"
                />
              </label>
            </div>

            {/* Output Format */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-500">صيغة التصدير (Output Format)</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
              >
                <option value="wav-48k">WAV 48 kHz / 24-bit (Studio Master)</option>
                <option value="mp3-128k">MP3 44.1 kHz (128 kbps Web Standard)</option>
                <option value="flac">FLAC Lossless Audio</option>
              </select>
            </div>

            {/* Reset Values Button */}
            <button
              onClick={handleResetSliders}
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط القيم الافتراضية</span>
            </button>
          </div>
        ) : (
          /* History Tab */
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar text-xs">
            {generations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <FileAudio className="w-8 h-8 text-slate-300 mx-auto" />
                <p>لا يوجد تسجيلات سابقة</p>
              </div>
            ) : (
              generations.map((gen) => {
                const isPlaying = activePlayId === gen.id;
                return (
                  <div
                    key={gen.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 hover:border-orange-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 truncate max-w-[200px]">
                        {gen.text.slice(0, 35)}...
                      </div>
                      <span className="text-[10px] text-slate-400">{gen.durationSeconds || 3.5}s</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handlePlayAudio(gen.id, gen.audioUrl)}
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          isPlaying
                            ? 'bg-[#FF5500] text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        <span>{isPlaying ? 'إيقاف' : 'استماع'}</span>
                      </button>

                      <a
                        href={gen.audioUrl}
                        download={`qeema-${gen.id}.wav`}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700"
                        title="تحميل"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Sticky Bottom Generate Button */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || isGenerating}
            className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
              text.trim() && !isGenerating
                ? 'bg-[#FF5500] hover:bg-[#e04b00] text-white shadow-orange-500/25'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'جاري التوليد بدقة 48kHz...' : 'توليد الصوت الآن (Generate)'}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>يشمل ترخيص تجاري وبث كامل 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
