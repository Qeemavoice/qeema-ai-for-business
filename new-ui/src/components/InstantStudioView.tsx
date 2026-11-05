import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Sliders, 
  Bookmark, 
  BookmarkCheck, 
  History, 
  Download, 
  Share2, 
  RotateCcw, 
  Volume2, 
  ShieldCheck, 
  Check, 
  Copy,
  Info,
  Layers,
  Building2,
  ChevronLeft
} from 'lucide-react';
import { VOICE_ARTISTS } from '../data/mockData';
import { audioSynth } from '../utils/audioSynthesizer';
import { ActiveView, VoiceArtist } from '../types';

interface InstantStudioViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const InstantStudioView: React.FC<InstantStudioViewProps> = ({ onNavigate }) => {
  const [sidebarTab, setSidebarTab] = useState<'generate' | 'favorites' | 'history' | 'why'>('generate');
  const [selectedArtistId, setSelectedArtistId] = useState<string>(VOICE_ARTISTS[0].id);
  const [promptText, setPromptText] = useState<string>(
    'أهلاً بكم في قيمة فويس، حيث نقدم لكم أحدث الحلول الصوتية بالذكاء الاصطناعي مع الحفاظ على أصالة اللهجات العربية ونقاء الصوت بجودة استوديو احترافية.'
  );
  const [speed, setSpeed] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([VOICE_ARTISTS[0].id]);
  const [historyList, setHistoryList] = useState<Array<{ id: string; text: string; artist: string; date: string }>>([
    {
      id: 'h1',
      text: 'نبتكر حلول الغد بثقة اليوم في أرض العطاء.',
      artist: 'طارق الشمري (QV-1042)',
      date: 'منذ 10 دقائق'
    },
    {
      id: 'h2',
      text: 'مرحباً بك في تطبيقنا الجديد، يسعدنا خدمتك.',
      artist: 'سارة الدوسري (QV-1088)',
      date: 'منذ ساعة'
    }
  ]);
  const [copied, setCopied] = useState(false);

