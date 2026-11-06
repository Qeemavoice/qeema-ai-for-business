import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles, Waves } from 'lucide-react';

export interface ShowcaseVoice {
  id: string;
  name: string;
  category: string;
  description: string;
  labels: Record<string, string> | string[];
  previewUrl: string;
  dialect: string;
  gender: 'male' | 'female';
  style: string;
  ttsReady: boolean;
}

interface VoiceExperienceShowcaseProps {
  voices: ShowcaseVoice[];
  providerName: string;
  selectedVoiceId: string;
  playingVoiceId: string | null;
  loading?: boolean;
  onSelect: (voiceId: string) => void;
  onPreview: (voice: ShowcaseVoice) => void;
}

const experiences = [
  {
    id: 'advertisement',
    label: 'إعلانات',
    description: 'أداء مقنع وحيوي يلفت الانتباه ويثبت الرسالة.',
    video: '/new-ui/voice-visuals/logo_liquid_ember.mp4',
    keywords: /إعلان|اعلان|تجاري|حماسي|ترويجي|promo|advert/i,
    accent: 'from-orange-500/35 via-rose-500/10 to-transparent',
  },
  {
    id: 'narration',
    label: 'سرد ووثائقي',
    description: 'صوت عميق ومتزن للقصص والأفلام والوثائقيات.',
    video: '/new-ui/voice-visuals/logo_liquid_lilac.mp4',
    keywords: /سرد|وثائق|قصص|قصة|روائي|narrat|story|document/i,
    accent: 'from-violet-500/35 via-fuchsia-500/10 to-transparent',
  },
  {
    id: 'characters',
    label: 'شخصيات',
    description: 'أداء تعبيري ومرح للشخصيات والمحتوى الإبداعي.',
    video: '/new-ui/voice-visuals/logo_liquid_garnet.mp4',
    keywords: /شخص|كرتون|مرح|تمثيل|درام|character|animation|dram/i,
    accent: 'from-red-500/35 via-orange-500/10 to-transparent',
  },
  {
    id: 'education',
    label: 'تعليمي وبودكاست',
    description: 'قراءة واضحة ومريحة للدروس والبودكاست والمحتوى الطويل.',
    video: '/new-ui/voice-visuals/logo_liquid_grove.mp4',
    keywords: /تعليم|بودكاست|هادئ|شرح|تدريب|education|podcast|calm/i,
    accent: 'from-emerald-500/35 via-lime-400/10 to-transparent',
  },
] as const;

function voiceSearchText(voice: ShowcaseVoice): string {
  const labels = Array.isArray(voice.labels) ? voice.labels : Object.values(voice.labels || {});
  return [voice.name, voice.category, voice.description, voice.style, voice.dialect, ...labels].join(' ');
}

export const VoiceExperienceShowcase: React.FC<VoiceExperienceShowcaseProps> = ({
  voices,
  providerName,
  selectedVoiceId,
  playingVoiceId,
  loading = false,
  onSelect,
  onPreview,
}) => {
  const cards = useMemo(() => {
    const used = new Set<string>();
    return experiences.map((experience, index) => {
      const matching = voices.find((voice) => !used.has(voice.id) && experience.keywords.test(voiceSearchText(voice)));
      const fallback = voices.find((voice) => !used.has(voice.id)) || voices[index % Math.max(voices.length, 1)];
      const voice = matching || fallback;
      if (voice) used.add(voice.id);
      return { ...experience, voice };
    }).filter((card) => Boolean(card.voice));
  }, [voices]);

  const selectedCardIndex = cards.findIndex((card) => card.voice?.id === selectedVoiceId);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (selectedCardIndex >= 0) setActiveIndex(selectedCardIndex);
  }, [selectedCardIndex]);

  useEffect(() => {
    if (!cards.length || cards.some((card) => card.voice?.id === selectedVoiceId)) return;
    const voice = cards[0]?.voice;
    if (voice) onSelect(voice.id);
  }, [cards, onSelect, selectedVoiceId]);

  const activate = (index: number) => {
    if (!cards.length) return;
    const normalized = (index + cards.length) % cards.length;
    setActiveIndex(normalized);
    const voice = cards[normalized]?.voice;
    if (voice) onSelect(voice.id);
  };

  if (loading) {
    return <div className="voice-showcase-skeleton h-[340px] rounded-[28px] bg-slate-950" aria-label="جارٍ تحميل تجارب الأصوات" />;
  }

  if (!cards.length) return null;

  const orderedCards = [-1, 0, 1].map((offset) => {
    const index = (activeIndex + offset + cards.length) % cards.length;
    return { ...cards[index], index, position: offset };
  });

  return (
    <section className="voice-showcase" aria-label="أنواع وتجارب الأصوات المتاحة">
      <div className="voice-showcase__header">
        <div>
          <span className="voice-showcase__eyebrow"><Sparkles className="h-3.5 w-3.5" /> تجارب صوتية حقيقية</span>
          <h3>اختر أسلوب الأداء، ثم استمع للصوت</h3>
          <p>كل بطاقة مرتبطة بصوت فعلي متاح من كتالوج {providerName}، وليست عينة وهمية.</p>
        </div>
        <span className="voice-showcase__provider"><Waves className="h-4 w-4" /> يعمل عبر {providerName}</span>
      </div>

      <div className="voice-showcase__stage">
        <button type="button" className="voice-showcase__arrow" onClick={() => activate(activeIndex - 1)} aria-label="النوع السابق">
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="voice-showcase__cards">
          {orderedCards.map((card) => {
            const voice = card.voice as ShowcaseVoice;
            const active = card.position === 0;
            const playing = playingVoiceId === voice.id;
            return (
              <article key={`${card.id}-${card.position}`} className={`voice-showcase__card ${active ? 'is-active' : 'is-side'}`}>
                <button type="button" className="voice-showcase__select" onClick={() => activate(card.index)} aria-label={`اختيار ${card.label} بصوت ${voice.name}`}>
                  <video
                    src={card.video}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload={active ? 'auto' : 'metadata'}
                    className="voice-showcase__video"
                    aria-hidden="true"
                  />
                  <span className={`voice-showcase__wash bg-gradient-to-t ${card.accent}`} />
                </button>
                <div className="voice-showcase__content">
                  <span className="voice-showcase__type">{card.label}</span>
                  <strong>{voice.name}</strong>
                  <span>{voice.dialect} · {voice.gender === 'female' ? 'صوت نسائي' : 'صوت رجالي'}</span>
                  {active && <p>{card.description}</p>}
                </div>
                <button
                  type="button"
                  className={`voice-showcase__play ${playing ? 'is-playing' : ''}`}
                  onClick={() => onPreview(voice)}
                  disabled={!voice.previewUrl}
                  aria-label={playing ? `إيقاف عينة ${voice.name}` : `تشغيل عينة ${voice.name}`}
                >
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                </button>
              </article>
            );
          })}
        </div>

        <button type="button" className="voice-showcase__arrow" onClick={() => activate(activeIndex + 1)} aria-label="النوع التالي">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="voice-showcase__tabs" role="tablist" aria-label="أنواع الأداء الصوتي">
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            className={activeIndex === index ? 'is-active' : ''}
            onClick={() => activate(index)}
          >
            {card.label}
          </button>
        ))}
      </div>
    </section>
  );
};
