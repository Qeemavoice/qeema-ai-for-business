import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Gauge, Lightbulb, Loader2, LockKeyhole, Mic2, Pause, Play, RefreshCw, Sparkles, Volume2, WandSparkles } from 'lucide-react';
import { authRequest } from '../lib/api';
import { VoiceExperienceShowcase } from './VoiceExperienceShowcase';

interface TtsVoice {
  id: string;
  name: string;
  category: string;
  description: string;
  labels: Record<string, string> | string[];
  previewUrl: string;
  avatar: string;
  dialect: string;
  dialects?: string[];
  gender: 'male' | 'female';
  style: string;
  ttsReady: boolean;
}

interface TtsStudioViewProps {
  isLoggedIn: boolean;
  onRequireAuth: () => void;
  initialVoiceId?: string;
}

interface TextAnalysis {
  improvedText: string;
  textType: 'advertisement' | 'documentary' | 'podcast' | 'educational' | 'ivr' | 'story' | 'general';
  emotion: string;
  tone: string;
  pace: 'slow' | 'medium' | 'fast';
  direction: string;
  performanceTips: string[];
  pronunciationNotes: string[];
  recommendedVoices: { voiceId: string; voiceName: string; dialect: string; ttsReady: boolean; reason: string }[];
  settings: { stability: number; similarityBoost: number; style: number; speed: number };
}

export interface TtsRecording {
  id: string;
  voiceName: string;
  text: string;
  characters: number;
  audioUrl: string;
  createdAt: string;
}

const MAX_CHARS = 2000;

function voiceMeta(voice: TtsVoice): string {
  const values = Array.isArray(voice.labels) ? voice.labels : Object.values(voice.labels || {});
  return values.filter(Boolean).slice(0, 3).join(' • ') || voice.category || 'قيمة فويس';
}

const textTypeLabels: Record<TextAnalysis['textType'], string> = {
  advertisement: 'إعلان',
  documentary: 'وثائقي',
  podcast: 'بودكاست',
  educational: 'تعليمي',
  ivr: 'رد آلي',
  story: 'سرد قصصي',
  general: 'نص عام',
};

const paceLabels: Record<TextAnalysis['pace'], string> = { slow: 'هادئ', medium: 'متوازن', fast: 'سريع' };

async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    const validation = data.errors ? Object.values(data.errors).flat().find(Boolean) : null;
    return String(validation || data.message || fallback);
  } catch {
    return fallback;
  }
}

