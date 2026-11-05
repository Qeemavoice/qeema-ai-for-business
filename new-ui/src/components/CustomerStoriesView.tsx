import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Headphones,
  ExternalLink,
  MessageSquareQuote,
  Filter,
  Layers,
  Radio,
  BookOpen,
  Phone,
  Film,
  Mic
} from 'lucide-react';
import { ActiveView } from '../types';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { STORIES, STORY_VOICE_CATEGORIES as VOICE_CATEGORIES, STORY_INDUSTRIES as INDUSTRIES, recordToStory, type Story } from '../data/stories';

interface CustomerStoriesViewProps {
  onNavigate?: (view: ActiveView, extra?: any) => void;
  onOpenDemo?: () => void;
  /** Set on /ar/our-works/:storyId -> show that story; unset -> filters + logo grid */
  storyId?: string;
}

/** Client logo, or the brand's first letter on its colour until a logo is uploaded from the dashboard. */
const StoryLogo: React.FC<{ story: Story; className?: string }> = ({ story, className = '' }) => story.logoUrl ? (
  <img src={story.logoUrl} alt={`شعار ${story.brand}`} loading="lazy" className={`object-contain ${className}`} />
) : (
  <div className={`rounded-2xl text-white font-black flex items-center justify-center ${className}`} style={{ backgroundColor: story.brandColor }}>
    {story.brand.trim().charAt(0)}
  </div>
);

