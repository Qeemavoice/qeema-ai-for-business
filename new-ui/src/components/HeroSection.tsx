import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sliders,
  Users,
  Building2,
  Volume2,
  RefreshCw,
  Award,
  Globe2,
  FileCheck
} from 'lucide-react';
import { SignatureWave } from './SignatureWave';
import { VOICE_ARTISTS } from '../data/mockData';
import { audioSynth } from '../utils/audioSynthesizer';
import { ActiveView } from '../types';

interface HeroSectionProps {
  onNavigate: (view: ActiveView) => void;
  onOpenChangelog: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onOpenChangelog }) => {
  const [heroWidgetTab, setHeroWidgetTab] = useState<'studio' | 'market' | 'branded'>('studio');
  const [selectedVoiceId, setSelectedVoiceId] = useState(VOICE_ARTISTS[0].id);
  const [sampleText, setSampleText] = useState(
    'أهلاً بكم في قيمة فويس، حيث تلتقي فصاحة اللسان العربي مع أحدث تقنيات الذكاء الاصطناعي الصوتي الأخلاقي.'
  );
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingArtistId, setPlayingArtistId] = useState<string | null>(null);

  const activeArtist = VOICE_ARTISTS.find(a => a.id === selectedVoiceId) || VOICE_ARTISTS[0];

  const handleGenerateVoice = () => {
    if (isPlaying) {
      audioSynth.stopAll();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    audioSynth.speakText(sampleText, speed, 1, () => {
      setIsPlaying(false);
    });
  };

  const handleArtistPlay = (artistId: string, quote: string) => {
    if (playingArtistId === artistId) {
      audioSynth.stopAll();
      setPlayingArtistId(null);
      return;
    }
    setPlayingArtistId(artistId);
    audioSynth.speakText(quote, 1, 1, () => {
      setPlayingArtistId(null);
    });
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16">
      {/* Background soft warm accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Top Breadcrumb & Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 bg-[#FF5500]/10 border border-[#FF5500]/25 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#E04400]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>التموضع الاستراتيجي الجديد: الإنسان أولاً، والذكاء الاصطناعي أداة</span>
          </div>

          <button
            onClick={onOpenChangelog}
            className="text-xs font-semibold text-slate-600 hover:text-[#FF5500] flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition"
          >
            <span>عرض تفاصيل ما تم إنجازه بالكود</span>
            <ArrowLeft className="w-3 h-3 text-[#FF5500]" />
          </button>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            بيانات صوتية. أصوات بشرية.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-[#E04400] to-[#F59E0B]">
              صوتٌ يصنع هويتك.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            نجمع بين عمق الخبرة لأكثر من <strong className="text-slate-900 font-bold">1,000 معلق صوتي عربي موثق</strong> وقوة استوديو الذكاء الاصطناعي الصوتي.
            كل نبرة مرخصة قانونياً، خالية من التدريب العشوائي، وبدقة استوديو 48kHz.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="btn-hero-instant-studio"
              onClick={() => onNavigate('instant-studio')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#E04400] hover:from-[#E04400] hover:to-[#C73800] text-white font-bold text-sm shadow-lg shadow-[#FF5500]/25 transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>افتح استوديو الأصوات الفوري</span>
            </button>

            <button
              id="btn-hero-branded-voice"
              onClick={() => onNavigate('branded-voice')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#FF5500]" />
              <span>صوت حصري لعلامتك (B2B)</span>
            </button>

            <button
              id="btn-hero-voice-data"
              onClick={() => onNavigate('voice-data')}
              className="px-5 py-3.5 rounded-xl bg-[#FAF8F5] hover:bg-white text-slate-700 font-semibold text-sm border border-dashed border-slate-300 transition flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>بيانات تدريب 48kHz</span>
            </button>
          </div>
        </div>

        {/* Signature Wave Visualizer Element */}
        <div className="max-w-4xl mx-auto">
          <SignatureWave />
        </div>

        {/* 6 Trust Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-[#FF5500]">1,000+</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">معلق صوتي معتمد</div>
            <div className="text-[10px] text-slate-400">مرخصون بعقود رسمية</div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900">+7,000</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">عميل وعلامة تجارية</div>
            <div className="text-[10px] text-slate-400">بنوك، شركات، ومنشآت</div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900">+10,000</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">مقطع صوتي منجز</div>
            <div className="text-[10px] text-slate-400">إعلانات وسرد وروبوتات</div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-[#FF5500]">+500</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">صوت AI مخصص</div>
            <div className="text-[10px] text-slate-400">هويات حصرية ومشتركة</div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900">كل اللهجات</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">العربية الأصيلة</div>
            <div className="text-[10px] text-slate-400">خليجي، شامي، مصري، مغاربي</div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900">5 لغات</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">عالمية إضافية</div>
            <div className="text-[10px] text-slate-400">الإنجليزية، الفرنسية...</div>
          </div>
        </div>

        {/* Interactive Demo Widget with 3 Tabs */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

          {/* Widget Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
            <button
              id="tab-widget-studio"
              onClick={() => setHeroWidgetTab('studio')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                heroWidgetTab === 'studio'
                  ? 'bg-white text-[#FF5500] shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#FF5500]" />
              <span>استوديو AI الفوري</span>
            </button>

            <button
              id="tab-widget-market"
              onClick={() => setHeroWidgetTab('market')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                heroWidgetTab === 'market'
                  ? 'bg-white text-[#FF5500] shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4 text-[#FF5500]" />
              <span>سوق الأصوات البشرية (1,000+)</span>
            </button>

            <button
              id="tab-widget-branded"
              onClick={() => setHeroWidgetTab('branded')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                heroWidgetTab === 'branded'
                  ? 'bg-white text-[#FF5500] shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#FF5500]" />
              <span>صوت حصري لعلامتك</span>
            </button>
          </div>

          {/* Tab 1: Interactive AI Studio Generator */}
          {heroWidgetTab === 'studio' && (
            <div className="p-5 sm:p-7 space-y-6">

              {/* Voice Selector Row */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  اختر صوت المعلق المعتمد:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {VOICE_ARTISTS.map(artist => (
                    <button
                      key={artist.id}
                      onClick={() => setSelectedVoiceId(artist.id)}
                      className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex items-center gap-2.5 ${
                        selectedVoiceId === artist.id
                          ? 'border-[#FF5500] bg-orange-50/60 ring-2 ring-[#FF5500]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{artist.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{artist.dialect.split('/')[0]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Area */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">النص المراد تحويله إلى صوت:</label>
                  <span className="text-[11px] text-slate-400">{sampleText.length} حرف</span>
                </div>
                <textarea
                  id="hero-sample-textarea"
                  value={sampleText}
                  onChange={e => setSampleText(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#FF5500]/30 focus:border-[#FF5500] leading-relaxed resize-none"
                  placeholder="اكتب النص العربي هنا..."
                />
              </div>

              {/* Quick Template Prompts */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">قوالب جاهزة:</span>
                {[
                  'إعلان مصرفي وطني',
                  'ترحيب خدمة عملاء IVR',
                  'إعلان متجر إلكتروني وسوشيال ميديا',
                  'سرد قصة بودكاست وثائقي'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx === 0) setSampleText('نبتكر حلول الغد بثقة اليوم، لخدمة تطلعاتكم المصرفية وفق أعلى معايير الأمان المالي.');
                      if (idx === 1) setSampleText('مرحباً بكم في مركز خدمة العملاء. يرجى الضغط على الرقم واحد للمبيعات أو الرقم اثنين للدعم الفني.');
                      if (idx === 2) setSampleText('عرض خاص لفترة محدودة! اطلب الآن واحصل على توصيل مجاني لباب بيتك مع كود الخصم الجديد.');
                      if (idx === 3) setSampleText('في سكون الليل وعلى أطراف الصحراء، كانت القوافل تنسج خيوط التاريخ تحت ضياء النجوم.');
                    }}
                    className="text-xs bg-slate-100 hover:bg-orange-50 hover:text-[#FF5500] text-slate-600 px-2.5 py-1 rounded-lg transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Controls and Generate Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>السرعة: {speed}x</span>
                    <input
                      type="range"
                      min="0.75"
                      max="1.5"
                      step="0.25"
                      value={speed}
                      onChange={e => setSpeed(parseFloat(e.target.value))}
                      className="w-20 accent-[#FF5500]"
                    />
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span>جواز QV: {activeArtist.code} موثق</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-hero-generate"
                    onClick={handleGenerateVoice}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gradient-to-r from-[#FF5500] to-[#E04400] hover:from-[#E04400] text-white shadow-[#FF5500]/20'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 animate-pulse" />
                        <span>إيقاف التشغيل</span>
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

          {/* Tab 2: Human Voice Market Preview */}
          {heroWidgetTab === 'market' && (
            <div className="p-5 sm:p-7 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">قاعدة بيانات الـ 1,000+ معلق صوتي حقيقي</h4>
                  <p className="text-xs text-slate-500">اختر الفنان واحجز تسجيل استوديو بشري مباشر أو اشترك بصوته الـ AI</p>
                </div>
                <button
                  onClick={() => onNavigate('instant-studio')}
                  className="text-xs font-bold text-[#FF5500] hover:underline"
                >
                  عرض جميع المعلقين
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {VOICE_ARTISTS.slice(0, 3).map(artist => (
                  <div key={artist.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={artist.avatar} alt={artist.name} className="w-12 h-12 rounded-full object-cover border" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900">{artist.name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 rounded">موثق</span>
                        </div>
                        <div className="text-xs text-slate-500">{artist.dialect}</div>
                        <div className="text-[10px] text-amber-700 font-mono">{artist.code}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      "{artist.sampleQuote}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                      <button
                        onClick={() => handleArtistPlay(artist.id, artist.sampleQuote)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#FF5500] hover:text-[#E04400]"
                      >
                        {playingArtistId === artist.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-[#FF5500]" />}
                        <span>{playingArtistId === artist.id ? 'إيقاف' : 'استمع للعينة'}</span>
                      </button>

                      <button
                        onClick={() => onNavigate('branded-voice')}
                        className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg font-medium"
                      >
                        طلب حجز
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Branded Voice Simulator */}
          {heroWidgetTab === 'branded' && (
            <div className="p-5 sm:p-7 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">الصوت المشترك</span>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">للكل</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800">مكتبة أصوات عامة</h4>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      <span>متاح لأي مشترك في المنصة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      <span>تكلفة منخفضة للاستخدام اليومي</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400">
                      <span>قد تستخدمه شركات منافسة في السوق</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border-2 border-[#FF5500] bg-orange-50/50 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bg-[#FF5500] text-white text-[10px] font-bold px-3 py-1 rounded-br-lg">
                    حصري للمؤسسات B2B
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FF5500] uppercase">الصوت الحصري المخصص</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">بصمة صوتية فريدة لعلامتك</h4>
                  <ul className="text-xs text-slate-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5500]" />
                      <span>ملك لك قانونياً بنسبة 100% ومشفر</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5500]" />
                      <span>مستنسخ من صوت ممثل معتمد أو سفيركم</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5500]" />
                      <span>حماية تامة من التزييف والتقليد</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => onNavigate('branded-voice')}
                  className="px-6 py-3 rounded-xl bg-[#FF5500] hover:bg-[#E04400] text-white font-bold text-xs shadow-md transition"
                >
                  استكشف حلول الصوت الحصري لعلامتك التجارية بالكامل
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