export const TtsStudioView: React.FC<TtsStudioViewProps> = ({ isLoggedIn, onRequireAuth, initialVoiceId }) => {
  const [voices, setVoices] = useState<TtsVoice[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [providers, setProviders] = useState<Record<string, { label: string; enabled: boolean; configured: boolean }>>({});
  const [dialectFilter, setDialectFilter] = useState('all');
  const [dialectHint, setDialectHint] = useState<'auto' | 'emirati' | 'fusha'>('auto');
  const [diacritize, setDiacritize] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [text, setText] = useState('مرحباً بك في قيمة فويس، حيث يتحول النص العربي إلى صوت واضح وطبيعي.');
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0.2);
  const [speed, setSpeed] = useState(1);
  const [model, setModel] = useState<'eleven_multilingual_v2' | 'eleven_v3'>('eleven_v3');
  const [emotion, setEmotion] = useState('none');
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [message, setMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [recordings, setRecordings] = useState<TtsRecording[]>([]);
  const audioUrlRef = useRef('');
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.id === selectedVoiceId),
    [voices, selectedVoiceId]
  );

  useEffect(() => {
    let active = true;

    setLoadingVoices(true);
    setMessage('');

    fetch('/api/v1/tts/voices', { headers: { Accept: 'application/json' }, credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error(await errorMessage(response, 'تعذر تحميل الأصوات.'));
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const available = Array.isArray(data.voices) ? data.voices : [];
        setProviders(data.providers?.providers || {});
        setSelectedProvider(data.provider || data.providers?.active || '');
        setVoices(available);
        setSelectedVoiceId(
          available.find((voice: TtsVoice) => voice.id === initialVoiceId)?.id
          || available.find((voice: TtsVoice) => voice.ttsReady)?.id
          || available[0]?.id
          || ''
        );
      })
      .catch((error) => active && setMessage(error instanceof Error ? error.message : 'تعذر تحميل الأصوات.'))
      .finally(() => active && setLoadingVoices(false));

    return () => {
      active = false;
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [isLoggedIn, initialVoiceId]);

  const changeProvider = async (provider: string) => {
    if (!provider || provider === selectedProvider) return;
    setLoadingVoices(true);
    setMessage('');
    try {
      const response = await fetch(`/api/v1/tts/voices?provider=${encodeURIComponent(provider)}`, {
        headers: { Accept: 'application/json' }, credentials: 'include'
      });
      if (!response.ok) throw new Error(await errorMessage(response, 'تعذر تحميل أصوات هذا المزوّد.'));
      const data = await response.json();
      const available = Array.isArray(data.voices) ? data.voices : [];
      setSelectedProvider(provider);
      setProviders(data.providers?.providers || providers);
      setVoices(available);
      setSelectedVoiceId(available.find((voice: TtsVoice) => voice.ttsReady)?.id || available[0]?.id || '');
      setDialectFilter('all');
      setDialectHint('auto');
      setEmotion('none');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر تحميل أصوات هذا المزوّد.');
    } finally {
      setLoadingVoices(false);
    }
  };

  const availableDialects = useMemo(() => Array.from(new Set(voices.flatMap((voice) => voice.dialects || [voice.dialect]).filter(Boolean))), [voices]);
  const visibleVoices = useMemo(() => dialectFilter === 'all' ? voices : voices.filter((voice) => (voice.dialects || [voice.dialect]).includes(dialectFilter)), [voices, dialectFilter]);

  const loadHistory = async () => {
    if (!isLoggedIn) return;
    const response = await fetch('/api/v1/tts/history', { headers: { Accept: 'application/json' }, credentials: 'include' });
    if (!response.ok) return;
    const data = await response.json();
    setRecordings(Array.isArray(data.recordings) ? data.recordings : []);
  };

  useEffect(() => { void loadHistory(); }, [isLoggedIn]);

  const replaceAudio = (nextUrl: string) => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = nextUrl;
    setAudioUrl(nextUrl);
  };

  const generate = async () => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    if (!selectedVoiceId || !text.trim()) {
      setMessage('اختر صوتاً وأدخل النص أولاً.');
      return;
    }
    if (!selectedVoice?.ttsReady) {
      setMessage('هذا نموذج لمعلق بشري متاح للمعاينة والحجز، ولم يُربط بالتوليد بعد.');
      return;
    }

    setGenerating(true);
    setMessage('');
    try {
      const response = await authRequest('/api/v1/tts/generate', {
        voiceId: selectedVoiceId,
        provider: selectedProvider,
        voiceName: selectedVoice?.name || '',
        text: text.trim(),
        settings: { model, emotion, stability, similarityBoost, style, speed, speakerBoost: true, dialect: dialectHint, diacritize }
      });

      if (!response.ok) {
        if (response.status === 401) onRequireAuth();
        throw new Error(await errorMessage(response, 'تعذر توليد الصوت.'));
      }

      const blob = await response.blob();
      replaceAudio(URL.createObjectURL(blob));
      setMessage('تم توليد الصوت وحفظه في تسجيلاتك.');
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر توليد الصوت.');
    } finally {
      setGenerating(false);
    }
  };

  const analyzeText = async () => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    if (text.trim().length < 10) {
      setMessage('اكتب نصاً من 10 أحرف على الأقل حتى يمكن تحليله.');
      return;
    }

    setAnalyzing(true);
    setMessage('');
    try {
      const response = await authRequest('/api/v1/tts/analyze', { text: text.trim() });
      if (!response.ok) {
        if (response.status === 401) onRequireAuth();
        throw new Error(await errorMessage(response, 'تعذر تحليل النص الآن.'));
      }
      const data = await response.json();
      setAnalysis(data.analysis || null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر تحليل النص الآن.');
    } finally {
      setAnalyzing(false);
    }
  };

  const applyAnalysis = () => {
    if (!analysis) return;
    setText(analysis.improvedText || text);
    const munsitEmotion: Record<string, string> = {
      curious: 'serious', mischievous: 'happy', whisper: 'calm', shout: 'excited', laugh: 'happy', sigh: 'sad'
    };
    setEmotion(selectedProvider === 'munsit' ? (munsitEmotion[analysis.emotion] || analysis.emotion || 'none') : (analysis.emotion || 'none'));
    setStability(analysis.settings.stability);
    setSimilarityBoost(analysis.settings.similarityBoost);
    setStyle(analysis.settings.style);
    setSpeed(analysis.settings.speed);
    setMessage('تم تطبيق النص المحسّن وإعدادات الأداء المقترحة.');
  };

  const toggleVoicePreview = async (voice: TtsVoice = selectedVoice as TtsVoice) => {
    const audio = previewAudioRef.current;
    if (!audio || !voice?.previewUrl) return;
    setSelectedVoiceId(voice.id);
    if (playingPreviewId === voice.id) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingPreviewId(null);
      return;
    }
    audio.pause();
    audio.src = voice.previewUrl;
    try {
      await audio.play();
      setPlayingPreviewId(voice.id);
    } catch {
      setPlayingPreviewId(null);
      setMessage('تعذر تشغيل عينة الصوت. حاول مرة أخرى.');
    }
  };

  return (
    <section dir="rtl" className="min-h-[75vh] bg-[radial-gradient(circle_at_top_right,_#fff7ed_0,_#f8fafc_34%,_#f8fafc_100%)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative mb-5 overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-7">
          <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#FF5500]/20 blur-3xl" />
          <div className="absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1.5 text-xs font-bold text-orange-300">
            <Sparkles className="w-4 h-4" />
            مجاني حالياً دون خصم رصيد
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">استوديو تحويل النص إلى صوت</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">اختر الصوت، اضبط الأداء، ثم ولّد التسجيل مباشرة. تُحفظ جميع النتائج تلقائياً في سجلّك.</p>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,.7fr)]">
          <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="tts-text" className="text-sm font-black text-slate-900">النص المراد تسجيله</label>
                <span className={`rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-mono ${text.length > MAX_CHARS ? 'text-red-600' : 'text-slate-500'}`}>{text.length}/{MAX_CHARS}</span>
              </div>
              <textarea
                id="tts-text"
                value={text}
                maxLength={MAX_CHARS}
                onChange={(event) => setText(event.target.value)}
                className="w-full min-h-40 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-base leading-8 outline-none transition focus:border-[#FF5500] focus:bg-white focus:ring-4 focus:ring-orange-100 resize-y"
                placeholder="اكتب النص الذي تريد تحويله إلى صوت..."
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs leading-5 text-slate-500">حلّل الحالة والمشاعر واحصل على توجيه للمعلق واقتراحات من أصواتنا.</p>
                <button
                  type="button"
                  onClick={() => void analyzeText()}
                  disabled={analyzing || !text.trim()}
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs font-black text-violet-800 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
                  {analyzing ? 'يحلّل النص...' : 'حلّل النص واقترح الأداء'}
                </button>
              </div>
            </div>

            {analysis && (
              <section className="overflow-hidden rounded-2xl border border-violet-200 bg-[linear-gradient(135deg,#faf5ff_0%,#ffffff_52%,#fff7ed_100%)]" aria-label="نتيجة تحليل النص">
                <div className="flex flex-col gap-4 border-b border-violet-100 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-950 px-3 py-1 text-[11px] font-black text-white"><WandSparkles className="h-3.5 w-3.5" /> المخرج الصوتي الذكي</span>
                      <span className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-bold text-violet-800">{textTypeLabels[analysis.textType]}</span>
                      <span className="rounded-full border border-orange-200 bg-white px-2.5 py-1 text-[11px] font-bold text-orange-800">إيقاع {paceLabels[analysis.pace]}</span>
                    </div>
                    <h2 className="mt-3 text-base font-black text-slate-950">{analysis.tone}</h2>
                    <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-600">{analysis.direction}</p>
                  </div>
                  <button type="button" onClick={applyAnalysis} className="shrink-0 rounded-xl bg-violet-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-violet-800">استخدم النص والإعدادات</button>
                </div>

                <div className="grid gap-4 p-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-white bg-white/80 p-4 shadow-sm">
                    <h3 className="flex items-center gap-2 text-xs font-black text-slate-900"><Lightbulb className="h-4 w-4 text-amber-500" /> توجيهات الأداء</h3>
                    <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
                      {analysis.performanceTips.map((tip, index) => <li key={`${tip}-${index}`} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5500]" />{tip}</li>)}
                      {analysis.pronunciationNotes.map((note, index) => <li key={`${note}-${index}`} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />{note}</li>)}
                    </ul>
                  </div>

                  {selectedProvider === 'munsit' ? <div className="rounded-xl border border-white bg-white/80 p-4 shadow-sm">
                    <h3 className="flex items-center gap-2 text-xs font-black text-slate-900"><Mic2 className="h-4 w-4 text-[#FF5500]" /> قراءة النص واللهجات</h3>
                    <p className="mt-3 text-xs leading-6 text-slate-600">اختر الصوت الذي يطابق اللهجة من كتالوج منصّت. اللهجات المعروضة مأخوذة من بيانات الصوت، أما تلميح النطق المباشر فيدعم الفصحى والإماراتية والتلقائي.</p>
                    <div className="mt-3 flex flex-wrap gap-2">{(selectedVoice?.dialects || []).map((dialect) => <button key={dialect} type="button" onClick={() => setDialectFilter(dialect)} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-800">{dialect}</button>)}</div>
                    <p className="mt-3 text-[11px] text-slate-500">لتحسين القراءة بالفصحى، فعّل تشكيل النص قبل التوليد، ثم راجع النص المشكول لأن التشكيل الآلي يحتاج مراجعة في بعض السياقات.</p>
                  </div> : <div className="rounded-xl border border-white bg-white/80 p-4 shadow-sm">
                    <h3 className="flex items-center gap-2 text-xs font-black text-slate-900"><Mic2 className="h-4 w-4 text-[#FF5500]" /> المعلقون الأنسب لهذا النص</h3>
                    {analysis.recommendedVoices.length > 0 ? <div className="mt-3 space-y-2">
                      {analysis.recommendedVoices.map((voice) => (
                        <button
                          key={voice.voiceId}
                          type="button"
                          onClick={() => voice.ttsReady && voices.some((item) => item.id === voice.voiceId) && setSelectedVoiceId(voice.voiceId)}
                          className={`w-full rounded-xl border p-3 text-right transition ${voice.ttsReady && voices.some((item) => item.id === voice.voiceId) ? 'border-slate-200 bg-white hover:border-[#FF5500]' : 'cursor-default border-slate-100 bg-slate-50'}`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <strong className="text-xs text-slate-900">{voice.voiceName}</strong>
                            <span className="text-[10px] font-bold text-slate-500">{voice.dialect}</span>
                          </span>
                          <span className="mt-1 block text-[11px] leading-5 text-slate-500">{voice.reason}</span>
                          <span className="mt-1.5 block text-[10px] font-bold text-[#D94800]">{voice.ttsReady ? 'متاح للتوليد' : 'متاح للحجز البشري'}</span>
                        </button>
                      ))}
                    </div> : <p className="mt-3 text-xs text-slate-500">لم نجد معلقاً مطابقاً ضمن الأصوات المنشورة حالياً.</p>}
                  </div>}
                </div>

                <div className="flex items-center gap-2 border-t border-violet-100 px-4 py-3 text-[11px] text-slate-500">
                  <Gauge className="h-3.5 w-3.5 text-violet-600" /> اقتراح آلي للمراجعة؛ يمكنك تعديل النص والإعدادات قبل التوليد.
                </div>
              </section>
            )}

            <div>
              {Object.values(providers).some((provider) => provider.enabled) && <div className="mb-4 max-w-md">
                <label htmlFor="tts-provider" className="mb-2 block text-sm font-black text-slate-900">محرك الصوت</label>
                <select id="tts-provider" value={selectedProvider} onChange={(event) => void changeProvider(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#FF5500]">
                  {Object.entries(providers).filter(([, provider]) => provider.enabled).map(([providerId, provider]) => <option key={providerId} value={providerId}>{provider.label}</option>)}
                </select>
              </div>}
              <label htmlFor="tts-voice" className="block text-sm font-black text-slate-900 mb-3">اختيار الصوت</label>
              <VoiceExperienceShowcase
                voices={visibleVoices}
                providerName={providers[selectedProvider]?.label || (selectedProvider === 'munsit' ? 'منصّت' : 'المزوّد المحدد')}
                selectedVoiceId={selectedVoiceId}
                playingVoiceId={playingPreviewId}
                loading={loadingVoices}
                onSelect={setSelectedVoiceId}
                onPreview={(voice) => void toggleVoicePreview(voice as TtsVoice)}
              />
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs font-black text-slate-800">كل الأصوات المتاحة</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{visibleVoices.length} صوت حقيقي</span>
              </div>
              <div className="flex gap-2">
                <select
                  id="tts-voice"
                  value={selectedVoiceId}
                  onChange={(event) => setSelectedVoiceId(event.target.value)}
                  disabled={loadingVoices || voices.length === 0}
                  className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#FF5500] focus:ring-4 focus:ring-orange-100"
                >
                  {loadingVoices && <option>جارٍ تحميل الأصوات...</option>}
                  {!loadingVoices && voices.length === 0 && <option>لا توجد أصوات متاحة</option>}
                  {visibleVoices.map((voice) => <option key={voice.id} value={voice.id}>{voice.name} — {voiceMeta(voice)} — {voice.ttsReady ? 'متاح للتوليد' : 'نموذج بشري للحجز'}</option>)}
                </select>
                {selectedVoice?.previewUrl && (
                  <button
                    type="button"
                    onClick={() => void toggleVoicePreview()}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition hover:bg-[#FF5500]"
                    aria-label="استمع إلى عينة الصوت"
                    title="استمع إلى عينة الصوت"
                  >
                    {playingPreviewId === selectedVoice.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                )}
              </div>
              <audio ref={previewAudioRef} className="hidden" preload="none" onEnded={() => setPlayingPreviewId(null)} onError={() => setPlayingPreviewId(null)} />
              {selectedVoice?.description && <p className="mt-2 text-xs text-slate-500 line-clamp-2">{selectedVoice.description}</p>}
              {selectedVoice && !selectedVoice.ttsReady && <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">هذا صوت بشري من منصة قيمة فويس. يمكنك الاستماع إلى نموذجه وحجز المعلق، وسيصبح متاحاً للتوليد بعد ربط نموذجه الصوتي.</p>}

              {availableDialects.length > 1 && <div className="mt-4 max-w-md">
                <label htmlFor="tts-dialect-filter" className="mb-2 block text-xs font-bold text-slate-700">تصفية حسب اللهجة المسجلة للصوت</label>
                <select id="tts-dialect-filter" value={dialectFilter} onChange={(event) => { setDialectFilter(event.target.value); const first = event.target.value === 'all' ? voices[0] : voices.find((voice) => (voice.dialects || [voice.dialect]).includes(event.target.value)); if (first) setSelectedVoiceId(first.id); }} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  <option value="all">كل اللهجات</option>
                  {availableDialects.map((dialect) => <option key={dialect} value={dialect}>{dialect}</option>)}
                </select>
              </div>}
              {visibleVoices.length > 0 && <div className="mt-4 max-h-80 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 custom-scrollbar" aria-label="نماذج الأصوات المتاحة">
                {visibleVoices.map((voice) => {
                  const selected = selectedVoiceId === voice.id;
                  const playing = playingPreviewId === voice.id;
                  return <article key={voice.id} className={`flex items-center gap-3 rounded-xl border p-3 transition ${selected ? 'border-[#FF5500] bg-white ring-2 ring-orange-100' : 'border-transparent bg-white/70 hover:border-slate-200'}`}>
                    {voice.avatar ? <img src={voice.avatar} alt={`صورة ${voice.name}`} className="h-11 w-11 shrink-0 rounded-xl bg-slate-100 object-cover" /> : <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-sm font-black text-[#FF7133]">{voice.name.charAt(0)}</div>}
                    <button type="button" onClick={() => setSelectedVoiceId(voice.id)} className="min-w-0 flex-1 text-right">
                      <span className="block truncate text-xs font-black text-slate-900">{voice.name}</span>
                      <span className="mt-1 block truncate text-[11px] text-slate-500">{voice.dialect} · {voice.gender === 'female' ? 'نسائي' : 'رجالي'} · {voice.style}</span>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${voice.ttsReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{voice.ttsReady ? 'متاح للتوليد' : 'معلق بشري للحجز'}</span>
                    </button>
                    <button type="button" disabled={!voice.previewUrl} onClick={() => void toggleVoicePreview(voice)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-white transition hover:bg-[#FF5500] disabled:bg-slate-200 disabled:text-slate-400" aria-label={playing ? `إيقاف عينة ${voice.name}` : `تشغيل عينة ${voice.name}`}>
                      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  </article>;
                })}
              </div>}
            </div>

            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2">
              {selectedProvider === 'munsit' ? <>
                <label className="text-sm font-bold text-slate-700">
                  <span className="mb-2 block">توجيه اللهجة عند التوليد</span>
                  <select value={dialectHint} onChange={(event) => setDialectHint(event.target.value as typeof dialectHint)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <option value="auto">تلقائي حسب النص والصوت</option><option value="emirati">إماراتي</option><option value="fusha">فصحى</option>
                  </select>
                  <span className="mt-1 block text-[11px] font-normal leading-5 text-slate-500">اللهجات الأخرى تُختار عبر صوت يدعمها؛ لا يرسل محرك منصّت تلميحًا مباشرًا لها حالياً.</span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={diacritize} onChange={(event) => setDiacritize(event.target.checked)} className="h-4 w-4 accent-[#FF5500]" />
                  <span>تشكيل النص قبل النطق <span className="mt-1 block text-[11px] font-normal text-slate-500">مناسب للفصحى؛ راجع النتيجة للهجات العامية.</span></span>
                </label>
                <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                  <span className="mb-2 block">المشاعر والأداء</span>
                  <select value={emotion} onChange={(event) => setEmotion(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <option value="none">النبرة الطبيعية</option><option value="happy">سعيد</option><option value="excited">حماسي</option><option value="calm">هادئ</option><option value="serious">جاد</option><option value="sad">حزين</option><option value="fearful">خائف</option><option value="angry">غاضب</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-slate-700">
                  <span className="flex justify-between mb-2"><span>ثبات الأداء</span><span>{Math.round(stability * 100)}%</span></span>
                  <input className="w-full accent-[#FF5500]" type="range" min="0" max="1" step="0.05" value={stability} onChange={(event) => setStability(Number(event.target.value))} />
                  <span className="mt-1 block text-[11px] font-normal text-slate-500">ارفعه لقراءة أكثر اتساقاً، وخفّضه لتعبير أكبر.</span>
                </label>
                <label className="text-sm font-bold text-slate-700">
                  <span className="flex justify-between mb-2"><span>سرعة القراءة</span><span>{speed.toFixed(2)}×</span></span>
                  <input className="w-full accent-[#FF5500]" type="range" min="0.7" max="1.2" step="0.05" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
                  <span className="mt-1 block text-[11px] font-normal text-slate-500">من قراءة هادئة 0.70× إلى أداء سريع 1.20×.</span>
                </label>
              </> : <>
              <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                <span className="mb-2 block">محرك الأداء</span>
                <select value={model} onChange={(event) => setModel(event.target.value as typeof model)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF5500]">
                  <option value="eleven_v3">أداء تعبيري — مشاعر وتوجيه صوتي</option>
                  <option value="eleven_multilingual_v2">أداء طبيعي — صوت ثابت وواضح</option>
                </select>
              </label>
              {model === 'eleven_v3' && <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                <span className="mb-2 block">إحساس وأسلوب الأداء</span>
                <select value={emotion} onChange={(event) => setEmotion(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF5500]">
                  <option value="none">بدون توجيه — دع النص يحدد الإحساس</option>
                  <option value="excited">حماسي ومتحمس</option>
                  <option value="curious">فضولي ومتسائل</option>
                  <option value="sad">حزين ومؤثر</option>
                  <option value="mischievous">مرح وماكر</option>
                  <option value="whisper">همس هادئ</option>
                  <option value="shout">صوت مرتفع وحماسي</option>
                  <option value="laugh">ضحكة طبيعية</option>
                  <option value="sigh">تنهد وتعبير عاطفي</option>
                </select>
                <span className="mt-1 block text-[11px] font-normal leading-5 text-slate-500">يُطبَّق توجيه الإحساس على بداية النص لتحسين طريقة الإلقاء.</span>
              </label>}
              <label className="text-sm font-bold text-slate-700">
                <span className="flex justify-between mb-2"><span>الثبات</span><span>{Math.round(stability * 100)}%</span></span>
                <input className="w-full accent-[#FF5500]" type="range" min="0" max="1" step="0.05" value={stability} onChange={(event) => setStability(Number(event.target.value))} />
              </label>
              {model === 'eleven_multilingual_v2' && <>
              <label className="text-sm font-bold text-slate-700">
                <span className="flex justify-between mb-2"><span>التشابه مع الصوت</span><span>{Math.round(similarityBoost * 100)}%</span></span>
                <input className="w-full accent-[#FF5500]" type="range" min="0" max="1" step="0.05" value={similarityBoost} onChange={(event) => setSimilarityBoost(Number(event.target.value))} />
              </label>
              <label className="text-sm font-bold text-slate-700">
                <span className="flex justify-between mb-2"><span>إبراز أسلوب الصوت</span><span>{Math.round(style * 100)}%</span></span>
                <input className="w-full accent-[#FF5500]" type="range" min="0" max="1" step="0.05" value={style} onChange={(event) => setStyle(Number(event.target.value))} />
              </label>
              <label className="text-sm font-bold text-slate-700">
                <span className="flex justify-between mb-2"><span>السرعة</span><span>{speed.toFixed(2)}×</span></span>
                <input className="w-full accent-[#FF5500]" type="range" min="0.7" max="1.2" step="0.05" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
              </label>
              </>}
              </>}
            </div>

            <button
              onClick={generate}
              disabled={generating || loadingVoices || !text.trim() || (isLoggedIn && (!selectedVoiceId || !selectedVoice?.ttsReady))}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF5500] px-5 py-3.5 font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:bg-[#E34C00] disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : isLoggedIn ? <Volume2 className="w-5 h-5" /> : <LockKeyhole className="w-5 h-5" />}
              {generating ? 'جارٍ توليد الصوت...' : !isLoggedIn ? 'سجّل مجانًا وابدأ التوليد' : selectedVoice && !selectedVoice.ttsReady ? 'النموذج متاح للحجز البشري' : 'توليد الصوت'}
            </button>
          </div>

          <aside className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-900/10 lg:sticky lg:top-20">
            <div className="border-b border-white/10 p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF5500]"><Volume2 className="w-5 h-5" /></div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">{selectedProvider === 'munsit' ? 'WAV بجودة كاملة' : 'MP3 جاهز للتنزيل'}</span>
              </div>
              <h2 className="text-lg font-black">المعاينة الصوتية</h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">استمع للنتيجة ونزّل الملف أو أعد التوليد بالإعدادات نفسها.</p>
            </div>
            <div className="p-5 sm:p-6">

            {audioUrl ? (
              <div className="space-y-4">
                <audio controls autoPlay src={audioUrl} className="w-full" />
                <a href={audioUrl} download={`qeemavoice-tts.${selectedProvider === 'munsit' ? 'wav' : 'mp3'}`} className="w-full rounded-xl bg-white text-slate-950 px-4 py-3 font-black flex items-center justify-center gap-2 hover:bg-orange-50">
                  <Download className="w-4 h-4" /> تنزيل {selectedProvider === 'munsit' ? 'WAV' : 'MP3'}
                </a>
                <button onClick={generate} disabled={generating} className="w-full rounded-xl border border-slate-700 px-4 py-3 font-bold flex items-center justify-center gap-2 hover:bg-slate-900">
                  <RefreshCw className="w-4 h-4" /> توليد نسخة جديدة
                </button>
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 text-slate-600">
                <div className="flex items-end gap-1 h-12">{[18, 32, 44, 25, 38, 20, 46, 30, 16].map((height, index) => <span key={index} style={{ height }} className="w-1.5 rounded-full bg-slate-700" />)}</div>
              </div>
            )}

            {message && (
              <div className={`mt-5 rounded-xl p-3 text-xs leading-5 flex items-start gap-2 ${audioUrl ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-200'}`}>
                {audioUrl ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{message}</span>
              </div>
            )}
            </div>
          </aside>
        </div>

        {isLoggedIn && (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">تسجيلاتي</h2>
                <p className="mt-1 text-sm text-slate-500">آخر التسجيلات التي ولّدتها، جاهزة للاستماع والتنزيل.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{recordings.length} تسجيل</span>
            </div>
            {recordings.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {recordings.slice(0, 12).map((recording) => (
                  <article key={recording.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-slate-900">{recording.voiceName}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{recording.text}</p>
                      </div>
                      <a href={recording.audioUrl} download className="shrink-0 rounded-xl bg-white p-2 text-slate-700 shadow-sm hover:text-[#FF5500]" aria-label="تنزيل التسجيل"><Download className="h-4 w-4" /></a>
                    </div>
                    <audio controls preload="none" src={recording.audioUrl} className="h-9 w-full" />
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">أول تسجيل تولّده سيظهر هنا تلقائياً.</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export const TtsHistoryView: React.FC = () => {
  const [recordings, setRecordings] = useState<TtsRecording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/tts/history', { headers: { Accept: 'application/json' }, credentials: 'include' })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setRecordings(Array.isArray(data.recordings) ? data.recordings : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section dir="rtl" className="mx-auto max-w-6xl p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-950">تسجيلاتي</h1>
        <p className="mt-2 text-sm text-slate-500">سجل التسجيلات التي أنشأتها، مع إمكانية الاستماع والتنزيل في أي وقت.</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#FF5500]" /></div>
      ) : recordings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {recordings.map((recording) => (
            <article key={recording.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-slate-900">{recording.voiceName}</h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{recording.text}</p>
                  <p className="mt-2 text-[11px] text-slate-400">{recording.characters} حرف • {new Date(recording.createdAt).toLocaleString('ar')}</p>
                </div>
                <a href={recording.audioUrl} download className="shrink-0 rounded-xl bg-slate-100 p-2.5 text-slate-700 hover:bg-orange-50 hover:text-[#FF5500]" aria-label="تنزيل التسجيل"><Download className="h-4 w-4" /></a>
              </div>
              <audio controls preload="none" src={recording.audioUrl} className="h-10 w-full" />
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <Volume2 className="mx-auto h-9 w-9 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-600">لا توجد تسجيلات بعد</p>
          <p className="mt-1 text-xs text-slate-400">اذهب إلى تحويل النص إلى صوت وأنشئ أول تسجيل.</p>
        </div>
      )}
    </section>
  );
};
