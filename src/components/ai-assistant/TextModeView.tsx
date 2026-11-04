import React, { useEffect, useRef } from 'react';
import { Sparkles, Bot, Check, ShieldCheck, ArrowUpRight, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { AssistantMessage, AssistantLanguage } from './types';
import { VoiceCardItem } from './VoiceCardItem';
import { Voice } from '../../types';

interface TextModeViewProps {
  messages: AssistantMessage[];
  language: AssistantLanguage;
  isThinking: boolean;
  playingVoiceId: string | null;
  onTogglePlayVoice: (voiceId: string) => void;
  onSelectVoice?: (voice: Voice) => void;
  onSelectAction: (text: string) => void;
  onNavigateTo: (view: string, tab?: string) => void;
  onOpenDemo?: () => void;
}

export const TextModeView: React.FC<TextModeViewProps> = ({
  messages,
  language,
  isThinking,
  playingVoiceId,
  onTogglePlayVoice,
  onSelectVoice,
  onSelectAction,
  onNavigateTo,
  onOpenDemo
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isEn = language === 'en';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 text-xs md:text-sm"
      style={{ direction: isEn ? 'ltr' : 'rtl' }}
    >

      {/* Messages Stream */}
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl transition-all leading-relaxed ${
                isUser
                  ? 'bg-slate-900 text-white shadow-xs rounded-br-xs'
                  : 'bg-slate-100/90 text-slate-800 border border-slate-200/60 rounded-bl-xs'
              }`}
            >
              {!isUser && (
                <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-brand-text">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>QeemaVoice AI</span>
                </div>
              )}
              <p className="whitespace-pre-line text-xs md:text-[13px]">{msg.text}</p>
            </div>

            {/* Rich Card Attachments */}
            {msg.cardType === 'voice_list' && msg.cardData?.voices && msg.cardData.voices.length > 0 && (
              <div className="w-full space-y-2 mt-1 max-w-[95%]">
                <div className="space-y-2">
                  {msg.cardData.voices.map((v) => (
                    <VoiceCardItem
                      key={v.id}
                      voice={v}
                      isPlaying={playingVoiceId === v.id}
                      onTogglePlay={onTogglePlayVoice}
                      onSelectVoice={onSelectVoice}
                      lang={language}
                    />
                  ))}
                </div>

                {msg.cardData.targetView && (
                  <button
                    onClick={() => onNavigateTo(msg.cardData!.targetView!, msg.cardData?.targetTab)}
                    className="w-full py-2 px-3 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>{msg.cardData.ctaLabel || (isEn ? 'View Voice Library' : 'فتح مكتبة الأصوات')}</span>
                    {isEn ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            )}

            {/* Pricing Cards */}
            {msg.cardType === 'pricing' && msg.cardData?.plans && (
              <div className="w-full space-y-2.5 mt-1 max-w-[95%]">
                <div className="grid grid-cols-1 gap-2.5">
                  {msg.cardData.plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        plan.highlight
                          ? 'bg-gradient-to-b from-orange-50/70 to-white border-orange-300 shadow-xs ring-1 ring-orange-200'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-slate-900 text-xs md:text-sm">
                            {isEn ? plan.nameEn : plan.nameAr}
                          </h5>
                          {plan.highlight && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand text-white">
                              {isEn ? 'Popular' : 'الأكثر طلباً'}
                            </span>
                          )}
                        </div>
                        <div className="text-right font-black text-slate-900 text-sm">
                          ${plan.priceUsd}
                          <span className="text-[10px] font-normal text-slate-500">/{plan.period}</span>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        {plan.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigateTo('billing')}
                  className="w-full py-2.5 bg-brand hover:bg-brand-orange text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <span>{isEn ? 'View Complete Pricing & Upgrade' : 'عرض تفاصيل كافة الباقات والترقية'}</span>
                  {isEn ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Licensing Card */}
            {msg.cardType === 'licensing' && (
              <div className="w-full bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-2xl max-w-[95%] space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isEn ? '100% Commercial Broadcast Rights' : 'ترخيص تجاري كامل وبث حر 100%'}</span>
                </div>
                <div className="space-y-1">
                  {msg.cardData?.details?.map((d, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-950">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onNavigateTo('client-dashboard')}
                  className="w-full mt-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <span>{isEn ? 'Explore Licensing Hub' : 'الاطلاع على وثائق التراخيص'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Voice Cloning / Twins Card */}
            {msg.cardType === 'cloning' && (
              <div className="w-full bg-gradient-to-r from-purple-50 to-orange-50 border border-purple-200 p-3.5 rounded-2xl max-w-[95%] space-y-2">
                <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>{isEn ? 'Enterprise Voice Twins' : 'التوأم الصوتي المخصص للمنشآت'}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isEn
                    ? 'Train a bespoke neural voice model for your brand with certified security, 98%+ accuracy, and biometrics.'
                    : 'قم ببناء نموذج صوتي ذكي مخصص لعلامتك التجارية بدقة استثنائية مع تشفير آمن لبيانات الصوت.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigateTo('branded-voice')}
                    className="flex-1 py-2 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <span>{isEn ? 'Voice Twins' : 'التوأم الصوتي'}</span>
                  </button>
                  {onOpenDemo && (
                    <button
                      onClick={onOpenDemo}
                      className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <span>{isEn ? 'Request Demo' : 'طلب ديمو تجريبي'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* How It Works Card */}
            {msg.cardType === 'how_it_works' && (
              <div className="w-full bg-white border border-slate-200 p-3.5 rounded-2xl max-w-[95%] space-y-2 shadow-2xs">
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-brand-text font-bold text-[10px] flex items-center justify-center">1</span>
                    <span>{isEn ? 'Choose an AI voice or certified human actor' : 'اختر صوتاً ذكياً أو احجز معلقاً بشرياً'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-brand-text font-bold text-[10px] flex items-center justify-center">2</span>
                    <span>{isEn ? 'Enter your text or upload audio script' : 'أدخل النص مع ضبط النبرة والسرعة'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-brand-text font-bold text-[10px] flex items-center justify-center">3</span>
                    <span>{isEn ? 'Export studio WAV with commercial licensing' : 'حمّل التسجيل فوراً مع شهادة الترخيص'}</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTo('how-it-works')}
                  className="w-full mt-2 py-2 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>{isEn ? 'Learn More' : 'شرح تفصيلي للمنصة'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Suggested Replies Chips */}
            {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {msg.suggestedReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectAction(reply)}
                    className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-200/80 hover:border-orange-300 text-slate-700 hover:text-brand-text rounded-full text-[11px] font-semibold transition-all shadow-2xs active:scale-95"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Thinking / Searching Indicator */}
      {isThinking && (
        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl w-fit animate-pulse">
          <div className="w-2 h-2 rounded-full bg-brand animate-ping" />
          <span className="text-xs font-medium">
            {isEn ? 'Thinking and searching QeemaVoice...' : 'جاري التفكير والبحث في منصة قيمة...'}
          </span>
        </div>
      )}
    </div>
  );
};