export const CustomerStoriesView: React.FC<CustomerStoriesViewProps> = ({
  onNavigate,
  onOpenDemo,
  storyId
}) => {
  // Classification Filter State
  const [filterMode, setFilterMode] = useState<'voiceCategory' | 'industry'>('voiceCategory');
  const [selectedVoiceCategory, setSelectedVoiceCategory] = useState<string>('الكل');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('الكل');

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [stories, setStories] = useState<Story[]>(STORIES);
  // Hidden until the dashboard list arrives, so stories deleted there never flash from the built-in list
  const [loaded, setLoaded] = useState(false);

  // Published stories managed from the admin dashboard ("قصص النجاح")
  useEffect(() => {
    api.getPublishedStories().then(items => { if (items.length) setStories(items.map(recordToStory)); }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  // Filter stories based on selected mode
  const filteredStories = stories.filter(story => {
    if (filterMode === 'voiceCategory') {
      if (selectedVoiceCategory === 'الكل') return true;
      return story.voiceCategory === selectedVoiceCategory;
    } else {
      if (selectedIndustry === 'الكل') return true;
      return story.industry === selectedIndustry;
    }
  });

  const activeStory = storyId ? stories.find(s => s.id === storyId) : undefined;

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [audioSecs, setAudioSecs] = useState<number | null>(null);
  const [clipIdx, setClipIdx] = useState(0);
  // Main sample + optional extra clips from the dashboard (the main one isn't repeated if it's also listed)
  const extraClips = (activeStory?.clips || []).filter(c => c.url);
  const playlist = [
    ...(activeStory?.audioUrl && !extraClips.some(c => c.url === activeStory.audioUrl) ? [{ title: 'العينة الأساسية', url: activeStory.audioUrl }] : []),
    ...extraClips
  ];
  const clip = playlist[clipIdx];
  const audioSrc = clip?.url;

  // New story or clip selected: stop and reset the player
  useEffect(() => { setIsPlayingAudio(false); setAudioProgress(0); setAudioSecs(null); }, [activeStory?.id, clipIdx]);
  useEffect(() => setClipIdx(0), [activeStory?.id]);

  const handleToggleAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
    else { a.pause(); setIsPlayingAudio(false); }
  };
  const fmtSecs = (t: number) => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`;


  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 ${loaded ? '' : 'invisible'}`} dir="rtl">
      
      {!storyId && <>
      {/* Dual Classification Filter Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Top Filter Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              تصفح قصص العملاء والتجارب الناجحة
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              اختر عرض القصص حسب تصنيف التعليق الصوتي أو حسب مجال الشركة والقطاع.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => { setFilterMode('voiceCategory'); setSelectedIndustry('الكل'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                filterMode === 'voiceCategory'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>حسب تصنيف التعليق الصوتي</span>
            </button>
            <button
              onClick={() => { setFilterMode('industry'); setSelectedVoiceCategory('الكل'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                filterMode === 'industry'
                  ? 'bg-brand-ink text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>حسب مجال الشركة (العميل)</span>
            </button>
          </div>
        </div>

        {/* Filter Pills based on active mode */}
        <div>
          <div className="text-xs font-bold text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-text" />
            <span>
              {filterMode === 'voiceCategory' 
                ? 'تصنيفات التعليق الصوتي المتاحة:' 
                : 'قطاعات ومجالات الشركات:'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {filterMode === 'voiceCategory' ? (
              VOICE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedVoiceCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedVoiceCategory === cat
                      ? 'bg-brand text-white shadow-sm shadow-brand/25'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))
            ) : (
              INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedIndustry === ind
                      ? 'bg-brand-ink text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {ind}
                </button>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Client logos: each opens its story page */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredStories.map(story => (
          <Link
            key={story.id}
            to={`/ar/our-works/${story.id}`}
            title={`قصة نجاح ${story.brand}`}
            className="group bg-white rounded-3xl border border-slate-200 hover:border-brand hover:shadow-md transition-all p-5 flex items-center justify-center"
          >
            {/* Logo only: gray, its own colours on hover. The name stays for search engines and screen readers. */}
            <div className="h-20 w-full flex items-center justify-center grayscale opacity-60 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:opacity-100">
              <StoryLogo story={story} className={story.logoUrl ? 'max-h-20 max-w-full' : 'w-16 h-16 text-2xl'} />
            </div>
            <h2 className="sr-only">{story.brand}</h2>
          </Link>
        ))}
        {!filteredStories.length && (
          <p className="col-span-full text-center text-sm text-slate-500 py-10">لا توجد قصص في هذا التصنيف حالياً.</p>
        )}
      </div>
      </>}

      {storyId && loaded && !activeStory && (
        <div className="text-center py-16 space-y-4">
          <p className="text-sm text-slate-600">لم نجد هذه القصة.</p>
          <Link to="/ar/our-works" className="inline-flex px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold">كل قصص النجاح</Link>
        </div>
      )}

      {/* Story page, laid out as an article: label, title, meta, voice sample, body, project details, similar stories */}
      {activeStory && (
        <article className="max-w-3xl mx-auto animate-in fade-in">
          <Link to="/ar/our-works" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text hover:text-brand-orange">
            <ArrowRight className="w-4 h-4" />
            قصص النجاح
          </Link>

          <div className="flex items-center gap-3 mt-6">
            <div className="h-12 w-12 shrink-0 flex items-center justify-center bg-white rounded-2xl border border-slate-200 p-1.5">
              <StoryLogo story={activeStory} className={activeStory.logoUrl ? 'max-h-full max-w-full' : 'w-full h-full text-lg'} />
            </div>
            <span className="text-sm font-black text-slate-800">{activeStory.brand}</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {activeStory.title}
          </h1>

          {/* Meta row */}
          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {[
              ['العميل', activeStory.brand],
              ['المجال', activeStory.industry],
              ['تصنيف التعليق', activeStory.voiceCategory],
              ['التاريخ', activeStory.date]
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-slate-400">{k}</dt>
                <dd className="mt-0.5 font-bold text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Voice sample (the actual recording delivered to the client) + CTAs */}
          <div className="mt-8 py-5 border-y border-slate-200 space-y-3">
            {playlist.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {playlist.map((c, i) => (
                  <button key={c.url} onClick={() => setClipIdx(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      i === clipIdx ? 'bg-brand-ink text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}>
                    {c.title}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {audioSrc ? (
                <div className="flex items-center gap-3 min-w-0">
                  <audio
                    key={audioSrc}
                    ref={audioRef}
                    src={audioSrc}
                    preload="metadata"
                    onLoadedMetadata={e => setAudioSecs(e.currentTarget.duration || null)}
                    onTimeUpdate={e => { const a = e.currentTarget; setAudioProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0); }}
                    onEnded={() => { setIsPlayingAudio(false); setAudioProgress(0); }}
                  />
                  <button
                    onClick={handleToggleAudio}
                    aria-label={isPlayingAudio ? 'إيقاف' : 'تشغيل'}
                    className="w-11 h-11 shrink-0 rounded-full bg-brand hover:bg-brand-orange text-white flex items-center justify-center transition shadow-md cursor-pointer"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900">
                      {playlist.length > 1 ? `استمع إلى العينة: ${clip.title}` : 'استمع إلى العينة الصوتية'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand transition-all duration-300" style={{ width: `${audioProgress}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                        {audioSecs ? fmtSecs(audioSecs) : activeStory.audioDuration}
                      </span>
                    </div>
                  </div>
                </div>
              ) : <span />}
              <div className="flex items-center gap-2">
                <Link to="/ar/contact-us" className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold transition">
                  تواصل معنا
                </Link>
                <a href={activeStory.voiceUrl || '/ar/voices'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-ink hover:opacity-90 text-white text-xs font-bold transition">
                  <Mic className="w-4 h-4" />
                  {activeStory.voiceButtonText?.trim() || 'اطلب نفس الصوت'}
                </a>
              </div>
            </div>
          </div>

          {/* Article body */}
          <div className="mt-8 text-sm sm:text-base text-slate-700 leading-8 space-y-5">
            {activeStory.about && (
              <section className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <h2 className="text-sm font-black text-slate-950 mb-1.5">عن {activeStory.brand}</h2>
                <p className="text-sm text-slate-700 leading-7">{activeStory.about}</p>
              </section>
            )}
            {activeStory.heroSubtitle && <p className="text-base sm:text-lg text-slate-900 font-semibold leading-8">{activeStory.heroSubtitle}</p>}
            {activeStory.contentHtml ? (
              // Written by admins in the dashboard's rich text editor (same trust as the CMS pages)
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: activeStory.contentHtml }} />
            ) : activeStory.paragraphs.map((p, idx) => <p key={idx}>{p}</p>)}

            {activeStory.quote.text && (
              <figure className="my-8 border-r-4 border-brand pr-5">
                <blockquote className="text-lg sm:text-xl font-bold text-slate-900 leading-9">«{activeStory.quote.text}»</blockquote>
                <figcaption className="mt-3 text-xs text-slate-500">
                  <span className="font-bold text-slate-800">{activeStory.quote.author}</span>
                  {activeStory.quote.role && ` - ${activeStory.quote.role}`}
                </figcaption>
              </figure>
            )}

            {activeStory.stats.length > 0 && (
              <section className="pt-4">
                <h2 className="text-xl font-black text-slate-950 mb-4">تفاصيل المشروع</h2>
                <table className="w-full text-sm">
                  <tbody>
                    {activeStory.stats.map((stat, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="py-3 text-slate-600">{stat.label}</td>
                        <td className="py-3 text-left font-black text-slate-950">{stat.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeStory.highlights.length > 0 && (
              <section className="pt-4">
                <h2 className="text-xl font-black text-slate-950 mb-3">أبرز ما في المشروع</h2>
                <ul className="list-disc pr-5 space-y-1.5">
                  {activeStory.highlights.map((h, idx) => <li key={idx}>{h}</li>)}
                </ul>
              </section>
            )}
          </div>

          {/* Similar stories: same industry first, then same voice category */}
          {(() => {
            const others = stories.filter(s => s.id !== activeStory.id);
            const similar = [...others.filter(s => s.industry === activeStory.industry), ...others.filter(s => s.industry !== activeStory.industry && s.voiceCategory === activeStory.voiceCategory)].slice(0, 3);
            return similar.length > 0 && (
              <section className="mt-14 pt-8 border-t border-slate-200">
                <h2 className="text-lg font-black text-slate-950 mb-4">قصص مشابهة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similar.map(s => (
                    <Link key={s.id} to={`/ar/our-works/${s.id}`} className="group rounded-2xl border border-slate-200 hover:border-brand p-4 transition">
                      <div className="h-10 w-10 flex items-center justify-center mb-3">
                        <StoryLogo story={s} className={s.logoUrl ? 'max-h-10 max-w-full' : 'w-10 h-10 text-sm'} />
                      </div>
                      <p className="text-xs font-bold text-slate-900 leading-6 group-hover:text-brand-text">{s.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{s.industry}</p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })()}
        </article>
      )}

    </div>
  );
};
