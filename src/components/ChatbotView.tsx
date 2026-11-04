import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Volume2, 
  Play, 
  Pause, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Bot, 
  User, 
  Zap, 
  HelpCircle,
  CreditCard,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Voice, ActiveView } from '../types';
import { assistantService } from '../services/assistantService';
import { AssistantMessage } from './ai-assistant/types';
import { GlassyVoiceOrb } from './GlassyVoiceOrb';

interface ChatbotViewProps {
  voices: Voice[];
  onNavigate: (view: ActiveView, extra?: { voiceId?: string; text?: string; tab?: 'human' | 'ai' | 'my-voices' }) => void;
  onOpenSignup?: () => void;
  onOpenDemo?: () => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  voices,
  onNavigate,
  onOpenSignup,
  onOpenDemo
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Hidden audio element for previews
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize with welcoming message focused on Phase 1 features: TTS & AI voice/model recommendation
  useEffect(() => {
    const welcomeMsg: AssistantMessage = {
      id: 'welcome-phase1',
      sender: 'assistant',
      text: 'مرحباً بك في «الشات بوت الصوتي الذكي» من قيمة فويس! 🎙️✨\n\nأنا هنا لمساعدتك في ترشيح أفضل الأصوات المناسبة لمشروعك، وتحديد النموذج الصوتي (AI Model) الأمثل لمتطلباتك. يمكنك أيضاً تجربة أي صوت مباشرة في استوديو تحويل النص إلى صوت (TTS).\n\nكيف تود أن نبدأ اليوم؟',
      timestamp: Date.now(),
      suggestedReplies: [
        'رشح لي صوتاً إعلانياً سعودياً حماسياً',
        'أريد صوتاً وثائقياً فخماً ووقوراً',
        'أبحث عن صوت نسائي مصري هادئ لبودكاست',
        'ما هي نماذج الذكاء الاصطناعي المتاحة وما الفروق بينها؟',
        'عرض باقات وأسعار خدمة تحويل النص إلى صوت'
      ]
    };
    setMessages([welcomeMsg]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Audio Playback
  const handleTogglePlayVoice = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingVoiceId(null);
      return;
    }

    const voice = voices.find(v => v.id === voiceId);
    if (!voice) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = voice.previewUrl || 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3';
      audioRef.current.play()
        .then(() => setPlayingVoiceId(voiceId))
        .catch(() => {
          // Fallback to SpeechSynthesis
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(voice.description || 'مرحباً بك في استوديو قيمة للذكاء الصوتي.');
            utter.lang = 'ar-SA';
            utter.onend = () => setPlayingVoiceId(null);
            window.speechSynthesis.speak(utter);
            setPlayingVoiceId(voiceId);
          }
        });
    }
  };

  // Helper to determine the best AI model for a voice
  const getRecommendedModelForVoice = (voice: Voice) => {
    if (voice.dialect === 'gulf' || voice.dialect === 'egyptian' || voice.dialect === 'levantine' || voice.dialect === 'maghrebi') {
      return {
        id: 'qeema-multilingual-v2',
        name: 'محرك قيمة المتعدد للهجات (Qeema Multilingual v2)',
        desc: 'أعلى دقة للمخارج المحلية والتلوين الصوتي العاطفي'
      };
    }
    return {
      id: 'qeema-neural-v3',
      name: 'محرك قيمة العصبي فائق الجودة (Qeema Neural HD v3)',
      desc: 'دقة استوديو 48kHz وتشكيل فصيح فائق النقاء'
    };
  };

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    const userMessage: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      const q = query.toLowerCase();

      // Check if user is asking about deferred features:
      const isAskingDeferredCloning = q.includes('استنساخ') || q.includes('توأم') || q.includes('توأمة') || q.includes('بصمة صوتية') || q.includes('clone') || q.includes('twin');
      const isAskingDeferredDubbing = q.includes('دبلجة') || q.includes('دوبلاج') || q.includes('dubbing');
      const isAskingDeferredAPI = q.includes('api') || q.includes('مطور') || q.includes('ربط برمجي') || q.includes('webhook');
      const isAskingDeferredData = q.includes('بيانات تدريب') || q.includes('داتا') || q.includes('تدريب النماذج') || q.includes('dataset');

      if (isAskingDeferredCloning || isAskingDeferredDubbing || isAskingDeferredAPI || isAskingDeferredData) {
        setTimeout(() => {
          let featureName = 'هذه الميزة';
          if (isAskingDeferredCloning) featureName = 'ميزة الاستنساخ الصوتي والتوأمة';
          else if (isAskingDeferredDubbing) featureName = 'ميزة الدبلجة الصوتية';
          else if (isAskingDeferredAPI) featureName = 'واجهات الربط البرمجي للمطورين (API)';
          else if (isAskingDeferredData) featureName = 'صفحة مجموعات البيانات الصوتية للتدريب';

          const reply: AssistantMessage = {
            id: `reply-${Date.now()}`,
            sender: 'assistant',
            text: `نود إحاطتك بأن **${featureName}** مجدولة للإطلاق في المراحل القادمة ضمن خريطة طريق المنصة 🚀.\n\nحالياً في **المرحلة الأولى** نركز بالكامل على تقديم أعلى جودة ممكنة في:\n1. **ميزة تحويل النص إلى صوت (TTS)** عبر استوديو متطور فائق الواقعية ومضبوط التشكيل.\n2. **الشات بوت الصوتي الذكي** لمساعدتك في ترشيح أنسب الأصوات والنماذج لاحتياجاتك.\n\nهل ترغب في تجربة الأصوات الذكية المتاحة الآن في استوديو تحويل النص إلى صوت؟`,
            timestamp: Date.now(),
            suggestedReplies: [
              'جرّب استوديو تحويل النص إلى صوت (TTS)',
              'رشح لي أفضل أصوات الذكاء الاصطناعي',
              'ما هي نماذج الذكاء الاصطناعي المتاحة؟',
              'عرض باقات الأسعار'
            ]
          };
          setMessages(prev => [...prev, reply]);
          setIsThinking(false);
        }, 600);
        return;
      }

      // Check if asking about AI Models:
      if (q.includes('نموذج') || q.includes('نماذج') || q.includes('مودل') || q.includes('model') || q.includes('محرك') || q.includes('محركات') || q.includes('فروق')) {
        setTimeout(() => {
          const reply: AssistantMessage = {
            id: `reply-${Date.now()}`,
            sender: 'assistant',
            text: 'إليك نماذج الذكاء الاصطناعي الصوتية المعتمدة في منصة «قيمة فويس» للمرحلة الأولى، وفروقاتها ومجالات استخدامها:',
            timestamp: Date.now(),
            cardType: 'licensing',
            cardData: {
              details: [
                '1. محرك قيمة المتعدد للهجات (Qeema Multilingual v2): الأنسب للهجات المحلية (السعودية، الخليجية، المصرية، الشامية) مع مرونة عالية في التعبير الحماسي والعاطفي.',
                '2. محرك قيمة العصبي فائق الجودة (Qeema Neural HD v3): جودة بث إذاعي 48kHz، دقة استثنائية في نطق الفصحى المشكولة وضبط الإعراب والوقف.',
                '3. استوديو قيمة الصوتي النقي (Qeema Acoustic Studio): نبرات متزنة ورسمية للمحتوى المؤسسي، أنظمة الرد التفاعلي، والتقارير المالية والوثائقية.'
              ],
              targetView: 'generate',
              ctaLabel: 'فتح الاستوديو وتجربة النماذج فوراً'
            },
            suggestedReplies: [
              'رشح لي صوتاً إعلانياً سعودياً',
              'رشح لي صوتاً وثائقياً بالفصحى',
              'فتح استوديو تحويل النص إلى صوت (TTS)'
            ]
          };
          setMessages(prev => [...prev, reply]);
          setIsThinking(false);
        }, 650);
        return;
      }

      // Default: Use assistantService for search / general inquiries
      const reply = await assistantService.sendMessage(
        query,
        messages,
        'ar',
        voices
      );

      setMessages(prev => [...prev, reply]);
      setIsThinking(false);
    } catch (err) {
      console.error('Chatbot error:', err);
      setIsThinking(false);
    }
  };

  const handleResetChat = () => {
    if (audioRef.current) audioRef.current.pause();
    setPlayingVoiceId(null);
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'تم بدء محادثة جديدة! كيف يمكنني مساعدتك في اختيار الأصوات أو النماذج الصوتية المناسبة؟',
        timestamp: Date.now(),
        suggestedReplies: [
          'رشح لي صوتاً إعلانياً سعودياً',
          'رشح لي صوتاً وثائقياً فخماً',
          'ما هي نماذج الذكاء الاصطناعي المتاحة؟',
          'عرض باقات الأسعار'
        ]
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 py-8 px-4 sm:px-6 lg:px-8 selection:bg-brand selection:text-white" dir="rtl">
      
      {/* Hidden Audio Player */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingVoiceId(null)}
        onError={() => setPlayingVoiceId(null)}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-text text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>المرحلة الأولى • شات بوت نصي تفاعلي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              الشات بوت الصوتي الذكي
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              مستشارك الذكي لاكتشاف وترشيح أنسب الأصوات العربية ونماذج الذكاء الاصطناعي (AI Models) لحملاتك الإعلانية، مقاطعك، ومشاريعك، مع إمكانية التجربة المباشرة في استوديو تحويل النص إلى صوت (TTS).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('generate')}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold transition-all shadow-md shadow-brand/25 flex items-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>استوديو تحويل النص إلى صوت (TTS)</span>
            </button>

            <button
              onClick={handleResetChat}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="بدء محادثة جديدة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>محادثة جديدة</span>
            </button>
          </div>
        </div>

        {/* Quick Inspiration Topics Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">مقترحات شائعة:</span>
          {[
            'رشح لي صوتاً إعلانياً سعودياً حماسياً',
            'صوت وثائقي فخم ووقور بالفصحى',
            'صوت نسائي مصري هادئ لبودكاست',
            'ما هو أفضل نموذج ذكاء اصطناعي (AI Model)؟',
            'عرض باقات وأسعار تحويل النص لصوت'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-orange-50 hover:text-brand-text border border-slate-200/90 text-slate-700 font-medium transition-all shadow-2xs hover:border-orange-200 shrink-0 cursor-pointer text-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Main Interactive Chat Window */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/[0.03] overflow-hidden flex flex-col h-[640px]">
          
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-50/50 to-white">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                >
                  {/* Sender Tag */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 px-1">
                    {isUser ? (
                      <>
                        <span>أنت</span>
                        <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">
                          <User className="w-2.5 h-2.5" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full bg-orange-100 text-brand-text flex items-center justify-center text-[10px]">
                          <Sparkles className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-brand-text">مستشار قيمة فويس الذكي</span>
                      </>
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`max-w-[92%] sm:max-w-[80%] p-4 sm:p-5 rounded-2xl leading-relaxed text-xs sm:text-sm ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-br-xs shadow-sm font-medium'
                        : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs shadow-xs space-y-3'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                    {/* AI Model Details Card (if included) */}
                    {msg.cardType === 'licensing' && msg.cardData?.details && (
                      <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-2.5 mt-2">
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-brand-text" />
                          <span>نماذج الذكاء الاصطناعي المتاحة:</span>
                        </div>
                        <div className="space-y-2 text-xs text-slate-700">
                          {msg.cardData.details.map((detail, idx) => (
                            <div key={idx} className="p-2.5 bg-white rounded-lg border border-orange-100 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                        {msg.cardData.targetView && (
                          <button
                            onClick={() => onNavigate(msg.cardData!.targetView as ActiveView)}
                            className="w-full mt-2 py-2 px-3 bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>{msg.cardData.ctaLabel || 'تجربة النماذج في الاستوديو'}</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Recommended Voice Cards List */}
                    {msg.cardType === 'voice_list' && msg.cardData?.voices && msg.cardData.voices.length > 0 && (
                      <div className="space-y-2.5 pt-2">
                        <div className="text-[11px] font-bold text-slate-500">
                          الأصوات المقترحة مع النموذج الصوتي الموصى به:
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {msg.cardData.voices.slice(0, 3).map((v) => {
                            const isPlaying = playingVoiceId === v.id;
                            const recommendedModel = getRecommendedModelForVoice(v);

                            return (
                              <div
                                key={v.id}
                                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-orange-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <button
                                    onClick={() => handleTogglePlayVoice(v.id)}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                                      isPlaying
                                        ? 'bg-brand text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-800 hover:border-orange-400'
                                    }`}
                                    title={isPlaying ? 'إيقاف المعاينة' : 'تشغيل العينة'}
                                  >
                                    {isPlaying ? (
                                      <Pause className="w-4 h-4 fill-white" />
                                    ) : (
                                      <Play className="w-4 h-4 fill-current mr-0.5" />
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-bold text-xs text-slate-900 truncate">{v.name}</h4>
                                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-orange-100 text-[#ea580c]">
                                        {v.dialectLabel || 'سعودي'}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {v.styleLabel || 'إعلاني'}
                                      </span>
                                    </div>

                                    {/* Recommended AI Model Badge */}
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                                      <Zap className="w-3 h-3 text-orange-700" />
                                      <span className="font-semibold text-slate-700">{recommendedModel.name}</span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => onNavigate('generate', { voiceId: v.id, text: v.description || 'مرحباً بكم في استوديو قيمة للذكاء الصوتي.' })}
                                  className="px-3.5 py-1.5 rounded-lg bg-brand-ink hover:bg-brand text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                                >
                                  <span>توليد بالاستوديو</span>
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {msg.cardData.targetView && (
                          <button
                            onClick={() => onNavigate(msg.cardData!.targetView as ActiveView, { tab: 'ai' })}
                            className="text-[11px] font-bold text-brand-text hover:underline pt-1 inline-flex items-center gap-1"
                          >
                            <span>استعراض كافة الأصوات في المكتبة ←</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Pricing Plans Card */}
                    {msg.cardType === 'pricing' && msg.cardData?.plans && (
                      <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {msg.cardData.plans.map((plan: any) => (
                            <div key={plan.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                              <div className="font-bold text-xs text-slate-900">{plan.nameAr}</div>
                              <div className="font-black text-sm text-brand-text font-mono">${plan.priceUsd} / {plan.period}</div>
                              <div className="text-[10px] text-slate-500">{plan.credits?.toLocaleString()} نقطة توليد</div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => onNavigate('billing')}
                          className="w-full mt-2 py-2 px-3 bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-orange-400" />
                          <span>عرض صفحة الاشتراكات والأسعار</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggested Replies Chips under Assistant Message */}
                  {!isUser && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 pr-1">
                      {msg.suggestedReplies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleSendMessage(reply)}
                          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-brand-text text-slate-700 text-[11px] font-medium border border-slate-200/60 transition-colors cursor-pointer"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-700 px-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>جاري تحليل طلبك وترشيح الأنسب...</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-bl-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Text Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب استفسارك هنا (مثال: أريد صوتاً سعودياً حماسياً لإعلان مطعم)..."
                disabled={isThinking}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  inputText.trim() && !isThinking
                    ? 'bg-brand hover:bg-brand-orange text-white shadow-brand/25'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>إرسال</span>
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>يدعم الترشيح الصوتي الفوري واقتراح نماذج AI حسب اللهجة والأسلوب.</span>
              <span>المرحلة الأولى • قيمة فويس</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
