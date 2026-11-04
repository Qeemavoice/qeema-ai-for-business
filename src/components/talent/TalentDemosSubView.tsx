import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Share2, 
  Download, 
  Headphones, 
  Sparkles, 
  Heart, 
  Check, 
  X, 
  Radio, 
  UploadCloud,
  FileAudio,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { TalentDemo } from '../../data/talentMockData';
import { audioSynth } from '../../utils/audioSynthesizer';

interface TalentDemosSubViewProps {
  demos: TalentDemo[];
  onAddNewDemo?: (demo: TalentDemo) => void;
}

export const TalentDemosSubView: React.FC<TalentDemosSubViewProps> = ({
  demos: initialDemos,
  onAddNewDemo
}) => {
  const [demos, setDemos] = useState<TalentDemo[]>(initialDemos);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [playingDemoId, setPlayingDemoId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New demo form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('إعلانات تجارية (Commercial)');
  const [newDialect, setNewDialect] = useState('سعودي نجدي فخم');
  const [newDuration, setNewDuration] = useState('0:45');
  const [newScript, setNewScript] = useState('');
  const [newTags, setNewTags] = useState('إعلانات, تسويق');

  const categories = [
    { key: 'all', label: 'جميع العينات' },
    { key: 'commercial', label: 'إعلانات تجارية' },
    { key: 'documentary', label: 'وثائقي وسرد' },
    { key: 'ivr', label: 'رد آلي وسنترال' },
    { key: 'dubbing', label: 'دوبلاج وشخصيات' },
    { key: 'audiobook', label: 'كتب وبودكاست' }
  ];

  const filteredDemos = demos.filter(d => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'commercial') return d.category.includes('Commercial') || d.category.includes('إعلانات');
    if (activeCategory === 'documentary') return d.category.includes('Documentary') || d.category.includes('وثائقي');
    if (activeCategory === 'ivr') return d.category.includes('IVR') || d.category.includes('رد آلي');
    if (activeCategory === 'dubbing') return d.category.includes('دوبلاج');
    if (activeCategory === 'audiobook') return d.category.includes('كتب');
    return true;
  });

  const handleTogglePlay = (demo: TalentDemo) => {
    if (playingDemoId === demo.id) {
      audioSynth.stopAll();
      setPlayingDemoId(null);
    } else {
      audioSynth.stopAll();
      setPlayingDemoId(demo.id);
      audioSynth.playAcousticPreview(() => {
        setPlayingDemoId(null);
      }, 5);
    }
  };

  const handleCopyShowreel = () => {
    try {
      navigator.clipboard.writeText(window.location.origin + '?view=talent-showreel&talent=QV-1042');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCreateDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const created: TalentDemo = {
      id: `demo-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      dialect: newDialect,
      duration: newDuration,
      playsCount: 1,
      likesCount: 0,
      sampleRate: '48kHz / 24-bit WAV',
      tags: newTags.split(',').map(t => t.trim()),
      audioFrequency: 220,
      scriptExcerpt: newScript || 'عينة صوتية احترافية مسجلة في كابينة الاستوديو المنزلي.'
    };

    setDemos([created, ...demos]);
    if (onAddNewDemo) onAddNewDemo(created);
    setIsAddModalOpen(false);
    // Reset
    setNewTitle('');
    setNewScript('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>معرض العينات الصوتية (Showreels & Demos)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {demos.length} نماذج
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            العينات المعروضة للمخرجين ووكالات الإعلان والعملاء في سوق الأصوات
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyShowreel}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-slate-400" />}
            <span>{copiedLink ? 'تم نسخ الرابط!' : 'مشاركة البورتفوليو'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand hover:bg-orange-600 text-white transition-all cursor-pointer shadow-lg shadow-orange-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عينة صوتية</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === cat.key
                ? 'bg-slate-800 text-white border border-brand shadow-sm'
                : 'bg-brand-ink text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Demos Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDemos.map(demo => {
          const isPlaying = playingDemoId === demo.id;
          return (
            <div
              key={demo.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                isPlaying ? 'border-brand shadow-xl shadow-orange-950/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-brand-text border border-slate-700">
                    {demo.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {demo.sampleRate}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-1">
                  {demo.title}
                </h3>

                <p className="text-xs text-slate-400 mb-3">
                  اللهجة: <strong className="text-slate-200">{demo.dialect}</strong>
                </p>

                {/* Script excerpt quote */}
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 mb-4 text-xs text-slate-300 italic line-clamp-2">
                  "{demo.scriptExcerpt}"
                </div>

                {/* Animated Waveform Visualizer Bar */}
                <div className="h-10 bg-slate-950 rounded-xl p-2 flex items-center justify-between gap-1 mb-4 border border-slate-800">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const heightPercent = isPlaying 
                      ? Math.min(100, Math.max(15, ((Math.sin(i * 0.7 + Date.now() / 200) + 1) / 2) * 90))
                      : 20 + ((i % 5) * 12);
                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isPlaying ? 'bg-brand' : 'bg-slate-700'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Bottom Playbar & Stats */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-slate-500" />
                    <span>{demo.playsCount}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500/70" />
                    <span>{demo.likesCount}</span>
                  </span>
                </div>

                <button
                  onClick={() => handleTogglePlay(demo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-md ${
                    isPlaying 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : 'bg-brand hover:bg-orange-600 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>إيقاف</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>استماع ({demo.duration})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Demo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-right">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute left-5 top-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">
              إضافة عينة صوتية جديدة للبورتفوليو
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              ارفع ملف WAV أو ادخل تفاصيل العينة المسجلة في الاستوديو
            </p>

            <form onSubmit={handleCreateDemo} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">عنوان العينة:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: إعلان مصرفي - نبرة وطنية فخمة"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">التصنيف:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand"
                  >
                    <option value="إعلانات تجارية (Commercial)">إعلانات تجارية</option>
                    <option value="أفلام وثائقية (Documentary)">أفلام وثائقية</option>
                    <option value="أنظمة IVR وسنترال">أنظمة IVR وسنترال</option>
                    <option value="دوبلاج وتمثيل صوتي">دوبلاج وتمثيل صوتي</option>
                    <option value="كتب مسموعة وبودكاست">كتب وبودكاست</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">اللهجة:</label>
                  <input
                    type="text"
                    value={newDialect}
                    onChange={(e) => setNewDialect(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">نص العينة:</label>
                <textarea
                  value={newScript}
                  onChange={(e) => setNewScript(e.target.value)}
                  placeholder="اكتب النص الذي تم تسجيله في العينة..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand h-20 resize-none"
                />
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-center cursor-pointer hover:border-brand">
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-300 block">انقر لاختيار ملف صوتي (WAV / FLAC 48kHz)</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-brand hover:bg-orange-600 text-white transition-all cursor-pointer shadow-lg shadow-orange-600/30"
                >
                  حفظ العينة ونشرها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
