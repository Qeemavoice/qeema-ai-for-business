import React, { useState, useEffect } from 'react';
import { 
  FileAudio, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  RotateCcw, 
  Search, 
  Calendar, 
  Clock, 
  Coins, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Generation, Voice } from '../types';
import { api } from '../lib/api';

interface MyAudioViewProps {
  onNavigateToGenerate: (extra: { voiceId?: string; text?: string }) => void;
}

export const MyAudioView: React.FC<MyAudioViewProps> = ({ onNavigateToGenerate }) => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      const res = await api.getGenerations();
      setGenerations(res.generations);
    } catch (err) {
      console.error('Failed to load generations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  const togglePlay = (gen: Generation) => {
    if (playingId === gen.id && audioInstance) {
      audioInstance.pause();
      setPlayingId(null);
      return;
    }

    if (audioInstance) {
      audioInstance.pause();
    }

    const audio = new Audio(gen.audioUrl);
    audio.play().catch(console.error);
    audio.onended = () => setPlayingId(null);
    setAudioInstance(audio);
    setPlayingId(gen.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا التسجيل؟')) return;
    try {
      await api.deleteGeneration(id);
      setGenerations(generations.filter(g => g.id !== id));
      if (playingId === id && audioInstance) {
        audioInstance.pause();
        setPlayingId(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filtered = generations.filter(g => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return g.text.toLowerCase().includes(q) || g.voiceName.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">سجل تسجيلاتي (My Audio)</h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700 font-mono">
              {generations.length} تسجيل
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            كافة المقاطع الصوتية المولدة لشركتكم بجودة استوديو، قابلة للاستماع والتحميل غير المحدود.
          </p>
        </div>

        <button
          onClick={() => onNavigateToGenerate({})}
          className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-orange transition-colors flex items-center gap-2 self-start sm:self-auto shadow-md shadow-brand/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>توليد مقطع جديد</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        <input
          type="text"
          placeholder="ابحث بالنص أو اسم الصوت..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand"
        />
      </div>

      {/* Generations List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">جارٍ تحميل التسجيلات الصوتية...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileAudio className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">لا توجد تسجيلات صوتية بعد</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            ابدأ بتوليد أول مقطع صوتي بالذكاء الاصطناعي الآن
          </p>
          <button
            onClick={() => onNavigateToGenerate({})}
            className="px-4 py-2 rounded-xl bg-brand-ink text-white text-xs font-semibold hover:bg-brand-ink/90 transition-colors"
          >
            الانتقال للاستوديو
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(gen => {
            const isPlaying = playingId === gen.id;
            const dateStr = new Date(gen.createdAt).toLocaleDateString('ar-SA', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={gen.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Play button & Text info */}
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => togglePlay(gen)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-105 shadow-sm ${
                      isPlaying
                        ? 'bg-brand text-white'
                        : 'bg-slate-100 text-slate-800 hover:bg-brand hover:text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{gen.voiceName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-50 text-brand-text font-bold">
                        {gen.dialect}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {gen.durationSeconds} ثانية
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Coins className="w-3 h-3 text-brand-text" />
                        {gen.creditsConsumed} نقطة
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      "{gen.text}"
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1 font-mono">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{gen.model}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <button
                    onClick={() => onNavigateToGenerate({ voiceId: gen.voiceId, text: gen.text })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    title="استخدام النص والإعدادات مجدداً في الاستوديو"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>إعادة استخدام</span>
                  </button>

                  <a
                    href={`${gen.audioUrl}?download=true`}
                    download={`${gen.id}.wav`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-ink text-white text-xs font-semibold hover:bg-brand-ink/90 transition-colors shadow-sm"
                    title="تحميل الملف الصوتي"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل</span>
                  </a>

                  <button
                    onClick={() => handleDelete(gen.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف من السجل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