  const selectedArtist: VoiceArtist = VOICE_ARTISTS.find(a => a.id === selectedArtistId) || VOICE_ARTISTS[0];

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePlayGeneration = () => {
    if (isPlaying) {
      audioSynth.stopAll();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    audioSynth.speakText(promptText, speed, pitch, () => {
      setIsPlaying(false);
    });

    // Add to history
    setHistoryList(prev => [
      {
        id: 'h-' + Date.now(),
        text: promptText.slice(0, 45) + (promptText.length > 45 ? '...' : ''),
        artist: `${selectedArtist.name} (${selectedArtist.code})`,
        date: 'الآن'
      },
      ...prev.slice(0, 7)
    ]);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">استوديو الأصوات الفوري (Instant Voices)</h1>
            <span className="text-[10px] bg-brand/10 text-brand-text font-bold px-2 py-0.5 rounded-full">v3.2</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تحويل نصوص إلى كلام فوري، تحكم دقيق بالنبرة والسرعة، ودعم كامل لكافة اللهجات العربية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('branded-voice')}
            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-brand-text" />
            <span>طلب صوت حصري لعلامتك</span>
          </button>
        </div>
      </div>

      {/* Main Studio Layout: Sidebar + Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar (Navigation & Sections) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-1">
            <button
              onClick={() => setSidebarTab('generate')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                sidebarTab === 'generate' ? 'bg-brand text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>لوحة التوليد الفوري</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setSidebarTab('favorites')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                sidebarTab === 'favorites' ? 'bg-brand text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                <span>الأصوات المفضلة</span>
              </div>
              <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full">{favorites.length}</span>
            </button>

            <button
              onClick={() => setSidebarTab('history')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                sidebarTab === 'history' ? 'bg-brand text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>سجل التوليد الأخير</span>
              </div>
              <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full">{historyList.length}</span>
            </button>

            <button
              onClick={() => setSidebarTab('why')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                sidebarTab === 'why' ? 'bg-brand text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>لماذا قيمة فويس؟</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Voice Info Card */}
          <div className="bg-[#1C120A] rounded-2xl p-4 border border-orange-500/20 text-white space-y-3">
            <div className="flex items-center justify-between text-xs text-brand-yellow font-bold">
              <span>الصوت النشط حالياً</span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-amber-200">{selectedArtist.code}</span>
            </div>

            <div className="flex items-center gap-3">
              <img src={selectedArtist.avatar} alt={selectedArtist.name} className="w-12 h-12 rounded-xl object-cover border border-orange-500/40" />
              <div>
                <h4 className="text-sm font-bold text-white">{selectedArtist.name}</h4>
                <p className="text-xs text-amber-200/70">{selectedArtist.dialect}</p>
              </div>
            </div>

            <p className="text-[11px] text-amber-100/60 leading-relaxed">
              {selectedArtist.bio}
            </p>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>مرخص تجارياً بالكامل</span>
              </span>
              <span className="font-mono text-slate-400">48kHz</span>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {sidebarTab === 'generate' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              
              {/* Voice Selection Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2.5">
                  اختر المعلق الصوتي المعتمد:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {VOICE_ARTISTS.map(artist => {
                    const isFav = favorites.includes(artist.id);
                    const isSelected = selectedArtistId === artist.id;
                    return (
                      <div
                        key={artist.id}
                        onClick={() => setSelectedArtistId(artist.id)}
                        className={`p-3 rounded-xl border text-right transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-brand bg-orange-50/70 ring-2 ring-brand/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={artist.avatar} alt={artist.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">{artist.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{artist.dialect.split('/')[0]}</div>
                            <div className="text-[10px] text-amber-700 font-mono">{artist.code}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(artist.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-brand-text"
                        >
                          {isFav ? <BookmarkCheck className="w-4 h-4 text-brand-text" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text Input Area */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-800">نص السكريبت للتوليد الفوري:</label>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <button onClick={handleCopyText} className="hover:text-brand-text flex items-center gap-1 cursor-pointer">
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                    </button>
                    <span>{promptText.length} حرف</span>
                  </div>
                </div>

                <textarea
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand/30 focus:border-brand leading-relaxed resize-none"
                  placeholder="اكتب أو الصق النص العربي المراد تحويله لصوت..."
                />
              </div>

              {/* Preset Prompts */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600">قوالب جاهزة حسب نوع المحتوى:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'إعلان ترويجي بنكي', text: 'يسرنا تقديم باقة الحلول التمويلية الرقمية الجديدة المصممة لتواكب تطلعات رواد الأعمال.' },
                    { label: 'رسالة هاتفية IVR', text: 'شكراً لاتصالكم بنا. لخدمات الحسابات اضغط الرقم واحد، للتحدث مع ممثل الخدمة اضغط الرقم صفر.' },
                    { label: 'ريلز وسوشيال ميديا', text: 'سرعة، توفير، وجودة مالهاش مثيل! حمل التطبيق النهاردة واستمتع بخصم خمسين في المية.' },
                    { label: 'سرد وثائقي فصيح', text: 'على مر العصور، بقيت شبه الجزيرة العربية مهداً للحضارات ومنارةً للأصالة والعراقة.' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPromptText(preset.text)}
                      className="text-xs bg-slate-100 hover:bg-orange-50 hover:text-brand-text text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls Bar: Sliders & Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-6">
                
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-slate-400" />
                    <span className="font-bold">السرعة: {speed}x</span>
                    <input
                      type="range"
                      min="0.75"
                      max="1.5"
                      step="0.25"
                      value={speed}
                      onChange={e => setSpeed(parseFloat(e.target.value))}
                      className="w-24 accent-brand"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">النبرة / الحدة: {pitch > 1 ? 'عالية' : pitch < 1 ? 'عميقة' : 'طبيعية'}</span>
                    <input
                      type="range"
                      min="0.8"
                      max="1.2"
                      step="0.1"
                      value={pitch}
                      onChange={e => setPitch(parseFloat(e.target.value))}
                      className="w-24 accent-brand"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSpeed(1);
                      setPitch(1);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                    title="إعادة ضبط"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    id="btn-studio-play"
                    onClick={handlePlayGeneration}
                    className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gradient-to-r from-brand-yellow to-brand-orange hover:from-brand-orange text-white shadow-brand/25'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 animate-pulse" />
                        <span>إيقاف التشغيل الصوتي</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>توليد واستماع للصوت الفوري</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          )}

          {sidebarTab === 'favorites' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">أصواتك المفضلة ({favorites.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {VOICE_ARTISTS.filter(a => favorites.includes(a.id)).map(artist => (
                  <div key={artist.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={artist.avatar} alt={artist.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{artist.name}</div>
                        <div className="text-xs text-slate-500">{artist.dialect}</div>
                        <div className="text-[10px] text-brand-text font-mono">{artist.code}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedArtistId(artist.id);
                        setSidebarTab('generate');
                      }}
                      className="text-xs font-bold bg-brand text-white px-3 py-1.5 rounded-lg"
                    >
                      استخدام
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sidebarTab === 'history' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">سجل المقاطع المُولدة</h3>
              <div className="space-y-3">
                {historyList.map(item => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-800">"{item.text}"</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>الصوت: {item.artist}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => audioSynth.speakText(item.text)}
                      className="flex items-center gap-1.5 text-xs font-bold text-brand-text hover:text-brand-text"
                    >
                      <Play className="w-3.5 h-3.5 fill-brand" />
                      <span>إعادة استماع</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sidebarTab === 'why' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">لماذا استوديو قيمة فويس يتفوق عربياً؟</h3>
              <ul className="text-xs text-slate-600 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-text shrink-0 mt-0.5" />
                  <span><strong>أصوات موثقة 100%:</strong> كل صوت في الاستوديو يرجع لمعلق بشري حقيقي مسجل في شبكتنا ويتقاضى أتعابه.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-text shrink-0 mt-0.5" />
                  <span><strong>مخارج الحروف العربية:</strong> لا وجود لأخطاء التشكيل أو اللكنة الغريبة المنتشرة في المنصات العالمية.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-text shrink-0 mt-0.5" />
                  <span><strong>جودة استوديو 48kHz:</strong> ملفات صوتية نقية جاهزة فوراً للإعلانات الإذاعية والتلفزيونية والبودكاست.</span>
                </li>
              </ul>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
